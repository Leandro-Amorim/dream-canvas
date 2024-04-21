import type { NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { SQL, and, asc, desc, eq, gt, isNull, lt, ne, or, sql } from 'drizzle-orm';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { INotification } from '@/types/database';
import protectAPI from '@/server/protectAPI';
import { NULL_UUID } from '@/lib/utils';
import { db } from '@/server/database/database';
import { comments, follows, images, notifications, postImages, postLikes, posts, users } from '@/server/database/schema';
import { alias } from 'drizzle-orm/pg-core';

export type APIResponse = GenericAPIResponse<INotification[]>;

export interface RequestBody {
	cursor?: { id: string, createdAt: string },
}

export const pageSize = 5;

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? NULL_UUID;

		const cursorFilters: (SQL | undefined)[] = [];

		const followers = alias(users, "followers");
		const usersWhoCommented = alias(users, "usersWhoCommented");
		const usersWhoLiked = alias(users, "usersWhoLiked");

		const sq = db.$with('sq').as(
			db.select({
				id: notifications.id,
				type: notifications.type,
				seen: notifications.seen,
				user: {
					id: sql<string | null>`COALESCE(${followers.id}, ${usersWhoCommented.id}, ${usersWhoLiked.id})`.as('userId'),
					name: sql<string | null>`COALESCE(${followers.name}, ${usersWhoCommented.name}, ${usersWhoLiked.name})`.as('userName'),
					avatar: sql<string | null>`COALESCE(${followers.image}, ${usersWhoCommented.image}, ${usersWhoLiked.image})`.as('userAvatar'),
					followedByMe: sql<boolean>`EXISTS(SELECT 1 from ${follows} where ${follows.userId} = COALESCE(${followers.id}, ${usersWhoCommented.id}, ${usersWhoLiked.id}) and ${follows.followerId} = ${userId})`.as('followedByMe'),
				},
				post: {
					id: sql<string | null>`${posts.id}`.as('postId'),
					title: posts.title,
					imageUrl: sql<string>`(SELECT i.url from ${images} i join ${postImages} pi on i.id = "pi"."imageId" where "pi"."postId" = ${posts.id} order by pi.order asc limit 1)`.as('imageUrl'),
				},
				additionalData: sql<string | null>`
				case when (${notifications.type} = 'NEW_LIKE') then (
					SELECT count(*) from ${postLikes} where ${postLikes.postId} = ${posts.id})::text
				 else ${notifications.data} end`.as('additionalData'),
				additionalImage: notifications.image,
				createdAt: notifications.createdAt,
				rn: sql<number>`row_number() over ( PARTITION BY ${notifications.type}, ${notifications.postId} ORDER BY ${notifications.createdAt} DESC)`.as('rn'),
			}).from(notifications)
				.leftJoin(follows, eq(follows.id, notifications.followId))
				.leftJoin(followers, eq(followers.id, follows.followerId))
				.leftJoin(postLikes, eq(postLikes.id, notifications.likeId))
				.leftJoin(usersWhoLiked, eq(usersWhoLiked.id, postLikes.userId))
				.leftJoin(comments, eq(comments.id, notifications.commentId))
				.leftJoin(usersWhoCommented, eq(usersWhoCommented.id, comments.authorId))
				.leftJoin(posts, eq(posts.id, notifications.postId))
				.where(
					or(
						eq(notifications.userId, userId),
						isNull(notifications.userId)
					)
				)
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
			.where(
				and(
					...cursorFilters,
					or(
						ne(sq.type, 'NEW_LIKE'),
						and(eq(sq.type, 'NEW_LIKE'), eq(sq.rn, 1)),
					)
				),
			)
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