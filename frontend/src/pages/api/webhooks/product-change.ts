import { db } from '@/server/database/database';
import { plans } from '@/server/database/schema';
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
				event = stripe.webhooks.constructEvent(buf.toString(), sig as string, process.env.STRIPE_PRODUCT_WH_SECRET ?? '');
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
				case 'product.created':
				case 'product.updated':
					await upsertProduct(event.data.object, stripe, event.type === 'product.created');
					break;
				case 'product.deleted':
					await db.delete(plans).where(eq(plans.productId, event.data.object.id));
					break;
				case 'price.created':
				case 'price.updated':
					await upsertPrice(event.data.object, stripe);
					break;
				case 'price.deleted':
					await deletePrice(event.data.object, stripe);
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

const upsertProduct = async (product: Stripe.Product, stripe: Stripe, creating: boolean) => {
	if (!product.active) { return; }

	let priceObject = null as null | Stripe.Price;

	try {
		priceObject = product.default_price ? await stripe.prices.retrieve(product.default_price as string) : null;
	}
	catch (err) {
		priceObject = null;
		//@ts-ignore
		console.log('Error retrieving price ', err.statusCode);
		//TODO: Proper error handling, keeping in mind that errors are expected since sometimes the product is updated after the price is deleted.
	}

	if (!creating) {
		await db.update(plans).set({
			priceId: (product.default_price as string) || null,
			price: priceObject?.unit_amount || null,
		}).where(eq(plans.productId, product.id));
	}
	else {
		await db.insert(plans).values({
			productId: product.id,
			priceId: (product.default_price as string) || null,
			price: priceObject?.unit_amount || null,
		}).onConflictDoUpdate({
			target: plans.productId,
			set: {
				priceId: (product.default_price as string) || null,
				price: priceObject?.unit_amount || null,
			}
		})
	}
}

const upsertPrice = async (price: Stripe.Price, stripe: Stripe) => {
	await db.update(plans).set({
		price: price.unit_amount || null,
	}).where(eq(plans.priceId, price.id));
}

const deletePrice = async (price: Stripe.Price, stripe: Stripe) => {
	await db.update(plans).set({
		priceId: null,
		price: null,
	}).where(eq(plans.priceId, price.id));
}

export default cors(handler as any);

export const config = {
	api: {
		bodyParser: false,
	},
}