import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { commentLikes } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { and, eq } from 'drizzle-orm';

export type APIResponse = GenericAPIResponse<{ success: boolean }>;

export interface RequestBody {
	commentId: string,
	like: boolean,
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		if (req.body.like) {
			await db.insert(commentLikes).values({
				commentId: req.body.commentId,
				userId
			}).onConflictDoUpdate({
				target: [commentLikes.commentId, commentLikes.userId],
				set: { likedAt: (new Date()).toISOString() }
			});
		}
		else {
			await db.delete(commentLikes).where(
				and(
					eq(commentLikes.commentId, req.body.commentId),
					eq(commentLikes.userId, userId)
				)
			);
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