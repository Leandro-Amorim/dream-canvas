import { IncomingMessage, createServer } from "http";
import { Server } from "socket.io";
import type { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData, SocketExt } from "./types/sockets";
import jwt from "jsonwebtoken";
import { processFreeQueue, processPremiumQueue, processing } from "./queue-processor";

const port = process.env.PORT || 3001;
const httpServer = createServer();

export const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
	cors: {
		origin: process.env.PUBLIC_URL ?? '',
		methods: ["GET", "POST"],
		credentials: true
	},
	maxHttpBufferSize: 1e8
});

const jwtSecret = process.env.JWT_SECRET ?? '';

io.engine.use((req: IncomingMessage, res: Response, next: (error?: Error) => void) => {
	//@ts-ignore
	const isHandshake = req._query.sid === undefined;
	if (!isHandshake) {
		return next();
	}

	const header = req.headers["authorization"];

	if (!header) {
		return next(new Error("no token"));
	}

	if (!header.startsWith("bearer ")) {
		return next(new Error("invalid token"));
	}

	const token = header.substring(7);

	jwt.verify(token, jwtSecret, (err, decoded) => {
		if (err || !decoded) {
			return next(new Error("invalid token"));
		}
		//@ts-ignore
		req.user = decoded.data;
		next();
	});
});

io.on('connection', (socket: SocketExt) => {

	const socketUserId = socket.request.user?.id;
	if (socketUserId && socketUserId !== 'server') {

		if (socket.request.user?.type === 'notification') {
			socket.join(`user:${socketUserId}`);
		}
		else if (socket.request.user?.type === 'generation') {
			socket.join(`generation:${socketUserId}`);
		}
	}

	socket.on('new_notification', (userIds, cb) => {
		if (socketUserId === 'server') {
			for (const userId of userIds) {
				io.to(`user:${userId}`).emit("notification");
			}
			cb(true);
		}
	});

	socket.on('new_generation', (type, cb) => {
		if (socketUserId === 'server') {
			console.log('New generation arrived', type);
			if (type === 'free') {
				processing.free = true;
			}
			else {
				processing.priority = true;
			}
			cb(true);
		}
	});

	socket.on('generation_completed', (id, cb) => {
		if (socketUserId === 'server') {
			console.log('Generation completed', id);
			io.to(`generation:${id}`).emit("status_update");
			cb(true);
		}
	});
});

export const startWebsocketsServer = async () => {
	httpServer.listen(port, () => {
		console.log(`Websockets Server is running at: http://localhost:${port}`);
	});
	processFreeQueue();
	processPremiumQueue();
}