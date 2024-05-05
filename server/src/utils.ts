import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { GenerationRequest } from "./types/data";
import { models } from "./data/models";
import { sizesNormal, sizesXL } from "./data/settings";

export async function fetchData<T = unknown>(input: string, body?: unknown, headers?: { [key: string]: string }) {

	headers = headers ?? {};
	headers = {
		...headers,
		'Content-Type': 'application/json',
	}

	const response = await fetch(input, {
		headers: body ? headers : undefined,
		method: body ? 'POST' : 'GET',
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		throw new Error('Network fail');
	}
	return response.json() as Promise<T>;
}

export const s3Client = new S3Client({
	region: process.env.AWS_REGION ?? '',
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY ?? '',
		secretAccessKey: process.env.AWS_SECRET_KEY ?? '',
	}
});


export const parseS3Url = function (key: string) {
	return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export const uploadImage = async function (key: string, body: Buffer) {

	const command = new PutObjectCommand({
		Bucket: process.env.AWS_BUCKET ?? '',
		Key: key,
		Body: body
	});
	await s3Client.send(command);
	return parseS3Url(key);
}

export const parseSize = function (request: GenerationRequest) {

	const modelData = models[request.model ?? ''];
	if (!modelData) { return null; }

	const size = modelData.type === 'base' ? sizesNormal[request.settings.size ?? ''] : sizesXL[request.settings.size ?? ''];
	if (!size) { return null; }

	return size;
}
