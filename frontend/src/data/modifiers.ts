export const modifiers: { [key: string]: Modifier } = {
	'princess_xl_v2': {
		id: 'princess_xl_v2',
		name: 'Disney Princess',
		image: 'https://dreamcanvasdev.s3.us-east-2.amazonaws.com/modifiers/disneyprincess.jpg',
		premium: false,
		triggerWords: ['Anna', 'Ariel', 'Aurora', 'Belle', 'Cinderella', 'Elsa',
			'Asha', 'Jasmine', 'Merida', 'Moana', 'Mulan', 'Pocahontas', 'Rapunzel',
			'Snow White', 'Tiana', 'Vanellope'
		],
		type: 'CHARACTER',
	},
	'casting shadow style v2': {
		id: 'casting shadow style v2',
		name: 'Casting Shadows',
		image: 'https://dreamcanvasdev.s3.us-east-2.amazonaws.com/modifiers/casting_shadows.jpg',
		premium: false,
		triggerWords: ['casting shadow style', 'cucoloris patterned illumination'],
		type: 'STYLE',
	},
	'ParchartXL_CODA': {
		id: 'ParchartXL_CODA',
		name: 'Parchments',
		image: 'https://dreamcanvasdev.s3.us-east-2.amazonaws.com/modifiers/parchments.jpg',
		premium: false,
		triggerWords: ['on parchment'],
		type: 'STYLE',
	},
	'Painted World-000006': {
		id: 'Painted World-000006',
		name: 'Painted World',
		image: 'https://dreamcanvasdev.s3.us-east-2.amazonaws.com/modifiers/painted_world.jpg',
		premium: true,
		triggerWords: ['painted world', 'colorful splashes'],
		type: 'STYLE',
	},
	'Neon_Cyberpunk_Impressionism_SDXL': {
		id: 'Neon_Cyberpunk_Impressionism_SDXL',
		name: 'Neon Cyberpunk',
		image: 'https://dreamcanvasdev.s3.us-east-2.amazonaws.com/modifiers/neon_cyberpunk.jpg',
		premium: true,
		triggerWords: ['mad-cybrpnkimprss'],
		type: 'STYLE',
	},
}

export const modifierArray = Object.keys(modifiers).map((id) => { return modifiers[id] });