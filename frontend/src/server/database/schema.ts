import { timestamp, pgTable, text, primaryKey, integer, boolean, uuid, json } from "drizzle-orm/pg-core";
import type { AdapterAccount } from '@auth/core/adapters';
import { GenerationRequest } from "@/types/generation";

export const accounts = pgTable("account", {
	userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
	type: text("type").$type<AdapterAccount["type"]>().notNull(),
	provider: text("provider").notNull(),
	providerAccountId: text("providerAccountId").notNull(),
	refresh_token: text("refresh_token"),
	access_token: text("access_token"),
	expires_at: integer("expires_at"),
	token_type: text("token_type"),
	scope: text("scope"),
	id_token: text("id_token"),
	session_state: text("session_state"),
},
	(account) => ({
		compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
	})
)

export const sessions = pgTable("session", {
	sessionToken: text("sessionToken").notNull().primaryKey(),
	userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
	expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable("verificationToken", {
	identifier: text("identifier").notNull(),
	token: text("token").notNull(),
	expires: timestamp("expires", { mode: "date" }).notNull(),
},
	(vt) => ({
		compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
	})
)

export const users = pgTable("user", {
	id: text("id").notNull().primaryKey(),
	name: text("name"),
	email: text("email").notNull(),
	emailVerified: timestamp("emailVerified", { mode: "date" }),
	image: text("image"),
	premium: boolean("premium").notNull().default(false),
	premiumCredits: integer("premiumCredits").notNull().default(Number(process.env.DAILY_PREMIUM_CREDITS ?? 50)),
	generations: integer("generations").notNull().default(Number(process.env.DAILY_FREE_USER_GENERATIONS ?? 25)),
})

export const ips = pgTable("ip", {
	address: text("address").notNull().primaryKey(),
	lastGeneration: timestamp("lastGeneration", { mode: "date" }).notNull().defaultNow(),
	generations: integer("generations").notNull().default(Number(process.env.DAILY_FREE_IP_GENERATIONS ?? 5)),
})

export const system = pgTable("system", {
	id: integer('id').primaryKey().default(1),
	generations: integer("generations").notNull().default(Number(process.env.SYSTEM_DAILY_FREE_GENERATIONS ?? 200)),
})

export const freeQueue = pgTable("freeQueue", {
	id: uuid('id').defaultRandom().notNull().primaryKey(),
	prompt: json('prompt').notNull().$type<GenerationRequest>(),
	status: text('status', { enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'] }).notNull().default('QUEUED'),
	createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
	type: text('type', { enum: ['ANONYMOUS', 'FREE'] }).notNull(),
	userId: text('userId'),
	ipAddress: text('ipAddress'),
})

export const priorityQueue = pgTable("priorityQueue", {
	id: uuid('id').defaultRandom().notNull().primaryKey(),
	prompt: json('prompt').notNull().$type<GenerationRequest>(),
	status: text('status', { enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'] }).notNull().default('QUEUED'),
	createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
	userId: text('userId').notNull(),
	premium: boolean('premium').notNull(),
	cost: integer('cost').default(0).notNull()
})