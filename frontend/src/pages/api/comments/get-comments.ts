import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { commentLikes, commentSubscriptions, comments, users } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { desc, eq, sql } from 'drizzle-orm';
import { IComment, } from '@/types/database';

export type APIResponse = GenericAPIResponse<{ comments: IComment[] }>;

export interface RequestBody {
	postId: string,
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', false)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		const rows = await db.select({
			id: comments.id,
			postId: comments.postId,
			message: comments.message,
			replyingTo: comments.replyingTo,
			createdAt: comments.createdAt,
			author: {
				id: users.id,
				name: users.name,
				avatar: users.image
			},
			likeCount: sql<number>`(SELECT count(*) from ${commentLikes} where ${commentLikes.commentId} = ${comments.id})::integer`.as('likeCount'),
			likedByMe: sql<boolean>`EXISTS(SELECT 1 from ${commentLikes} where ${commentLikes.commentId} = ${comments.id} and ${commentLikes.userId} = ${userId})`.as('likedByMe'),
			subscribedByMe: sql<boolean>`EXISTS(SELECT 1 from ${commentSubscriptions} where ${commentSubscriptions.commentId} = ${comments.id} and ${commentSubscriptions.userId} = ${userId})`.as('subscribedByMe'),

		}).from(comments).leftJoin(users, eq(comments.authorId, users.id)).where(eq(comments.postId, req.body.postId)).orderBy(desc(comments.createdAt));

		return res.status(200).json({
			status: 'success',
			data: {
				comments: rows,
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