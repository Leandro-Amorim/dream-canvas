import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { follows, postSaves } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { and, eq } from 'drizzle-orm';

export type APIResponse = GenericAPIResponse<{ success: boolean }>;

export interface RequestBody {
	userId: string,
	follow: boolean,
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		if (req.body.userId === userId || !req.body.userId) {
			return res.status(400).json({
				status: 'error',
				reason: 'BAD_REQUEST',
			} satisfies APIResponse);
		}

		if (req.body.follow) {
			await db.insert(follows).values({
				userId: req.body.userId,
				followerId: userId,
			}).onConflictDoUpdate({
				target: [follows.userId, follows.followerId],
				set: { followedAt: (new Date()).toISOString() },
			});
		}
		else {
			await db.delete(follows).where(
				and(
					eq(follows.userId, req.body.userId),
					eq(follows.followerId, userId)
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