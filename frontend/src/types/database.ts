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

export interface IPostCard {
	id: string,
	title: string,
	imageUrl: string,
	imageWidth: number,
	imageHeight: number,
	imageCount: number,
	createdAt: string,
	anonymous: boolean,
	orphan: boolean,
	author: {
		id: string | null,
		name: string | null,
		avatar: string | null,
	},
	followedByMe: boolean,
	savedByMe: boolean,
	likeCount: number,
	likedByMe: boolean,
	commentCount: number
}

export type ReportType = 'INNAPROPRIATE_TITLE_OR_DESCRIPTION' | 'INNAPROPRIATE_ARTWORK' | 'SPAM';