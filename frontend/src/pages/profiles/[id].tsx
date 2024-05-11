import Main from "@/components/layout/Main";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { IconDots, IconEdit, IconShare, IconUser, IconUserCancel, IconUserCheck, IconUsersMinus } from "@tabler/icons-react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image";
import { authOptions } from "../api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import { APIResponse, getProfile } from "../api/profiles/get-profile";
import { IProfile } from "@/types/database";
import { fetchData } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
const LottieAnimation = dynamic(() => import('@/components/layout/LottieAnimation'), { ssr: false });
import sadRobot from "$/sad-robot.json";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import ProfilePostsSection from "@/components/profiles/ProfilePostsSection";
import ProfileFollowersSection from "@/components/profiles/ProfileFollowersSection";
import ProfileFollowingSection from "@/components/profiles/ProfileFollowingSection";
import ProfileSavedSection from "@/components/profiles/ProfileSavedSection";
import ProfileLikedSection from "@/components/profiles/ProfileLikedSection";
import { useCallback, useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { blockUserModalState, shareModalState, signinModalOpenState } from "@/lib/atoms";
import { useSetRecoilState } from "recoil";
import { useRouter } from "next/router";
import Head from "next/head";

export const getServerSideProps = (async function (context) {

	const session = await getServerSession(context.req, context.res, authOptions);
	const userId = session?.user.id ?? '';
	let profileId = context.query.id;
	if (!profileId) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		}
	}

	if (profileId === 'me') {
		profileId = userId;
	}

	const profile = await getProfile(profileId as string, userId);

	return {
		props: {
			originalProfile: profile,
		},
	}
}) satisfies GetServerSideProps<{ originalProfile: IProfile | null }>;

export default function Profile({ originalProfile }: InferGetServerSidePropsType<typeof getServerSideProps>) {

	const router = useRouter();
	const session = useSession();
	const setSigninModalOpen = useSetRecoilState(signinModalOpenState);

	const { data, refetch: refetchProfile } = useQuery<APIResponse>({
		queryKey: [originalProfile?.id],
		queryFn: async () => {
			return fetchData('/api/profiles/get-profile', { profileId: originalProfile?.id });
		},
		enabled: originalProfile !== null,
		initialData: {
			status: 'success',
			data: {
				profile: originalProfile
			}
		}
	});

	const profile = data?.status === 'success' && data.data.profile ? data.data.profile : null;
	const isOwnProfile = profile?.id === (session.data?.user.id ?? null);

	const [tab, setTab] = useState('posts');
	useEffect(() => {
		setTab('posts');
	}, [profile?.id]);

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
			refetchProfile();
		}
	})
	const followUser = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		followUserMutation({
			userId: profile?.id ?? '',
			follow: !followed
		})
	}, [profile, session, followUserMutation, setSigninModalOpen, followed]);

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
			refetchProfile();
		}
	});

	const blockUser = useCallback(() => {
		if (session.status === 'unauthenticated') {
			setSigninModalOpen(true);
			return;
		}
		if (blockUserPending) { return; }

		if (profile?.blockedByMe) {
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
					userId: profile?.id ?? '',
					onSuccess: refetchProfile,
				}
			})
		}
	}, [profile, setBlockModal, refetchProfile, session, setSigninModalOpen, blockUserMutation, blockUserPending]);

	const setShareModal = useSetRecoilState(shareModalState);
	const shareProfile = useCallback(() => {
		setShareModal((prev) => {
			return {
				...prev,
				open: true,
				mode: 'profile',
				id: profile?.id ?? '',
				title: profile?.name ?? '',
				imageUrl: profile?.image ?? '',
			}
		})
	}, [profile, setShareModal]);

	return (
		<Main>
			{
				profile === null ?
					<div className="w-full mt-12 flex flex-col md:flex-row justify-center items-center">
						<LottieAnimation animationData={sadRobot} loop={true} className="shrink-0 mt-10 size-80 scale-150 md:translate-x-[10px] pointer-events-none " />
						<div className="ml-2 flex flex-col gap-6 justify-center z-10 break-words max-w-[600px]">
							<span className="text-6xl font-bold">Oh no!</span>
							<span className="text-xl text-muted-foreground">{`The profile you're looking for doesn't exist on the server.`}</span>
						</div>
					</div>
					:
					<>
						<Head>
							<title key="title">{`${profile.name} — Dream Canvas`}</title>
							<meta key={'meta-title'} name="title" content={`${profile.name} — Dream Canvas`} />
							<meta key={'meta-description'} name="description" content={`${profile.description || 'No description provided.'}`} />

							<meta key={'og-url'} name="og:url" property="og:url" content={`${process.env.NEXT_PUBLIC_URL}/profiles/${profile.id}`} />
							<meta key={'og-type'} name="og:type" property="og:type" content="website" />
							<meta key={'og-title'} name="og:title" property="og:title" content={`${profile.name} — Dream Canvas`} />
							<meta key={'og-description'} name="og:description" property="og:description" content={`${profile.description || 'No description provided.'}`} />
							<meta key={'og-image'} name="og:image" property="og:image" content={profile.image || `${process.env.NEXT_PUBLIC_URL}/card1.jpg`} />

							<meta key={'twitter-card'} name="twitter:card" property="twitter:card" content="summary_large_image" />
							<meta key={'twitter-url'} name="twitter:url" property="twitter:url" content={`${process.env.NEXT_PUBLIC_URL}/profiles/${profile.id}`} />
							<meta key={'twitter-title'} name="twitter:title" property="twitter:title" content={`${profile.name} — Dream Canvas`} />
							<meta key={'twitter-description'} name="twitter:description" property="twitter:description" content={`${profile.description || 'No description provided.'}`} />
							<meta key={'twitter-image'} name="twitter:image" property="twitter:image" content={profile.image || `${process.env.NEXT_PUBLIC_URL}/card1.jpg`} />
						</Head>
						<div className="w-full flex flex-col items-center overflow-hidden relative">
							<div className="w-full h-[180px] absolute bg-secondary/90 rounded-t-lg">
								{
									profile.coverImage &&
									<Image src={profile.coverImage} alt="Cover image" fill={true} className="object-cover" />
								}
								<div className="absolute right-1 top-1 flex gap-1">
									{
										!isOwnProfile && !followed &&
										<Button onClick={followUser}>Follow</Button>
									}
									<DropdownMenu>
										<DropdownMenuTrigger asChild><Button size={'icon'} variant={'outline'}> <IconDots size={20} /> </Button></DropdownMenuTrigger>
										<DropdownMenuPortal>
											<DropdownMenuContent align="end">
												{
													!isOwnProfile && followed &&
													<DropdownMenuItem className="cursor-pointer flex items-center gap-1" onClick={followUser}>
														{
															<><IconUsersMinus size={16} /> Unfollow user</>
														}
													</DropdownMenuItem>
												}
												<DropdownMenuItem className={`cursor-pointer flex items-center gap-1`} onClick={shareProfile}><IconShare size={16} /> Share profile</DropdownMenuItem>
												{
													isOwnProfile &&
													<DropdownMenuItem className="cursor-pointer flex items-center gap-1" onClick={() => router.push(`/settings#profile`)}>
														{
															<><IconEdit size={16} /> Edit profile</>
														}
													</DropdownMenuItem>
												}
												{
													!isOwnProfile &&
													<DropdownMenuItem className={`cursor-pointer flex items-center gap-1 ${!profile.blockedByMe && '!text-red-500'}`} onClick={blockUser}>
														{
															profile.blockedByMe ? <><IconUserCheck size={16} /> Unblock user</> : <><IconUserCancel size={16} /> Block user</>
														}
													</DropdownMenuItem>
												}
											</DropdownMenuContent>
										</DropdownMenuPortal>
									</DropdownMenu>
								</div>
							</div>


							<div className="w-full max-w-[600px] mt-20 shrink-0 flex z-[1]">

								<div className="flex-1 flex flex-col md:flex-row mt-[106px] md:mt-[116px] gap-2">
									<div className="flex-1 flex flex-col items-center gap-1">
										<h3 className="text-sm font-semibold">Followers</h3>
										<span className="text-sm">{profile.followersCount}</span>
									</div>
									<div className="flex-1 flex flex-col items-center gap-1">
										<h3 className="text-sm font-semibold">Following</h3>
										<span className="text-sm">{profile.followingCount}</span>
									</div>
								</div>

								<div className="flex-1 px-2 flex flex-col items-center min-w-[190px] text-center">
									<Avatar className="size-[150px] shrink-0 border shadow-md">
										<AvatarImage className="object-cover" src={profile.image || ''} alt={profile.name || 'User'} />
										<AvatarFallback><IconUser size={80} className="text-gray-600" /></AvatarFallback>
									</Avatar>
									<h3 className="text-lg font-semibold mt-4 line-clamp-2 break-all">{profile.name || 'User'}</h3>
								</div>

								<div className="flex-1 flex flex-col md:flex-row mt-[106px] md:mt-[116px] gap-2">
									<div className="flex-1 flex flex-col items-center gap-1">
										<h3 className="text-sm font-semibold">Posts</h3>
										<span className="text-sm">{profile.postsCount}</span>
									</div>
									<div className="flex-1 flex flex-col items-center gap-1">
										<h3 className="text-sm font-semibold">Saved posts</h3>
										<span className="text-sm">{profile.savedPostsCount}</span>
									</div>
								</div>

							</div>
							{
								profile.description &&
								<div className="w-full max-w-[900px] mt-5 leading-relaxed line-clamp-4 text-sm text-center">
									{
										profile.description
									}
								</div>
							}
						</div>

						<Tabs value={tab} onValueChange={setTab} className="w-full mt-6 flex flex-col">

							<TabsList className="flex h-10 w-full max-w-[1000px] self-center">
								<TabsTrigger className="flex-1 h-8" value="posts">Posts</TabsTrigger>
								<TabsTrigger className="flex-1 h-8" value="followers">Followers</TabsTrigger>
								<TabsTrigger className="flex-1 h-8" value="following">Following</TabsTrigger>
								<TabsTrigger className="flex-1 h-8" value="saved">Saved</TabsTrigger>
								{
									isOwnProfile &&
									<TabsTrigger className="flex-1 h-8 flex gap-1 items-center" value="liked"><LockClosedIcon className="size-4" /> Likes</TabsTrigger>
								}
							</TabsList>

							<ProfilePostsSection profileId={profile.id} refetchProfile={refetchProfile} />
							<ProfileFollowersSection isOwnProfile={isOwnProfile} profileId={profile.id} refetchProfile={refetchProfile} />
							<ProfileFollowingSection isOwnProfile={isOwnProfile} profileId={profile.id} refetchProfile={refetchProfile} />
							<ProfileSavedSection profileId={profile.id} refetchProfile={refetchProfile} />
							{
								isOwnProfile &&
								<ProfileLikedSection refetchProfile={refetchProfile} />
							}
						</Tabs>
					</>
			}
		</Main>
	)
}