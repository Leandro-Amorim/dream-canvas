export const modifiers: { [key: string]: Modifier } = {
	'modifierA': {
		id: 'modifierA',
		name: 'Modifier A',
		image: '/test.jpg',
		premium: false,
		triggerWords: ['modifierA'],
		type: 'CHARACTER',
	},
	'modifierB': {
		id: 'modifierB',
		name: 'Modifier B',
		image: '/test.jpg',
		premium: false,
		triggerWords: [],
		type: 'STYLE',
	},
	'modifierC': {
		id: 'modifierC',
		name: 'Modifier C',
		image: '/test.jpg',
		premium: true,
		triggerWords: [],
		type: 'STYLE',
	},
}

export const modifierArray = Object.keys(modifiers).map((id) => { return modifiers[id] });