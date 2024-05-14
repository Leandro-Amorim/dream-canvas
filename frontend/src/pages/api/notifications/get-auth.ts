import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { GenericAPIResponse } from '@/types/api';
import protectAPI from '@/server/protectAPI';
import getSocketAuth from '@/server/getSocketAuth';

export type APIResponse = GenericAPIResponse<{ token: string }>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		const jwtData = getSocketAuth(userId, 'notification');

		return res.status(200).json({
			status: 'success',
			data: {
				token: jwtData,
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