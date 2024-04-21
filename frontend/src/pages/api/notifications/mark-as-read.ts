import type { NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import protectAPI from '@/server/protectAPI';
import { db } from '@/server/database/database';
import { notifications } from '@/server/database/schema';
import { and, eq, inArray } from 'drizzle-orm';
export type APIResponse = GenericAPIResponse<{ success: boolean }>;

export interface RequestBody {
	ids: string[],
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		await db.update(notifications).set({ seen: true }).where(
			and(
				inArray(notifications.id, req.body.ids),
				eq(notifications.userId, userId)
			)
		)

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