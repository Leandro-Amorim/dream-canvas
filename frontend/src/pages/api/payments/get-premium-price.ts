import type { NextApiRequest, NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { GenericAPIResponse } from '@/types/api';
import { blocks, plans } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { asc, } from 'drizzle-orm';

export type APIResponse = GenericAPIResponse<{ price: number | null }>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	if (await protectAPI(req, res, 'GET', false)) { return; }

	try {

		const price = (await db.query.plans.findFirst({ orderBy: asc(plans.id) }))?.price ?? null;

		return res.status(200).json({
			status: 'success',
			data: {
				price,
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