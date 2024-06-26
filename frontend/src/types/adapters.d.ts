import type { AdapterUser as BaseAdapterUser } from "next-auth/adapters";

declare module "next-auth/adapters" {
	interface AdapterUser extends BaseAdapterUser {
		premium: boolean,
		premiumCredits: number,
		description: string,
		coverImage: string,
		signupCompleted: boolean
	}
}