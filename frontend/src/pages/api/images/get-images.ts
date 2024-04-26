import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { images } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { and, eq, sql } from 'drizzle-orm';
import { IImage } from '@/types/database';
import { imagesCursor } from '@/server/database/cursors';

export type APIResponse = GenericAPIResponse<IImage[]>;

export interface RequestBody {
	search: string,
	cursor?: string,
}

export const pageSize = 10;

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		const data = await db.select().from(images)
			.orderBy(...imagesCursor.orderBy)
			.where(
				and(
					eq(images.userId, userId),
					sql`${images.prompt}->>'prompt' ilike '%' || ${req.body.search} || '%'`,
					imagesCursor.where(req.body.cursor)
				)
			)
			.limit(pageSize);

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