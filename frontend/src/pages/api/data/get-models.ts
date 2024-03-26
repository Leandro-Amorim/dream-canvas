import { modelArray } from '@/data/models';
import { GenericAPIResponse } from '@/types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

export type APIResponse = GenericAPIResponse<Model[]>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		return res.status(200).json({
			status: 'success',
			data: modelArray
		} satisfies APIResponse)
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: 'error',
			reason: 'INTERNAL_SERVER_ERROR',
		} satisfies APIResponse);
	}
}