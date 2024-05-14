
export default function parseS3Url(key: string) {
	return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REG}.amazonaws.com/${key}`;
}
