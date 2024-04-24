import { useSession } from "next-auth/react";
import { Separator } from "../ui/separator";
import { fetchData } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { APIResponse } from "@/pages/api/comments/get-comments";
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";
import { IconLoader2, IconMessageOff } from "@tabler/icons-react";
import { IComment } from "@/types/database";
import { CommentField } from "./CommentField";
import { Comment } from "./Comment";

export default function PostModalComments({ postId, isPostOwner, setDirty }: { postId: string | null, isPostOwner: boolean, setDirty?: Dispatch<SetStateAction<boolean>> }) {

	const session = useSession();

	const { data, isError, isLoading, refetch: refetchComments } = useQuery<APIResponse>({
		queryKey: ['comments', postId],
		queryFn: async () => {
			return fetchData('/api/comments/get-comments', { postId: postId ?? '' });
		},
		enabled: postId !== null
	});

	const { parents, childrenRecord, commentCount } = useMemo(() => {

		const allComments = data?.status === 'success' && data.data.comments !== null ? data.data.comments : [];
		const parents = allComments.filter((comment) => comment.replyingTo === null);
		let commentCount = parents.length;

		const childrenRecord: Record<string, IComment[]> = {};
		for (const parent of parents) {
			childrenRecord[parent.id] = allComments.filter((comment) => comment.replyingTo === parent.id).sort((a, b) => { return new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf() });
			commentCount += childrenRecord[parent.id].length;
		}
		return {
			parents,
			childrenRecord,
			commentCount
		};
	}, [data]);

	const onCommentSend = useCallback(async () => {
		setDirty?.(true);
		await refetchComments();
	}, [setDirty, refetchComments]);

	const onDeleteComment = useCallback(async () => {
		setDirty?.(true);
		await refetchComments();
	}, [setDirty, refetchComments]);

	const [replyingTo, setReplyingTo] = useState<string | null>(null);


	const scrollIntoView = useCallback((node: HTMLElement | null) => {
		if (node) {
			node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	}, []);

	return (
		<div className="w-full mt-6 pr-4">
			<div className="w-full px-4">
				<Separator />
			</div>
			<div className="w-full mt-4 max-w-[800px] mx-auto">
				<h3 className="font-medium text-xl shrink-0">Comments {isError || isLoading ? '' : `(${commentCount})`}</h3>
				{
					isError || isLoading ?
						<div className="w-full h-full flex items-center justify-center mt-2">
							<IconLoader2 className="size-10 animate-spin text-primary" />
						</div>
						:
						<>
							{
								session.status === 'authenticated' &&
								<CommentField setReplyingTo={setReplyingTo} postId={postId} replyingTo={null} onCommentSend={onCommentSend} />
							}
							<div className="w-full flex flex-col gap-4 mt-4 pb-2">
								{
									commentCount === 0 ?
										<div className="w-full mt-4 flex justify-center">
											<IconMessageOff className="size-16 text-muted-foreground" />
											<div className="ml-2 flex flex-col justify-center">
												<span className="text-sm font-medium">There are no comments on this post yet</span>
												<span className="text-sm">Be the first to leave a message</span>
											</div>
										</div>
										:
										parents.map((comment) => {
											return (
												<React.Fragment key={comment.id}>
													<Comment refetchComments={refetchComments} onDeleteComment={onDeleteComment} isPostOwner={isPostOwner} comment={comment} setReplyingTo={setReplyingTo} />
													{
														(childrenRecord[comment.id] ?? []).map((child) => {
															return (
																<Comment key={child.id} refetchComments={refetchComments} onDeleteComment={onDeleteComment} isPostOwner={isPostOwner} comment={child} setReplyingTo={setReplyingTo} />
															)
														})
													}
													{
														replyingTo === comment.id && <CommentField ref={(node) => { scrollIntoView(node) }} setReplyingTo={setReplyingTo} postId={postId} replyingTo={comment.id} onCommentSend={onCommentSend} />
													}
												</React.Fragment>

											)
										})
								}
							</div>
						</>
				}

			</div>
		</div >
	)
}