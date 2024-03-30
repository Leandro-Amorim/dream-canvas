import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import { IProfileCard } from "@/types/database";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { IconDots, IconUser, IconUserCancel, IconUserCheck, IconUsersMinus, IconUsersPlus } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { fetchData } from "@/lib/utils";
import { toast } from "sonner";
import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { blockUserModalState, signinModalOpenState } from "@/lib/atoms";

export default function FollowerCard({ profile, refetchFn }: { profile: IProfileCard, refetchFn: () => void }) {

	const session = useSession();
	const userId = session.data?.user.id ?? null;
	const isMe = profile.id === userId;

	const setSigninModalOpen = useSetRecoilState(signinModalOpenState);

	const { mutate: followUserMutation, isPending: followUserPending } = useMutation({
		mutationFn: async (data: { userId: string, follow: boolean }) => {
			return fetchData('/api/users/follow', data);
		},
		onError(error, variables, context) {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			toast.success(variables.follow ? `You started following ${profile.name || 'User'}.` : `You have unfollowed ${profile.name || 'User'}.`);
			refetchFn();
		}
	})
	const followUser = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		if (followUserPending) { return; }
		followUserMutation({
			userId: profile.id ?? '',
			follow: !profile.followedByMe
		})
	}, [profile, session, followUserMutation, followUserPending, setSigninModalOpen]);

	const setBlockModal = useSetRecoilState(blockUserModalState);

	const { mutate: blockUserMutation, isPending: blockUserPending } = useMutation({
		mutationFn: async (data: { userId: string | null, block: boolean }) => {
			return fetchData('/api/users/block', data);
		},
		onError(error, variables, context) {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			toast.success(variables.block ? `You have blocked this user.` : `You have unblocked this user.`);
			refetchFn();
		}
	});

	const blockUser = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		if (blockUserPending) { return; }

		if (profile.blockedByMe) {
			blockUserMutation({
				userId: profile.id,
				block: false
			})
		}
		else {
			setBlockModal((prev) => {
				return {
					...prev,
					open: true,
					mode: 'user',
					userId: profile.id,
					onSuccess: refetchFn,
				}
			})
		}
	}, [profile, setBlockModal, refetchFn, session, setSigninModalOpen, blockUserMutation, blockUserPending]);

	return (
		<Card>
			<CardContent className="flex flex-col p-3 relative">
				{
					!isMe &&
					<DropdownMenu>
						<DropdownMenuTrigger asChild><Button className="w-6 h-6 absolute top-[6px] right-[6px]" size={'icon'} variant={'outline'}> <IconDots size={16} /> </Button></DropdownMenuTrigger>
						<DropdownMenuPortal>
							<DropdownMenuContent align="end">
								<DropdownMenuItem className="cursor-pointer flex items-center gap-1" onClick={followUser}>
									{
										profile.followedByMe ? <><IconUsersMinus size={16} /> Unfollow user</> : <> <IconUsersPlus size={16} /> Follow user</>
									}
								</DropdownMenuItem>
								<DropdownMenuItem className={`cursor-pointer flex items-center gap-1 ${!profile.blockedByMe && '!text-red-500'}`} onClick={blockUser}>
									{
										profile.blockedByMe ? <><IconUserCheck size={16} /> Unblock user</> : <><IconUserCancel size={16} /> Block user</>
									}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenuPortal>
					</DropdownMenu>
				}

				<div className="w-full flex flex-col items-center gap-2">
					<Link href={`/profiles/${profile.id}`}>
						<Avatar className="size-[70px] shrink-0">
							<AvatarImage className="object-cover" src={profile.image || ''} alt={profile.name || 'User'} />
							<AvatarFallback><IconUser size={34} className="text-gray-600" /></AvatarFallback>
						</Avatar>
						<h3 className="w-full font-medium text-base text-center line-clamp-1 select-none">{profile.name || 'User'}</h3>
					</Link>
				</div>

				<div className="flex justify-between gap-2 mt-2">
					<PhotoProvider maskOpacity={0.97} speed={() => 300} easing={() => 'cubic-bezier(0.215, 0.61, 0.355, 1)'}>
						{
							profile.postImages.length === 0 ?
								<div className="w-full flex items-center justify-center text-center p-8 italic text-gray-400 text-sm bg-muted rounded-lg">
									{`This user doesn't have any posts`}
								</div>
								:
								[0, 1, 2].map((i) => {
									return (
										<div key={i} className="flex-1 aspect-square relative rounded-md overflow-hidden bg-muted">
											{
												profile.postImages[i] &&
												<PhotoView src={profile.postImages[i]}>
													<Image fill={true} src={profile.postImages[i]} alt="Post" className="object-cover cursor-pointer" />
												</PhotoView>
											}
										</div>
									)
								})
						}
					</PhotoProvider>
				</div>

			</CardContent>
		</Card>
	)
}