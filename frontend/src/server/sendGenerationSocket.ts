import { sign } from "jsonwebtoken";
import { io } from "socket.io-client";

export default function sendSocket(type: 'free' | 'priority') {

	const jwtData = sign({
		data: {
			id: 'server',
		}
	}, (process.env.JWT_SECRET ?? ''), {
		expiresIn: '1h',
	});

	const socket = io(process.env.NEXT_PUBLIC_QUEUE_SERVER ?? '', {
		extraHeaders: {
			authorization: `bearer ${jwtData}`
		},
		autoConnect: false,
	});
	socket.connect();

	socket.once('connect', () => {
		socket.emitWithAck('new_generation', type).then(() => {
			socket.disconnect();
		})
	});
}