import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reportModalState } from "@/lib/atoms";
import { fetchData } from "@/lib/utils";
import { ReportType } from "@/types/database";
import { IconLoader2 } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useRecoilState } from "recoil"
import { toast } from "sonner";

export default function ReportPostModal() {

	const [modal, setModal] = useRecoilState(reportModalState);
	const [reason, setReason] = useState<ReportType | undefined>(undefined);

	const { mutate, isPending } = useMutation({
		mutationFn: async (data: { postId: string, reason: ReportType }) => {
			return fetchData('/api/posts/report', {
				postId: data.postId,
				reason: data.reason
			});
		},
		onError(error, variables, context) {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			toast.success(`You have reported this post.`, { description: 'Thank you for your contribution!' });
			onCancel();
		}
	});

	const processReport = useCallback(() => {
		if (!reason) { return; }
		mutate({
			postId: modal.postId ?? '',
			reason,
		})
	}, [modal, mutate, reason]);

	const onCancel = useCallback(() => {
		setModal((prev) => {
			return {
				...prev,
				open: false,
				postId: null,
			}
		});
		setReason(undefined);
	}, [setModal]);

	const options: Record<string, ReportType> = {
		'Innappropriate title or description': 'INNAPROPRIATE_TITLE_OR_DESCRIPTION',
		'Innappropriate artwork': 'INNAPROPRIATE_ARTWORK',
		'Spam': 'SPAM',
	}

	return (
		<Dialog open={modal.open} onOpenChange={(o) => { if (!o) { onCancel() } }}>
			<DialogContent className="w-full max-w-[600px] rounded-lg gap-0 pb-6">
				<DialogHeader>
					<DialogTitle className="font-medium text-lg line-clamp-1 mb-2">Report content</DialogTitle>
				</DialogHeader>

				<h3 className="text-sm mt-1">
					{`We work hard to create a safe and pleasant environment for all users.
				If you feel that this content violates our terms of use, please report it and our staff will review it and take appropriate actions.
				Thank you for contributing to the platform!`}
				</h3>
				<Select value={reason} onValueChange={(value) => setReason(value as ReportType)}>
					<SelectTrigger className="w-full mt-4">
						<SelectValue placeholder="Select a reason" />
					</SelectTrigger>
					<SelectContent>
						{
							Object.keys(options).map((key) => {
								return <SelectItem key={options[key]} value={options[key]}>{key}</SelectItem>
							})
						}
					</SelectContent>
				</Select>

				<DialogFooter className="mt-4 gap-2 sm:gap-0">
					<Button variant={'outline'} onClick={onCancel}>Cancel</Button>
					<Button className="flex items-center gap-1" disabled={isPending || reason === undefined} variant={'destructive'} onClick={processReport}>
						{isPending && <IconLoader2 className="mr-[2px] size-5 animate-spin" />}
						Report
					</Button>
				</DialogFooter>

			</DialogContent>
		</Dialog >
	)
}