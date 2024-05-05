import { generationStatusState, generationToastState } from "@/lib/atoms"
import { fetchData } from "@/lib/utils";
import { APIResponse } from "@/pages/api/generation/get_status";
import { useMutation } from "@tanstack/react-query";
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
import { Socket, io } from "socket.io-client";

export default function GenerationStatusPoller() {

	const router = useRouter();
	const [generationStatus, setGenerationStatus] = useRecoilState(generationStatusState);
	const generationToast = useRecoilValue(generationToastState);

	useEffect(() => {
		let socket: Socket;

		function onStatusUpdate() {
			checkStatus();
		}

		if (generationStatus.socketAuth) {
			socket = io(process.env.NEXT_PUBLIC_QUEUE_SERVER ?? '', {
				extraHeaders: {
					authorization: `bearer ${generationStatus.socketAuth}`
				},
			});
			socket.on('status_update', onStatusUpdate);
		}

		return () => {
			socket?.off('status_update', onStatusUpdate);
			socket?.disconnect();
		};

	}, [generationStatus.socketAuth])


	const { mutateAsync: checkStatus } = useMutation({
		mutationFn: async () => {
			return fetchData<APIResponse>('/api/generation/get_status', { id: generationStatus.id, type: generationStatus.type });
		},
		onSuccess(data) {
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
		},
	})

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