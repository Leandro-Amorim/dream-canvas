import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fetchData } from "@/lib/utils";
import { IconLoader2 } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useCallback } from "react";
import { toast } from "sonner";

export default function ClearHiddenBlocklistModal({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {

	const { mutate, isPending } = useMutation({
		mutationFn: async () => {
			return fetchData('/api/users/clear-hidden-blocks', {});
		},
		onError() {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess() {
			toast.success(`You have cleared the hidden blocklist.`);
			onCancel();
		}
	});

	const processClear = useCallback(() => {
		mutate();
	}, [mutate]);

	const onCancel = useCallback(() => {
		setOpen(false);
	}, [setOpen]);

	return (
		<Dialog open={open} onOpenChange={(o) => { if (!o) { onCancel() } }}>
			<DialogContent className="w-full max-w-[600px] rounded-lg gap-0 pb-6">
				<DialogHeader>
					<DialogTitle className="font-medium text-lg line-clamp-1 mb-2">Clear Hidden Blocklist</DialogTitle>
				</DialogHeader>

				<h3 className="text-sm">{`Are you sure you want to clear the hidden blocklist? You'll be able to see the posts of all the anonymous users you've blocked.`}</h3>

				<DialogFooter className="mt-4 gap-2 sm:gap-0">
					<Button variant={'outline'} onClick={onCancel}>Cancel</Button>
					<Button className="flex items-center gap-1" disabled={isPending} variant={'destructive'} onClick={processClear}>
						{isPending && <IconLoader2 className="mr-[2px] size-5 animate-spin" />}
						Clear
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog >
	)
}