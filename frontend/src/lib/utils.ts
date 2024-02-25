import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const NULL_UUID = '00000000-0000-0000-0000-000000000000';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export async function fetchData(input: string, body?: unknown) {

	const response = await fetch(input, {
		headers: body ? { "Content-Type": "application/json" } : undefined,
		method: body ? 'POST' : 'GET',
		body: body ? JSON.stringify(body) : undefined,
	});

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

export function downloadImage(url: string) {
	fetch(url).then(async (resp) => {
		const buffer = await resp.arrayBuffer();
		const objectUrl = window.URL.createObjectURL(new Blob([buffer]));
		const link = document.createElement("a");
		link.href = objectUrl;
		link.setAttribute("download", "image.png");
		document.body.appendChild(link);
		link.click();
	}).catch(console.error);
}