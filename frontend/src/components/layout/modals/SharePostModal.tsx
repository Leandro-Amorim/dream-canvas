import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { sharePostModalState } from "@/lib/atoms";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRecoilState } from "recoil"
import { toast } from "sonner";
import {
	FacebookIcon,
	FacebookShareButton,
	PinterestIcon,
	PinterestShareButton,
	RedditIcon,
	RedditShareButton,
	TwitterShareButton,
	WhatsappIcon,
	WhatsappShareButton,
	XIcon,
} from "react-share";

export default function SharePostModal() {
	const [modal, setModal] = useRecoilState(sharePostModalState);

	const onCancel = useCallback(() => {
		setModal((prev) => {
			return {
				...prev,
				open: false,
				postId: null,
				imageUrl: '',
				postTitle: '',
			}
		});
	}, [setModal]);

	const [postUrl, setPostUrl] = useState('');

	useEffect(() => {
		setPostUrl(window.location.origin + '/posts/' + modal.postId);
	}, [modal.postId]);

	const copyLink = useCallback(() => {
		navigator.clipboard.writeText(postUrl).then(() => {
			toast.success('Link copied to clipboard');
		})
	}, [postUrl]);

	return (
		<Dialog open={modal.open} onOpenChange={(o) => { if (!o) { onCancel() } }}>
			<DialogContent className="w-full max-w-[600px] rounded-lg gap-0 flex flex-col ">
				<DialogHeader>
					<DialogTitle><h3 className="font-medium text-lg line-clamp-1 mb-2">Share post</h3></DialogTitle>
				</DialogHeader>

				<div className="w-full flex gap-2 mt-4 flex-wrap">

					<FacebookShareButton className="grow" url={postUrl} hashtag="#DreamCanvas">
						<Button className="w-full h-[46px] px-2" variant={'outline'} size={'lg'}>
							<FacebookIcon size={32} round />
						</Button>
					</FacebookShareButton>

					<PinterestShareButton className="grow" url={postUrl} media={modal.imageUrl} description={modal.postTitle ? `${modal.postTitle} on DreamCanvas` : undefined}>
						<Button className="w-full h-[46px] px-2" variant={'outline'} size={'lg'}>
							<PinterestIcon size={32} round />
						</Button>
					</PinterestShareButton>

					<RedditShareButton className="grow" url={postUrl} title={modal.postTitle ? `${modal.postTitle} on DreamCanvas` : undefined}>
						<Button className="w-full h-[46px] px-2" variant={'outline'} size={'lg'}>
							<RedditIcon size={32} round />
						</Button>
					</RedditShareButton>

					<WhatsappShareButton className="grow" url={postUrl} title={modal.postTitle ? `${modal.postTitle} on DreamCanvas` : undefined} separator=" - ">
						<Button className="w-full h-[46px] px-2" variant={'outline'} size={'lg'}>
							<WhatsappIcon size={32} round />
						</Button>
					</WhatsappShareButton>

					<TwitterShareButton className="grow" url={postUrl} title={modal.postTitle ? `${modal.postTitle} on DreamCanvas - ` : undefined}>
						<Button className="w-full h-[46px] px-2" variant={'outline'} size={'lg'}>
							<XIcon size={32} round />
						</Button>
					</TwitterShareButton>
				</div>

				<div className="w-full flex gap-[6px] mt-6 items-center text-muted-foreground">
					<Separator className="grow w-0" />
					<span className="text-[13px] pb-[3px]">or</span>
					<Separator className="grow w-0" />
				</div>

				<div className="flex mt-6 w-full items-center mb-2">
					<Input value={postUrl} readOnly={true} placeholder="Post link" className="h-10 w-full rounded-r-none" />
					<Button className="rounded-l-none w-[80px]" size={'lg'} onClick={copyLink}>Copy</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
