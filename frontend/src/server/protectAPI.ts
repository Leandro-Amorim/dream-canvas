import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { GenericAPIResponse } from "@/types/api";

export default async function protectAPI(req: NextApiRequest, res: NextApiResponse, method: 'GET' | 'POST' = 'POST', auth = true) {

	const session = await getServerSession(req, res, authOptions);

	let error = false;
	if (req.method !== method) {
		const resp: GenericAPIResponse<null> = {
			status: 'error',
			reason: 'Method not allowed',
		};
		res.status(405).json(resp);
		error = true;
	}
	else if (auth && session?.user === undefined) {
		const resp: GenericAPIResponse<null> = {
			status: 'error',
			reason: 'Not authorized',
		}
		res.status(401).json(resp);
		error = true;
	}
	return error;
}