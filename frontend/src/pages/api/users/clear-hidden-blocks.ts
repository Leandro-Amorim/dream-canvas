import type { NextApiRequest, NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { blocks } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { and, eq } from 'drizzle-orm';

export type APIResponse = GenericAPIResponse<{ success: boolean }>;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		await db.delete(blocks).where(
			and(
				eq(blocks.hidden, true),
				eq(blocks.userId, userId)
			)
		);

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