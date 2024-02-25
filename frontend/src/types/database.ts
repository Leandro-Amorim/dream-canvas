import { GenerationRequest } from "./generation";

export interface IImage {
    createdAt: string;
    id: string;
    url: string;
	height: number;
    width: number;
    prompt: GenerationRequest;
    userId: string;
}