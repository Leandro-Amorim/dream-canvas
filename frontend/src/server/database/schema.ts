import { timestamp, pgTable, text, primaryKey, integer, boolean, uuid, json, varchar } from "drizzle-orm/pg-core";
import type { AdapterAccount } from '@auth/core/adapters';
import { GenerationRequest } from "@/types/generation";
import { ReportType } from "@/types/database";

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

export const images = pgTable("images", {
	id: uuid('id').notNull().primaryKey(),
	url: text('url').notNull(),
	width: integer('width').notNull(),
	height: integer('height').notNull(),
	prompt: json('prompt').notNull().$type<GenerationRequest>(),
	userId: text('userId').notNull().references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
})

export const posts = pgTable("posts", {
	id: varchar('id', { length: 64 }).notNull().primaryKey(),

	title: text('title').notNull().default(''),
	description: text('description').notNull().default(''),

	anonymous: boolean('anonymous').notNull().default(false),
	hidePrompt: boolean('hidePrompt').notNull().default(false),
	orphan: boolean('orphan').notNull().default(false),

	authorId: text('authorId').references(() => users.id, { onDelete: "cascade" }),
	createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
});

export const postImages = pgTable("postImages", {
	postId: varchar('postId', { length: 64 }).notNull().references(() => posts.id, { onDelete: "cascade" }),
	imageId: uuid('imageId').notNull().references(() => images.id, { onDelete: "cascade" }),

	order: integer('order').notNull().default(0),
},
	(row) => ({
		compoundKey: primaryKey({ columns: [row.postId, row.imageId] }),
	})
);

export const postLikes = pgTable("postLikes", {
	postId: varchar('postId', { length: 64 }).notNull().references(() => posts.id, { onDelete: "cascade" }),
	userId: varchar('userId', { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
	likedAt: timestamp('likedAt', { mode: 'string' }).notNull().defaultNow(),
},
	(row) => ({
		compoundKey: primaryKey({ columns: [row.postId, row.userId] }),
	})
);

export const postSaves = pgTable("postSaves", {
	postId: varchar('postId', { length: 64 }).notNull().references(() => posts.id, { onDelete: "cascade" }),
	userId: varchar('userId', { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
	savedAt: timestamp('savedAt', { mode: 'string' }).notNull().defaultNow(),
},
	(row) => ({
		compoundKey: primaryKey({ columns: [row.postId, row.userId] }),
	})
);

export const blocks = pgTable("blocks", {
	userId: varchar('userId', { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
	blockedId: varchar('blockedId', { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
	hidden: boolean('hidden').notNull().default(false),
	blockedAt: timestamp('blockedAt', { mode: 'string' }).notNull().defaultNow(),
},
	(row) => ({
		compoundKey: primaryKey({ columns: [row.userId, row.blockedId] }),
	})
);

export const follows = pgTable("follows", {
	userId: varchar('userId', { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
	followerId: varchar('followerId', { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
	followedAt: timestamp('followedAt', { mode: 'string' }).notNull().defaultNow(),
},
	(row) => ({
		compoundKey: primaryKey({ columns: [row.userId, row.followerId] }),
	})
);

export const reports = pgTable("reports", {
	reportId: uuid('reportId').notNull().primaryKey().defaultRandom(),
	postId: varchar('postId', { length: 64 }).notNull().references(() => posts.id, { onDelete: "cascade" }),
	userId: varchar('userId', { length: 64 }).notNull().references(() => users.id, { onDelete: "cascade" }),
	reason: text('reason').notNull().$type<ReportType>(),
	reportedAt: timestamp('reportedAt', { mode: 'string' }).notNull().defaultNow(),
});
