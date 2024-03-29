import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { commentSubscriptions, comments } from '@/server/database/schema';
import { db } from '@/server/database/database';

export type APIResponse = GenericAPIResponse<{ success: true }>;

export interface RequestBody {
	postId: string,
	message: string,
	replyingTo: string | null,
	subscribe: boolean,
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		const insertedComments = await db.insert(comments).values({
			authorId: userId,
			message: req.body.message,
			postId: req.body.postId,
			replyingTo: req.body.replyingTo ?? null,
		}).returning({
			id: comments.id
		})

		if (req.body.subscribe) {
			const commentId = req.body.replyingTo ?? insertedComments[0].id;
			await db.insert(commentSubscriptions).values({
				userId,
				commentId,
			}).onConflictDoUpdate({
				target: [commentSubscriptions.userId, commentSubscriptions.commentId],
				set: {
					subscribedAt: (new Date()).toISOString()
				}
			})
		}

		return res.status(200).json({
			status: 'success',
			data: {
				success: true,
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