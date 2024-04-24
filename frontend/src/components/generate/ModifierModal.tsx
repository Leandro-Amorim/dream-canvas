import { useRecoilState } from "recoil";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../ui/dialog";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { modifierModalState } from "@/lib/modalAtoms";
import { Toggle } from "../ui/toggle";
import { Button } from "../ui/button";
import Image from "next/image";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useCallback, useEffect, useState } from "react";
import { promptState } from "@/lib/atoms";
import escapeStringRegexp from 'escape-string-regexp';

export default function ModifierModal() {

	const [prompt, setPrompt] = useRecoilState(promptState);
	const [modal, setModal] = useRecoilState(modifierModalState);
	const [initialWords, setInitialWords] = useState<{ [key: string]: boolean }>({});

	useEffect(() => {
		if (modal.open) {
			const wordIndex = structuredClone(modal.triggerWords);
			for (const word of Object.keys(modal.triggerWords)) {
				wordIndex[word] = new RegExp('(?<!<lora:)\\b' + escapeStringRegexp(word) + '\\b', 'gm').test(prompt);
			}
			setInitialWords(structuredClone(wordIndex));
			setModal((prev) => { return { ...prev, triggerWords: wordIndex } })
		}
	}, [modal.open, prompt, setModal]);

	const onClose = useCallback(() => {
		setModal((prev) => {
			return {
				...prev,
				id: null,
				name: '',
				image: '',
				open: false,
				selected: false,
				strength: 0,
				triggerWords: {}
			}
		});
		setInitialWords({});
	}, [setModal, setInitialWords]);

	const removeModifier = useCallback(() => {
		setPrompt(prompt.replaceAll(new RegExp(',*\\s*<lora:' + modal.id + ':\\d+(?:\\.\\d+)?>', 'g'), ''));
		onClose();
	}, [modal.id, onClose, prompt, setPrompt]);

	const applyModifier = useCallback(() => {

		let newPrompt = prompt;
		if (modal.selected) {
			newPrompt = prompt.replaceAll(new RegExp('<lora:' + modal.id + ':\\d+(?:\\.\\d+)?>', 'g'), `<lora:${modal.id}:${modal.strength}>`);
		}
		else {
			newPrompt = prompt + (prompt.length > 0 ? `, <lora:${modal.id}:${modal.strength}>` : `<lora:${modal.id}:${modal.strength}>`)
		}

		for (const word of Object.keys(modal.triggerWords)) {

			const alreadyExists = initialWords[word];

			if (modal.triggerWords[word] && !alreadyExists) {
				newPrompt += `, ${word}`;
			}
			if (!modal.triggerWords[word]) {
				newPrompt = newPrompt.replaceAll(new RegExp(',*\\s*(?<!<lora:)\\b' + escapeStringRegexp(word) + '\\b', 'gm'), '');
			}
		}
		setPrompt(newPrompt);
		onClose();
	}, [modal, initialWords, onClose, prompt, setPrompt]);

	const toggleTriggerWord = useCallback((word: string) => {
		const wordIndex = structuredClone(modal.triggerWords);
		wordIndex[word] = !wordIndex[word];
		setModal((prev) => {
			return {
				...prev,
				triggerWords: wordIndex
			}
		})
	}, [modal.triggerWords, setModal]);

	const toggleAllTriggerWords = useCallback(() => {
		const wordIndex = structuredClone(modal.triggerWords);
		let hasFalseValue = false;

		for (const word of Object.keys(wordIndex)) {
			if (wordIndex[word] === false) {
				hasFalseValue = true;
				break;
			}
		}

		for (const word of Object.keys(wordIndex)) {
			wordIndex[word] = hasFalseValue ? true : false;
		}

		setModal((prev) => {
			return {
				...prev,
				triggerWords: wordIndex
			}
		})
	}, [modal.triggerWords, setModal])

	return (
		<Dialog open={modal.open} onOpenChange={(open) => { if (!open) { onClose() } }}>
			<DialogContent className="w-full max-w-[600px] rounded-lg gap-0 pb-6">
				<DialogHeader>
					<DialogTitle className="font-medium text-lg line-clamp-1 mb-2">{modal.name}</DialogTitle>
				</DialogHeader>

				<div className="flex gap-6">
					<div className="flex-1 flex flex-col mt-4">
						<div className="mb-4">
							<h3 className="font-medium line-clamp-1 mb-2 text-sm">Strength</h3>
							<div className="flex gap-2">
								<Slider max={2} min={0} step={0.1} value={[modal.strength]} onValueChange={(val) => { setModal((prev) => { return { ...prev, strength: val[0] } }) }} />
								<Input className="basis-20" type="number" max={2} min={0} step={0.1} value={modal.strength} onChange={(e) => { setModal((prev) => { return { ...prev, strength: e.target.valueAsNumber } }) }} />
							</div>
						</div>
						<div className="mb-2">
							<div className="mb-2 flex justify-between">
								<h3 className="font-medium line-clamp-1 text-sm">Trigger words</h3>
								<Button variant='link' className="ml-2 p-0 pb-[1px] h-fit" onClick={toggleAllTriggerWords}>Select All</Button>
							</div>

							<div className="flex flex-wrap gap-2">
								{
									Object.keys(modal.triggerWords).map((el, i) => {
										return (
											<Toggle key={i} variant={'default'} pressed={modal.triggerWords[el]} onPressedChange={() => { toggleTriggerWord(el) }} className="bg-muted data-[state=on]:bg-primary data-[state=on]:text-white">{el}</Toggle>
										)
									})
								}

							</div>
						</div>
					</div>
					<div className="flex-1 self-center aspect-[3/4] rounded-lg overflow-hidden relative">
						<Image src={modal.image} alt={modal.name} fill={true} className={`object-cover`} />
					</div>
				</div>
				<DialogFooter className="mt-4 gap-2 sm:gap-0">
					{
						modal.selected && <Button variant={'destructive'} onClick={removeModifier}>Remove</Button>
					}
					<Button variant={'outline'} onClick={onClose}>Cancel</Button>
					<Button onClick={applyModifier}>{modal.selected ? 'Apply' : 'Add modifier'}</Button>
				</DialogFooter>

			</DialogContent>
		</Dialog>
	)
}