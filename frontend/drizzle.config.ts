import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit';

dotenv.config({path:'./.env.local'});

export default defineConfig({
	schema: "./src/server/database/schema.ts",
	driver: 'pg',
	out: "./drizzle",
	dbCredentials: {
		connectionString: process.env.DATABASE_URL ?? '',
	},
	verbose: true,
	strict: true,
})