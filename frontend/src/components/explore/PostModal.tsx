import Image from "next/image";
import { Dialog, DialogContent } from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { IconBookmark, IconDots, IconHeartFilled, IconShare } from "@tabler/icons-react";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import Comment from "./Comment";

export default function PostModal() {
	return (
		<Dialog open={false}>
			<DialogContent className="w-full max-w-[1420px] h-full rounded-lg">
				<ScrollArea className="mt-2">

					<div className="flex flex-col h-auto lg:flex-row lg:h-[800px] gap-4">

						<div className='h-[calc(100vh-150px)] lg:flex-1 lg:h-auto mr-4 lg:mr-0 rounded-md overflow-hidden relative'>
							<Image src={'/test-post.png'} fill={true} alt="Post" className="object-cover" />
						</div>

						<div className='lg:flex-1 flex flex-col pr-4'>

							<div className="w-full flex items-center justify-between shrink-0">
								<div className="flex items-center">
									<Avatar className="size-11">
										<AvatarImage className="object-cover" src="/test.jpg" alt="@shadcn" />
										<AvatarFallback>CN</AvatarFallback>
									</Avatar>
									<div className="flex flex-col ml-2 gap-1">
										<h3 className="font-medium line-clamp-1">User</h3>
										<h3 className="font-normal text-sm  text-muted-foreground line-clamp-1">Feb 02, 2024</h3>
									</div>
								</div>
								<div className="flex gap-2">
									<Button>Follow</Button>
									<Button size={'icon'} variant={'outline'}> <IconDots size={20} /> </Button>
								</div>
							</div>

							<h3 className="mt-4 mb-3 pl-2 font-medium text-lg shrink-0">My title</h3>


							<ScrollArea className="w-full h-[200px] lg:h-auto grow min-h-0 max-h-[250px] text-sm px-2 leading-relaxed" type="auto">

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

							<Tabs defaultValue="prompt" className="mt-4 w-full h-[250px] lg:h-auto lg:grow min-h-0 max-h-[250px] flex flex-col ">
								<TabsList className="flex h-10 shrink-0">
									<TabsTrigger className="flex-1 h-8" value="prompt">Prompt</TabsTrigger>
									<TabsTrigger className="flex-1 h-8" value="negative_prompt">Negative Prompt</TabsTrigger>
								</TabsList>

								<TabsContent value="prompt" className="grow min-h-0">
									<ScrollArea className="h-full bg-secondary rounded-md p-2 leading-relaxed" type="auto">
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
								</TabsContent>
								<TabsContent value="negative_prompt" className="grow min-h-0">
									<ScrollArea className="h-full bg-secondary rounded-md p-2 leading-relaxed" type="auto">
										AA
									</ScrollArea>
								</TabsContent>
							</Tabs>

							<div className="w-full flex flex-col gap-8 mt-8 shrink-0">

								<div className="w-full flex">
									<div className="flex-1 flex flex-col">
										<h3 className="font-medium ">Model</h3>
										<span className="mt-3 text-sm  text-secondary-foreground">Juggernaut XL</span>
									</div>
									<div className="flex-1 flex flex-col">
										<h3 className="font-medium ">Sampling Method</h3>
										<span className="mt-3 text-sm  text-secondary-foreground">Euler Ancestral</span>
									</div>
									<div className="flex-1 flex flex-col">
										<h3 className="font-medium ">Sampling Steps</h3>
										<span className="mt-3 text-sm  text-secondary-foreground">50</span>
									</div>

								</div>
								<div className="w-full flex">
									<div className="flex-1 flex flex-col">
										<h3 className="font-medium ">CFG Scale</h3>
										<span className="mt-3 text-sm  text-secondary-foreground">10</span>
									</div>
									<div className="flex-1 flex flex-col">
										<h3 className="font-medium ">Seed</h3>
										<span className="mt-3 text-sm  text-secondary-foreground">12345678</span>
									</div>
									<div className="flex-1 flex flex-col">
										<h3 className="font-medium ">Dimensions</h3>
										<span className="mt-3 text-sm  text-secondary-foreground">512x1024</span>
									</div>
								</div>

							</div>

							<div className="w-full pb-1 mt-4 flex items-center gap-2 justify-end shrink-0">
								<Button className="flex gap-1 px-3 w-full md:w-auto"><IconHeartFilled size={20} /> 600 Likes</Button>
								<Button size={'icon'} variant={'outline'}> <IconBookmark size={20} /> </Button>
								<Button size={'icon'} variant={'outline'}> <IconShare size={20} /> </Button>
							</div>
						</div>

					</div>

					<div className="w-full mt-6  pr-4">
						<div className="w-full px-4">
							<Separator />
						</div>

						<div className="w-full mt-4">

							<h3 className="font-medium text-xl shrink-0">Comments (25)</h3>

							<div className="w-full max-w-[800px] mt-4 flex flex-col mx-auto gap-4">

								<Comment />
								<Comment />
								<Comment isReply={true} />
								<Comment isReply={true} />
							</div>
							<div className="w-full max-w-[800px] mt-4 flex flex-col mx-auto gap-4">
								<Separator />
								<div className="w-full flex flex-col gap px-1">
									<Textarea className="h-[120px] resize-none bg-secondary" placeholder="Reply to post..." />
									<div className="w-full my-4 flex items-center justify-end">
										<Button className="w-full md:w-auto">Send</Button>
									</div>
								</div>
							</div>
						</div>
					</div>

				</ScrollArea>
			</DialogContent>

		</Dialog>
	)
}