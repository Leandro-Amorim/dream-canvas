
export default function isS3Url(url: string) {
	return url.includes(`https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REG}.amazonaws.com/`);
}
