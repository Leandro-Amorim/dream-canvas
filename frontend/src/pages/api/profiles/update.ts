import type { NextApiRequest, NextApiResponse } from 'next';
import protectAPI from '@/server/protectAPI';
import { GenericAPIResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import formidable from 'formidable';
import { db } from '@/server/database/database';
import { users } from '@/server/database/schema';
import { eq } from 'drizzle-orm';
import uploadImage from '@/server/s3/uploadImage';
import fs from 'node:fs/promises';
import deleteImage from '@/server/s3/deleteImage';
import getKeyFromS3Url from '@/server/s3/getKeyFromS3Url';
import isS3Url from '@/server/s3/isS3Url';
export type APIResponse = GenericAPIResponse<{ success: boolean }>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

	if (await protectAPI(req, res, 'POST', true)) { return; }

	try {
		const session = await getServerSession(req, res, authOptions);
		const userId = session?.user.id ?? '';

		const oldProfile = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});

		const form = formidable({});
		const [fields, files] = await form.parse<'name' | 'description' | 'image' | 'coverImage', 'image' | 'coverImage'>(req);

		const updateObject = {
			signupCompleted: true
		} as Record<string, string | boolean>;

		if (fields.name) {
			updateObject.name = fields.name[0];
		}

		if (fields.description) {
			updateObject.description = fields.description[0];
		}

		let markToDeleteImage = false;

		if (files.image) {
			const file = files.image[0];
			const path = file.filepath;
			const name = file.newFilename;

			const body = await fs.readFile(path);
			const url = await uploadImage(`profiles/${userId}/${name}`, body);
			await fs.unlink(path);

			updateObject.image = url;
			markToDeleteImage = true;
		}
		else if (fields.image && fields.image[0] === '') {
			updateObject.image = '';
			markToDeleteImage = true;
		}

		let markToDeleteCoverImage = false;

		if (files.coverImage) {
			const file = files.coverImage[0];
			const path = file.filepath;
			const name = file.newFilename;

			const body = await fs.readFile(path);
			const url = await uploadImage(`profiles/${userId}/cover_${name}`, body);
			await fs.unlink(path);

			updateObject.coverImage = url;
			markToDeleteCoverImage = true;
		}
		else if (fields.coverImage && fields.coverImage[0] === '') {
			updateObject.coverImage = '';
			markToDeleteCoverImage = true;
		}

		await db.update(users).set(updateObject).where(eq(users.id, userId));

		try {
			if (oldProfile?.image && markToDeleteImage && isS3Url(oldProfile.image)) {
				const key = getKeyFromS3Url(oldProfile.image);
				await deleteImage(key);
			}

			if (oldProfile?.coverImage && markToDeleteCoverImage && isS3Url(oldProfile.coverImage)) {
				const key = getKeyFromS3Url(oldProfile.coverImage);
				await deleteImage(key);
			}
		}
		catch (err) {
			console.log('Error deleting old images');
		}

		return res.status(200).json({
			status: 'success',
			data: {
				success: true
			},
		} satisfies APIResponse);

	} catch (error) {
		console.error(error);
		return res.status(500).json({
			status: 'error',
			reason: 'INTERNAL_SERVER_ERROR',
		} satisfies APIResponse);
	}
}

export const config = {
	api: {
		bodyParser: false,
	},
}