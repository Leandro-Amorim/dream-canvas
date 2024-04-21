import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { GenericAPIResponse } from '@/types/api';
import protectAPI from '@/server/protectAPI';
import { db } from '@/server/database/database';
import { notifications } from '@/server/database/schema';
import { desc, eq } from 'drizzle-orm';
export type APIResponse = GenericAPIResponse<{ hasNew: boolean }>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		const lastNotification = await db.query.notifications.findFirst({
			where: eq(notifications.userId, userId),
			orderBy: desc(notifications.createdAt),
			columns: {
				seen: true
			}
		});

		return res.status(200).json({
			status: 'success',
			data: {
				hasNew: lastNotification?.seen === false
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