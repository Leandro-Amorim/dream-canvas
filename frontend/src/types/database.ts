import { GenerationRequest } from "./generation";

export interface IImage {
	id: string;
	url: string;
	height: number;
	width: number;
	prompt: GenerationRequest;
	userId: string;
	createdAt: string;
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

export interface IPost {
	id: string,
	title: string,
	description: string,

	anonymous: boolean,
	hidePrompt: boolean,
	orphan: boolean,

	createdAt: string,

	images: (Omit<IImage, 'userId' | 'prompt'> & { prompt: GenerationRequest | null })[],

	author: {
		id: string | null,
		name: string | null,
		avatar: string | null,
	},
	followedByMe: boolean,
	savedByMe: boolean,
	likeCount: number,
	likedByMe: boolean
}

export interface IComment {
	id: string,
	postId: string,
	message: string,
	replyingTo: string | null,
	createdAt: string,
	author: {
		id: string | null,
		name: string | null,
		avatar: string | null
	} | null,
	likeCount: number,
	likedByMe: boolean,
	subscribedByMe: boolean,
}

export interface IProfile {
	id: string,
	name: string,
	description: string,
	image: string,
	coverImage: string,
	followersCount: number,
	followingCount: number,
	postsCount: number,
	savedPostsCount: number,
	followedByMe: boolean,
	blockedByMe: boolean,
}

export interface IProfileCard {
	id: string,
	name: string,
	image: string,
	postImages: string[],
	followedByMe: boolean,
	blockedByMe: boolean,
	followedAt: string
}

export type NotificationType = 'NEW_FOLLOWER' | 'NEW_LIKE' | 'NEW_COMMENT' | 'NEW_REPLY' | 'SYSTEM';

export interface INotification {
	id: string,
	type: NotificationType,
	seen: boolean,

	user: {
		id: string | null,
		name: string | null,
		avatar: string | null,
		followedByMe: boolean
	} | null,

	post: {
		id: string | null,
		title: string | null,
		imageUrl: string | null,
	} | null,

	additionalData: string | null,
	additionalImage: string | null,

	createdAt: string
}