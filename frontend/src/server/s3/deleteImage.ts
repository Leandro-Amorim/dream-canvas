import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./client";

export default async function deleteImage(key: string) {

	const command = new DeleteObjectCommand({
		Bucket: process.env.AWS_BUCKET ?? '',
		Key: key,
	});
	await s3Client.send(command);
}