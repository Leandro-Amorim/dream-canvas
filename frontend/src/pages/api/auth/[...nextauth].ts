import NextAuth, { NextAuthOptions } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/database/database";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
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
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',

			//Not recommended in production, only used for demo purposes (even though google and github can be considered "safe" providers since email is always verified)
			allowDangerousEmailAccountLinking: true,

		}),
		GithubProvider({
			clientId: process.env.GITHUB_CLIENT_ID ?? '',
			clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',

			//Same as above
			allowDangerousEmailAccountLinking: true,
		})
	],
	callbacks: {
		async session({ session, user }) {
			session.user.premium = user.premium;
			session.user.premiumCredits = user.premiumCredits;
			session.user.id = user.id;
			session.user.description = user.description;
			session.user.coverImage = user.coverImage;
			session.user.signupCompleted = user.signupCompleted;
			
			return session;
		},

	},
	pages: {
		'signIn': '/signin'
	},
};

export default NextAuth(authOptions);