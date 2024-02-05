import { IconDotsVertical, IconHeartFilled } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export default function Comment({ isReply }: { isReply?: boolean }) {
	return (
		<div className={`flex flex-col gap-2 ${isReply && 'ml-10 rounded-md bg-secondary p-2'}`}>

			<div className="w-full flex items-center mt-2 justify-between ">

				<div className="flex items-center">
					<Avatar className="size-8 shrink-0">
						<AvatarImage className="object-cover" src="/test.jpg" alt="@shadcn" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
					<div className="flex items-baseline">
						<h4 className="ml-2 font-medium  text-base line-clamp-1">My awesome user</h4>
						<span className="mx-2 text-[12px] font-semibold text-muted-foreground text-nowrap">5h ago</span>
					</div>
				</div>

				<div className="flex items-center gap-1 shrink-0">
					<Button className="flex items-center gap-1 px-2 h-7"><IconHeartFilled size={18} className="mt-[2px]" /> 1</Button>
					<Button size={'icon'} variant={'outline'} className="size-7"> <IconDotsVertical size={18} /> </Button>
				</div>
			</div>

			<div className="w-full p-4 pt-1">
				Jokester began sneaking into the castle in the middle of the night and leaving
				jokes all over the place: under the kings pillow, in his soup, even in the
				royal toilet. The king was furious, but he couldnt seem to stop Jokester. And
				then, one day, the people of the kingdom discovered that the jokes left by
				Jokester were so funny that they couldnt help but laugh. And once they
				started laughing, they couldnt stop.
			</div>
		</div>
	)
}