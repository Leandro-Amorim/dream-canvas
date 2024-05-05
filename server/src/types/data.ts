
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

export interface ModelData {
	id: string,
	name: string,
	type: 'base' | 'XL',
	prompt: string,
	negativePrompt: string,
	filename: string,
	refinerFilename?: string,
	vaeFilename?: string
}

export interface APIOutput {
	id: string,
	output: {
		images: string[]
	},
	status: RunpodAPIState
}


export type RunpodAPIState = 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'TIMED_OUT';