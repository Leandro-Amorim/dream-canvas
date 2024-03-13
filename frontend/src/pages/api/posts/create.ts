import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { postImages, posts } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { IImage } from '@/types/database';
import { z } from 'zod';
import { formSchema } from '@/pages/posts/create';
import { customAlphabet } from 'nanoid';

export type APIResponse = GenericAPIResponse<{ id: string }>;

export interface RequestBody {
	images: IImage[],
	formData: z.infer<typeof formSchema>
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
	const nanoid = customAlphabet(alphabet, 20);

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		const formData = req.body.formData;
		const postId = nanoid();

		await db.transaction(async (tx) => {
			await tx.insert(posts).values({
				id: postId,
				userId,
				title: formData.title,
				description: formData.description,
				anonymous: formData.anonymousPost,
				hidePrompt: formData.hidePrompt
			});
			await tx.insert(postImages).values(req.body.images.map((image, index) => {
				return {
					postId,
					imageId: image.id,
					order: index,
				}
			}))
		});

		return res.status(200).json({
			status: 'success',
			data: {
				id: postId
			},
		} satisfies APIResponse);

	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: 'error',
			reason: 'INTERNAL_SERVER_ERROR',
		} satisfies APIResponse);
	}
}