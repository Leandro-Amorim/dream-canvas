import { sign } from "jsonwebtoken";
import { io } from "socket.io-client";

export default function sendSocket(ids: string[]) {

	const jwtData = sign({
		data: {
			id: 'server',
		}
	}, (process.env.JWT_SECRET ?? ''), {
		expiresIn: '1h',
	});

	const socket = io(process.env.NEXT_PUBLIC_WEBSOCKETS_SERVER ?? '', {
		extraHeaders: {
			authorization: `bearer ${jwtData}`
		},
		autoConnect: false,
	});
	socket.connect();

	socket.once('connect', () => {
		socket.emitWithAck('new_notification', ids).then(() => {
			socket.disconnect();
		})
	});
}