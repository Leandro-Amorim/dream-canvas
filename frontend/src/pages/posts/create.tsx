import Main from "@/components/layout/Main";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { IconCirclePlus, IconCrown, IconLoader2, IconPhotoPlus, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { db } from "@/server/database/database";
import { images } from "@/server/database/schema";
import { and, eq, inArray } from "drizzle-orm";
import isUUID from 'is-uuid';
import { IImage } from "@/types/database";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InfiniteScroll from "react-infinite-scroller";
import { APIResponse } from "../api/images/get-images";
import { fetchData } from "@/lib/utils";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "@/lib/hooks";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { imagesCursor } from "@/server/database/cursors";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import SimpleImageCard from "@/components/posts/SimpleImageCard";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useSession } from "next-auth/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PhotoSlider } from "react-photo-view";
import { DndProvider, useDrag, useDrop, } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import { APIResponse as CreatePostAPIResponse } from "../api/posts/create";
import { useRouter } from "next/router";

export const getServerSideProps = (async function (context) {

	const session = await getServerSession(context.req, context.res, authOptions);
	if (session?.user === undefined) {
		return {
			redirect: {
				destination: '/api/auth/signin',
				permanent: false,
			},
		}
	}

	const userId = session.user.id;

	const queryIds = [context.query.id ?? []].flat().filter((value) => { return isUUID.anyNonNil(value) });

	let defaultImages: IImage[] = [];
	if (queryIds.length > 0) {
		defaultImages = await db.select().from(images).where(and(eq(images.userId, userId), inArray(images.id, queryIds)))
	}

	return {
		props: {
			defaultImages,
		},
	}
}) satisfies GetServerSideProps<{ defaultImages: IImage[] }>;

export const formSchema = z.object({
	title: z.string().max(128, {
		message: "The title may not exceed 128 characters.",
	}),
	description: z.string().max(500, {
		message: "The description may not exceed 500 characters.",
	}),
	anonymousPost: z.boolean(),
	hidePrompt: z.boolean(),
})

export default function CreatePost({ defaultImages }: InferGetServerSidePropsType<typeof getServerSideProps>) {

	const router = useRouter();

	const session = useSession();
	const userIsPremium = useMemo(() => {
		return session.data?.user.premium ?? false;
	}, [session]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
			description: '',
			anonymousPost: false,
			hidePrompt: false,
		},
	});

	const [images, setImages] = useState<IImage[]>([]);

	const mutation = useMutation({
		mutationFn: ({ images, formData }: { images: IImage[], formData: z.infer<typeof formSchema> }): Promise<CreatePostAPIResponse> => {
			return fetchData('/api/posts/create', { images, formData });
		},
		onSuccess(data) {
			if (data.status === 'success') {
				router.push(`/posts/${data.data.id}`);
			}
		},
	})

	const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
		mutation.mutate({ images, formData: values });
	}, [images, mutation]);

	useEffect(() => {
		setImages(defaultImages);
	}, [defaultImages]);

	function removeImage(image: IImage) {
		setImages(images.filter((i) => i.id !== image.id));
	}

	const reorderImage = useCallback((dragIndex: number, hoverIndex: number) => {
		setImages((prevImages) =>
			update(prevImages, {
				$splice: [
					[dragIndex, 1],
					[hoverIndex, 0, prevImages[dragIndex]],
				],
			}),
		)
	}, [])

	const [selectedImage, setSelectedImage] = useState(null as IImage | null);

	useEffect(() => {
		if (!images.find((i) => i.id === selectedImage?.id)) {
			setSelectedImage(images[images.length - 1] ?? null);
		}
		if (selectedImage === null) {
			setSelectedImage(images[images.length - 1] ?? null);
		}
	}, [images, selectedImage]);

	const [slideIndex, setSlideIndex] = useState(0);
	const [slideOpen, setSlideOpen] = useState(false);

	const openSlide = useCallback(() => {
		if (!selectedImage) { return; }
		const index = images.findIndex((i) => i.id === selectedImage.id);
		if (index !== -1) {
			setSlideIndex(index);
			setSlideOpen(true);
		}
	}, [selectedImage, images]);

	const [modalOpen, setModalOpen] = useState(false);

	return (
		<Main>

			<ImagesModal open={modalOpen} onClose={() => { setModalOpen(false) }} images={images} setImages={setImages} />

			<div className="flex w-full gap-8 xl:gap-10 flex-col xl:flex-row">
				<div className="flex-1 flex flex-col gap-4">

					<div className="w-full grow min-h-[500px] bg-secondary rounded-lg relative overflow-hidden p-4">
						<PhotoSlider images={images.map((item) => ({ src: item.url, key: item.id }))} index={slideIndex} onIndexChange={setSlideIndex} visible={slideOpen} onClose={() => { setSlideOpen(false) }}
							maskOpacity={0.97} speed={() => 300} easing={() => 'cubic-bezier(0.215, 0.61, 0.355, 1)'} loop={true} />
						{
							selectedImage ? <Image src={selectedImage.url} alt={selectedImage.prompt.prompt} fill={true} className="object-contain cursor-pointer" onClick={openSlide} />
								:
								<div className="w-full h-full mt-[100px] xl:mt-0 flex flex-col items-center justify-center">
									<div className="w-1/4 min-w-[150px] aspect-square bg-primary rounded-full flex items-center justify-center">
										<IconPhotoPlus className="size-1/3 text-muted" />
									</div>
									<div className="text-xl font-semibold mt-4 text-center">
										Click on the + icon below to start adding new images to your post.
									</div>
									<div className="mt-2 text-center">
										You can also reorder the images by dragging them.
									</div>


								</div>
						}
					</div>

					<ScrollArea className="w-full bg-secondary p-2 rounded-lg overflow-x-auto">
						<div className="w-full h-[120px] gap-2 flex">
							<DndProvider backend={HTML5Backend}>
								{
									images.map((image, index) => {
										return (
											<DragCard image={image} index={index} reorderImage={reorderImage} key={image.id} removeImage={removeImage} setSelectedImage={setSelectedImage} />
										)
									})
								}
							</DndProvider>
							{
								images.length < 5 &&
								<div className="h-full aspect-square rounded-md relative bg-primary shrink-0 cursor-pointer"
									onClick={() => { setModalOpen(true) }}>
									<div className="absolute inset-[5px] rounded-[4px] bg-muted overflow-hidden flex items-center justify-center text-primary antialiased">
										<IconCirclePlus size={56} />
									</div>
								</div>
							}

						</div>
						<ScrollBar orientation="horizontal" className="[&>*]:!bg-muted-foreground pt-[3px]" />
					</ScrollArea>

				</div>

				<div className="flex-1">
					<Form {...form} >
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

							<FormField control={form.control} name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input placeholder="Title" {...field} />
										</FormControl>
										<FormDescription>
											An optional title for your post.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField control={form.control} name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea className="h-40 resize-none" maxLength={500} placeholder="Insert your description..." {...field} />
										</FormControl>
										<FormDescription>
											{form.getValues('description').length} / 500
										</FormDescription>
										<FormMessage />
									</FormItem>

								)}
							/>
							<div className="w-full flex gap-4">
								<FormField control={form.control} name="anonymousPost"
									render={({ field }) => (
										<FormItem className="flex-1 flex flex-col gap-2">
											<FormLabel className="flex gap-1">
												Anonymous post
												{
													userIsPremium ?
														[] :
														<Tooltip>
															<TooltipTrigger><Badge variant={"default"} className="flex gap-1 px-[2px] font-bold tracking-normal text-xs"><IconCrown size={14} /></Badge></TooltipTrigger>
															<TooltipContent>
																<p>This feature is exclusive to premium users</p>
															</TooltipContent>
														</Tooltip>
												}
											</FormLabel>
											<div className="flex gap-2 items-center">
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} disabled={!userIsPremium} />
												</FormControl>
												<h3 className="text-sm">{field.value ? 'Enabled' : 'Disabled'}</h3>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField control={form.control} name="hidePrompt"
									render={({ field }) => (
										<FormItem className="flex-1 flex flex-col gap-2">
											<FormLabel className="flex gap-1">
												Hide prompt
												{
													userIsPremium ?
														[] :
														<Tooltip>
															<TooltipTrigger><Badge variant={"default"} className="flex gap-1 px-[2px] font-bold tracking-normal text-xs"><IconCrown size={14} /></Badge></TooltipTrigger>
															<TooltipContent>
																<p>This feature is exclusive to premium users</p>
															</TooltipContent>
														</Tooltip>
												}
											</FormLabel>
											<div className="flex gap-2 items-center">
												<FormControl>
													<Switch checked={field.value} onCheckedChange={field.onChange} disabled={!userIsPremium} />
												</FormControl>
												<h3 className="text-sm">{field.value ? 'Enabled' : 'Disabled'}</h3>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="w-full flex justify-end">
								<Button size={'lg'} className="w-full lg:w-auto flex items-center gap-1" type="submit" disabled={images.length === 0 || mutation.isPending || mutation.isError}>
									{
										(mutation.isPending || mutation.isError) && <IconLoader2 className="mr-[2px] size-5 animate-spin" />
									}
									Submit
								</Button>
							</div>
						</form>
					</Form>
				</div>
			</div>
		</Main>
	);
}

interface DragItem {
	index: number
	id: string,
	type: string
}

function DragCard({ image, index, reorderImage, removeImage, setSelectedImage }: { image: IImage, index: number, reorderImage: (dragIndex: number, hoverIndex: number) => void, setSelectedImage: Dispatch<SetStateAction<IImage | null>>, removeImage: (image: IImage) => void }) {

	const ref = useRef<HTMLDivElement>(null);

	const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
		accept: 'image',
		collect(monitor) {
			return {
				handlerId: monitor.getHandlerId(),
			}
		},
		hover(item: DragItem, monitor) {
			if (!ref.current) {
				return;
			}

			const dragIndex = item.index;
			const hoverIndex = index;

			if (dragIndex === hoverIndex) {
				return;
			}

			const hoverBoundingRect = ref.current?.getBoundingClientRect();

			const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2
			const clientOffset = monitor.getClientOffset();
			const hoverClientX = (clientOffset as XYCoord).x - hoverBoundingRect.left;

			if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
				return;
			}
			if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
				return;
			}

			reorderImage(dragIndex, hoverIndex);
			item.index = hoverIndex;
		},
	})

	const [{ isDragging }, drag] = useDrag({
		type: 'image',
		item: () => {
			return { id: image.id, index }
		},
		collect: (monitor: any) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	drag(drop(ref));

	return (
		<div ref={ref} data-handler-id={handlerId} key={image.id} className="h-full aspect-square rounded-md relative overflow-hidden shrink-0 bg-primary cursor-pointer">
			<Button className="absolute top-1 right-1 z-10 text rounded-full size-5" size={'icon'} variant={"secondary"} onClick={(evt) => { evt.stopPropagation(); removeImage(image) }}><IconX size={14} /></Button>
			<Image src={image.url} alt={image.prompt.prompt} fill={true} className="object-cover" onClick={() => { setSelectedImage(image) }} />
		</div>
	)
}

function ImagesModal({ open, onClose, images, setImages }: { open: boolean, onClose: (success: boolean) => void, images: IImage[], setImages: Dispatch<SetStateAction<IImage[]>> }) {

	async function fetchImages({ pageParam }: { pageParam?: string }): Promise<APIResponse> {
		return await fetchData('/api/images/get-images', { cursor: pageParam });
	}

	const { isFetching, isFetchingNextPage, data, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery({
		queryKey: ['images'],
		queryFn: fetchImages,
		//@ts-expect-error
		getNextPageParam: (lastPage) => (lastPage.status === 'success' && lastPage.data.length > 0) ? imagesCursor.serialize(lastPage.data.at(-1)) : undefined,
		initialPageParam: undefined,
	});

	const [search, setSearch] = useState('');
	const debouncedSearch = useDebounce(search, 500);

	const imageList = useMemo(() => {
		return data?.pages.flatMap((page) => {
			return (page.status === 'success' ? page.data : [])
		}).filter((image) => {
			return image.prompt.prompt.toLowerCase().includes(debouncedSearch.toLowerCase());
		}) ?? []
	}, [data, debouncedSearch]);

	return (
		<Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(false) } }}>
			<DialogContent className="w-full h-full max-w-[1100px] rounded-lg gap-0 pb-6">
				<ScrollArea className="w-full h-full mt-3 pr-4">
					<DialogHeader>
						<DialogTitle className="font-medium text-2xl line-clamp-1 mb-2">Images</DialogTitle>

						<div className="w-full px-[2px]">
							<div className="w-full relative">
								<MagnifyingGlassIcon className={`w-6 h-6 absolute left-2 top-[25px] -translate-y-1/2`} />
								<Input placeholder="Search for prompts..." className="w-full pl-9 h-12 text-base shadow-sm" value={search} onChange={(evt) => { setSearch(evt.target.value) }} />
							</div>
						</div>

						<InfiniteScroll loadMore={() => { !isFetching && fetchNextPage() }} hasMore={hasNextPage} loader={<div className="w-full flex justify-center" key={0}><IconLoader2 className="size-10 text-primary animate-spin mt-8 mb-2" /></div>}>
							<ResponsiveMasonry className="mt-3" columnsCountBreakPoints={{ 0: 2, 650: 3, 850: 4, 1100: 5 }}>
								<Masonry gutter={'20px'}>
									{
										imageList.map((image) => {
											return (<SimpleImageCard key={image.id} image={image} images={images} setImages={setImages} />)
										})
									}
								</Masonry>
							</ResponsiveMasonry>
							{
								isFetching && !isFetchingNextPage && imageList.length === 0 &&
								<div className="w-full flex justify-center" key={0}><IconLoader2 className="size-10 text-primary animate-spin mt-8 mb-2" /></div>
							}
						</InfiniteScroll>
					</DialogHeader>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}