import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { deletePostModalState } from "@/lib/atoms";
import { fetchData } from "@/lib/utils";
import { IconLoader2 } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { useRecoilState } from "recoil"
import { toast } from "sonner";

export default function DeletePostModal() {

	const [modal, setModal] = useRecoilState(deletePostModalState);

	const { mutate, isPending } = useMutation({
		mutationFn: async (data: { postId: string }) => {
			return fetchData('/api/posts/delete', {
				postId: data.postId
			});
		},
		onError(error, variables, context) {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			toast.success(`You have deleted the post.`);
			modal.onSuccess?.();
			onCancel();
		}
	});

	const processDelete = useCallback(() => {
		if (!modal.postId) { return; }
		mutate({
			postId: modal.postId,
		})
	}, [modal, mutate]);

	const onCancel = useCallback(() => {
		setModal((prev) => {
			return {
				...prev,
				open: false,
				postId: null,
				onSuccess: () => { }
			}
		})
	}, [setModal]);

	return (
		<Dialog open={modal.open} onOpenChange={(o) => { if (!o) { onCancel() } }}>
			<DialogContent className="w-full max-w-[600px] rounded-lg gap-0 pb-6">
				<DialogHeader>
					<DialogTitle className="font-medium text-lg line-clamp-1 mb-2">Delete post</DialogTitle>
				</DialogHeader>

				<h3 className="text-sm">{`Are you sure you want to delete this post? This action cannot be undone.`}</h3>

				<DialogFooter className="mt-4 gap-2 sm:gap-0">
					<Button variant={'outline'} onClick={onCancel}>Cancel</Button>
					<Button className="flex items-center gap-1" disabled={isPending} variant={'destructive'} onClick={processDelete}>
						{isPending && <IconLoader2 className="mr-[2px] size-5 animate-spin" />}
						Delete
					</Button>
				</DialogFooter>

			</DialogContent>
		</Dialog >
	)
}