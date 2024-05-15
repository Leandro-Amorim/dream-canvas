import Main from "@/components/layout/Main";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconCrown, IconCrownOff, IconLoader2, IconPhotoPlus, IconUser, IconX } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useSession } from "next-auth/react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { APIResponse as CheckoutAPIResponse } from "./api/payments/create-checkout-session";
import { APIResponse as BlocklistAPIResponse } from "./api/users/blocklist";
import { fetchData, fetchDataForm } from "@/lib/utils";
import { toast } from "sonner";
import InfiniteScroll from "react-infinite-scroller";
import { IBlock } from "@/types/database";
import { useSetRecoilState } from "recoil";
import { unblockUserModalState } from "@/lib/atoms";
import ClearHiddenBlocklistModal from "@/components/layout/modals/ClearHiddenBlocklistModal";
import { db } from "@/server/database/database";
import { users } from "@/server/database/schema";
import { eq } from "drizzle-orm";
import { ZodError, z } from 'zod';

export const getServerSideProps = (async function (context) {

	const session = await getServerSession(context.req, context.res, authOptions);

	if (session?.user === undefined) {
		return {
			redirect: {
				destination: '/api/auth/signin',
				permanent: false,
			},
		}
	}

	const profile = await db.query.users.findFirst({
		columns: {
			id: true,
			image: true,
			coverImage: true,
			name: true,
			description: true,
		},
		where: eq(users.id, session.user.id),
	});

	return {
		props: { profile },
	}
}) satisfies GetServerSideProps<{
	profile: {
		id: string;
		name: string;
		description: string;
		image: string;
		coverImage: string;
	} | undefined
}>;

type tabType = 'profile' | 'billing' | 'blocklist';

const options = {
	profile: 'Profile',
	billing: 'Billing',
	blocklist: 'Blocklist',
}

export default function Settings({ profile }: InferGetServerSidePropsType<typeof getServerSideProps>) {

	const router = useRouter();
	const [active, setActive] = useState('profile' as tabType);

	useEffect(() => {
		if (router.asPath?.includes('/settings#')) {
			const key = router.asPath.split('#')[1] as tabType;
			setActive(options[key] ? key : 'profile');
		}
	}, [router.asPath]);

	const session = useSession();
	const userIsPremium = session.data?.user.premium ?? false;

	/***PROFILE SECTION */

	const [form, setForm] = useState({
		image: undefined as undefined | null | File,
		coverImage: undefined as undefined | null | File,
		name: undefined as undefined | string,
		description: undefined as undefined | string,
	});

	const formChanged = useMemo(() => {
		for (const key in form) {
			//@ts-ignore
			if (form[key] !== undefined) {
				return true;
			}
		}
		return false;
	}, [form]);

	const imageInputRef = useRef<HTMLInputElement>(null);
	const coverImageInputRef = useRef<HTMLInputElement>(null);

	const imageUrl = useMemo(() => {
		if (form.image === null) { return undefined; }
		return form.image !== undefined ? URL.createObjectURL(form.image) : profile?.image;
	}, [form.image, profile]);

	const coverImageUrl = useMemo(() => {
		if (form.coverImage === null) { return undefined; }
		return form.coverImage !== undefined ? URL.createObjectURL(form.coverImage) : profile?.coverImage;
	}, [form.coverImage, profile]);

	const nameLength = useMemo(() => {
		return (form.name ?? profile?.name ?? '').length;
	}, [form.name, profile?.name]);

	const descriptionLength = useMemo(() => {
		return (form.description ?? profile?.description ?? '').length;
	}, [form.description, profile?.description]);

	const validateForm = useCallback(() => {

		const imageSchema = z.custom<File>(file => file instanceof File, 'The selected file is not a valid image.')
			.refine(
				file => ['image/jpg', 'image/jpeg', 'image/png'].includes(file?.type),
				'The selected file is not a valid image.'
			)
			.refine(file => file?.size <= 2 * 1024 * 1024, "The image size must be less than 2MB.").optional().nullable();

		const schema = z.object({
			name: z.string().min(3, 'Name must contain at least 3 characters.').max(32, 'Name must contain at most 32 characters.').optional(),
			description: z.string().max(150, 'Description must contain at most 150 characters.').optional(),
			image: imageSchema,
			coverImage: imageSchema,
		});
		try {
			schema.parse(form);
			return true;
		}
		catch (error) {
			if (error instanceof ZodError) {
				for (const err of error.issues) {
					toast.error(err.message);
				}
			}
			return false;
		}
	}, [form]);

	const { mutate: profileMutation, isPending: profilePending } = useMutation({
		mutationFn: async () => {
			return fetchDataForm('/api/profiles/update', form);
		},
		onError() {
			toast.error('There was an error updating your profile', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			toast.success('Profile updated successfully', {
				description: 'Your profile has been updated successfully.'
			})
		}
	})

	const onSubmit = useCallback(() => {
		const valid = validateForm();
		if (valid) {
			profileMutation();
		}
	}, [validateForm, profileMutation])

	/***BILLING SECTION */

	const { mutate: portalMutation, isPending: portalPending } = useMutation<CheckoutAPIResponse>({
		mutationFn: async () => {
			return fetchData('/api/payments/create-portal-session', {});
		},
		onError() {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			const url = data.status === 'success' ? data.data.url : '';
			router.push(url);
		}
	})

	/***BLOCKLIST SECTION */

	const { isFetching, isFetchingNextPage, data, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery({
		queryKey: ['blocklist'],
		queryFn: async ({ pageParam }: { pageParam?: { id: string, blockedAt: string } }): Promise<BlocklistAPIResponse> => {
			return await fetchData('/api/users/blocklist', {
				cursor: pageParam
			});
		},
		getNextPageParam: (lastPage) => {
			if (lastPage.status !== 'success' || lastPage.data.length == 0) { return undefined; }

			const lastItem = lastPage.data.at(-1);
			if (!lastItem) { return undefined; }

			return {
				id: lastItem.id,
				blockedAt: lastItem.blockedAt
			}
		},
		initialPageParam: undefined,
	})

	const blockList = useMemo(() => {
		return data?.pages.flatMap((page) => {
			return (page.status === 'success' ? page.data : [])
		}) ?? []
	}, [data]);

	const [modalOpen, setModalOpen] = useState(false);

	return (
		<Main>
			<ClearHiddenBlocklistModal open={modalOpen} setOpen={setModalOpen} />
			<div className="flex flex-col gap-6 md:gap-10 py-4">
				<div className="mx-auto w-full max-w-6xl">
					<h1 className="text-4xl font-semibold">Settings</h1>
				</div>
				<div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr] relative">
					<nav className="grid gap-4 text-sm text-muted-foreground md:sticky md:top-2">
						{
							Object.entries(options).map(([key, value]) => (
								<Link
									key={key}
									href={`#${key}`}
									className={`${active === key ? 'font-semibold text-primary' : ''}`}
								>
									{value}
								</Link>
							))
						}
					</nav>
					<div className="grid gap-6">
						{
							active === 'profile' && (
								<Card className="overflow-hidden">
									<input ref={imageInputRef} type="file" hidden name="image" accept="image/*" onChange={(e) => { setForm({ ...form, image: e.target.files?.[0] }) }} />
									<input ref={coverImageInputRef} type="file" hidden name="coverImage" accept="image/*" onChange={(e) => { setForm({ ...form, coverImage: e.target.files?.[0] }) }} />
									<CardContent className="p-0">
										<div className="w-full flex flex-col items-center overflow-hidden relative pb-4">
											<div className="w-full h-[180px] absolute bg-secondary/90">
												{
													coverImageUrl && <Image src={coverImageUrl} alt="Cover image" fill={true} className="object-cover" />
												}
												<div className="absolute right-1 top-1 flex gap-1">
													<Button variant="default" size="icon" className="size-7"
														onClick={() => { coverImageInputRef.current?.click() }}
													><IconPhotoPlus size={16} /></Button>
													<Button variant="destructive" size="icon" className="size-7"
														onClick={() => { setForm({ ...form, coverImage: null }) }}
													><IconX size={16} /></Button>
												</div>
											</div>
											<div className="w-full max-w-[600px] mt-20 shrink-0 flex z-[1]">
												<div className="flex-1 px-2 flex flex-col items-center min-w-[190px] text-center">
													<Avatar className="size-[150px] shrink-0 border shadow-md">
														<AvatarImage className="object-cover" src={imageUrl} alt={'User'} />
														<AvatarFallback><IconUser size={80} className="text-gray-600" /></AvatarFallback>
													</Avatar>
													<div className="size-[150px] absolute">
														<Button variant="default" size="icon" className="rounded-full absolute top-2 right-2 size-7"
															onClick={() => { imageInputRef.current?.click() }}
														><IconPhotoPlus size={16} /></Button>
														<Button variant="destructive" size="icon" className="rounded-full absolute top-10 -right-2 size-7"
															onClick={() => { setForm({ ...form, image: null }) }}
														><IconX size={16} /></Button>
													</div>
												</div>
											</div>
										</div>
										<div className="w-full px-4 pb-6 flex flex-col gap-4">
											<div>
												<Label htmlFor="name">Display name</Label>
												<Input maxLength={32} className="mt-2" id="name" placeholder="Insert a display name..."
													value={form.name ?? profile?.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
												<span className={`text-xs ${nameLength > 32 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>{nameLength}/32</span>
											</div>
											<div>
												<Label htmlFor="name">Description</Label>
												<Textarea maxLength={150} className="mt-2 h-40 resize-none" placeholder="Insert a description..."
													value={form.description ?? profile?.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
												<span className={`text-xs ${descriptionLength > 150 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>{descriptionLength}/150</span>
											</div>

										</div>
									</CardContent>
									<CardFooter className="border-t px-6 py-4 flex justify-end">
										<Button size={'lg'} disabled={!formChanged || profilePending} className="flex items-center gap-2" onClick={() => { onSubmit() }}>
											{
												profilePending && <IconLoader2 className="animate-spin size-5" />
											}
											Save</Button>
									</CardFooter>
								</Card>
							)
						}
						{
							active === 'billing' && (
								<Card>
									<CardHeader>
										<CardTitle>Subscription Status</CardTitle>
										<CardDescription>
											View and change the status of your current premium subscription.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="flex justify-between items-center">
											<div className="flex items-center gap-3 grow">
												<Badge variant={userIsPremium ? 'default' : 'outline'} className="rounded-full size-16 flex items-center justify-center shrink-0">
													{
														userIsPremium ? <IconCrown size={36} /> : <IconCrownOff size={36} />
													}
												</Badge>
												<div className="flex flex-col">
													<span className="text-xl font-semibold line-clamp-1">{userIsPremium ? 'Premium' : 'Free'}</span>
													<CardDescription className="line-clamp-1">
														{
															userIsPremium ? 'You are currently on the premium plan.' : 'You are currently on the free plan.'
														}
													</CardDescription>
												</div>
											</div>
											<Button size={'lg'} disabled={portalPending} variant={"default"} className="gap-1 px-3 flex items-center" onClick={() => { userIsPremium ? portalMutation() : router.push('/#pricing') }}>
												{
													portalPending && <IconLoader2 className="mr-[2px] size-5 animate-spin" />
												}
												{
													userIsPremium ? 'Manage Subscription' : 'Go Premium'
												}
												<ArrowRightIcon className="size-5" /></Button>

										</div>
									</CardContent>
								</Card>
							)
						}
						{
							active === 'blocklist' && (
								<div className="grid gap-6">
									<Card>
										<CardHeader>
											<CardTitle>Hidden blocklist</CardTitle>
											<CardDescription>
												{`Anonymous users who have been blocked by you. You can't see them, just clear the list.`}
											</CardDescription>
										</CardHeader>
										<CardContent>
											<Button size={'lg'} variant={"destructive"} className="px-4" onClick={() => { setModalOpen(true) }} >Clear list</Button>
										</CardContent>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle>Blocklist</CardTitle>
											<CardDescription>
												{`Users who have been blocked by you.`}
											</CardDescription>
										</CardHeader>
										<CardContent>
											<InfiniteScroll loadMore={() => { !isFetching && fetchNextPage() }} hasMore={hasNextPage} loader={<div className="w-full flex justify-center" key={0}><IconLoader2 className="size-10 text-primary animate-spin mt-4 mb-2" /></div>}>
												{
													blockList.length === 0 && !isFetching &&
													<div className="w-full flex gap-1 items-center justify-center italic text-gray-400 text-base" key={0}>
														{`You don't have any blocked users.`}
													</div>
												}
												<div className="w-full flex flex-col gap-3">
													{
														blockList.map((block) => {
															return (<BlockedUser key={block.id} blockedUser={block} refetch={refetch} />)
														})
													}
												</div>
												{
													isFetching && !isFetchingNextPage && blockList.length === 0 &&
													<div className="w-full flex justify-center" key={0}><IconLoader2 className="size-10 text-primary animate-spin mt-4 mb-2" /></div>
												}
											</InfiniteScroll>
										</CardContent>
									</Card>
								</div>
							)
						}
					</div>
				</div>
			</div>

		</Main>
	)
}

function BlockedUser({ blockedUser, refetch }: { blockedUser: IBlock, refetch: () => void }) {

	const setModal = useSetRecoilState(unblockUserModalState);

	const onUnblock = () => {
		setModal((prev) => {
			return {
				...prev,
				open: true,
				blockedId: blockedUser.id,
				blockedName: blockedUser.name,
				onSuccess: () => { refetch?.(); }
			}
		})
	}

	return (
		<div className="w-full flex justify-between items-center">
			<div className="flex gap-2 items-center">
				<Avatar className="size-[60px] shrink-0">
					<AvatarImage className="object-cover" src={blockedUser.image ?? ''} alt={blockedUser.name ?? 'User'} />
					<AvatarFallback><IconUser size={36} className="text-gray-600" /></AvatarFallback>
				</Avatar>

				<div className="flex flex-col gap-[2px]">
					<CardDescription className="font-semibold text-card-foreground line-clamp-1">{blockedUser.name || 'User'}</CardDescription>
					<CardDescription className="line-clamp-1">{blockedUser.description}</CardDescription>
				</div>
			</div>
			<Button variant={"destructive"} onClick={onUnblock}>Unblock</Button>
		</div>
	)
}