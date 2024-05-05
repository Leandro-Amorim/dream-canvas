import { json } from "drizzle-orm/pg-core"
import { text } from "drizzle-orm/pg-core"
import { integer } from "drizzle-orm/pg-core"
import { boolean } from "drizzle-orm/pg-core"
import { timestamp } from "drizzle-orm/pg-core"
import { uuid } from "drizzle-orm/pg-core"
import { pgTable } from "drizzle-orm/pg-core"
import { GenerationRequest } from "./types/data"
import { varchar } from "drizzle-orm/pg-core"
import { primaryKey } from "drizzle-orm/pg-core"

export const freeQueue = pgTable("freeQueue", {
	id: uuid('id').defaultRandom().notNull().primaryKey(),
	prompt: json('prompt').notNull().$type<GenerationRequest>(),
	status: text('status', { enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'] }).notNull().default('QUEUED'),
	createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	type: text('type', { enum: ['ANONYMOUS', 'FREE'] }).notNull(),
	userId: text('userId'),
	ipAddress: text('ipAddress'),
	apiId: text('apiId').unique(),
})

export const priorityQueue = pgTable("priorityQueue", {
	id: uuid('id').defaultRandom().notNull().primaryKey(),
	prompt: json('prompt').notNull().$type<GenerationRequest>(),
	status: text('status', { enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'] }).notNull().default('QUEUED'),
	createdAt: timestamp('createdAt', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
	userId: text('userId').notNull(),
	premium: boolean('premium').notNull(),
	cost: integer('cost').default(0).notNull(),
	apiId: text('apiId').unique(),
})


export const images = pgTable("images", {
	id: uuid('id').notNull().primaryKey(),
	url: text('url').notNull(),
	width: integer('width').notNull(),
	height: integer('height').notNull(),
	prompt: json('prompt').notNull().$type<GenerationRequest>(),
	userId: text('userId'),
	createdAt: timestamp('createdAt', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
})

export const posts = pgTable("posts", {
	id: varchar('id', { length: 64 }).notNull().primaryKey(),

	title: text('title').notNull().default(''),
	description: text('description').notNull().default(''),

	anonymous: boolean('anonymous').notNull().default(false),
	hidePrompt: boolean('hidePrompt').notNull().default(false),
	orphan: boolean('orphan').notNull().default(false),

	authorId: text('authorId'),
	createdAt: timestamp('createdAt', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
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
