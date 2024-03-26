import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { blocks } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { and, eq } from 'drizzle-orm';

export type APIResponse = GenericAPIResponse<{ success: boolean }>;

export interface RequestBody {
	userId: string,
	block: boolean,
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		if (req.body.userId === userId) {
			return res.status(400).json({
				status: 'error',
				reason: 'BAD_REQUEST',
			} satisfies APIResponse);
		}

		if (req.body.block) {
			await db.insert(blocks).values({
				blockedId: req.body.userId,
				userId,
				hidden: false,
			}).onConflictDoUpdate({
				target: [blocks.blockedId, blocks.userId],
				set: { blockedAt: (new Date()).toISOString(), hidden: false },
			});
		}
		else {
			await db.delete(blocks).where(
				and(
					eq(blocks.blockedId, req.body.userId),
					eq(blocks.userId, userId)
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