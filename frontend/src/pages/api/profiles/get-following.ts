import type { NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { SQL, and, asc, desc, eq, gt, lt, or, sql } from 'drizzle-orm';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { IProfileCard } from '@/types/database';
import protectAPI from '@/server/protectAPI';
import { NULL_UUID } from '@/lib/utils';
import { db } from '@/server/database/database';
import { blocks, follows, images, postImages, posts, users } from '@/server/database/schema';

export type APIResponse = GenericAPIResponse<IProfileCard[]>;

export interface RequestBody {
	profileId: string,
	cursor?: { id: string, followedAt: string },
}

export const pageSize = 10;

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', false)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? NULL_UUID;

		const filters: (SQL | undefined)[] = [];
		const cursorFilters: (SQL | undefined)[] = [];

		filters.push(
			eq(follows.followerId, req.body.profileId)
		);

		const sq = db.$with('sq').as(
			db.select(
				{
					id: users.id,
					name: users.name,
					image: users.image,
					postImages: sql<string[]>`
					(SELECT JSON_AGG(data.url) from (
						SELECT ${images.url}
						from ${posts} join ${postImages} p1 on ${posts.id} = p1."postId"
						join ${images} on ${images.id} = p1."imageId"
						left join ${postImages} p2 on p1."postId" = p2."postId" and p1."order" > p2."order"
						where p2."postId" is null and ${posts.authorId} = ${users.id}
						and ${posts.orphan} = false and ${posts.anonymous} = false
						order by ${posts.createdAt} desc
						limit 3
					) data)
					`.as('postImages'),
					followedByMe: sql<boolean>`EXISTS(SELECT 1 from ${follows} where ${follows.userId} = ${users.id} and ${follows.followerId} = ${userId})`.as('followedByMe'),
					blockedByMe: sql<boolean>`EXISTS(SELECT 1 from ${blocks} where ${blocks.blockedId} = ${users.id} and ${blocks.userId} = ${userId})`.as('blockedByMe'),
					followedAt: follows.followedAt
				}
			).from(users).innerJoin(follows, eq(users.id, follows.userId))
				.where(and(...filters))
		);

		if (req.body.cursor) {
			cursorFilters.push(
				or(
					lt(sq.followedAt, req.body.cursor.followedAt),
					and(eq(sq.followedAt, req.body.cursor.followedAt), gt(sq.id, req.body.cursor.id)),
				)
			)
		}

		const query = db.with(sq).select().from(sq)
			.where(and(...cursorFilters))
			.limit(pageSize)
			.orderBy(desc(sq.followedAt), asc(sq.id));

		//console.log(query.toSQL());
		const data = await query;

		return res.status(200).json({
			status: 'success',
			data,
		} satisfies APIResponse);

	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: 'error',
			reason: 'INTERNAL_SERVER_ERROR',
		} satisfies APIResponse);
	}
}