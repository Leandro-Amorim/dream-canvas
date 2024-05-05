import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { follows, notifications } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { and, eq } from 'drizzle-orm';
import sendSocket from '@/server/sendNotificationSocket';

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

		let insertedFollows: { id: string }[] = [];

		if (req.body.follow) {
			insertedFollows = await db.insert(follows).values({
				userId: req.body.userId,
				followerId: userId,
			}).onConflictDoUpdate({
				target: [follows.userId, follows.followerId],
				set: { followedAt: (new Date()).toISOString() },
			}).returning({
				id: follows.id
			})
		}
		else {
			await db.delete(follows).where(
				and(
					eq(follows.userId, req.body.userId),
					eq(follows.followerId, userId)
				)
			);
		}

		try {
			if (req.body.follow) {
				await db.insert(notifications).values({
					type: 'NEW_FOLLOWER',
					userId: req.body.userId,
					followId: insertedFollows[0].id,
				})
				sendSocket([req.body.userId?? '']);
			}
		}
		catch (err) {
			console.error('Notification error - Follow');
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