import PostContent from "@/components/explore/PostContent";
import Main from "@/components/layout/Main";
import { NextPageContext } from "next";
import { getServerSession } from "next-auth";
import { useRouter } from "next/router";
import { useCallback } from "react"
import { authOptions } from "../api/auth/[...nextauth]";
import { APIResponse, getPost } from "../api/posts/get-post";
import { IPost } from "@/types/database";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/lib/utils";

const LottieAnimation = dynamic(() => import('@/components/layout/LottieAnimation'), { ssr: false });
import sadRobot from "$/sad-robot.json";
import dynamic from "next/dynamic";

export default function PostPage({ originalPost }: { originalPost: IPost | null }) {

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
						<PostContent onCancel={onCancel} post={post} refetchPost={refetch} />
				}

			</div>
		</Main>
	)
}

export async function getServerSideProps(context: NextPageContext) {

	//@ts-ignore
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
}