import type { NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { SQL, and, asc, desc, eq, gt, lt, or, sql } from 'drizzle-orm';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { IPostCard } from '@/types/database';
import protectAPI from '@/server/protectAPI';
import { NULL_UUID } from '@/lib/utils';
import { db } from '@/server/database/database';
import { comments, follows, images, postImages, postLikes, postSaves, posts, users } from '@/server/database/schema';

export type APIResponse = GenericAPIResponse<IPostCard[]>;

export interface RequestBody {
	cursor?: { id: string, createdAt: string },
}

export const pageSize = 10;

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? NULL_UUID;

		const filters: (SQL | undefined)[] = [];
		const cursorFilters: (SQL | undefined)[] = [];

		filters.push(
			sql<boolean>`EXISTS(SELECT 1 from ${postLikes} where ${postLikes.postId} = ${posts.id} and ${postLikes.userId} = ${userId})`,
		)

		const sq = db.$with('sq').as(
			db.select(
				{
					id: posts.id,
					title: posts.title,
					imageUrl: sql<string>`(SELECT i.url from ${images} i join ${postImages} pi on i.id = "pi"."imageId" where "pi"."postId" = ${posts.id} order by pi.order asc limit 1)`.as('imageUrl'),
					imageWidth: sql<number>`(SELECT i.width from ${images} i join ${postImages} pi on i.id = "pi"."imageId" where "pi"."postId" = ${posts.id} order by pi.order asc limit 1)`.as('imageWidth'),
					imageHeight: sql<number>`(SELECT i.height from ${images} i join ${postImages} pi on i.id = "pi"."imageId" where "pi"."postId" = ${posts.id} order by pi.order asc limit 1)`.as('imageHeight'),
					imageCount: sql<number>`(SELECT count(*) from ${postImages} where ${postImages.postId} = ${posts.id})::integer`.as('imageCount'),
					createdAt: posts.createdAt,
					orphan: posts.orphan,
					anonymous: posts.anonymous,
					author: {
						id: sql<string | null>`case when (${posts.orphan} = true OR (${posts.anonymous} = true AND ${users.id} != ${userId})) then NULL else ${users.id} end`.as('authorId'),
						name: sql<string | null>`case when (${posts.orphan} = true OR (${posts.anonymous} = true AND ${users.id} != ${userId})) then NULL else ${users.name} end`.as('authorName'),
						avatar: sql<string | null>`case when (${posts.orphan} = true OR (${posts.anonymous} = true AND ${users.id} != ${userId})) then NULL else ${users.image} end`.as('authorAvatar'),
					},
					followedByMe: sql<boolean>`
					case when (${posts.orphan} = true OR ${posts.anonymous} = true) then FALSE else (
						EXISTS(SELECT 1 from ${follows} where ${follows.userId} = ${posts.authorId} and ${follows.followerId} = ${userId})
					) end`.as('followedByMe'),
					savedByMe: sql<boolean>`EXISTS(SELECT 1 from ${postSaves} where ${postSaves.postId} = ${posts.id} and ${postSaves.userId} = ${userId})`.as('savedByMe'),
					likeCount: sql<number>`(SELECT count(*) from ${postLikes} where ${postLikes.postId} = ${posts.id})::integer`.as('likeCount'),
					likedByMe: sql<boolean>`EXISTS(SELECT 1 from ${postLikes} where ${postLikes.postId} = ${posts.id} and ${postLikes.userId} = ${userId})`.as('likedByMe'),
					commentCount: sql<number>`(SELECT count(*) from ${comments} where ${comments.postId} = ${posts.id})::integer`.as('commentCount'),
				}
			).from(posts)
				.leftJoin(users, eq(posts.authorId, users.id))
				.where(and(...filters))
		);

		if (req.body.cursor) {
			cursorFilters.push(
				or(
					lt(sq.createdAt, req.body.cursor.createdAt),
					and(eq(sq.createdAt, req.body.cursor.createdAt), gt(sq.id, req.body.cursor.id)),
				)
			)
		}

		const query = db.with(sq).select().from(sq)
			.where(and(...cursorFilters))
			.limit(pageSize)
			.orderBy(desc(sq.createdAt), asc(sq.id));

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