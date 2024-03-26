import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { postLikes } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { and, eq } from 'drizzle-orm';

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

		if (req.body.like) {
			await db.insert(postLikes).values({
				postId: req.body.postId,
				userId
			}).onConflictDoUpdate({
				target: [postLikes.postId, postLikes.userId],
				set: { likedAt: (new Date()).toISOString() }
			});
		}
		else {
			await db.delete(postLikes).where(
				and(
					eq(postLikes.postId, req.body.postId),
					eq(postLikes.userId, userId)
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