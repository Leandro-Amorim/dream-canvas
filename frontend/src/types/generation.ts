

export interface GenerationSettings {
	size: string,
	samplingMethod: string,
	seed: number,
	steps: number,
	scale: number,
	highPriority: boolean,
	hires: {
		enabled: boolean,
		upscaler: string,
		factor: number,
		steps: number,
		denoisingStrength: number
	}
}

export interface GenerationRequest {
	model: string | null,
	modifiers: { [key: string]: number },
	prompt: string,
	negativePrompt: string,
	settings: GenerationSettings
}