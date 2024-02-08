import { modelArray } from '@/data/models';
import { GenericAPIResponse } from '@/types/api';
import { GenerationRequest } from '@/types/generation';
import type { NextApiRequest, NextApiResponse } from 'next';

export type APIResponse = GenericAPIResponse<number>;


interface APIRequest extends NextApiRequest {
	body: GenerationRequest
}

export default async function handler(req: APIRequest, res: NextApiResponse) {
	try {
		let cost = 0;
		if (req.body.settings.highPriority) {
			cost += 10;
		}
		if (req.body.settings.hires.enabled) {
			cost += 5;
		}

		return res.status(200).json({
			status: 'success',
			data: cost
		} satisfies APIResponse);
		
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: 'error',
			reason: 'Internal Server Error',
		} satisfies APIResponse);
	}
}