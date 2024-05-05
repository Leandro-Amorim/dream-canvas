import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { commentSubscriptions, comments, notifications, posts } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { and, eq, ne } from 'drizzle-orm';
import { NotificationType } from '@/types/database';
import sendSocket from '@/server/sendNotificationSocket';

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

		try {
			const post = await db.query.posts.findFirst({
				where: eq(posts.id, req.body.postId),
				columns: {
					authorId: true,
					orphan: true,
				}
			});

			if (req.body.replyingTo === null) {

				if (post?.authorId !== userId && !post?.orphan) {
					await db.insert(notifications).values({
						type: 'NEW_COMMENT',
						userId: post?.authorId ?? '',
						commentId: insertedComments[0].id,
						postId: req.body.postId,
						data: req.body.message,
					});
					sendSocket([post?.authorId ?? '']);
				}
			}
			else {
				const subscribers = await db.query.commentSubscriptions.findMany({
					where: and(
						eq(commentSubscriptions.commentId, req.body.replyingTo),
						ne(commentSubscriptions.userId, userId)
					)
				})

				if (subscribers.length > 0) {
					await db.insert(notifications).values(
						subscribers.map((s) => {
							return {
								type: 'NEW_REPLY' satisfies NotificationType as NotificationType,
								userId: s.userId,
								commentId: insertedComments[0].id,
								postId: req.body.postId,
								data: req.body.message,
							};
						})
					)

					sendSocket(subscribers.map((s) => s.userId));
				}
			}
		}
		catch (err) {
			console.log('Notification error - Comment')
			console.error(err);
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