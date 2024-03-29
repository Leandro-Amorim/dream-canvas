import { IPost } from "@/types/database"
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel"
import { useSession } from "next-auth/react";
import { useSetRecoilState } from "recoil";
import { useMutation } from "@tanstack/react-query";
import { fetchData } from "@/lib/utils";
import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { blockUserModalState, deletePostModalState, reportModalState, sharePostModalState, signinModalOpenState } from "@/lib/atoms";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { IconBookmark, IconBookmarkFilled, IconDots, IconEyeOff, IconFlag, IconHeart, IconHeartFilled, IconShare, IconTrash, IconUser, IconUserCancel, IconUsersMinus } from "@tabler/icons-react";
import { DateTime } from "luxon";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { models } from "@/data/models";
import { samplingMethods } from "@/data/settings";
import PostModalComments from "./PostModalComments";
import { useRouter } from "next/router";

export default function PostContent({ post, setDirty, onCancel, refetchPost }: { post: IPost | null, setDirty?: Dispatch<SetStateAction<boolean>>, refetchPost: () => void, onCancel?: (immediateCleanup?: boolean) => void }) {

	const router = useRouter();
	const session = useSession();
	const userId = session.data?.user.id ?? null;
	const isOwner = post?.author.id !== null && post?.author.id === userId;

	const setSigninModalOpen = useSetRecoilState(signinModalOpenState);

	const [saved, setSaved] = useState(false);
	useEffect(() => {
		setSaved(post?.savedByMe ?? false);
	}, [post?.savedByMe]);
	const { mutate: savePostMutation, isPending: savePostPending } = useMutation({
		mutationFn: async (data: { postId: string, save: boolean }) => {
			return fetchData('/api/posts/save', data);
		},
		onMutate(variables) {
			setSaved(variables.save);
		},
		onError(error, variables, context) {
			setSaved(!variables.save);
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			toast.success(variables.save ? 'Post saved.' : 'Post unsaved.');
			refetchPost();
			setDirty?.(true);
		}
	})
	const savePost = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		if (savePostPending) { return; }
		savePostMutation({
			postId: post?.id ?? '',
			save: !saved
		})
	}, [post, session, savePostMutation, savePostPending, setSigninModalOpen, saved]);

	const [followed, setFollowed] = useState(false);
	useEffect(() => {
		setFollowed(post?.followedByMe ?? false);
	}, [post?.followedByMe]);
	const { mutate: followUserMutation, isPending: followUserPending } = useMutation({
		mutationFn: async (data: { userId: string, follow: boolean }) => {
			return fetchData('/api/users/follow', data);
		},
		onMutate(variables) {
			setFollowed(variables.follow);
		},
		onError(error, variables, context) {
			setFollowed(!variables.follow);
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			toast.success(variables.follow ? `You started following ${post?.author.name || 'User'}.` : `You have unfollowed ${post?.author.name || 'User'}.`);
			refetchPost();
			setDirty?.(true);
		}
	})
	const followUser = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		followUserMutation({
			userId: post?.author.id ?? '',
			follow: !followed
		})
	}, [post, session, followUserMutation, setSigninModalOpen, followed]);

	const setBlockModal = useSetRecoilState(blockUserModalState);
	const openBlockModal = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		setBlockModal((prev) => {
			return {
				...prev,
				open: true,
				mode: 'post',
				postId: post?.id ?? '',
				onSuccess: () => { refetchPost(); setDirty?.(true) },
			}
		})
	}, [post, setBlockModal, session, setSigninModalOpen, refetchPost, setDirty])

	const setReportModal = useSetRecoilState(reportModalState);
	const openReportModal = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		setReportModal((prev) => {
			return {
				...prev,
				open: true,
				postId: post?.id ?? '',
			}
		})
	}, [post, setReportModal, session, setSigninModalOpen])

	const setDeleteModal = useSetRecoilState(deletePostModalState);
	const openDeleteModal = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		setDeleteModal((prev) => {
			return {
				...prev,
				open: true,
				postId: post?.id ?? '',
				onSuccess: () => { onCancel?.(true); },
			}
		})
	}, [post, setDeleteModal, session, setSigninModalOpen, onCancel]);

	const [liked, setLiked] = useState(false);
	useEffect(() => {
		setLiked(post?.likedByMe ?? false);
	}, [post?.likedByMe]);

	const { mutate: likePostMutation, isPending: likePostPending } = useMutation({
		mutationFn: async (data: { postId: string, like: boolean }) => {
			return fetchData('/api/posts/like', data);
		},
		onMutate(variables) {
			setLiked(variables.like);
		},
		onError(error, variables, context) {
			setLiked(!variables.like);
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			refetchPost();
			setDirty?.(true);
		}
	})
	const toggleLike = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		likePostMutation({
			postId: post?.id ?? '',
			like: !liked
		})
	}, [post, session, likePostMutation, setSigninModalOpen, liked]);

	const likeCount = useMemo(() => {
		if (post?.likedByMe !== liked) {
			if (post?.likedByMe && !liked) {
				return post?.likeCount - 1;
			}
			else if (!post?.likedByMe && liked) {
				return (post?.likeCount ?? 0) + 1;
			}
		}
		return post?.likeCount ?? 0;
	}, [liked, post?.likeCount, post?.likedByMe]);

	const [imageIndex, setImageIndex] = useState(0);
	const [carouselAPI, setCarouselAPI] = useState<CarouselApi>();
	useEffect(() => {
		if (!carouselAPI) { return; }
		setImageIndex(carouselAPI.selectedScrollSnap())
		carouselAPI.on("select", () => {
			setImageIndex(carouselAPI.selectedScrollSnap())
		});
	}, [carouselAPI]);

	const selectedImage = useMemo(() => {
		return post?.images[imageIndex] ?? null;
	}, [post, imageIndex]);

	const setShareModal = useSetRecoilState(sharePostModalState);
	const sharePost = useCallback(() => {
		setShareModal((prev) => {
			return {
				...prev,
				open: true,
				postId: post?.id ?? '',
				postTitle: post?.title ?? '',
				imageUrl: selectedImage?.url ?? '',
			}
		})
	}, [post, selectedImage, setShareModal]);

	return (
		<>
			<div className="flex flex-col lg:flex-row gap-7 lg:h-[calc(100vh-150px)] lg:min-h-[600px]">
				<div className='h-[calc(100vh-200px)] min-h-[450px] lg:h-full lg:flex-1 mr-4 lg:mr-0 rounded-xl overflow-hidden relative bg-[#131313]'>
					<Carousel setApi={setCarouselAPI} opts={{ align: "start" }} className="w-full h-full [&>div]:h-full [&>div]:w-full">
						<CarouselContent className="w-full h-full ml-0">
							{
								post?.images.map((image) => {
									return (
										<CarouselItem key={image.id} className="w-full h-full pl-0 relative">
											<Image src={image.url} fill={true} alt={image.prompt?.prompt ?? image.id} className="object-cover blur-xl" />
											<Image src={image.url} fill={true} alt={image.prompt?.prompt ?? image.id} className="object-contain" />
										</CarouselItem>
									)
								})
							}
						</CarouselContent>
						{
							(post?.images.length ?? 0) > 1 &&
							<>
								<CarouselPrevious className="left-2" />
								<CarouselNext className="right-2" />
							</>
						}

					</Carousel>
				</div>
				<div className='lg:flex-1 flex flex-col pr-4 lg:mt-2 lg:h-full'>
					<div className="w-full flex items-center justify-between shrink-0">
						{
							post?.orphan == true ?
								<div /> :
								<Link href={'/profiles/' + post?.author.id} className={post?.anonymous ? 'pointer-events-none' : ''} aria-disabled={post?.anonymous} tabIndex={post?.anonymous ? -1 : undefined}>
									<div className="flex items-center">
										<Avatar className="size-11">
											<AvatarImage className="object-cover" src={post?.author.avatar && !post.anonymous ? post.author.avatar : ''} alt={post?.author.name ?? 'User'} />
											<AvatarFallback><IconUser size={22} className="text-gray-600" /></AvatarFallback>
										</Avatar>
										<div className="flex flex-col ml-2 gap-1">
											<h3 className="font-medium line-clamp-1">{post?.anonymous ? `Anonymous user ${isOwner ? ' (You)' : ''}` : (post?.author.name || 'User')}</h3>
											<h3 className="font-normal text-sm text-muted-foreground line-clamp-1">{DateTime.fromSQL(post?.createdAt ?? '').toRelative({ locale: 'en' })} </h3>
										</div>
									</div>
								</Link>
						}

						<div className="flex gap-2">
							{
								!post?.anonymous && !post?.orphan && !isOwner && !followed &&
								<Button onClick={followUser}>Follow</Button>
							}

							<DropdownMenu>
								<DropdownMenuTrigger asChild><Button size={'icon'} variant={'outline'}> <IconDots size={20} /> </Button></DropdownMenuTrigger>
								<DropdownMenuPortal>
									<DropdownMenuContent align="end">
										{
											!post?.anonymous && !post?.orphan && !isOwner && followed &&
											<DropdownMenuItem className="cursor-pointer flex items-center gap-1" onClick={followUser}>
												{
													<><IconUsersMinus size={16} /> Unfollow user</>
												}
											</DropdownMenuItem>
										}
										{
											!isOwner &&
											<DropdownMenuItem className="!text-red-500 cursor-pointer flex items-center gap-1" onClick={openBlockModal}><IconUserCancel size={16} /> Block user</DropdownMenuItem>
										}
										{
											!isOwner &&
											<DropdownMenuItem className="!text-red-500 cursor-pointer flex items-center gap-1" onClick={openReportModal}><IconFlag size={16} /> Report post</DropdownMenuItem>
										}
										{
											!post?.orphan && isOwner &&
											<DropdownMenuItem className="!text-red-500 cursor-pointer flex items-center gap-1" onClick={openDeleteModal}><IconTrash size={16} /> Delete post</DropdownMenuItem>
										}
									</DropdownMenuContent>
								</DropdownMenuPortal>
							</DropdownMenu>
						</div>

					</div>
					{
						post?.title &&
						<h3 className="mt-4 pl-2 font-medium text-lg shrink-0 line-clamp-2">{post.title}</h3>
					}
					{
						post?.description &&
						<ScrollArea className={`${post?.title ? 'mt-3' : 'mt-5'} w-full lg:grow lg:max-h-[250px] text-sm px-2 !leading-relaxed`} type="auto">
							{
								post.description
							}
						</ScrollArea>
					}

					{
						post?.hidePrompt ?
							<div className={`w-full h-[250px] lg:h-auto lg:grow rounded-md bg-secondary flex flex-col gap-1 items-center justify-center text-center ${!post?.title && !post?.description ? 'mt-6' : 'mt-4'}`}>
								<IconEyeOff size={64} className="text-gray-600" />
								<span className="text-sm italic">The prompt for this post has been set to hidden.</span>
							</div>
							:
							<>
								<Tabs defaultValue="prompt" className={`${!post?.title && !post?.description ? 'mt-6' : 'mt-4'} w-full lg:grow lg:max-h-[250px] flex flex-col`}>
									<TabsList className="flex h-10 shrink-0">
										<TabsTrigger className="flex-1 h-8" value="prompt">Prompt</TabsTrigger>
										<TabsTrigger className="flex-1 h-8" value="negative_prompt">Negative Prompt</TabsTrigger>
									</TabsList>
									<TabsContent value="prompt" className="grow min-h-10">
										<ScrollArea className="h-full bg-secondary rounded-md p-2 !leading-relaxed text-sm" type="auto">
											{
												selectedImage?.prompt?.prompt ?? ''
											}
										</ScrollArea>
									</TabsContent>
									<TabsContent value="negative_prompt" className="grow min-h-10">
										<ScrollArea className="h-full bg-secondary rounded-md p-2 !leading-relaxed  text-sm" type="auto">
											{
												selectedImage?.prompt?.negativePrompt ?? ''
											}
										</ScrollArea>
									</TabsContent>
								</Tabs>
								<div className="w-full flex flex-col gap-4 mt-6 shrink-0">
									<div className="w-full flex">
										<div className="flex-1 flex flex-col gap-2">
											<h3 className="font-medium ">Model</h3>
											<span className="text-sm text-secondary-foreground">{(models[selectedImage?.prompt?.model ?? ''])?.name ?? selectedImage?.prompt?.model ?? ''}</span>
										</div>
										<div className="flex-1 flex flex-col gap-2">
											<h3 className="font-medium ">Sampling Method</h3>
											<span className="text-sm text-secondary-foreground">{(samplingMethods[selectedImage?.prompt?.settings.samplingMethod ?? '']) ?? selectedImage?.prompt?.settings.samplingMethod ?? ''}</span>
										</div>
										<div className="flex-1 flex flex-col gap-2">
											<h3 className="font-medium ">Sampling Steps</h3>
											<span className="text-sm text-secondary-foreground">{selectedImage?.prompt?.settings.steps}</span>
										</div>

									</div>
									<div className="w-full flex">
										<div className="flex-1 flex flex-col gap-2">
											<h3 className="font-medium ">CFG Scale</h3>
											<span className="text-sm text-secondary-foreground">{selectedImage?.prompt?.settings.scale}</span>
										</div>
										<div className="flex-1 flex flex-col gap-2">
											<h3 className="font-medium ">Seed</h3>
											<span className="text-sm text-secondary-foreground">{selectedImage?.prompt?.settings.seed}</span>
										</div>
										<div className="flex-1 flex flex-col gap-2">
											<h3 className="font-medium ">Dimensions</h3>
											<span className="text-sm text-secondary-foreground">{`${selectedImage?.width ?? 0}x${selectedImage?.height ?? 0}`}</span>
										</div>
									</div>
								</div>
							</>

					}


					<div className="w-full pb-1 mt-auto shrink-0">
						<div className="flex gap-2 items-center justify-end mt-6">
							{
								!post?.hidePrompt &&
								<Button asChild variant={'secondary'} className="grow md:grow-0">
									<Link href={`/generate?postId=${post?.id ?? '0'}&imageId=${selectedImage?.id ?? '0'}`} rel="noopener noreferrer" target="_blank">Use settings</Link>
								</Button>
							}

							<Button className="flex gap-1 px-3 grow md:grow-0" onClick={toggleLike}>
								{
									liked ? <IconHeartFilled size={20} /> : <IconHeart size={20} />
								}
								{
									likeCount
								}
								{` Like${likeCount > 1 ? 's' : ''}`}
							</Button>
							<Button size={'icon'} variant={'outline'} onClick={savePost}>
								{
									saved ?
										<IconBookmarkFilled size={20} /> :
										<IconBookmark size={20} />
								}
							</Button>
							<Button size={'icon'} variant={'outline'} onClick={sharePost}> <IconShare size={20} /> </Button>
						</div>
					</div>
				</div>
			</div>

			<PostModalComments isPostOwner={!post?.orphan && isOwner} postId={post?.id ?? null} setDirty={setDirty} />
		</>
	)
}