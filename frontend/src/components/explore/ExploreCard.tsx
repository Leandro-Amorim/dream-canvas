import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { IconBookmark, IconBookmarkFilled, IconDots, IconFlag, IconHeartFilled, IconMessage, IconPhoto, IconTrash, IconUser, IconUserCancel, IconUsers, IconUsersMinus, IconUsersPlus } from "@tabler/icons-react";
import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { IPostCard } from "@/types/database";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSetRecoilState } from "recoil";
import { blockUserModalState, deletePostModalState, postModalState, reportModalState, signinModalOpenState } from "@/lib/atoms";
import { fetchData } from "@/lib/utils";

export default function ExploreCard({ post, refetchFn }: { post: IPostCard, refetchFn: () => void }) {

	const session = useSession();
	const userId = session.data?.user.id ?? null;
	const isOwner = post.author.id !== null && post.author.id === userId;

	const [hover, setHover] = useState(false);
	const [optionsOpen, setOptionsOpen] = useState(false);
	const setSigninModalOpen = useSetRecoilState(signinModalOpenState);

	const { mutate: savePostMutation, isPending: savePostPending } = useMutation({
		mutationFn: async (data: { postId: string, save: boolean }) => {
			return fetchData('/api/posts/save', data);
		},
		onError(error, variables, context) {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			toast.success(variables.save ? 'Post saved.' : 'Post unsaved.');
			refetchFn();
		}
	})
	const savePost = useCallback((evt: MouseEvent<HTMLDivElement>) => {
		evt.stopPropagation();
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		if (savePostPending) { return; }
		savePostMutation({
			postId: post.id,
			save: !post.savedByMe
		})
	}, [post, session, savePostMutation, savePostPending, setSigninModalOpen]);

	const { mutate: followUserMutation, isPending: followUserPending } = useMutation({
		mutationFn: async (data: { userId: string, follow: boolean }) => {
			return fetchData('/api/users/follow', data);
		},
		onError(error, variables, context) {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			toast.success(variables.follow ? `You started following ${post.author.name || 'User'}.` : `You have unfollowed ${post.author.name || 'User'}.`);
			refetchFn();
		}
	})
	const followUser = useCallback((evt: MouseEvent<HTMLDivElement>) => {
		evt.stopPropagation();
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		if (followUserPending) { return; }
		followUserMutation({
			userId: post.author.id ?? '',
			follow: !post.followedByMe
		})
	}, [post, session, followUserMutation, followUserPending, setSigninModalOpen]);

	const setBlockModal = useSetRecoilState(blockUserModalState);
	const openBlockModal = useCallback((evt: MouseEvent<HTMLDivElement>) => {
		evt.stopPropagation();
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		setBlockModal((prev) => {
			return {
				...prev,
				open: true,
				mode: 'post',
				postId: post.id,
				onSuccess: refetchFn,
			}
		})
	}, [post.id, setBlockModal, refetchFn, session, setSigninModalOpen])

	const setReportModal = useSetRecoilState(reportModalState);
	const openReportModal = useCallback((evt: MouseEvent<HTMLDivElement>) => {
		evt.stopPropagation();
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		setReportModal((prev) => {
			return {
				...prev,
				open: true,
				postId: post.id,
			}
		})
	}, [post.id, setReportModal, session, setSigninModalOpen])

	const setDeleteModal = useSetRecoilState(deletePostModalState);
	const openDeleteModal = useCallback((evt: MouseEvent<HTMLDivElement>) => {
		evt.stopPropagation();
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		setDeleteModal((prev) => {
			return {
				...prev,
				open: true,
				postId: post.id,
				onSuccess: refetchFn,
			}
		})
	}, [post.id, setDeleteModal, refetchFn, session, setSigninModalOpen]);

	const [liked, setLiked] = useState(false);
	useEffect(() => {
		setLiked(post.likedByMe);
	}, [post.likedByMe]);

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
			refetchFn();
		}
	})
	const toggleLike = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		likePostMutation({
			postId: post.id,
			like: !liked
		})
	}, [post, session, likePostMutation, setSigninModalOpen, liked]);

	const likeCount = useMemo(() => {
		if (post.likedByMe !== liked) {
			if (post.likedByMe && !liked) {
				return post.likeCount - 1;
			}
			else if (!post.likedByMe && liked) {
				return post.likeCount + 1;
			}
		}
		return post.likeCount;
	}, [liked, post.likeCount, post.likedByMe]);

	const setPostModal = useSetRecoilState(postModalState);
	const openModal = useCallback(() => {
		history.pushState({}, '', `/posts/${post.id}`);
		setPostModal((prev) => {
			return {
				...prev,
				open: true,
				postId: post.id,
				onDirty: refetchFn,
			}
		})
	}, [post.id, setPostModal, refetchFn]);

	return (
		<div className="w-full flex flex-col select-none" onClick={openModal}>

			<div className="w-full relative rounded-md overflow-hidden cursor-pointer bg-gray-900" style={{ aspectRatio: `${post.imageWidth ?? 2}/${post.imageHeight ?? 3}` }}>
				<Image src={post.imageUrl} fill={true} alt={post.title || post.id} className={`object-cover transition-all ${(hover || optionsOpen) && 'scale-105'}`} />
				{
					post.imageCount > 1 &&
					<Badge className="absolute top-[6px] right-[6px] flex items-center gap-1 px-1 bg-gray-900 font-bold">
						<IconPhoto size={16} stroke={2} />
						{post.imageCount}
					</Badge>
				}
				<div className={`absolute transition-all inset-0 p-4 flex items-end bg-gradient-to-t from-[rgba(0,0,0,0.8)] from-5% via-transparent via-30% ${(hover || optionsOpen) ? 'opacity-100' : 'opacity-0'}`}
					onMouseEnter={() => { setHover(true) }} onMouseLeave={() => { setHover(false) }}>
					<h3 className="font-medium text-white">{post.title}</h3>
					<DropdownMenu open={optionsOpen} onOpenChange={(open) => { setOptionsOpen(open) }}>
						<DropdownMenuTrigger asChild><Button className="w-6 h-6 absolute top-[6px] left-[6px]" size={'icon'} variant={'outline'}> <IconDots size={16} /> </Button></DropdownMenuTrigger>
						<DropdownMenuPortal>
							<DropdownMenuContent align="start">
								<DropdownMenuItem className="cursor-pointer flex items-center gap-1" onClick={savePost}>
									{
										post.savedByMe ? <><IconBookmarkFilled size={16} /> Unsave post</> : <><IconBookmark size={16} /> Save post</>
									}
								</DropdownMenuItem>
								{
									!post.anonymous && !post.orphan && !isOwner &&
									<DropdownMenuItem className="cursor-pointer flex items-center gap-1" onClick={followUser}>
										{
											post.followedByMe ? <><IconUsersMinus size={16} /> Unfollow user</> : <> <IconUsersPlus size={16} /> Follow user</>
										}
									</DropdownMenuItem>
								}
								<DropdownMenuSeparator />
								{
									!isOwner &&
									<DropdownMenuItem className="!text-red-500 cursor-pointer flex items-center gap-1" onClick={openBlockModal}><IconUserCancel size={16} /> Block user</DropdownMenuItem>
								}
								{
									!isOwner &&
									<DropdownMenuItem className="!text-red-500 cursor-pointer flex items-center gap-1" onClick={openReportModal}><IconFlag size={16} /> Report post</DropdownMenuItem>
								}
								{
									!post.orphan && isOwner &&
									<DropdownMenuItem className="!text-red-500 cursor-pointer flex items-center gap-1" onClick={openDeleteModal}><IconTrash size={16} /> Delete post</DropdownMenuItem>
								}
							</DropdownMenuContent>
						</DropdownMenuPortal>
					</DropdownMenu>


				</div>
			</div>

			<div className="w-full flex items-center mt-2 justify-between">
				{
					!post.orphan ?
						<Link href={'/profiles/' + post.author.id} className={post.anonymous ? 'pointer-events-none' : ''} aria-disabled={post.anonymous} tabIndex={post.anonymous ? -1 : undefined}>
							<div className={`flex items-center`}>
								<Avatar className="size-7">
									<AvatarImage className="object-cover" src={post.author.avatar && !post.anonymous ? post.author.avatar : ''} alt={post.author.name ?? 'User'} />
									<AvatarFallback><IconUser size={16} className="text-gray-600" /></AvatarFallback>
								</Avatar>
								<h4 className="ml-2 font-medium text-[13px] line-clamp-1">
									{
										post.anonymous ? `Anonymous user ${isOwner ? ' (You)' : ''}` : (post.author.name || 'User')
									}
								</h4>
							</div>
						</Link>
						: <div />
				}

				<div className="flex items-center gap-2">
					<div className="flex items-center">
						<IconHeartFilled className={`mt-[2px] text-muted-foreground cursor-pointer hover:scale-125 transition-all ${liked && 'text-red-600'}`} size={20} onClick={toggleLike} />
						<span className="ml-1 text-[13px] font-semibold text-muted-foreground">{likeCount}</span>
					</div>
					<div className="flex items-center text-muted-foreground">
						<IconMessage className="mt-[2px]" size={20} />
						<span className="ml-1 text-[13px] font-semibold text-muted-foreground">{post.commentCount}</span>
					</div>
				</div>

			</div>
		</div>
	)
}