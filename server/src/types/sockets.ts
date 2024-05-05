import { IncomingMessage } from "node:http";
import { Socket } from "socket.io";

export interface ServerToClientEvents {
	notification: () => void;
}

export interface ClientToServerEvents {
	new_notification: (userIds: string[], cb: (success: boolean) => void) => void;
}

export interface InterServerEvents {
	ping: () => void;
}

export interface SocketData {
}

export interface SocketRequest extends IncomingMessage {
	user?: {
		id: string
	}
}

export interface SocketExt extends Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
	request: SocketRequest
}

export interface GenerationServerToClientEvents {
	status_update: () => void;
}

export interface GenerationClientToServerEvents {
	new_generation: (type: 'free' | 'premium', cb: (success: boolean) => void) => void;
}

export interface GenerationSocketExt extends Socket<GenerationClientToServerEvents, GenerationServerToClientEvents, InterServerEvents, SocketData> {
	request: SocketRequest
}