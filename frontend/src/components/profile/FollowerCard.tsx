import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export default function FollowerCard() {
	return (
		<Card>
			<CardContent className="flex flex-col p-5">
				<div className="w-full p-0 flex">
					<Avatar className="size-16 shrink-0">
						<AvatarImage className="object-cover" src="/test.jpg" alt="@shadcn" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
					<div className="ml-4 grow flex flex-col justify-center gap-[2px]">
						<h3 className="font-medium text-base">User</h3>
						<h3 className="text-xs line-clamp-1">Description</h3>
					</div>
					<div className="shrink-0 flex items-center">
						<Button>Follow</Button>
					</div>
				</div>
				<div className="flex justify-between gap-2 mt-2">
					<div className="flex-1 aspect-square relative rounded-md overflow-hidden">
						<Image fill={true} src={'/test-post.png'} alt="Post" className="object-cover" />
					</div>
					<div className="flex-1 aspect-square relative rounded-md overflow-hidden">
						<Image fill={true} src={'/test-post.png'} alt="Post" className="object-cover" />
					</div>
					<div className="flex-1 aspect-square relative rounded-md overflow-hidden">
						<Image fill={true} src={'/test-post.png'} alt="Post" className="object-cover" />
					</div>
				</div>
			</CardContent>
		</Card>
	)
}