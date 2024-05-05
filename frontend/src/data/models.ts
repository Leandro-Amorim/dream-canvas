export const models: { [key: string]: Model } = {
	'juggernaut_xl': {
		id: 'juggernaut_xl',
		name: 'Juggernaut XL',
		image: 'https://dreamcanvasdev.s3.us-east-2.amazonaws.com/models/juggernaut_xl.jpg',
		premium: false,
		type: 'XL'
	},
	'animapencil_xl': {
		id: 'animapencil_xl',
		name: 'AnimaPencil XL',
		image: 'https://dreamcanvasdev.s3.us-east-2.amazonaws.com/models/animapencil_xl.jpg',
		premium: false,
		type: 'XL'
	},
	'epicrealism_xl': {
		id: 'epicrealism_xl',
		name: 'Epic Realism XL',
		image: 'https://dreamcanvasdev.s3.us-east-2.amazonaws.com/models/epicrealism_xl.jpg',
		premium: true,
		type: 'XL'
	},
}

export const modelArray = Object.keys(models).map((id) => { return models[id] });