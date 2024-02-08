import { GenerationRequest, GenerationSettings } from "@/types/generation";
import { atom, selector } from "recoil";

export const modelState = atom({ key: 'modelState', default: null as string | null });
export const modelTypeState = atom({ key: 'modelTypeState', default: null as string | null });

export const modifiersState = atom({ key: 'modifiersState', default: {} as { [key: string]: number } })

export const promptState = atom({ key: 'promptState', default: '' });

export const negativePromptState = atom({ key: 'negativePromptState', default: '' });

export const settingsState = atom({
	key: 'settingsState',
	default: {
		size: 'portrait',
		samplingMethod: 'euler_a',
		seed: -1,
		steps: 30,
		scale: 10,
		highPriority: false,
		hires: {
			enabled: false,
			upscaler: 'esrgan_4x',
			factor: 2,
			steps: 10,
			denoisingStrength: 0.5
		}
	} satisfies GenerationSettings as GenerationSettings
})

export const generationRequestState = selector({
	key: 'generationRequestState',
	get: ({ get }) => {

		return {
			model: get(modelState),
			modifiers: get(modifiersState),
			prompt: get(promptState),
			negativePrompt: get(negativePromptState),
			settings: get(settingsState),
		} satisfies GenerationRequest as GenerationRequest
	},
});