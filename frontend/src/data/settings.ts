export const sizesNormal: { [key: string]: { label: string, width: number, height: number } } = {
	'portrait': {
		label: 'Portrait (512 x 768)',
		width: 512,
		height: 768,
	},
	'landscape': {
		label: 'Landscape (768 x 512)',
		width: 768,
		height: 512,
	},
	'square': {
		label: 'Square (512 x 512)',
		width: 512,
		height: 512
	},
}
export const sizesNormalArray = Object.keys(sizesNormal).map((id) => { return { value: id, label: sizesNormal[id].label } });

export const sizesXL: { [key: string]: { label: string, width: number, height: number } } = {
	'portrait': {
		label: 'SDXL Portrait (896 x 1152)',
		width: 896,
		height: 1152,
	},
	'landscape': {
		label: 'SDXL Landscape (1152 x 896)',
		width: 1152,
		height: 896,
	},
	'square': {
		label: 'SDXL Square (1024 x 1024)',
		width: 1024,
		height: 1024,
	}
}
export const sizesXLArray = Object.keys(sizesXL).map((id) => { return { value: id, label: sizesXL[id].label } });

export const samplingMethods: { [key: string]: string } = {
	'euler_a': 'Euler A',
}
export const samplingMethodsArray = Object.keys(samplingMethods).map((id) => { return { value: id, label: samplingMethods[id] } });

export const upscalerMethods: { [key: string]: string } = {
	'esrgan_4x': 'ESGAN 4X'
}
export const upscalerMethodsArray = Object.keys(upscalerMethods).map((id) => { return { value: id, label: upscalerMethods[id] } });
