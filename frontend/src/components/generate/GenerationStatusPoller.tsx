import { generationStatusState, generationToastState } from "@/lib/atoms"
import { fetchData } from "@/lib/utils";
import { APIResponse } from "@/pages/api/generation/get_status";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil"
import {
	Toast,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from "@/components/ui/toast"
import { Button } from "../ui/button";
import { IconCircleCheckFilled, IconCircleXFilled, IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";

export default function GenerationStatusPoller() {

	const router = useRouter();
	const [generationStatus, setGenerationStatus] = useRecoilState(generationStatusState);
	const generationToast = useRecoilValue(generationToastState);

	const { data } = useQuery<APIResponse>({
		queryKey: [generationStatus.id, generationStatus.type, generationStatus.status],
		queryFn: async () => {
			return fetchData('/api/generation/get_status', { id: generationStatus.id, type: generationStatus.type });
		},
		refetchInterval: 1500,
		enabled: generationStatus.id !== null && generationStatus.status !== 'COMPLETED' && generationStatus.status !== 'FAILED',
	});
	useEffect(() => {
		if (data && data.status === 'success') {
			setGenerationStatus((prev) => {
				return {
					...prev,
					status: data.data.status,
					data: {
						url: data.data.url,
						refunded: data.data.refunded
					}
				}
			})
		}

	}, [data, setGenerationStatus, generationStatus.id]);

	const isGenerationPage = useMemo(() => {
		return router.asPath.startsWith('/generate');
	}, [router.asPath])

	if (generationStatus.id === null || !generationToast.open) { return [] }

	const captions = {
		'QUEUED': [<IconLoader2 key={'icon'} className="size-6 animate-spin text-primary shrink-0" />, 'Your image is being generated', 'Request was queued'],
		'PROCESSING': [<IconLoader2 key={'icon'} className="size-6 animate-spin text-primary shrink-0" />, 'Your image is being generated', 'Request is being processed'],
		'COMPLETED': [<IconCircleCheckFilled key={'icon'} className="size-6 text-green-600 shrink-0" />, 'Your image was generated', 'Go to the generation page to see the result'],
		'FAILED': [<IconCircleXFilled key={'icon'} className="size-6 text-red-600 shrink-0" />, 'There was an error when generating the image', 'Please try again later'],
	}

	return (
		//@ts-expect-error
		<ToastProvider swipeDirection="" >
			<Toast open={!isGenerationPage} id={'1'} onOpenChange={() => { }}>

				<div className="flex gap-2 items-center">
					{generationStatus.status ? captions[generationStatus.status][0] : []}
					<div className="grid gap-[2px]">
						<ToastTitle className="line-clamp-1">{generationStatus.status ? captions[generationStatus.status][1] : ''}</ToastTitle>
						<ToastDescription className="line-clamp-1">{generationStatus.status ? captions[generationStatus.status][2] : ''}</ToastDescription>
					</div>

				</div>
				<Button asChild>
					<Link href={'/generate'}>Check</Link>
				</Button>
			</Toast>
			<ToastViewport />
		</ToastProvider>
	)
}