import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { unblockUserModalState } from "@/lib/atoms";
import { fetchData } from "@/lib/utils";
import { IconLoader2 } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { useRecoilState } from "recoil"
import { toast } from "sonner";

export default function UnblockUserModal() {

	const [modal, setModal] = useRecoilState(unblockUserModalState);

	const { mutate, isPending } = useMutation({
		mutationFn: async (data: { blockedId: string }) => {
			return fetchData('/api/users/block', {
				userId: data.blockedId,
				block: false
			});
		},
		onError() {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess() {
			toast.success(`You have unblocked ${modal.blockedName || `this user`}.`);
			modal.onSuccess?.();
			onCancel();
		}
	});

	const processBlock = useCallback(() => {
		mutate({
			blockedId: modal.blockedId ?? '',
		})
	}, [modal, mutate]);

	const onCancel = useCallback(() => {
		setModal((prev) => {
			return {
				...prev,
				open: false,
				onSuccess: () => { },
				blockedId: null,
				blockedName: null
			}
		})
	}, [setModal]);

	return (
		<Dialog open={modal.open} onOpenChange={(o) => { if (!o) { onCancel() } }}>
			<DialogContent className="w-full max-w-[600px] rounded-lg gap-0 pb-6">
				<DialogHeader>
					<DialogTitle className="font-medium text-lg line-clamp-1 mb-2">Unblock {modal.blockedName || 'user'}</DialogTitle>
				</DialogHeader>

				<h3 className="text-sm">{`Are you sure you want to unblock this user? You'll be able to see their posts again.`}</h3>

				<DialogFooter className="mt-4 gap-2 sm:gap-0">
					<Button variant={'outline'} onClick={onCancel}>Cancel</Button>
					<Button className="flex items-center gap-1" disabled={isPending} variant={'destructive'} onClick={processBlock}>
						{isPending && <IconLoader2 className="mr-[2px] size-5 animate-spin" />}
						Unblock
					</Button>
				</DialogFooter>

			</DialogContent>
		</Dialog >
	)
}