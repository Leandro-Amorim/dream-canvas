interface Model {
	id: string,
	name: string,
	type: 'base' | 'XL',
	image: string,
	premium: boolean,
}

type ModifierType = 'CHARACTER' | 'STYLE';

interface Modifier {
	id: string,
	name: string,
	type: ModifierType,
	image: string,
	premium: boolean,
	triggerWords: string[]
}