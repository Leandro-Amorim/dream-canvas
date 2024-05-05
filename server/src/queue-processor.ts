import { asc, eq, sql } from "drizzle-orm";
import { db } from "./database";
import { io, processing } from "./queue-websocket-server";
import { freeQueue, priorityQueue } from "./schema";
import { GenerationRequest, RunpodAPIState } from "./types/data";
import { fetchData } from "./utils";
import { models } from "./data/models";
import { samplingMethods, sizesNormal, sizesXL } from "./data/settings";

export const processFreeQueue = () => {
	if (processing.free) {
		processFreeItem().finally(() => {
			processing.free = false;
			setTimeout(processFreeQueue, 100);
		})
	}
	else {
		setTimeout(processFreeQueue, 100);
	}
}

export const processPremiumQueue = () => {
	if (processing.priority) {
		processPremiumItem().finally(() => {
			processing.priority = false;
			setTimeout(processPremiumQueue, 100);
		})
	}
	else {
		setTimeout(processPremiumQueue, 100);
	}
}

export const processFreeItem = async () => {

	const item = await db.query.freeQueue.findFirst({
		where: eq(freeQueue.status, 'QUEUED'),
		orderBy: asc(freeQueue.createdAt)
	});

	if (!item) { return; }

	await sendRequest(item.id, 'free', item.prompt);

	await processFreeItem();
}

export const processPremiumItem = async () => {

	const item = await db.query.priorityQueue.findFirst({
		where: eq(priorityQueue.status, 'QUEUED'),
		orderBy: asc(priorityQueue.createdAt)
	});

	if (!item) { return; }

	await sendRequest(item.id, 'priority', item.prompt);

	await processPremiumItem();
}

export const sendRequest = async (id: string, type: 'free' | 'priority', request: GenerationRequest) => {

	const formattedRequest = formatRequest(request);
	if (!formattedRequest) {
		await setFailed(type, id);
		return;
	}
	
	try {
		const data = await fetchData<{ id: string, state: RunpodAPIState }>(process.env.API_URL ?? '', formattedRequest, {
			'Authorization': `Bearer ${process.env.API_KEY ?? ''}`,
		});

		if (data.state === 'FAILED' || data.state === 'CANCELLED' || data.state === 'TIMED_OUT') {
			throw new Error(data.state);
		}

		await db.update(type === 'free' ? freeQueue : priorityQueue).set({
			status: 'PROCESSING',
			apiId: data.id,
		}).where(sql`id = ${id}`);
		io.to(`generation:${id}`).emit("status_update");
	}
	catch (err) {
		console.error(err);
		await setFailed(type, id);
	}
}

export const formatRequest = (request: GenerationRequest) => {

	const modelData = models[request.model ?? ''];
	if (!modelData) { return null; }

	const size = modelData.type === 'base' ? sizesNormal[request.settings.size ?? ''] : sizesXL[request.settings.size ?? ''];
	if (!size) { return null; }

	const width = size.width;
	const height = size.height;

	return {
		"webhook": process.env.WEBHOOK_URL ?? '',
		"input": {
			"api": {
				"method": "POST",
				"endpoint": '/sdapi/v1/txt2img',
			},
			"payload": {
				"override_settings": {
					"sd_model_checkpoint": modelData.filename,
					"sd_vae": modelData.vaeFilename
				},
				"override_settings_restore_afterwards": true,

				"refiner_checkpoint": modelData.refinerFilename,
				"refiner_switch_at": 0.8,

				"prompt": request.prompt + ' ' + modelData.prompt,
				"negative_prompt": request.negativePrompt + ' ' + modelData.negativePrompt,
				"seed": request.settings.seed,

				"batch_size": 1,

				"steps": request.settings.steps,
				"cfg_scale": request.settings.scale,

				"width": width,
				"height": height,

				"sampler_name": samplingMethods[request.settings.samplingMethod],
				"sampler_index": samplingMethods[request.settings.samplingMethod],
				"scheduler": "karras",

				"enable_hr": request.settings.hires.enabled,
				"hr_upscaler": request.settings.hires.enabled ? request.settings.hires.upscaler : undefined,
				"hr_scale": request.settings.hires.enabled ? request.settings.hires.factor : undefined,
				"hr_second_pass_steps": request.settings.hires.enabled ? request.settings.hires.steps : undefined,
				"denoising_strength": request.settings.hires.enabled ? request.settings.hires.denoisingStrength : undefined,
			}
		}
	}

}

export const setFailed = async (type: 'free' | 'priority', id: string) => {
	const relevantTable = type === 'free' ? freeQueue : priorityQueue;
	const relevantCol = type === 'free' ? freeQueue.id : priorityQueue.id;
	await db.update(relevantTable).set({ status: 'FAILED' }).where(eq(relevantCol, id));
	io.to(`generation:${id}`).emit("status_update");
}