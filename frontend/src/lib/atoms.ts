import { atom } from "recoil";

export const modelState = atom({ key: 'modelState', default: null as string | null });

export const modifiersState = atom({ key: 'modifiersState', default: {} as { [key: string]: number } })

export const promptState = atom({ key: 'promptState', default: '' });

export const negativePromptState = atom({ key: 'negativePromptState', default: '' });