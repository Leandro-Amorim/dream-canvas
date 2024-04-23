import { IconBellFilled, IconLoader2, IconUser } from "@tabler/icons-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { INotification } from "@/types/database";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { DateTime } from "luxon";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { APIResponse } from "@/pages/api/notifications/get";
import { fetchData } from "@/lib/utils";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroller";
import { toast } from "sonner";
import { APIResponse as CheckNewApiResponse } from "@/pages/api/notifications/check-new";
import { APIResponse as GetAuthApiResponse } from "@/pages/api/notifications/get-auth";
import { Socket, io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query'

export default function Notifications() {

	const queryClient = useQueryClient();

	const fetchNotifications = async ({ pageParam }: { pageParam?: { id: string, createdAt: string } }): Promise<APIResponse> => {
		return await fetchData('/api/notifications/get', {
			cursor: pageParam
		});
	}

	const { isFetching, isFetchingNextPage, data, fetchNextPage, hasNextPage, refetch: refetchNotifications, } = useInfiniteQuery({
		queryKey: ['notifications'],
		queryFn: fetchNotifications,
		getNextPageParam: (lastPage) => {
			if (lastPage.status !== 'success' || lastPage.data.length == 0) { return undefined; }

			const lastItem = lastPage.data.at(-1);
			if (!lastItem) { return undefined; }

			return {
				id: lastItem.id,
				createdAt: lastItem.createdAt,
			}
		},
		initialPageParam: undefined,
	})

	const notificationsList = useMemo(() => {
		return data?.pages.flatMap((page) => {
			return (page.status === 'success' ? page.data : [])
		}) ?? []
	}, [data]);

	const { mutate: readMutation } = useMutation({
		mutationFn: async (data: { ids: string[] }) => {
			return fetchData('/api/notifications/mark-as-read', data);
		},
		onSuccess: async () => {
			await refetchNotifications();
			checkNewMutation().then((data) => {
				setHasNew(data.status === 'success' && data.data.hasNew === true);
			})
		}
	})

	const [open, setOpen] = useState(false);
	const onOpenChange = useCallback((o: boolean) => {
		if (!o) {
			readMutation({ ids: notificationsList.map((n) => n.id) });
		}
		setOpen(o);
	}, [notificationsList, readMutation]);

	const { mutateAsync: checkNewMutation } = useMutation({
		mutationFn: async () => {
			return fetchData<CheckNewApiResponse>('/api/notifications/check-new', {});
		}
	})

	const [hasNew, setHasNew] = useState(false);

	useEffect(() => {
		checkNewMutation().then((data) => {
			setHasNew(data.status === 'success' && data.data.hasNew === true);
		})
	}, [])

	useEffect(() => {

		function onNotification() {
			checkNewMutation().then((data) => {
				setHasNew(data.status === 'success' && data.data.hasNew === true);
				queryClient.invalidateQueries({ queryKey: ['notifications'] });
			})
		}

		let socket: Socket;
		fetchData<GetAuthApiResponse>('/api/notifications/get-auth', {}).then((data) => {
			console.log('AS');
			if (data.status === 'success') {
				socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER ?? '', {
					extraHeaders: {
						authorization: `bearer ${data.data.token}`
					},
				});
				socket.on('notification', onNotification);
			}
		});

		return () => {
			socket?.off('notification', onNotification);
			socket?.disconnect();
		};
	}, []);

	return (
		<Popover open={open} onOpenChange={onOpenChange}>
			<PopoverTrigger>
				<Button variant={"ghost"} size={'icon'} className="rounded-full relative">
					<IconBellFilled size={20} className={`${hasNew ? 'animate-bell' : ''}`} />
					<span className={`absolute transition-all translate-x-1/2 -translate-y-1/2 flex right-1 top-1 ${hasNew ? 'size-2' : 'size-0'}`}>
						<span className="animate-[ping_1.5s_ease-in-out_infinite] absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
						<span className="relative inline-flex rounded-full size-full bg-red-500"></span>
					</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="md:max-w-[500px] w-screen md:mr-8 p-3">
				<InfiniteScroll loadMore={() => { !isFetching && fetchNextPage() }} hasMore={hasNextPage} className="w-full" loader={<div className="w-full flex justify-center" key={0}><IconLoader2 className="size-6 text-primary animate-spin my-1" /></div>}>
					{
						notificationsList.length === 0 && !isFetching &&
						<div className="w-full flex gap-1 items-center justify-center italic text-gray-400 text-lg py-8" key={0}>
							{`No notifications at the moment.`}
						</div>
					}
					<ScrollArea type="auto" className="flex flex-col max-h-[300px] pr-3">
						<div className="flex flex-col gap-1">
							{
								notificationsList.map((notif) => {
									return (
										<NotificationItem key={notif.id} notification={notif} refetchNotifications={refetchNotifications} />
									)
								})}
							{
								isFetching && !isFetchingNextPage && notificationsList.length === 0 &&
								<div className="w-full flex justify-center" key={0}><IconLoader2 className="size-6 text-primary animate-spin my-1" /></div>
							}
						</div>
					</ScrollArea>
				</InfiniteScroll>
			</PopoverContent>
		</Popover>
	)
}

export const NotificationItem = ({ notification, refetchNotifications }: { notification: INotification, refetchNotifications: () => void }) => {

	const profile = notification.user;
	const post = notification.post;

	const [followed, setFollowed] = useState(false);
	useEffect(() => {
		setFollowed(profile?.followedByMe ?? false);
	}, [profile?.followedByMe]);

	const { mutate: followUserMutation } = useMutation({
		mutationFn: async (data: { userId: string, follow: boolean }) => {
			return fetchData('/api/users/follow', data);
		},
		onMutate(variables) {
			setFollowed(variables.follow);
		},
		onError(error, variables, context) {
			setFollowed(!variables.follow);
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			toast.success(variables.follow ? `You started following ${profile?.name || 'User'}.` : `You have unfollowed ${profile?.name || 'User'}.`);
			refetchNotifications();
		}
	})
	const followUser = useCallback(() => {
		followUserMutation({
			userId: profile?.id ?? '',
			follow: !followed
		})
	}, [profile, followUserMutation, followed]);

	let content;
	switch (notification.type) {
		case "NEW_FOLLOWER":
			content = <>
				<Link href={`/profiles/${profile?.id ?? ''}`}>
					<Avatar className="size-[56px] shrink-0">
						<AvatarImage className="object-cover" src={profile?.avatar || ''} alt={profile?.name || 'User'} />
						<AvatarFallback><IconUser size={32} className="text-gray-600" /></AvatarFallback>
					</Avatar>
				</Link>
				<div className="grow text-sm flex flex-col gap-[2px]">
					<div className="w-full line-clamp-2 grow">
						<Link href={`/profiles/${profile?.id ?? ''}`}>
							<span className="font-medium truncate">{`${profile?.name || 'User'} `}</span>
						</Link>
						<span>started following you.</span>
					</div>
					<div className="text-xs line-clamp-1 text-muted-foreground">{DateTime.fromSQL(notification.createdAt).toRelative()}</div>
				</div>
				<Button variant={followed ? 'destructive' : 'default'} onClick={followUser}>{followed ? 'Unfollow' : 'Follow'}</Button>
			</>
			break;
		case "NEW_LIKE":

			const likeCount = Number(notification.additionalData ?? 0);

			content = <>
				<Link href={`/posts/${post?.id ?? ''}`}>
					<div className="size-[64px] shrink-0 rounded-md overflow-hidden relative">
						<Image src={post?.imageUrl ?? ''} fill={true} className="object-cover" alt={post?.title || 'Post'} />
					</div>
				</Link>
				<div className="grow text-sm flex flex-col gap-[2px]">
					<div className="w-full line-clamp-2 grow">
						<Link href={`/profiles/${profile?.id ?? ''}`}>
							<span className="font-medium truncate">{`${profile?.name || 'User'} `}</span>
						</Link>
						{
							likeCount < 2 ?
								<span>liked your post.</span>
								:
								likeCount == 2 ?
									<span>and 1 other liked your post.</span>
									:
									<span>and {likeCount - 1} others liked your post.</span>
						}
					</div>
					<div className="text-xs line-clamp-1 text-muted-foreground">{DateTime.fromSQL(notification.createdAt).toRelative()}</div>
				</div>
			</>
			break;
		case "NEW_COMMENT":
			content = <>
				<Link href={`/posts/${post?.id ?? ''}`}>
					<div className="size-[64px] shrink-0 rounded-md overflow-hidden relative">
						<Image src={post?.imageUrl ?? ''} fill={true} className="object-cover" alt={post?.title || 'Post'} />
					</div>
				</Link>
				<div className="grow text-sm flex flex-col gap-[2px]">
					<div className="w-full line-clamp-3 grow">
						<Link href={`/profiles/${profile?.id ?? ''}`}>
							<span className="font-medium truncate">{`${profile?.name || 'User'} `}</span>
						</Link>
						<span>commented on your post: {notification.additionalData ?? ''}</span>
					</div>
					<div className="text-xs line-clamp-1 text-muted-foreground">{DateTime.fromSQL(notification.createdAt).toRelative()}</div>
				</div>
			</>
			break;
		case "NEW_REPLY":
			content = <>
				<Link href={`/posts/${post?.id ?? ''}`}>
					<div className="size-[64px] shrink-0 rounded-md overflow-hidden relative">
						<Image src={post?.imageUrl ?? ''} fill={true} className="object-cover" alt={post?.title || 'Post'} />
					</div>
				</Link>
				<div className="grow text-sm flex flex-col gap-[2px]">
					<div className="w-full line-clamp-3 grow">
						<Link href={`/profiles/${profile?.id ?? ''}`}>
							<span className="font-medium truncate">{`${profile?.name || 'User'} `}</span>
						</Link>
						<span>{`commented in a thread you're subscribed to: ${notification.additionalData ?? ''}`}</span>
					</div>
					<div className="text-xs line-clamp-1 text-muted-foreground">{DateTime.fromSQL(notification.createdAt).toRelative()}</div>
				</div>
			</>
			break;
		case "SYSTEM":
			content = <>
				{
					notification.additionalImage &&
					<div className="size-[64px] shrink-0 rounded-md overflow-hidden relative">
						<Image src={notification.additionalImage} fill={true} className="object-cover" alt={'System notification'} />
					</div>
				}

				<div className="grow text-sm flex flex-col gap-[2px]">
					<div className="w-full line-clamp-3 grow">
						{notification.additionalData}
					</div>
					<div className="text-xs line-clamp-1 text-muted-foreground">{DateTime.fromSQL(notification.createdAt).toRelative()}</div>
				</div>
			</>
			break;
	}

	return (
		<Card>
			<CardContent className="w-full flex p-3 relative gap-2 items-center">
				{
					!notification.seen && notification.type !== 'SYSTEM' &&
					<span className="absolute inline-flex rounded-full size-2 top-1 right-1 bg-red-500"></span>
				}
				{content}
			</CardContent>
		</Card>
	)
}