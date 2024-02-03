import ExploreCard from "@/components/explore/ExploreCard";
import Main from "@/components/layout/Main";
import FollowerCard from "@/components/profile/FollowerCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { IconDots } from "@tabler/icons-react";
import Image from "next/image";
import Masonry from "react-responsive-masonry";

export default function Profile() {
	return (
		<Main>
			<div className="w-full flex flex-col items-center rounded-lg overflow-hidden relative">

				<div className="w-full h-[180px] absolute">
					<Image src={'/test-cover.jpg'} alt="Cover" fill={true} className="object-cover" />
					<div className="absolute right-1 top-1 flex gap-1">
						<Button>Follow</Button>
						<Button size={'icon'} variant={'outline'}> <IconDots size={20} /> </Button>
					</div>
				</div>

				<div className="w-full max-w-[800px] mt-20 shrink-0 flex z-[1]">
					<div className="flex-1 flex flex-col items-center mt-[116px] gap-1">
						<h3 className="text-lg font-semibold">Followers</h3>
						<span>180</span>
					</div>
					<div className="flex-1  flex flex-col items-center mt-[116px] gap-1">
						<h3 className="text-lg font-semibold">Following</h3>
						<span>180</span>
					</div>
					<div className="shrink-0 px-2">
						<Avatar className="size-[190px]">
							<AvatarImage className="object-cover" src="/test.jpg" alt="@shadcn" />
							<AvatarFallback>CN</AvatarFallback>
						</Avatar>
					</div>
					<div className="flex-1  flex flex-col items-center mt-[116px] gap-1">
						<h3 className="text-lg font-semibold">Posts</h3>
						<span>180</span>
					</div>
					<div className="flex-1  flex flex-col items-center mt-[116px] gap-1">
						<h3 className="text-lg font-semibold">Saved Posts</h3>
						<span>180</span>
					</div>
				</div>
				<div className="w-full max-w-[800px] flex flex-col items-center mt-1">
					<h3 className="text-xl font-semibold">User</h3>
					<ScrollArea className="w-full px-2 leading-relaxed mt-2 [&>*]:max-h-[100px]" >
						Jokester began sneaking into the castle in the middle of the night and leaving
						jokes all over the place: under the kings pillow, in his soup, even in the
						royal toilet. The king was furious, but he couldnt seem to stop Jokester. And
						then, one day, the people of the kingdom discovered that the jokes left by
						Jokester were so funny that they couldnt help but laugh. And once they
						started laughing, they couldnt stop.
						Jokester began sneaking into the castle in the middle of the night and leaving
						jokes all over the place: under the kings pillow, in his soup, even in the
						royal toilet. The king was furious, but he couldnt seem to stop Jokester. And
						then, one day, the people of the kingdom discovered that the jokes left by
						Jokester were so funny that they couldnt help but laugh. And once they
						started laughing, they couldnt stop.
						Jokester began sneaking into the castle in the middle of the night and leaving
						jokes all over the place: under the kings pillow, in his soup, even in the
						royal toilet. The king was furious, but he couldnt seem to stop Jokester. And
						then, one day, the people of the kingdom discovered that the jokes left by
						Jokester were so funny that they couldnt help but laugh. And once they
						started laughing, they couldnt stop.
					</ScrollArea>
				</div>

				<Tabs defaultValue="posts" className="w-full mt-8 flex flex-col">
					<TabsList className="flex h-10 w-full max-w-[800px] self-center">
						<TabsTrigger className="flex-1 h-8" value="posts">Posts</TabsTrigger>
						<TabsTrigger className="flex-1 h-8" value="followers">Followers</TabsTrigger>
						<TabsTrigger className="flex-1 h-8" value="following">Following</TabsTrigger>
						<TabsTrigger className="flex-1 h-8" value="saved">Saved Posts</TabsTrigger>
						<TabsTrigger className="flex-1 h-8 flex gap-1 items-center" value="likes"><LockClosedIcon className="size-4"/> Likes</TabsTrigger>
					</TabsList>
					<TabsContent value="posts">
						<div className="mt-4 flex w-full">
							<Masonry columnsCount={5} gutter={'16px'}>
								<ExploreCard />
								<ExploreCard />
								<ExploreCard />
								<ExploreCard />
								<ExploreCard />
								<ExploreCard />
								<ExploreCard />
								<ExploreCard />
								<ExploreCard />
								<ExploreCard />
							</Masonry>
						</div>
					</TabsContent>
					<TabsContent value="followers">
					<div className="mt-4 flex w-full">
							<Masonry columnsCount={4} gutter={'16px'}>
								<FollowerCard/>
								<FollowerCard/>
								<FollowerCard/>
								<FollowerCard/>
								<FollowerCard/>
							</Masonry>
						</div>
					</TabsContent>
				</Tabs>
			</div>


		</Main>
	)
}