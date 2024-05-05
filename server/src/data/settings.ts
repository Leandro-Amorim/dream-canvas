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
	'portrait_9x16': {
		label: 'SDXL Portrait 9:16 (720 x 1280)',
		width: 720,
		height: 1280,
	},
	'landscape': {
		label: 'SDXL Landscape (1152 x 896)',
		width: 1152,
		height: 896,
	},
	'landscape_16x9': {
		label: 'SDXL Landscape 16:9 (1280 x 720)',
		width: 1280,
		height: 720,
	},
	'square': {
		label: 'SDXL Square (1024 x 1024)',
		width: 1024,
		height: 1024,
	},
	'small_square': {
		label: 'SDXL Small Square (512 x 512)',
		width: 512,
		height: 512
	}
}
export const sizesXLArray = Object.keys(sizesXL).map((id) => { return { value: id, label: sizesXL[id].label } });

export const samplingMethods: { [key: string]: string } = {
	'k_dpmpp_2m': 'DPM++ 2M',
	'k_dpmpp_sde': 'DPM++ SDE',
	'k_dpmpp_2m_sde': 'DPM++ 2M SDE',
	'k_dpmpp_2m_sde_heun': 'DPM++ 2M SDE Heun',
	'k_dpmpp_2s_a': 'DPM++ 2S a',
	'k_dpmpp_3m_sde': 'DPM++ 3M SDE',
	'k_euler_a': 'Euler a',
	'k_euler': 'Euler',
	'k_lms': 'LMS',
	'k_heun': 'Heun',
	'k_dpm_2': 'DPM2',
	'k_dpm_2_a': 'DPM2 a',
	'k_dpm_fast': 'DPM Fast',
	'k_dpm_ad': 'DPM adaptive',
	'restart': 'Restart',
	'ddim': 'DDIM',
	'plms': 'PLMS',
	'unipc': 'UniPC',
	'k_lcm': 'LCM',
}
export const samplingMethodsArray = Object.keys(samplingMethods).map((id) => { return { value: id, label: samplingMethods[id] } });

export const upscalerMethods: { [key: string]: string } = {
	'Latent': 'Latent',
	'Lanczos': 'Lanczos',
	'Nearest': 'Nearest',
	'4x-UltraSharp': 'ESRGAN 4x',
	'DAT x2': 'DAT x2',
	'DAT x3': 'DAT x3',
	'DAT x4': 'DAT x4',
	'LDSR': 'LDSR',
	'R-ESRGAN 4x+': 'R-ESRGAN 4x+',
}
export const upscalerMethodsArray = Object.keys(upscalerMethods).map((id) => { return { value: id, label: upscalerMethods[id] } });
