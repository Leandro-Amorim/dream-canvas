import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { notifications, postLikes, posts } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { and, eq } from 'drizzle-orm';
import sendSocket from '@/server/sendSocket';

export type APIResponse = GenericAPIResponse<{ success: boolean }>;

export interface RequestBody {
	postId: string,
	like: boolean,
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		let insertedLikes: { id: string }[] = [];
		if (req.body.like) {
			insertedLikes = await db.insert(postLikes).values({
				postId: req.body.postId,
				userId
			}).onConflictDoUpdate({
				target: [postLikes.postId, postLikes.userId],
				set: { likedAt: (new Date()).toISOString() }
			}).returning({
				id: postLikes.id
			})
		}
		else {
			await db.delete(postLikes).where(
				and(
					eq(postLikes.postId, req.body.postId),
					eq(postLikes.userId, userId)
				)
			);
		}

		try {
			const post = await db.query.posts.findFirst({
				where: eq(posts.id, req.body.postId),
				columns: {
					authorId: true,
					orphan: true,
				}
			});

			if (req.body.like && post?.authorId !== userId && !post?.orphan) {
				await db.insert(notifications).values({
					type: 'NEW_LIKE',
					userId: post?.authorId ?? '',
					likeId: insertedLikes[0].id,
					postId: req.body.postId
				})
				sendSocket([post?.authorId ?? '']);
			}

		}
		catch (err) {
			console.error('Notification error - Like');
			console.error(err);
		}

		return res.status(200).json({
			status: 'success',
			data: {
				success: true
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