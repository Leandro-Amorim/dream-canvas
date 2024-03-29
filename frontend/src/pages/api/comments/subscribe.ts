import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { commentSubscriptions, comments } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { and, eq } from 'drizzle-orm';

export type APIResponse = GenericAPIResponse<{ success: true }>;

export interface RequestBody {
	commentId: string,
	subscribe: boolean,
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		if (req.body.subscribe) {
			await db.insert(commentSubscriptions).values({
				userId: userId,
				commentId: req.body.commentId,
			}).onConflictDoUpdate({
				target: [commentSubscriptions.userId, commentSubscriptions.commentId],
				set: {
					subscribedAt: (new Date()).toISOString()
				}
			})
		}
		else {
			await db.delete(commentSubscriptions).where(
				and(
					eq(commentSubscriptions.userId, userId),
					eq(commentSubscriptions.commentId, req.body.commentId)
				)
			);
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