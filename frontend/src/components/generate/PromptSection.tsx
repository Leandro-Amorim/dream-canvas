import { GearIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Card, CardContent } from "../ui/card";
import { useRecoilState, useSetRecoilState } from "recoil";
import { modifiersState, negativePromptState, promptState } from "@/lib/atoms";
import { useEffect } from "react";
import { parseModifiers } from "@/lib/utils";

export default function PromptSection() {

	const [prompt, setPrompt] = useRecoilState(promptState);
	const [negativePrompt, setNegativePrompt] = useRecoilState(negativePromptState);
	const setModifiers = useSetRecoilState(modifiersState);

	useEffect(() => {
		setModifiers(parseModifiers(prompt));
	}, [prompt, setModifiers]);

	return (
		<div className="flex flex-col">

			<div className="flex flex-col lg:flex-row lg:gap-6">

				<div className="flex-[6]">
					<div className="flex flex-col">
						<h3 className="text-2xl font-semibold">Prompt</h3>
						<Textarea className="mt-4 h-[216px] resize-none bg-secondary" placeholder="Insert your prompt here." value={prompt} onChange={(e) => { setPrompt(e.target.value) }} />
					</div>

					<div className="flex flex-col mt-6">
						<h3 className="text-2xl font-semibold">Negative Prompt</h3>
						<Textarea className="mt-4 h-[194px] resize-none bg-secondary" placeholder="Insert your negative prompt here." value={negativePrompt} onChange={(e) => { setNegativePrompt(e.target.value) }} />
					</div>
				</div>

				<div className="flex-[4] mt-4 lg:mt-12">
					<Card className="w-full h-[420px] lg:h-full">
						<CardContent>

						</CardContent>
					</Card>
				</div>

			</div>

			<div className="w-full flex gap-2 mt-4 justify-end">
				<Button className="h-12 text-base px-16 grow sm:grow-0">Generate</Button>
				<Button variant="outline" size="icon" className="size-12"><GearIcon className="w-5 h-5" /></Button>
			</div>
		</div>

	)
}