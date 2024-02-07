import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export async function fetchData(input: string) {
	const response = await fetch(input);
	if (!response.ok) {
		throw new Error('Network fail');
	}
	return response.json();
}
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export function parseModifiers(prompt: string) {
	const results = prompt.match(/<lora:\w+:\d+(?:\.\d+)?>/g);

	const index: { [key: string]: number } = {};

	for (const result of results ?? []) {
		const arr = result.replace('<lora:', '').replace('>', '').split(':');
		index[arr[0]] = isNaN(Number(arr[1])) ? 1 : Number(arr[1]);
		index[arr[0]] = clamp(index[arr[0]], 0, 2);
	}
	return index;
}