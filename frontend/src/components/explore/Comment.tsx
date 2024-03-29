import { IconBellMinus, IconBellPlus, IconDotsVertical, IconHeart, IconHeartFilled, IconMessages, IconTrash, IconUser } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { IComment } from "@/types/database";
import Link from "next/link";
import { DateTime } from "luxon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { Dispatch, SetStateAction, forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { QueryObserverResult, useMutation } from "@tanstack/react-query";
import { fetchData } from "@/lib/utils";
import { toast } from "sonner";
import { APIResponse } from "@/pages/api/comments/get-comments";
import { useSetRecoilState } from "recoil";
import { signinModalOpenState } from "@/lib/atoms";

interface CommentProps {
	comment: IComment,
	isPostOwner: boolean,
	setReplyingTo: Dispatch<SetStateAction<string | null>>,
	refetchComments: () => Promise<QueryObserverResult<APIResponse, Error>>,
	onDeleteComment: () => void
}

export const Comment = forwardRef<HTMLDivElement, CommentProps>(({ comment, isPostOwner, setReplyingTo, refetchComments, onDeleteComment }, ref) => {

	const isReply = comment.replyingTo !== null;

	const session = useSession();
	const userId = session.data?.user.id ?? null;
	const isCommentOwner = comment.author?.id === userId;

	const setSigninModalOpen = useSetRecoilState(signinModalOpenState);

	const { mutate: subscribeMutation, isPending: subscribePending } = useMutation({
		mutationFn: async (data: { commentId: string, subscribe: boolean }) => {
			return fetchData('/api/comments/subscribe', data);
		},
		onError(error, variables, context) {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			toast.success(variables.subscribe ? `Subscribed to thread.` : `Unsubscribed from thread.`);
			refetchComments();
		}
	})
	const toggleSubscribed = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		if (subscribePending) { return; }
		subscribeMutation({
			commentId: comment.id ?? '',
			subscribe: !comment.subscribedByMe
		})
	}, [comment, session, subscribeMutation, subscribePending, setSigninModalOpen]);

	const toggleReply = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		setReplyingTo(comment.id);
	}, [comment, session, setReplyingTo, setSigninModalOpen]);

	const { mutate: deleteMutation, isPending: deletePending } = useMutation({
		mutationFn: async (data: { commentId: string }) => {
			return fetchData('/api/comments/delete', data);
		},
		onError(error, variables, context) {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			toast.success('Comment deleted.');
			onDeleteComment?.();
		}
	})
	const deleteComment = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		if (deletePending) { return; }
		deleteMutation({
			commentId: comment.id ?? '',
		})
	}, [comment, session, deleteMutation, deletePending, setSigninModalOpen]);

	const [liked, setLiked] = useState(false);
	useEffect(() => {
		setLiked(comment.likedByMe ?? false);
	}, [comment.likedByMe]);

	const { mutate: likeMutation } = useMutation({
		mutationFn: async (data: { commentId: string, like: boolean }) => {
			return fetchData('/api/comments/like', data);
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
			refetchComments();
		}
	})
	const toggleLike = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		likeMutation({
			commentId: comment.id ?? '',
			like: !liked
		})
	}, [comment, session, likeMutation, setSigninModalOpen, liked]);

	const likeCount = useMemo(() => {
		if (comment.likedByMe !== liked) {
			if (comment.likedByMe && !liked) {
				return comment.likeCount - 1;
			}
			else if (!comment.likedByMe && liked) {
				return (comment.likeCount ?? 0) + 1;
			}
		}
		return comment.likeCount ?? 0;
	}, [liked, comment.likeCount, comment.likedByMe]);

	return (
		<div ref={ref} className={`flex flex-col gap-2 ${isReply && 'ml-10 rounded-md bg-secondary p-2'}`}>

			<div className="w-full flex items-center mt-2 justify-between ">

				<Link href={'/profiles/' + (comment.author?.id || '')}>
					<div className="flex items-center">
						<Avatar className="size-8 shrink-0">
							<AvatarImage className="object-cover" src={comment.author?.avatar ?? ''} alt={comment.author?.name ?? 'User'} />
							<AvatarFallback><IconUser size={16} className="text-gray-600" /></AvatarFallback>
						</Avatar>
						<div className="flex items-baseline">
							<h4 className="ml-2 font-medium  text-base line-clamp-1">{(comment.author?.name || 'User')}</h4>
							<span className="mx-2 text-[12px] font-semibold text-muted-foreground text-nowrap">{DateTime.fromSQL(comment.createdAt ?? '').toRelative({ locale: 'en' })}</span>
						</div>
					</div>
				</Link>

				<div className="flex items-center gap-1 shrink-0">
					<Button className="flex items-center gap-1 px-2 h-7" onClick={toggleLike}>
						{
							liked ? <IconHeartFilled size={18} className="mt-[2px]" /> : <IconHeart size={18} className="mt-[2px]" />
						}
						{likeCount}
					</Button>

					{
						isReply ?
							<>
								{
									(isCommentOwner || isPostOwner) ?
										<DropdownMenu>
											<DropdownMenuTrigger asChild><Button size={'icon'} variant={'outline'} className="size-7"> <IconDotsVertical size={18} /> </Button></DropdownMenuTrigger>
											<DropdownMenuPortal>
												<DropdownMenuContent align="end">
													<DropdownMenuItem className="!text-red-500 cursor-pointer flex items-center gap-1" onClick={deleteComment}><IconTrash size={16} /> Delete</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenuPortal>
										</DropdownMenu>
										:
										<></>
								}
							</> :
							<DropdownMenu>
								<DropdownMenuTrigger asChild><Button size={'icon'} variant={'outline'} className="size-7"> <IconDotsVertical size={18} /> </Button></DropdownMenuTrigger>
								<DropdownMenuPortal>
									<DropdownMenuContent align="end">
										{
											<DropdownMenuItem className="cursor-pointer flex items-center gap-1" onClick={toggleReply}><IconMessages size={16} /> Reply</DropdownMenuItem>
										}
										{
											<DropdownMenuItem className={`cursor-pointer flex items-center gap-1 ${comment.subscribedByMe ? '!text-red-500' : ''}`} onClick={toggleSubscribed}>
												{
													comment.subscribedByMe ?
														<><IconBellMinus size={16} /> Unsubscribe from thread</> :
														<><IconBellPlus size={16} /> Subscribe to thread</>
												}
											</DropdownMenuItem>
										}
										{
											(isCommentOwner || isPostOwner) &&
											<DropdownMenuItem className="!text-red-500 cursor-pointer flex items-center gap-1" onClick={deleteComment}><IconTrash size={16} /> Delete</DropdownMenuItem>
										}
									</DropdownMenuContent>
								</DropdownMenuPortal>
							</DropdownMenu>
					}
				</div>
			</div>

			<div className="w-full p-2 pt-1 text-sm">
				{comment.message}
			</div>
		</div>
	)
})
Comment.displayName = 'Comment';