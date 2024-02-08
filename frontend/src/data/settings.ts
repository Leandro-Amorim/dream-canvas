export const sizesNormal: { [key: string]: string } = {
	'portrait': 'Portrait (512 x 768)',
	'landscape': 'Landscape (768 x 512)',
	'square': 'Square (512 x 512)',
}
export const sizesNormalArray = Object.keys(sizesNormal).map((id) => { return { value: id, label: sizesNormal[id] } });

export const sizesXL: { [key: string]: string } = {
	'portrait': 'SDXL Portrait (896 x 1152)',
	'landscape': 'SDXL Landscape (1152 x 896)',
	'square': 'SDXL Square (1024 x 1024)',
}
export const sizesXLArray = Object.keys(sizesXL).map((id) => { return { value: id, label: sizesXL[id] } });

export const samplingMethods: { [key: string]: string } = {
	'euler_a': 'Euler A',
}
export const samplingMethodsArray = Object.keys(samplingMethods).map((id) => { return { value: id, label: samplingMethods[id] } });

export const upscalerMethods: { [key: string]: string } = {
	'esrgan_4x': 'ESGAN 4X'
}
export const upscalerMethodsArray = Object.keys(upscalerMethods).map((id) => { return { value: id, label: upscalerMethods[id] } });
