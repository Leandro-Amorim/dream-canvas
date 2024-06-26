import { IncomingMessage } from "node:http";
import { Socket } from "socket.io";

export interface ServerToClientEvents {
	notification: () => void;
	status_update: () => void;
}

export interface ClientToServerEvents {
}

export interface InterServerEvents {
	ping: () => void;
}

export interface SocketData {
}

export interface SocketRequest extends IncomingMessage {
	user?: {
		type: 'notification' | 'generation';
		id: string
	}
}

export interface SocketExt extends Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
	request: SocketRequest
}