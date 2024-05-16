import { IncomingMessage, createServer } from "http";
import { Server } from "socket.io";
import type { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData, SocketExt } from "./types/sockets";
import jwt from "jsonwebtoken";
import { processFreeQueue, processPremiumQueue, processing } from "./queue-processor";
import express from 'express';

const app = express();
app.use('/handler', express.json());

const port = process.env.PORT || 3001;
const httpServer = createServer(app);

export const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
	cors: {
		origin: process.env.PUBLIC_URL ?? '',
		methods: ["GET", "POST"],
		credentials: true
	},
	maxHttpBufferSize: 1e8
});

const jwtSecret = process.env.JWT_SECRET ?? '';

app.post('/handler', (req, res) => {

	try {
		const header = req.headers["authorization"];

		if (!req.body.type) {
			throw new Error("invalid type");
		}

		if (!header) {
			throw new Error("no token");
		}

		if (!header.startsWith("bearer ")) {
			throw new Error("invalid token");
		}

		const token = header.substring(7);
		const decoded = jwt.verify(token, jwtSecret) as { data: { id: string } } | undefined;
		if (!decoded) {
			throw new Error("invalid token");
		}

		const id = decoded.data?.id;
		if (id === 'server') {
			switch (req.body.type) {
				case 'new_notification':
					const userIds = (req.body.userIds ?? []) as string[];
					for (const userId of userIds) {
						io.to(`user:${userId}`).emit("notification");
					}
					break;
				case 'new_generation':
					const generationType = req.body.generationType as 'free' | 'priority';
					console.log('New generation arrived', generationType);
					if (generationType === 'free') {
						processing.free = true;
					}
					else {
						processing.priority = true;
					}
					break;
				case 'generation_completed':
					const id = req.body.id as string;
					console.log('Generation completed', id);
					io.to(`generation:${id}`).emit("status_update");
					break;
			}
		}

	}
	catch (err) {
		console.log(err);
	}
	res.send('ok');
	res.end();
});

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
});

export const startWebsocketsServer = async () => {
	httpServer.listen(port, () => {
		console.log(`Websockets Server is running at: http://localhost:${port}`);
	});
	processFreeQueue();
	processPremiumQueue();
}