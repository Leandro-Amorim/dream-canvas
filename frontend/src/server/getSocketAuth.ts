import { sign } from "jsonwebtoken";

export default function getSocketAuth(id: string, type: 'notification' | 'generation') {
	const jwtData = sign({
		data: {
			id,
			type,
		}
	}, (process.env.JWT_SECRET ?? ''), {
		expiresIn: '1h',
	});
	return jwtData;
}