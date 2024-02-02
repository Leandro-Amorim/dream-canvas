import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { IconDots, IconHeart, IconHeartFilled, IconMessage } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "../ui/button";

export default function ExploreCard() {

	const [hover, setHover] = useState(false);

	return (
		<div className="w-full flex flex-col">

			<div className="w-full aspect-[2/3] relative rounded-md overflow-hidden bg-gray-900">
				<Image src={'/test-post.png'} fill={true} alt="Test" className={`object-cover transition-all ${hover && 'scale-105'}`} />
				<div className="absolute transition-all opacity-0 hover:opacity-100 inset-0 p-4 flex items-end bg-gradient-to-t from-[rgba(0,0,0,0.8)] from-5% via-transparent via-30%"
					onMouseEnter={() => { setHover(true) }} onMouseLeave={() => { setHover(false) }}>
					<h3 className="font-medium leading-none text-white">My awesome title</h3>
					<Button className="absolute top-[6px] left-[6px] w-6 h-6" size={'icon'} variant={'outline'}> <IconDots size={16} /> </Button>
				</div>
			</div>

			<div className="w-full flex items-center mt-2 justify-between">
				<div className="flex items-center">
					<Avatar className="size-6">
						<AvatarImage src="/test.jpg" alt="@shadcn" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
					<h4 className="ml-2 font-medium leading-none text-sm">My awesome user</h4>
				</div>
				<div className="flex items-center gap-2">
					<div className="flex items-center">
						<IconHeartFilled className="mt-[2px] text-muted-foreground" size={16} />
						<span className="ml-1 text-[12px] font-semibold text-muted-foreground">979</span>
					</div>
					<div className="flex items-center text-muted-foreground">
						<IconMessage className="mt-[2px]" size={16} />
						<span className="ml-1 text-[12px] font-semibold text-muted-foreground">585</span>
					</div>
				</div>


			</div>
		</div>
	)
}

/**
 * -Avatar
 * -Name
 * -Likes
 * -Comments
 * 
 * -Title
 * 
 */