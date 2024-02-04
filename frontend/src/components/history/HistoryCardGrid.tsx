import Image from "next/image";
import { IconCircle, IconDots, IconPhotoPlus } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "../ui/button";

export default function HistoryCardGrid() {

	const [hover, setHover] = useState(false);

	return (
		<div className="w-full flex flex-col">

			<div className="w-full aspect-[2/3] relative rounded-md overflow-hidden bg-gray-900">
				<Image src={'/test-post.png'} fill={true} alt="Test" className={`object-cover transition-all ${hover && 'scale-105'}`} />
				<div className="absolute transition-all opacity-0 hover:opacity-100 inset-0 p-4 flex items-end bg-gradient-to-t from-[rgba(0,0,0,0.8)] from-5% via-transparent via-30%"
					onMouseEnter={() => { setHover(true) }} onMouseLeave={() => { setHover(false) }}>
					<h3 className="font-medium text-white line-clamp-4 text-sm">
						Jokester began sneaking into the castle in the middle of the night and leaving
						jokes all over the place: under the kings pillow, in his soup, even in the
						royal toilet. The king was furious, but he couldnt seem to stop Jokester. And
						then, one day, the people of the kingdom discovered that the jokes left by
						Jokester were so funny that they couldnt help but laugh. And once they
						started laughing, they couldnt stop.
					</h3>
					<Button className="absolute top-[6px] left-[6px] w-6 h-6 text-white" size={'icon'} variant={'link'}> <IconCircle size={22} /> </Button>
				</div>
			</div>

			<div className="w-full flex items-center mt-2 justify-between">
				<div className="flex flex-col">
					<h4 className="font-medium text-sm">Juggernaut XL</h4>
					<h4 className="font-medium text-xs text-muted-foreground">6h ago</h4>
				</div>
				<div className="flex items-center gap-1">
					<Button className="size-8" size={'icon'} variant={'default'}><IconPhotoPlus size={18} /></Button>
					<Button className="size-8" size={'icon'} variant={'outline'}> <IconDots size={20} /> </Button>
				</div>
			</div>
		</div>
	)
}