import type { NextApiRequest, NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { GenericAPIResponse } from '@/types/api';
import { users } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { eq, } from 'drizzle-orm';
import { stripe } from '@/server/database/stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export type APIResponse = GenericAPIResponse<{ url: string }>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		const customerId = (await db.select({ customerId: users.customerId }).from(users).where(eq(users.id, userId))).at(0)?.customerId;

		if (!customerId) { throw new Error('No customer found'); }

		const portalSession = await stripe.billingPortal.sessions.create({
			customer: customerId,
			return_url: `${process.env.NEXT_PUBLIC_URL}/settings#billing`,
		});

		if (portalSession.url === null) { throw new Error('No url found'); }

		return res.status(200).json({
			status: 'success',
			data: {
				url: portalSession.url,
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