import { sign } from "jsonwebtoken";

export default async function sendSocket(ids: string[]) {

	const jwtData = sign({
		data: {
			id: 'server',
		}
	}, (process.env.JWT_SECRET ?? ''), {
		expiresIn: '1h',
	});

	
	await fetch(`${process.env.NEXT_PUBLIC_WEBSOCKETS_SERVER}/handler`, {
		headers: {
			"Content-Type": "application/json",
			"authorization": `bearer ${jwtData}`
		},
		method:'POST',
		body: JSON.stringify({
			type: 'new_notification',
			userIds: ids
		}),
	});
}