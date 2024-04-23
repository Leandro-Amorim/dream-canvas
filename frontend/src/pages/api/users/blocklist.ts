import type { NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { SQL, and, asc, desc, eq, gt, lt, or } from 'drizzle-orm';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import protectAPI from '@/server/protectAPI';
import { db } from '@/server/database/database';
import { blocks, users } from '@/server/database/schema';
import { IBlock } from '@/types/database';

export type APIResponse = GenericAPIResponse<IBlock[]>;

export interface RequestBody {
	cursor?: { id: string, blockedAt: string },
}

export const pageSize = 10;

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		const cursorFilters: (SQL | undefined)[] = [];

		const sq = db.$with('sq').as(
			db.select(
				{
					id: blocks.blockedId,
					name: users.name,
					description: users.description,
					image: users.image,
					blockedAt: blocks.blockedAt
				}
			).from(blocks).innerJoin(users, eq(blocks.blockedId, users.id))
				.where(
					and(
						eq(blocks.userId, userId),
						eq(blocks.hidden, false)
					)
				)
		);

		if (req.body.cursor) {
			cursorFilters.push(
				or(
					lt(sq.blockedAt, req.body.cursor.blockedAt),
					and(eq(sq.blockedAt, req.body.cursor.blockedAt), gt(sq.id, req.body.cursor.id)),
				)
			)
		}

		const query = db.with(sq).select().from(sq)
			.where(and(...cursorFilters))
			.limit(pageSize)
			.orderBy(desc(sq.blockedAt), asc(sq.id));

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