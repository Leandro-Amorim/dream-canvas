import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { blockUserModalState } from "@/lib/atoms";
import { fetchData } from "@/lib/utils";
import { IconLoader2 } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { useRecoilState } from "recoil"
import { toast } from "sonner";

export default function BlockUserModal() {

	const [modal, setModal] = useRecoilState(blockUserModalState);

	const { mutate, isPending } = useMutation({
		mutationFn: async (data: { mode: string, postId: string | null, userId: string | null }) => {
			if (data.mode === 'post') {
				return fetchData('/api/posts/block-author', {
					postId: data.postId
				});
			} else if (data.mode === 'user') {
				return fetchData('/api/users/block', {
					userId: data.userId,
					block: true
				});
			}
		},
		onError(error, variables, context) {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			toast.success(`You have blocked this user.`);
			modal.onSuccess?.();
			onCancel();
		}
	});

	const processBlock = useCallback(() => {
		mutate({
			mode: modal.mode,
			postId: modal.postId,
			userId: modal.userId,
		})
	}, [modal, mutate]);

	const onCancel = useCallback(() => {
		setModal((prev) => {
			return {
				...prev,
				open: false,
				onSuccess: () => { },
				postId: null,
				userId: null,
			}
		})
	}, [setModal]);

	return (
		<Dialog open={modal.open} onOpenChange={(o) => { if (!o) { onCancel() } }}>
			<DialogContent className="w-full max-w-[600px] rounded-lg gap-0 pb-6">
				<DialogHeader>
					<DialogTitle><h3 className="font-medium text-lg line-clamp-1 mb-2">Block user</h3></DialogTitle>
				</DialogHeader>

				<h3 className="text-sm">{`Are you sure you want to block this user? If it's an anonymous user, the only way to unblock them is to clear your hidden blocklist.`}</h3>

				<DialogFooter className="mt-4 gap-2 sm:gap-0">
					<Button variant={'outline'} onClick={onCancel}>Cancel</Button>
					<Button className="flex items-center gap-1" disabled={isPending} variant={'destructive'} onClick={processBlock}>
						{isPending && <IconLoader2 className="mr-[2px] size-5 animate-spin" />}
						Block
					</Button>
				</DialogFooter>

			</DialogContent>
		</Dialog >
	)
}