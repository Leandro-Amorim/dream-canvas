import { sign } from "jsonwebtoken";

export default async function notifyGenerationCompleted(id: string) {

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
			type: 'generation_completed',
			id
		}),
	});
}