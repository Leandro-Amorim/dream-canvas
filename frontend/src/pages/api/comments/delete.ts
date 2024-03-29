import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { comments, posts } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { and, eq } from 'drizzle-orm';

export type APIResponse = GenericAPIResponse<{ success: true }>;

export interface RequestBody {
	commentId: string
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		const comment = await db.query.comments.findFirst({
			where: eq(comments.id, req.body.commentId),
		})

		if (!comment) {
			return res.status(404).json({
				status: 'error',
				reason: 'NOT_FOUND',
			})
		}

		const post = await db.query.posts.findFirst({
			where: eq(posts.id, comment.postId),
		})

		if (comment.authorId === userId || (post?.orphan === false && post.authorId === userId)) {
			await db.delete(comments).where(and(eq(comments.id, req.body.commentId)));
		}
		else {
			return res.status(401).json({
				status: 'error',
				reason: 'NOT_AUTHORIZED',
			} satisfies APIResponse);
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