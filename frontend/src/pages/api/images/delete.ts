import type { NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { APIRequest, GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { images } from '@/server/database/schema';
import { db } from '@/server/database/database';
import { and, eq, inArray } from 'drizzle-orm';

export type APIResponse = GenericAPIResponse<null>;

export interface RequestBody {
	imageIds: string[]
}

export default async function handler(req: APIRequest<RequestBody>, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		await db.delete(images).where(and(eq(images.userId, userId), inArray(images.id, req.body.imageIds)))

		return res.status(200).json({
			status: 'success',
			data: null,
		} satisfies APIResponse);

	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: 'error',
			reason: 'INTERNAL_SERVER_ERROR',
		} satisfies APIResponse);
	}
}