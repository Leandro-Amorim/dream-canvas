import { models } from "@/data/models";
import { modifiers } from "@/data/modifiers";
import { GenerationRequest } from "@/types/generation";

export default function checkAbuseAttempt(request: GenerationRequest,) {
	const model = models[request.model ?? ''];

	if (model?.premium) {
		return true;
	}

	for (const id of Object.keys(request.modifiers)) {
		const modifier = modifiers[id];
		if (modifier?.premium) {
			return true;
		}
	}
	
	return false;
}