import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { IconCircle, IconDots, IconPhotoPlus } from "@tabler/icons-react";
import { useState } from "react";

export default function HistoryCardList() {

	const [hover, setHover] = useState(false);

	return (
		<Card className="rounded-md p-0 border-0" onMouseEnter={() => { setHover(true) }} onMouseLeave={() => { setHover(false) }}>
			<CardContent className="p-3 flex gap-4">

				<div className="self-center size-[150px] rounded-md overflow-hidden relative shrink-0">

					<Image src={'/test-post.png'} fill={true} className='object-cover' alt="Post" />
					<Button className={`absolute top-[6px] left-[6px] w-6 h-6 text-white transition-all ${hover ? 'opacity-100' : 'opacity-0'}`} size={'icon'} variant={'link'}> <IconCircle size={22} /> </Button>

				</div>

				<div className="grow flex flex-col gap-2">
					<div className="w-full flex justify-end gap-2 shrink-0">
						<Button className="flex items-center pl-2 gap-1" variant={'default'}><IconPhotoPlus size={18} /> Create Post</Button>
						<Button className="size-9" size={'icon'} variant={'outline'}> <IconDots size={18} /> </Button>
					</div>
					<div className="w-full flex flex-col grow justify-between">
						<h3 className="text-sm">
							Jokester began sneaking into the castle in the middle of the night and leaving
							jokes all over the place: under the kings pillow, in his soup, even in the
							royal toilet. The king was furious, but he couldnt seem to stop Jokester. And
							then, one day, the people of the kingdom discovered that the jokes left by
							Jokester were so funny that they couldnt help but laugh. And once they
							started laughing, they couldnt stop.
						</h3>
						<div className="flex flex-col mt-2">
							<h4 className="font-medium text-base">Juggernaut XL</h4>
							<h4 className="font-medium text-xs text-muted-foreground">6h ago</h4>
						</div>
					</div>

				</div>

			</CardContent>
		</Card>
	)
}