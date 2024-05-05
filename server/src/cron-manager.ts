import { sql } from "drizzle-orm";
import { db } from "./database"
import { ips, system, users } from "./schema";

export const processCron = async () => {
	
	let systemRow = await db.query.system.findFirst();
	if (!systemRow) {
		systemRow = (await db.insert(system).values({ id: 1 }).returning({
			id: system.id,
			generations: system.generations,
			resetedAt: system.resetedAt
		}))[0];
	}

	const resetedAt = systemRow.resetedAt;

	const miliseconds = new Date().getTime() - resetedAt.getTime();

	if (miliseconds > 1000 * 60 * 60 * 24) {
		await resetResources();
		setTimeout(processCron, 1000 * 60 * 60 * 24);
	}
	else {
		setTimeout(processCron, 1000 * 60 * 60 * 24 - miliseconds);
	}
}

export const resetResources = async () => {
	await db.update(ips).set({
		generations: Number(process.env.DAILY_FREE_IP_GENERATIONS ?? 5),
	});
	await db.update(users).set({
		generations: Number(process.env.DAILY_FREE_USER_GENERATIONS ?? 25),
		premiumCredits: sql`${users.premiumCredits} + ${Number(process.env.DAILY_PREMIUM_CREDITS ?? 50)}`,
	})
	await db.update(system).set({
		generations: Number(process.env.SYSTEM_DAILY_FREE_GENERATIONS ?? 200),
		resetedAt: new Date()
	});
}