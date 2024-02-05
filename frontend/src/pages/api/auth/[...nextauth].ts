import NextAuth, { NextAuthOptions } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/server/database/database";
import EmailProvider from "next-auth/providers/email";


export const authOptions: NextAuthOptions = {
	//@ts-ignore
	adapter: DrizzleAdapter(db),
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
};

export default NextAuth(authOptions);