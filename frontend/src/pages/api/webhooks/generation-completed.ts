import type { NextApiResponse } from 'next';
import { eq } from 'drizzle-orm';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import protectAPI from '@/server/protectAPI';
import { db } from '@/server/database/database';
import { freeQueue, images, postImages, posts, priorityQueue } from '@/server/database/schema';
import uploadImage from '@/server/s3/uploadImage';
import { parseSize } from '@/server/generation/parseSize';
import { customAlphabet } from 'nanoid';
import notifyGenerationCompleted from '@/server/notifyGenerationCompleted';

export type APIResponse = GenericAPIResponse<string>;

export type RunpodAPIState = 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'TIMED_OUT';

export interface RequestBody {
	id: string,
	output: {
		images: string[]
	},
	status: RunpodAPIState
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', false)) { return; }

	const apiId = req.body?.id;

	if (!apiId) {
		return res.status(200).json({
			status: 'error',
			reason: 'INTERNAL_SERVER_ERROR',
		} satisfies APIResponse);
	}

	let type: 'free' | 'priority' | undefined = undefined;

	const freeItem = await db.query.freeQueue.findFirst({ where: eq(freeQueue.apiId, apiId) });
	if (freeItem) {
		type = 'free';
	}

	const premiumItem = freeItem ? undefined : await db.query.priorityQueue.findFirst({ where: eq(priorityQueue.apiId, apiId) });
	if (premiumItem) {
		type = 'priority';
	}

	if (type === undefined) {
		return res.status(200).json({
			status: 'error',
			reason: 'INTERNAL_SERVER_ERROR',
		} satisfies APIResponse);
	}

	const item = type === 'free' ? freeItem : premiumItem;

	if (item === undefined) {
		return res.status(200).json({
			status: 'error',
			reason: 'INTERNAL_SERVER_ERROR',
		} satisfies APIResponse);
	}

	if (req.body.status !== 'COMPLETED' || !req.body.output?.images?.[0]) {
		await setFailed(type, item.id);

		return res.status(200).json({
			status: 'error',
			reason: 'INTERNAL_SERVER_ERROR',
		} satisfies APIResponse);
	}

	try {
		const base64 = req.body.output.images[0];
		const buffer = Buffer.from(base64, 'base64');

		const url = await uploadImage(`images/${item.id}`, buffer);

		const size = parseSize(item.prompt);

		await db.insert(images).values({
			id: item.id,
			url,
			width: size?.width ?? 0,
			height: size?.height ?? 0,
			userId: item.userId,
			prompt: item.prompt,
		});

		//DISABLE ORPHAN POST CREATION FOR DEMO
		/*
		if (type === 'free') {
			const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
			const nanoid = customAlphabet(alphabet, 20);
	
			const post = (await db.insert(posts).values({
				id: nanoid(),
				anonymous: true,
				orphan: true
			}).returning({ id: posts.id }))[0];
	
			await db.insert(postImages).values({
				postId: post.id,
				imageId: item.id,
			});
		}*/

		const relevantTable = type === 'free' ? freeQueue : priorityQueue;
		const relevantCol = type === 'free' ? freeQueue.id : priorityQueue.id;
		await db.update(relevantTable).set({ status: 'COMPLETED' }).where(eq(relevantCol, item.id));
		notifyGenerationCompleted(item.id);
	}
	catch (err) {
		console.error(err);
		setFailed(type, item?.id ?? '');
	}

	return res.status(200).json({
		status: 'success',
		data: 'OK'
	} satisfies APIResponse);
}

const setFailed = async (type: 'free' | 'priority', id: string) => {
	const relevantTable = type === 'free' ? freeQueue : priorityQueue;
	const relevantCol = type === 'free' ? freeQueue.id : priorityQueue.id;
	await db.update(relevantTable).set({ status: 'FAILED' }).where(eq(relevantCol, id));
	notifyGenerationCompleted(id);
}

export const config = {
	api: {
		bodyParser: {
			sizeLimit: '100mb'
		},
	},
}