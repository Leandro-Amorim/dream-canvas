import { db } from '@/server/database/database';
import { plans, users } from '@/server/database/schema';
import { GenericAPIResponse } from '@/types/api';
import { eq } from 'drizzle-orm';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import Cors from 'micro-cors';
import { stripe } from '@/server/database/stripe';
import { buffer } from 'stream/consumers';

const cors = Cors({
	allowMethods: ['POST', 'HEAD'],
});

export type APIResponse = GenericAPIResponse<{ success: boolean }>;

async function handler(req: NextApiRequest, res: NextApiResponse) {

	if (req.method === 'POST') {
		try {
			const buf = await buffer(req);
			const sig = req.headers['stripe-signature'];

			let event = null as Stripe.Event | null;

			try {
				event = stripe.webhooks.constructEvent(buf.toString(), sig as string, process.env.STRIPE_SUBSCRIPTION_WH_SECRET ?? '');
			} catch (err) {
				return res.status(400).json({
					status: 'error',
					reason: `Webhook Signature Error`,
				} satisfies APIResponse);
			}

			if (event === null) {
				return res.status(400).json({
					status: 'error',
					reason: 'Invalid event',
				} satisfies APIResponse);
			}

			switch (event.type) {
				case 'customer.subscription.created':
				case 'customer.subscription.updated':
				case 'customer.subscription.deleted':
					await updateSubscriptionStatus(event.data.object);
					break;
				case 'checkout.session.completed':
					await completeCheckoutSession(event.data.object);
					break;
				case 'customer.created':
					await upsertCustomer(event.data.object);
					break;
				case 'customer.deleted':
					await deleteCustomer(event.data.object);
					break;
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
	return res.status(405).json({
		status: 'error',
		reason: 'METHOD_NOT_ALLOWED',
	})
}

const updateSubscriptionStatus = async (subscription: Stripe.Subscription) => {
	await db.update(users).set({
		premium: subscription.status === 'active',
	}).where(eq(users.customerId, subscription.customer as string));
}

const completeCheckoutSession = async (session: Stripe.Checkout.Session) => {
	const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
	await db.update(users).set({
		customerId: subscription.customer as string,
		premium: subscription.status === 'active',
	}).where(eq(users.id, session.client_reference_id as string));
}

const upsertCustomer = async (customer: Stripe.Customer) => {
	if (customer.email) {
		await db.update(users).set({
			customerId: customer.id,
		}).where(eq(users.email, customer.email));
	}
}


const deleteCustomer = async (customer: Stripe.Customer) => {
	if (customer.email) {
		await db.update(users).set({
			customerId: null,
			premium: false,
		}).where(eq(users.email, customer.email));
	}
}

export default cors(handler as any);

export const config = {
	api: {
		bodyParser: false,
	},
}