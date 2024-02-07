import { atom } from "recoil";

export const modifierModalState = atom({
	key: 'modifierModalState',
	default: {
		open: false,
		selected: false,
		id: null as string | null,
		name: '',
		image: '',
		strength: 0,
		triggerWords: {} as { [key: string]: boolean }
	}
})