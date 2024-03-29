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

export const generationStatusState = atom({
	key: 'generationStatusState',
	default: {
		id: null as null | string,
		type: null as null | 'free' | 'priority',
		status: null as null | 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
		data: null as null | {
			url: string,
			refunded: boolean,
		}
	}
})

export const generationToastState = atom({
	key: 'generationToastState',
	default: {
		open: false,
	}
})

export const signinModalOpenState = atom({ key: 'signinModalOpenState', default: false });

export const blockUserModalState = atom({
	key: 'blockUserModalState', default: {
		open: false,
		mode: 'post' as 'post' | 'user',
		userId: null as null | string,
		postId: null as null | string,
		onSuccess: (() => { }) as () => void
	}
});

export const reportModalState = atom({
	key: 'reportModalState', default: {
		open: false,
		postId: null as null | string,
	}
});

export const deletePostModalState = atom({
	key: 'deletePostModalState', default: {
		open: false,
		postId: null as null | string,
		onSuccess: (() => { }) as () => void
	}
});

export const postModalState = atom({
	key: 'postModalState', default: {
		open: false,
		postId: null as null | string,
		onDirty: (() => { }) as () => void
	}
})

export const sharePostModalState = atom({
	key: 'sharePostModalState', default: {
		open: false,
		postId: null as null | string,
		postTitle: '',
		imageUrl: '',
	}
})
