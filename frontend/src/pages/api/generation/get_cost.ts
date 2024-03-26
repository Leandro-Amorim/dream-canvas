import calculateCost from '@/server/generation/calculateCost';
import { GenericAPIResponse } from '@/types/api';
import { GenerationRequest } from '@/types/generation';
import type { NextApiRequest, NextApiResponse } from 'next';

export type APIResponse = GenericAPIResponse<number>;


interface APIRequest extends NextApiRequest {
	body: GenerationRequest
}

export default async function handler(req: APIRequest, res: NextApiResponse) {
	try {

		return res.status(200).json({
			status: 'success',
			data: calculateCost(req.body)
		} satisfies APIResponse);
		
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: 'error',
			reason: 'INTERNAL_SERVER_ERROR',
		} satisfies APIResponse);
	}
}