import type { NextApiRequest, NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { GenericAPIResponse } from '@/types/api';
import { plans, users } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { asc, eq, } from 'drizzle-orm';
import { stripe } from '@/server/database/stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export type APIResponse = GenericAPIResponse<{ url: string }>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		const priceId = (await db.query.plans.findFirst({ orderBy: asc(plans.id) }))?.priceId ?? null;
		if (priceId === null) { throw new Error('No price found'); }

		const customerId = (await db.select({ customerId: users.customerId }).from(users).where(eq(users.id, userId))).at(0)?.customerId ?? undefined;

		const stripeSession = await stripe.checkout.sessions.create({
			client_reference_id: userId,
			customer: customerId,
			mode: 'subscription',
			line_items: [
				{
					price: priceId,
					quantity: 1,
				}
			],
			customer_email: customerId ? undefined : session?.user.email ?? '',
			success_url: `${process.env.NEXT_PUBLIC_URL}/checkout-success`,
			cancel_url: process.env.NEXT_PUBLIC_URL ?? '',
			billing_address_collection: 'required',
		});

		if (stripeSession.url === null) { throw new Error('No url found'); }

		return res.status(200).json({
			status: 'success',
			data: {
				url: stripeSession.url,
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