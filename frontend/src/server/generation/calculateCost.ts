import { GenerationRequest } from "@/types/generation";

export default function calculateCost(request: GenerationRequest) {
	let cost = 0;
	if (request.settings.highPriority) {
		cost += 10;
	}
	if (request.settings.hires.enabled) {
		cost += 5;
	}
	return cost;
}