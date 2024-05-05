import { ModelData } from "../types/data";

export const models: { [key: string]: ModelData } = {
	'juggernaut_xl': {
		id: 'juggernaut_xl',
		name: 'Juggernaut XL',
		type: 'XL',
		filename: 'juggernautXL_juggernautX.safetensors',
		prompt: '',
		negativePrompt: 'nsfw nude',
		vaeFilename: 'sdxl_vae.safetensors',
	},
	'animapencil_xl': {
		id: 'animapencil_xl',
		name: 'AnimaPencil XL',
		type: 'XL',
		filename: 'animaPencilXL_v310.safetensors',
		prompt: '',
		negativePrompt: 'nsfw nude',
		vaeFilename: 'sdxl_vae.safetensors',
	},
	'epicrealism_xl': {
		id: 'epicrealism_xl',
		name: 'Epic Realism XL',
		type: 'XL',
		filename: 'epicrealismXL_v6Miracle.safetensors',
		prompt: '',
		negativePrompt: 'nsfw nude',
		vaeFilename: 'sdxl_vae.safetensors',
	},
}

export const modelArray = Object.keys(models).map((id) => { return models[id] });