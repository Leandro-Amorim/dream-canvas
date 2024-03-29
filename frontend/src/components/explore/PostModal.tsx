import { Dialog, DialogContent } from "../ui/dialog";
import { IconLoader2 } from "@tabler/icons-react";
import { ScrollArea } from "../ui/scroll-area";
import { useRecoilState } from "recoil";
import { postModalState, } from "@/lib/atoms";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/lib/utils";
import { APIResponse } from "@/pages/api/posts/get-post";
import PostContent from "./PostContent";

export default function PostModal() {

	const [modal, setModal] = useRecoilState(postModalState);
	const [dirty, setDirty] = useState(false);

	const onCancel = useCallback((immediateCleanup?: boolean) => {
		history.back();
		if (dirty || immediateCleanup) {
			modal.onDirty?.();
			setDirty(false);
		}
		setModal((prev) => {
			return {
				...prev,
				open: false,
				postId: null,
				onDirty: () => { }
			}
		})

	}, [modal, setModal, dirty]);

	useEffect(() => {
		const popStateListener = () => {
			if (!modal.open) { return; }
			if (dirty) {
				modal.onDirty?.();
				setDirty(false);
			}
			setModal((prev) => {
				return {
					...prev,
					open: false,
					postId: null,
					onDirty: () => { }
				}
			})
		}
		window.addEventListener('popstate', popStateListener);
		return () => window.removeEventListener('popstate', popStateListener);
	}, [onCancel, dirty, modal, setModal]);

	const { data, isError, isLoading, refetch } = useQuery<APIResponse>({
		queryKey: [modal.postId],
		queryFn: async () => {
			return fetchData('/api/posts/get-post', { postId: modal.postId });
		},
		enabled: modal.postId !== null
	});

	const post = data?.status === 'success' && data.data.post ? data.data.post : null;

	return (
		<Dialog open={modal.open} onOpenChange={(o) => { if (!o) { onCancel() } }}>

			<DialogContent className="w-full max-w-[1420px] h-[calc(100vh-32px)] !rounded-xl">
				{
					(isError || isLoading) ?
						<div className="w-full h-full flex items-center justify-center">
							<IconLoader2 className="size-14 animate-spin text-primary" />
						</div>

						:
						<ScrollArea className="mr-[6px]">
							<PostContent post={post} refetchPost={refetch} setDirty={setDirty} onCancel={onCancel} />
						</ScrollArea>
				}

			</DialogContent>
		</Dialog>
	)
}