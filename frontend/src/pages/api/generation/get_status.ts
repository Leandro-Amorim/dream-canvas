import type { NextApiResponse } from 'next';
import { db } from '@/server/database/database';
import { freeQueue, priorityQueue, users, } from '@/server/database/schema';
import { eq } from 'drizzle-orm';

import { APIRequest, GenericAPIResponse } from '@/types/api';

export type APIResponse = GenericAPIResponse<{ status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | null, url: string, refunded: boolean }>

export default async function handler(req: APIRequest<{ type: 'free' | 'priority', id: string }>, res: NextApiResponse) {
	try {

		if (req.body.type === 'free') {
			const row = (await db.query.freeQueue.findFirst({
				where: eq(freeQueue.id, req.body.id)
			})) ?? null;

			if (row?.status === 'COMPLETED' || row?.status === 'FAILED') {
				await db.delete(freeQueue).where(eq(freeQueue.id, req.body.id));
			}

			return res.status(200).json({
				status: 'success',
				data: {
					status: row?.status ?? null,
					url: row?.status === 'COMPLETED' ? row.id : '',
					refunded: false
				}
			} satisfies APIResponse);
		}
		else {
			const row = (await db.query.priorityQueue.findFirst({
				where: eq(priorityQueue.id, req.body.id)
			})) ?? null;

			let refunded = false;

			if (row?.status === 'FAILED' && row.cost !== null && row.cost > 0) {
				const remainingCredits = (await db.query.users.findFirst({ where: eq(users.id, row.userId) }))?.premiumCredits ?? 0;
				await db.update(users).set({ premiumCredits: remainingCredits + (row.cost ?? 0) }).where(eq(users.id, row.userId));
				refunded = true;
			}

			if (row?.status === 'COMPLETED' || row?.status === 'FAILED') {
				await db.delete(priorityQueue).where(eq(priorityQueue.id, req.body.id));
			}

			return res.status(200).json({
				status: 'success',
				data: {
					status: row?.status ?? null,
					url: row?.status === 'COMPLETED' ? row.id : '',
					refunded
				}
			} satisfies APIResponse);
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: 'error',
			reason: 'INTERNAL_SERVER_ERROR',
		} satisfies APIResponse);
	}
}