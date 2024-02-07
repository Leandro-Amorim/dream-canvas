export const models: { [key: string]: Model } = {
	'modelA': {
		id: 'modelA',
		name: 'Model A',
		image: '/test.jpg',
		premium: false,
		type: 'Base'
	},
	'modelB': {
		id: 'modelB',
		name: 'Model B',
		image: '/test.jpg',
		premium: false,
		type: 'XL'
	},
	'modelC': {
		id: 'modelC',
		name: 'Model C',
		image: '/test.jpg',
		premium: true,
		type: 'XL'
	},
}

export const modelArray = Object.keys(models).map((id) => { return models[id] });