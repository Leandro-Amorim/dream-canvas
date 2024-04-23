import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./client";
import parseS3Url from "./parseS3Url";

export default async function uploadImage(key: string, body: Buffer) {

	const command = new PutObjectCommand({
		Bucket: process.env.AWS_BUCKET ?? '',
		Key: key,
		Body: body
	});
	await s3Client.send(command);
	return parseS3Url(key);
}