import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { APIOutput } from './types/data';
import { db } from './database';
import { freeQueue, images, postImages, posts, priorityQueue } from './schema';
import { eq } from 'drizzle-orm';
import { setFailed } from './queue-processor';
import { parseSize, uploadImage } from './utils';
import { io } from './queue-websocket-server';

const app = new Koa();
const router = new Router();
const port = 3003;

app.use(bodyParser({
	jsonLimit: '100mb',
	textLimit: '100mb',
	formLimit: '100mb',
}));

router.post('handle-webhook', '/', async (ctx) => {
	const body = ctx.request.body as APIOutput;
	const apiId = body?.id;

	if (!apiId) {
		return ctx.body = 'OK';
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
		return ctx.body = 'OK';
	}

	const item = type === 'free' ? freeItem : premiumItem;

	if (item === undefined) {
		return ctx.body = 'OK';
	}

	if (body.status !== 'COMPLETED' || !body.output?.images?.[0]) {
		await setFailed(type, item.id ?? '');
		return ctx.body = 'OK';
	}

	try {
		const base64 = body.output.images[0];
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
			const { customAlphabet } = await import('nanoid');
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
		}
		*/

		const relevantTable = type === 'free' ? freeQueue : priorityQueue;
		const relevantCol = type === 'free' ? freeQueue.id : priorityQueue.id;
		await db.update(relevantTable).set({ status: 'COMPLETED' }).where(eq(relevantCol, item.id));
		io.to(`generation:${item.id}`).emit("status_update");
	}
	catch (err) {
		console.error(err);
		setFailed(type, item?.id ?? '');
	}
	return ctx.body = 'OK';
});

app.use(router.routes()).use(router.allowedMethods());

export const startWebhookServer = () => {
	app.listen(port, () => {
		console.log(`Webhook Server is running at: http://localhost:${port}`);
	});
}