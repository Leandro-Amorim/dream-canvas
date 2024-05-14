import { GenerationRequest } from '@/types/generation';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import checkAbuseAttempt from '@/server/generation/checkAbuseAttempt';
import { db } from '@/server/database/database';
import { freeQueue, ips, priorityQueue, system, users } from '@/server/database/schema';
import { count, eq } from 'drizzle-orm';
import requestIp from 'request-ip';
import calculateCost from '@/server/generation/calculateCost';
import sendSocket from '@/server/sendGenerationSocket';
import getSocketAuth from '@/server/getSocketAuth';

export type APIResponse = ErrorResponse | DataResponse;

interface ErrorResponse {
	status: 'error',
	reason: 'MALFORMED_REQUEST' | 'NO_GENERATIONS_LEFT' | 'SYSTEM_RESOURCES_DEPLETED' | 'FREE_QUEUE_FULL' | 'NOT_ENOUGH_CREDITS' | 'INTERNAL_SERVER_ERROR'
}
interface DataResponse {
	status: 'success',
	data: {
		id: string,
		type: 'free' | 'priority',
		socketAuth: string,
	}
}


interface APIRequest extends NextApiRequest {
	body: GenerationRequest
}

export default async function handler(req: APIRequest, res: NextApiResponse) {
	try {
		if (req.body.settings.seed === -1) {
			req.body.settings.seed = Math.floor(Math.random() * 1000000000);
		}

		const session = await getServerSession(req, res, authOptions);
		let role = 'anonymous';
		if (session?.user) {
			role = (session.user.premium ? 'premium' : 'free');
		}

		if (role === 'anonymous' || role === 'free') {

			const clientIp = requestIp.getClientIp(req) ?? '';
			const userId = session?.user.id ?? '';

			if (checkAbuseAttempt(req.body)) {
				return res.status(200).json({
					status: 'error',
					reason: 'MALFORMED_REQUEST',
				} satisfies APIResponse);
			}

			if (req.body.settings.highPriority === false) {

				const systemGenerations = (await db.query.system.findFirst())?.generations ?? 0;

				if (systemGenerations <= 0) {
					return res.status(200).json({
						status: 'error',
						reason: 'SYSTEM_RESOURCES_DEPLETED',
					} satisfies APIResponse);
				}

				if ((await db.select({ value: count() }).from(freeQueue))[0]?.value >= Number(process.env.SYSTEM_FREE_QUEUE_MAX_SIZE ?? 0)) {
					return res.status(200).json({
						status: 'error',
						reason: 'FREE_QUEUE_FULL',
					} satisfies APIResponse);
				}

				if (role === 'anonymous') {

					if ((await db.query.ips.findFirst({ where: eq(ips.address, clientIp) })) === undefined) {
						await db.insert(ips).values({ address: clientIp })
					}

					const remainingGenerations = (await db.query.ips.findFirst({ where: eq(ips.address, clientIp) }))?.generations ?? 0;

					if (remainingGenerations <= 0) {
						return res.status(200).json({
							status: 'error',
							reason: 'NO_GENERATIONS_LEFT',
						} satisfies APIResponse);
					}

					await db.update(ips).set({ generations: remainingGenerations - 1 }).where(eq(ips.address, clientIp));
					await db.update(system).set({ generations: systemGenerations - 1 });

					const queueEntry = (await db.insert(freeQueue).values({
						type: 'ANONYMOUS',
						ipAddress: clientIp,
						prompt: req.body,
					}).returning({ id: freeQueue.id }))[0];

					sendSocket('free');

					return res.status(200).json({
						status: 'success',
						data: {
							id: queueEntry.id,
							type: 'free',
							socketAuth: getSocketAuth(queueEntry.id, 'generation')
						}
					} satisfies APIResponse);
				}
				else {
					const remainingGenerations = (await db.query.users.findFirst({ where: eq(users.id, userId) }))?.generations ?? 0;

					if (remainingGenerations <= 0) {
						return res.status(200).json({
							status: 'error',
							reason: 'NO_GENERATIONS_LEFT',
						} satisfies APIResponse);
					}

					await db.update(users).set({ generations: remainingGenerations - 1 }).where(eq(users.id, userId));
					await db.update(system).set({ generations: systemGenerations - 1 });

					const queueEntry = (await db.insert(freeQueue).values({
						type: 'FREE',
						userId: userId,
						prompt: req.body,
					}).returning({ id: freeQueue.id }))[0];

					sendSocket('free');

					return res.status(200).json({
						status: 'success',
						data: {
							id: queueEntry.id,
							type: 'free',
							socketAuth: getSocketAuth(queueEntry.id, 'generation')
						}
					} satisfies APIResponse);
				}
			}
			else {
				const remainingCredits = (await db.query.users.findFirst({ where: eq(users.id, userId) }))?.premiumCredits ?? 0;
				const cost = calculateCost(req.body);

				if (role === 'anonymous' || remainingCredits < cost) {
					return res.status(200).json({
						status: 'error',
						reason: 'NOT_ENOUGH_CREDITS',
					} satisfies APIResponse);
				}

				await db.update(users).set({ premiumCredits: remainingCredits - cost }).where(eq(users.id, userId));

				const queueEntry = (await db.insert(priorityQueue).values({
					premium: false,
					cost: cost,
					userId: userId,
					prompt: req.body,
				}).returning({ id: priorityQueue.id }))[0];

				sendSocket('priority');

				return res.status(200).json({
					status: 'success',
					data: {
						id: queueEntry.id,
						type: 'priority',
						socketAuth: getSocketAuth(queueEntry.id, 'generation')
					},
				} satisfies APIResponse);
			}
		}
		else {
			const userId = session?.user.id ?? '';

			const queueEntry = (await db.insert(priorityQueue).values({
				premium: true,
				cost: 0,
				userId: userId,
				prompt: req.body,
			}).returning({ id: priorityQueue.id }))[0];

			sendSocket('priority');

			return res.status(200).json({
				status: 'success',
				data: {
					id: queueEntry.id,
					type: 'priority',
					socketAuth: getSocketAuth(queueEntry.id, 'generation')
				},
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