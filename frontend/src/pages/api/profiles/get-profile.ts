import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { blocks, follows, postSaves, posts, users } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { eq, sql } from 'drizzle-orm';
import { IProfile } from '@/types/database';

export type APIResponse = GenericAPIResponse<{ profile: IProfile | null }>;

export interface RequestBody {
	profileId: string,
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', false)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		const profile = await getProfile(req.body.profileId, userId);

		return res.status(200).json({
			status: 'success',
			data: {
				profile: profile,
			},
		} satisfies APIResponse);

	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: 'error',
			reason: 'INTERNAL_SERVER_ERROR',
		} satisfies APIResponse);
	}
}

export const getProfile = async function (profileId: string, userId: string): Promise<IProfile | null> {
	if (!profileId) {
		return null;
	}
	const profile = (await db.select(
		{
			id: users.id,
			name: users.name,
			description: users.description,
			image: users.image,
			coverImage: users.coverImage,
			followersCount: sql<number>`(SELECT count(*) from ${follows} where ${follows.userId} = ${profileId})::integer`.as('followersCount'),
			followingCount: sql<number>`(SELECT count(*) from ${follows} where ${follows.followerId} = ${profileId})::integer`.as('followingCount'),
			postsCount: sql<number>`(SELECT count(*) from ${posts} where ${posts.authorId} = ${profileId} and ${posts.orphan} = false and ${posts.anonymous} = false)::integer`.as('postsCount'),
			savedPostsCount: sql<number>`(SELECT count(*) from ${postSaves} where ${postSaves.userId} = ${profileId})::integer`.as('savedPostsCount'),
			followedByMe: sql<boolean>`EXISTS(SELECT 1 from ${follows} where ${follows.userId} = ${profileId} and ${follows.followerId} = ${userId})`.as('followedByMe'),
			blockedByMe: sql<boolean>`EXISTS(SELECT 1 from ${blocks} where ${blocks.blockedId} = ${profileId} and ${blocks.userId} = ${userId})`.as('blockedByMe'),
		}
	).from(users).where(eq(users.id, profileId)).limit(1)).at(0) ?? null satisfies (IProfile | null);
	return profile;
}