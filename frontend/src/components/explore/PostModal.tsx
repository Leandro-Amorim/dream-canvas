import Image from "next/image";
import { Dialog, DialogContent } from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { IconBookmark, IconDots, IconDotsVertical, IconHeartFilled, IconShare } from "@tabler/icons-react";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

export default function PostModal() {
	return (
		<Dialog open={false}>
			<DialogContent className="w-full max-w-[1420px] h-screen">
				<ScrollArea className="h-full mt-2">


					<div className="h-[850px] flex gap-4">
						<div className='flex-1 h-[850px] rounded-md overflow-hidden'>
							<div className="w-full relative h-full">
								<Image src={'/test-post.png'} fill={true} alt="Post" className="object-cover" />
							</div>
						</div>
						<div className='flex-1 flex flex-col pr-4'>

							<div className="w-full flex items-center justify-between shrink-0">

								<div className="flex items-center">
									<Avatar className="size-11">
										<AvatarImage  className="object-cover" src="/test.jpg" alt="@shadcn" />
										<AvatarFallback>CN</AvatarFallback>
									</Avatar>
									<div className="flex flex-col ml-2 gap-1">
										<h3 className="font-medium ">User</h3>
										<h3 className="font-normal text-sm  text-muted-foreground">Feb 02, 2024</h3>
									</div>
								</div>

								<div className="flex gap-2">
									<Button>Follow</Button>
									<Button size={'icon'} variant={'outline'}> <IconDots size={20} /> </Button>
								</div>

							</div>
							<div className="grow min-h-0 flex flex-col">

								<div className="pt-4 flex flex-col gap-3">
									<h3 className="pl-2 font-medium text-lg  shrink-0">My title</h3>
									<div className="w-full text-sm h-[250px]">
										<ScrollArea className="h-full w-full px-2 leading-relaxed" type="auto">
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
									</div>
								</div>
								<div className="grow min-h-0 mt-4">
									<Tabs defaultValue="prompt" className="w-full">
										<TabsList className="flex h-10">
											<TabsTrigger className="flex-1 h-8" value="prompt">Prompt</TabsTrigger>
											<TabsTrigger className="flex-1 h-8" value="negative_prompt">Negative Prompt</TabsTrigger>
										</TabsList>
										<TabsContent value="prompt">
											<ScrollArea className="mt-2 h-[220px] bg-secondary rounded-md p-2 leading-relaxed">
												Jokester began sneaking into the castle in the middle of the night and leaving
												jokes all over the place: under the kings pillow, in his soup, even in the
												royal toilet. The king was furious, but he couldnt seem to stop Jokester. And
												then, one day, the people of the kingdom discovered that the jokes left by
												Jokester were so funny that they couldnt help but laugh. And once they
												started laughing, they couldnt stop.
											</ScrollArea>
										</TabsContent>
										<TabsContent value="negative_prompt">
											<ScrollArea className="mt-2 h-[220px] bg-secondary rounded-md p-2 leading-relaxed">
												AA
											</ScrollArea>
										</TabsContent>
									</Tabs>
									<div className="w-full flex mt-8">
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
									<div className="w-full flex mt-8">
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

							</div>
							<div className="w-full pb-1 flex items-center gap-2 justify-end shrink-0">

								<Button className="flex gap-1 px-3"><IconHeartFilled size={20} /> 600 Likes</Button>
								<Button size={'icon'} variant={'outline'}> <IconBookmark size={20} /> </Button>
								<Button size={'icon'} variant={'outline'}> <IconShare size={20} /> </Button>
							</div>

						</div>
					</div>

					<div className="h-96 mt-6">
						<div className="w-full px-4">
							<Separator />
						</div>

						<div className="w-full mt-4">
							<h3 className="font-medium text-xl  shrink-0">Comments</h3>
							<div className="w-full max-w-[800px] mt-4 flex flex-col mx-auto gap-4">
								<div className="flex flex-col gap-2">
									<div className="w-full flex items-center mt-2 justify-between ">
										<div className="flex items-center">
											<Avatar className="size-8">
												<AvatarImage  className="object-cover" src="/test.jpg" alt="@shadcn" />
												<AvatarFallback>CN</AvatarFallback>
											</Avatar>
											<div className="flex items-baseline">
												<h4 className="ml-2 font-medium  text-base">My awesome user</h4>
												<span className="ml-2 text-[12px] font-semibold text-muted-foreground">5h ago</span>
											</div>

										</div>

										<div className="flex items-center gap-1">
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
								<div className="flex flex-col gap-2">
									<div className="w-full flex items-center mt-2 justify-between ">
										<div className="flex items-center">
											<Avatar className="size-8">
												<AvatarImage  className="object-cover" src="/test.jpg" alt="@shadcn" />
												<AvatarFallback>CN</AvatarFallback>
											</Avatar>
											<div className="flex items-baseline">
												<h4 className="ml-2 font-medium  text-base">My awesome user</h4>
												<span className="ml-2 text-[12px] font-semibold text-muted-foreground">5h ago</span>
											</div>

										</div>

										<div className="flex items-center gap-1">
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
								<div className="flex flex-col gap-2 ml-10 rounded-md bg-secondary p-2">
									<div className="w-full flex items-center mt-2 justify-between ">
										<div className="flex items-center">
											<Avatar className="size-8">
												<AvatarImage  className="object-cover" src="/test.jpg" alt="@shadcn" />
												<AvatarFallback>CN</AvatarFallback>
											</Avatar>
											<div className="flex items-baseline">
												<h4 className="ml-2 font-medium  text-base">My awesome user</h4>
												<span className="ml-2 text-[12px] font-semibold text-muted-foreground">5h ago</span>
											</div>

										</div>

										<div className="flex items-center gap-1">
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
								<div className="flex flex-col gap-2 ml-10 rounded-md bg-secondary p-2">
									<div className="w-full flex items-center mt-2 justify-between ">
										<div className="flex items-center">
											<Avatar className="size-8">
												<AvatarImage className="object-cover"  src="/test.jpg" alt="@shadcn" />
												<AvatarFallback>CN</AvatarFallback>
											</Avatar>
											<div className="flex items-baseline">
												<h4 className="ml-2 font-medium  text-base">My awesome user</h4>
												<span className="ml-2 text-[12px] font-semibold text-muted-foreground">5h ago</span>
											</div>

										</div>

										<div className="flex items-center gap-1">
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
							</div>
							<div className="w-full max-w-[800px] mt-4 flex flex-col mx-auto gap-4">
								<Separator />
								<div className="w-full flex flex-col gap">
									<Textarea className="h-[120px] resize-none bg-secondary" placeholder="Reply to post..." />
									<div className="w-full my-2 flex items-center justify-end">
										<Button>Send</Button>
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