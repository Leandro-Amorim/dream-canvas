import PostContent from "@/components/explore/PostContent";
import Main from "@/components/layout/Main";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react"
import { authOptions } from "../api/auth/[...nextauth]";
import { APIResponse, getPost } from "../api/posts/get-post";
import { IPost } from "@/types/database";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/lib/utils";

const LottieAnimation = dynamic(() => import('@/components/layout/LottieAnimation'), { ssr: false });
import sadRobot from "$/sad-robot.json";
import dynamic from "next/dynamic";
import Head from "next/head";

export default function PostPage({ originalPost }: InferGetServerSidePropsType<typeof getServerSideProps>) {

	const router = useRouter();

	const onCancel = useCallback(() => {
		router.push('/');
	}, [router]);

	const { data, refetch } = useQuery<APIResponse>({
		queryKey: [originalPost?.id],
		queryFn: async () => {
			return fetchData('/api/posts/get-post', { postId: originalPost?.id });
		},
		enabled: originalPost !== null,
		initialData: {
			status: 'success',
			data: {
				post: originalPost
			}
		}
	});

	const post = data?.status === 'success' && data.data.post ? data.data.post : null;

	const { postName, postDescription, authorName } = useMemo(() => {
		return {
			postName: post?.title || 'Untitled Post',
			postDescription: post?.description || 'No description provided.',
			authorName: (post?.anonymous || post?.orphan) ? 'Anonymous User' : post?.author?.name || 'Anonymous User',
		}
	}, [post]);

	return (
		<Main>
			<div className="w-full mt-6">
				{
					post === null ?
						<div className="w-full mt-6 flex flex-col md:flex-row justify-center items-center">
							<LottieAnimation animationData={sadRobot} loop={true} className="shrink-0 mt-10 size-80 scale-150 md:translate-x-[10px] pointer-events-none " />
							<div className="ml-2 flex flex-col gap-6 justify-center z-10 break-words max-w-[600px]">
								<span className="text-6xl font-bold">Oh no!</span>
								<span className="text-xl text-muted-foreground">{`The post you're looking for seems to have been moved or doesn't exist on the server.`}</span>
							</div>
						</div>
						:
						<>
							<Head>
								<title key="title">{`${postName} by ${authorName} — Dream Canvas`}</title>
								<meta key={'meta-title'} name="title" content={`${postName} by ${authorName} — Dream Canvas`} />
								<meta key={'meta-description'} name="description" content={postDescription} />

								<meta key={'og-url'} name="og:url" property="og:url" content={`${process.env.NEXT_PUBLIC_URL}/posts/${post.id}`} />
								<meta key={'og-type'} name="og:type" property="og:type" content="website" />
								<meta key={'og-title'} name="og:title" property="og:title" content={`${postName} by ${authorName} — Dream Canvas`} />
								<meta key={'og-description'} name="og:description" property="og:description" content={postDescription} />
								<meta key={'og-image'} name="og:image" property="og:image" content={post.images?.[0]?.url ?? ''} />

								<meta key={'twitter-card'} name="twitter:card" property="twitter:card" content="summary_large_image" />
								<meta key={'twitter-url'} name="twitter:url" property="twitter:url" content={`${process.env.NEXT_PUBLIC_URL}/posts/${post.id}`} />
								<meta key={'twitter-title'} name="twitter:title" property="twitter:title" content={`${postName} by ${authorName} — Dream Canvas`} />
								<meta key={'twitter-description'} name="twitter:description" property="twitter:description" content={postDescription} />
								<meta key={'twitter-image'} name="twitter:image" property="twitter:image" content={post.images?.[0]?.url ?? ''} />
							</Head>
							<PostContent onCancel={onCancel} post={post} refetchPost={refetch} />
						</>

				}

			</div>
		</Main>
	)
}

export const getServerSideProps = (async function (context) {

	const session = await getServerSession(context.req, context.res, authOptions);
	const userId = session?.user.id ?? '';
	const postId = context.query.id;
	if (!postId) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		}
	}

	const post = await getPost(postId as string, userId);

	return {
		props: {
			originalPost: post,
		},
	}
}) satisfies GetServerSideProps<{ originalPost: IPost | null }>