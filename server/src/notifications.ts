import { IncomingMessage, createServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import type { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData, SocketExt } from "./types";

const port = 3001;
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
	console.log("user connected", socketUserId);
	if (socketUserId && socketUserId !== 'server') {
		socket.join(`user:${socketUserId}`);
	}

	socket.on('new_notification', (userIds, cb) => {
		if (socketUserId === 'server') {
			for (const userId of userIds) {
				console.log("new notification", userId);
				io.to(`user:${userId}`).emit("notification");
			}
			cb(true);
		}
	})

	socket.on("connect_error", (err: Error) => {
		console.log(`connect_error due to ${err.message}`);
	});
});

export const startNotificationsServer = () => {
	httpServer.listen(port, () => {
		console.log(`application is running at: http://localhost:${port}`);
	});
}