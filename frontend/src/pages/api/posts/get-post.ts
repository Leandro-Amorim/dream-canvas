import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { follows, images, postImages, postLikes, postSaves, posts, users } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { and, eq, sql } from 'drizzle-orm';
import { IImage, IPost } from '@/types/database';
import { GenerationRequest } from '@/types/generation';

export type APIResponse = GenericAPIResponse<{ post: IPost | null }>;

export interface RequestBody {
	postId: string,
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', false)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		const post = await getPost(req.body.postId, userId);

		return res.status(200).json({
			status: 'success',
			data: {
				post: post,
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

export const getPost = async function (postId: string, userId: string): Promise<IPost | null> {
	const post = (await db.select(
		{
			id: posts.id,
			title: posts.title,
			description: posts.description,
			anonymous: posts.anonymous,
			hidePrompt: posts.hidePrompt,
			orphan: posts.orphan,
			createdAt: posts.createdAt,

			images: sql<(Omit<IImage, 'userId' | 'prompt'> & { prompt: GenerationRequest | null })[]>`
			(SELECT json_agg(row_to_json(data)) from (
				SELECT ${images.id},${images.url}, ${images.height}, ${images.width}, ${images.createdAt},
				case when ${posts.hidePrompt} = true then NULL else ${images.prompt} end as prompt
				from ${images} join ${postImages} on ${images.id} = ${postImages.imageId}
				where ${postImages.postId} = ${posts.id} order by ${postImages.order}) data)`.as('images'),

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
		}
	).from(posts).leftJoin(users, eq(posts.authorId, users.id))
		.where(eq(posts.id, postId)).limit(1)).at(0) ?? null satisfies (IPost | null);
	return post;
}