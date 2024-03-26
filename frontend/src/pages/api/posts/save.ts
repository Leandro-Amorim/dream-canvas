import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { postSaves } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { and, eq } from 'drizzle-orm';

export type APIResponse = GenericAPIResponse<{ success: boolean }>;

export interface RequestBody {
	postId: string,
	save: boolean,
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		if (req.body.save) {
			await db.insert(postSaves).values({
				postId: req.body.postId,
				userId
			}).onConflictDoUpdate({
				target: [postSaves.postId, postSaves.userId],
				set: { savedAt: (new Date()).toISOString() }
			});
		}
		else {
			await db.delete(postSaves).where(
				and(
					eq(postSaves.postId, req.body.postId),
					eq(postSaves.userId, userId)
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