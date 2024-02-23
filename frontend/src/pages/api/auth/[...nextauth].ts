import NextAuth, { NextAuthOptions } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/database/database";
import EmailProvider from "next-auth/providers/email";
import { accounts, sessions, users, verificationTokens } from "@/server/database/schema";


export const tableFn = (table: string) => {
	switch (table) {
		case 'user':
			return users;
		case 'account':
			return accounts;
		case 'session':
			return sessions;
		case 'verificationToken':
			return verificationTokens;
		default:
			throw new Error(`Table ${table} not found`);
	}
};

export const authOptions: NextAuthOptions = {
	//@ts-ignore
	adapter: DrizzleAdapter(db, tableFn),
	providers: [
		EmailProvider({
			server: {
				host: process.env.SMTP_HOST,
				port: Number(process.env.SMTP_PORT),
				auth: {
					user: process.env.SMTP_USER,
					pass: process.env.SMTP_PASSWORD,
				},
			},
			from: process.env.EMAIL_FROM,
		})
	],
	callbacks: {
		async session({ session, user }) {
			//@ts-ignore
			session.user.premium = user.premium;
			session.user.id = user.id;
			return session;
		}
	},
};

export default NextAuth(authOptions);