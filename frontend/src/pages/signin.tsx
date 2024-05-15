import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { getProviders, signIn } from "next-auth/react"
import { toast } from "sonner"
import { useCallback, useState } from "react"
import { z } from "zod";
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { db } from "@/server/database/database"
import { images, postImages, postLikes, posts, users } from "@/server/database/schema"
import { desc, eq, sql } from "drizzle-orm"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"

const emailSchema = z.string().email();

interface PopularPost {
	id: string;
	title: string;
	imageUrl: string;
	authorName: string | null;
	likeCount: number;
}

export const getServerSideProps = (async (context) => {

	const session = await getServerSession(context.req, context.res, authOptions);

	if (session) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		}
	}

	const sq = db.$with('sq').as(
		db.select(
			{
				id: posts.id,
				title: posts.title,
				imageUrl: sql<string>`(SELECT i.url from ${images} i join ${postImages} pi on i.id = "pi"."imageId" where "pi"."postId" = ${posts.id} order by pi.order asc limit 1)`.as('imageUrl'),
				authorName: sql<string | null>`case when (${posts.orphan} = true OR ${posts.anonymous}) then NULL else ${users.name} end`.as('authorName'),
				likeCount: sql<number>`(SELECT count(*) from ${postLikes} where ${postLikes.postId} = ${posts.id})::integer`.as('likeCount'),
			}
		).from(posts).leftJoin(users, eq(posts.authorId, users.id)).where(eq(posts.orphan, false))
	);


	const popularPosts = await db.with(sq).select().from(sq)
		.limit(5)
		.orderBy(desc(sq.likeCount));

	return { props: { popularPosts } }

}) satisfies GetServerSideProps<{
	popularPosts: PopularPost[],
}>

export default function SignIn({ popularPosts }: InferGetServerSidePropsType<typeof getServerSideProps>) {

	const { data: providers, isSuccess } = useQuery({
		queryKey: ['providers'],
		queryFn: async () => {
			return getProviders();
		}
	})


	const icons = {
		'google': 'https://authjs.dev/img/providers/google.svg',
		'github': 'https://authjs.dev/img/providers/github-dark.svg',
	}

	const [email, setEmail] = useState('');

	const onSignIn = useCallback(async (provider: string) => {

		if (provider === 'email' && !emailSchema.safeParse(email).success) {
			toast.error('Please enter a valid email');
			return;
		}

		const data = await signIn(provider, { email: provider === 'email' ? email : undefined, redirect: false, callbackUrl: '/' });

		if (data?.error) {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			});
		}
		else if (provider === 'email') {
			toast.success('Check your email for a link to sign in.');
		}
	}, [email]);

	const [currentIndex, setCurrentIndex] = useState(popularPosts.length - 1);

	const processAnimation = useCallback((indexStr: string) => {

		let numberIndex = Number(indexStr);
		numberIndex = (numberIndex - 1);
		numberIndex = numberIndex < 0 ? popularPosts.length - 1 : numberIndex;

		setCurrentIndex(numberIndex);

	}, [popularPosts]);

	return (
		<div className="w-full min-h-screen lg:grid lg:grid-cols-12 overflow-hidden">
			<div className="flex items-center justify-center py-12 col-span-5 xl:col-span-4">
				<div className="grid w-full gap-6 ">
					<div className="flex flex-col gap-2 text-center items-center">
						<GitHubLogoIcon height={56} width={56} className="shrink-0 text-primary" />
						<h1 className="text-3xl font-bold">Welcome back!</h1>
						<p className="text-balance text-muted-foreground w-full">
							Please enter your details to sign in or create an account
						</p>
					</div>
					<div className="grid gap-4 mx-auto w-[350px]">

						<div className="w-full flex gap-2 mt-7">
							{
								(isSuccess && providers) ?
									Object.values(providers).map((provider) => {
										return (provider.type === 'oauth' &&
											<Button className="grow" variant={'outline'} size={'lg'} key={provider.id} onClick={() => onSignIn(provider.id)}>
												{/*@ts-ignore*/}
												<Image src={icons[provider.id] ?? `https://authjs.dev/img/providers/${provider.id}.svg`} alt={provider.name} width={24} height={24} />
											</Button>
										)
									}) :
									<Skeleton className="w-full h-10" />
							}
						</div>
						<div className="w-full flex gap-[6px] mt-4 items-center text-muted-foreground">
							<Separator className="grow w-0" />
							<span className="text-[13px] pb-[3px]">or</span>
							<Separator className="grow w-0" />
						</div>
						<div className="flex flex-col mt-4 w-full">
							<Input placeholder="E-mail address" type="email" className="h-10 w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
							<Button className="w-full mt-3" size={'lg'} onClick={() => onSignIn('email')}>Sign in with e-mail</Button>
						</div>
					</div>
				</div>
			</div>
			<div className="hidden bg-muted lg:block col-span-7 xl:col-span-8 relative overflow-hidden">
				{
					popularPosts && popularPosts.length > 0 &&
					<>
						<div className="absolute w-full h-full">
							<Image src={popularPosts[popularPosts.length - 1].imageUrl} fill={true} alt={popularPosts[popularPosts.length - 1].title ?? 'Post'} className="object-cover scale-110 blur-xl" />
							<Image src={popularPosts[popularPosts.length - 1].imageUrl} fill={true} alt={popularPosts[popularPosts.length - 1].title ?? 'Post'} className="object-contain" />
						</div>
						{
							popularPosts.map((post, idx) => {
								return (
									<div key={idx} data-animating={(idx === currentIndex ? 'true' : 'false')} data-index={idx.toString()} className="absolute w-full h-full data-[animating='true']:animate-login-image"
										onAnimationEnd={(e) => { processAnimation(e.currentTarget.getAttribute('data-index') as string) }}
										style={{ opacity: idx < currentIndex ? 1 : 0 }}>
										<Image src={post.imageUrl} fill={true} alt={post.title ?? post.id} className="object-cover scale-110 blur-xl" />
										<Image src={post.imageUrl} fill={true} alt={post.title ?? post.id} className="object-contain" />
									</div>
								)
							})
						}
						<div className="absolute left-0 bottom-0 p-4 z-10 bg-black/50 backdrop-blur-lg">
							<Link href={`/posts/${popularPosts[currentIndex]?.id}`} target="_blank">
								<h1 className="text-white font-bold text-2xl">{popularPosts[currentIndex]?.title ?? 'Untitled Post'}</h1>
								<p className="text-white text-lg">
									By {popularPosts[currentIndex]?.authorName ?? 'Anonymous user'}
								</p>
							</Link>

						</div>
					</>
				}
			</div>
		</div>
	)
}
