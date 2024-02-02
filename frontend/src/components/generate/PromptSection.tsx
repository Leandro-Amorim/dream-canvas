import { GearIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import PreviewBox from "./PreviewBox";
import TagCarousel from "./TagCarousel";
import { Textarea } from "../ui/textarea";

export default function PromptSection() {
	return (
		<div className="flex gap-6">
			<div className="w-[60%]">
				<div className="flex flex-col">
					<h3 className="text-2xl font-semibold">Prompt</h3>
					<Textarea className="mt-4 h-[216px] resize-none bg-secondary" placeholder="Insert your prompt here." />
				</div>

				<div className="flex flex-col mt-6">
					<h3 className="text-2xl font-semibold">Negative Prompt</h3>
					<Textarea className="mt-4 h-[194px] resize-none bg-secondary" placeholder="Insert your negative prompt here." />
				</div>
			</div>
			<div className="w-[40%] mt-12 flex flex-col items-center ">
				<PreviewBox />
				<div className="w-full flex gap-2 pt-4 justify-end">
					<Button className="h-12 text-base px-16">Generate</Button>
					<Button variant="outline" size="icon" className="size-12"><GearIcon className="w-5 h-5" /></Button>
				</div>
			</div>
		</div>
	)
}