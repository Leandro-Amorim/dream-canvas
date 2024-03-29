import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Label } from "../ui/label";
import { Dispatch, SetStateAction, forwardRef, useCallback, useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { fetchData } from "@/lib/utils";
import { IconLoader2 } from "@tabler/icons-react";

interface CommentFieldProps {
	postId: string | null,
	replyingTo: string | null,
	onCommentSend: () => Promise<void>,
	setReplyingTo: Dispatch<SetStateAction<string | null>>
}

export const CommentField = forwardRef<HTMLDivElement, CommentFieldProps>(({ postId, replyingTo, onCommentSend, setReplyingTo }, ref) => {

	const isReply = replyingTo !== null;

	const [message, setMessage] = useState('');
	const [subscribe, setSubscribe] = useState(true);
	const [refetching, setRefetching] = useState(false);

	const { mutate, isPending } = useMutation({
		mutationFn: async (data: { message: string, replyingTo: string | null, postId: string, subscribe: boolean }) => {
			return fetchData('/api/comments/create', data);
		},
		onError(error, variables, context) {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			setRefetching(true);
			onCommentSend?.().then(() => {
				setReplyingTo(null);
				setRefetching(false);
				setMessage('');
			});
		}
	});


	const sendComment = useCallback(() => {
		if (message === '') {
			toast.error('Please enter a message');
			return;
		}
		if (message.length > 500) {
			toast.error('The length of the message must be less than 500 characters.');
			return;
		}
		mutate({
			message: message,
			postId: postId ?? '',
			replyingTo: replyingTo ?? null,
			subscribe: subscribe
		});
	}, [message, replyingTo, postId, subscribe, mutate]);

	const checkboxId = `checkbox-${postId ?? ''}-${replyingTo ?? ''}`;




	return (
		<div ref={ref} className={` px-1 ${isReply ? 'ml-10 mt-0' : 'mt-4'}`}>
			<Textarea value={message} onChange={(e) => setMessage(e.target.value)} className={`${isReply ? 'h-[80px]' : 'h-[120px]'} resize-none bg-secondary`} placeholder={`Reply to ${isReply ? 'comment' : 'post'}...`} />
			<div className="w-full mt-4 flex items-center justify-end gap-2">
				<div className="grow shrink flex justify-end">
					<Tooltip>
						<TooltipTrigger>
							<div className="flex items-center gap-1">
								<Label htmlFor={checkboxId} className="text-sm text-muted-foreground font-normal cursor-pointer">Subscribe to thread</Label>
								<Checkbox id={checkboxId} checked={subscribe} onCheckedChange={(checked) => setSubscribe(checked as boolean)} />
							</div>
						</TooltipTrigger>
						<TooltipContent className="bg-gray-950">
							<p className="text-sm break-words max-w-[200px]">{`When you subscribe to a thread, you will be notified of any new messages replying to the parent comment in that thread.
							If you are not replying to any messages, the parent comment will be yours.`}</p>
						</TooltipContent>
					</Tooltip>
				</div>
				{
					isReply &&
					<Button variant={'outline'} className="grow md:w-28 md:grow-0" onClick={() => { setReplyingTo(null) }}>Cancel</Button>
				}

				<Button disabled={isPending || refetching} className={`grow md:grow-0 ${isReply ? 'md:w-28' : 'md:w-36'}  flex items-center gap-1`} onClick={sendComment}>
					{
						(isPending || refetching) && <IconLoader2 className="mr-[2px] size-5 animate-spin" />
					}
					Send
				</Button>
			</div>
			{
				!isReply &&
				<Separator className="mt-4" />
			}
		</div>
	)
})
CommentField.displayName = 'CommentField';