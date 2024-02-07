import { modifierArray } from '@/data/modifiers';
import { GenericAPIResponse } from '@/types/api';
import type { NextApiRequest, NextApiResponse } from 'next';

export type APIResponse = GenericAPIResponse<Modifier[]>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		return res.status(200).json({
			status: 'success',
			data: modifierArray
		} satisfies APIResponse)
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: 'error',
			reason: 'Internal Server Error',
		} satisfies APIResponse);
	}
}