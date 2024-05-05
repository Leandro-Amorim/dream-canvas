import { Server } from "socket.io";
import { GenerationClientToServerEvents, GenerationServerToClientEvents, GenerationSocketExt, InterServerEvents, SocketData } from "./types/sockets";
import { IncomingMessage, createServer } from "http";
import jwt from "jsonwebtoken";
import { processFreeQueue, processPremiumQueue } from "./queue-processor";

const port = 3002;
const httpServer = createServer();

export const processing = {
	free: false,
	priority: false
}

export const io = new Server<GenerationClientToServerEvents, GenerationServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
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

io.on('connection', (socket: GenerationSocketExt) => {
	const socketUserId = socket.request.user?.id;
	if (socketUserId && socketUserId !== 'server') {
		socket.join(`generation:${socketUserId}`);
	}

	socket.on('new_generation', (type, cb) => {
		if (socketUserId === 'server') {
			if (type === 'free') {
				processing.free = true;
			}
			else {
				processing.priority = true;
			}
			cb(true);
		}
	})
});

export const startQueueProcessing = async () => {
	httpServer.listen(port, () => {
		console.log(`Queue Server is running at: http://localhost:${port}`);
	});
	processFreeQueue();
	processPremiumQueue();
}