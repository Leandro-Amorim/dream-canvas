import { sign } from "jsonwebtoken";

export default function getSocketAuth(id: string){
	const jwtData = sign({
		data: {
			id,
		}
	}, (process.env.JWT_SECRET ?? ''), {
		expiresIn: '1h',
	});
	return jwtData;
}