import { models } from "@/data/models";
import { sizesNormal, sizesXL } from "@/data/settings";
import { GenerationRequest } from "@/types/generation";

export const parseSize = function (request: GenerationRequest) {

	const modelData = models[request.model ?? ''];
	if (!modelData) { return null; }

	const size = modelData.type === 'base' ? sizesNormal[request.settings.size ?? ''] : sizesXL[request.settings.size ?? ''];
	if (!size) { return null; }

	return size;
}
