import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { blocks, posts } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { eq } from 'drizzle-orm';

export type APIResponse = GenericAPIResponse<{ success: boolean }>;

export interface RequestBody {
	postId: string,
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		const post = await db.query.posts.findFirst({
			where: eq(posts.id, req.body.postId),
		});

		if (post?.authorId === userId) {
			return res.status(400).json({
				status: 'error',
				reason: 'BAD_REQUEST',
			} satisfies APIResponse);
		}

		if (post?.authorId) {
			await db.insert(blocks).values({
				blockedId: post.authorId,
				userId,
				hidden: post.anonymous || post.orphan,
			}).onConflictDoUpdate({
				target: [blocks.blockedId, blocks.userId],
				set: { blockedAt: (new Date()).toISOString(), hidden: post.anonymous || post.orphan },
			});
		}

		return res.status(200).json({
			status: 'success',
			data: {
				success: true
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