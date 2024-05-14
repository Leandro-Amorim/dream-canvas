
export default function getKeyFromS3Url(url: string) {
	return url.replace(`https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REG}.amazonaws.com/`, '');
}
