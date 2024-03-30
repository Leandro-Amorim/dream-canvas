import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { TabsContent } from "../ui/tabs";
import InfiniteScroll from "react-infinite-scroller";
import { IconLoader2 } from "@tabler/icons-react";
import { useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchData } from "@/lib/utils";
import { APIResponse } from "@/pages/api/profiles/get-posts";
import ExploreCard from "../explore/ExploreCard";

export default function ProfileLikedSection({ refetchProfile }: { refetchProfile: () => void }) {

	const fetchPosts = useCallback(async ({ pageParam }: { pageParam?: { id: string, createdAt: string } }): Promise<APIResponse> => {
		return await fetchData('/api/profiles/get-liked-posts', {
			cursor: pageParam
		});
	}, []);

	const { isFetching, isFetchingNextPage, data, fetchNextPage, hasNextPage, refetch: refetchPosts } = useInfiniteQuery({
		queryKey: ['liked-posts'],
		queryFn: fetchPosts,
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

	const postsList = useMemo(() => {
		return data?.pages.flatMap((page) => {
			return (page.status === 'success' ? page.data : [])
		}) ?? []
	}, [data]);

	const refetch = useCallback(() => {
		refetchPosts();
		refetchProfile();
	}, [refetchPosts, refetchProfile])

	return (
		<TabsContent value="liked">
			<InfiniteScroll loadMore={() => { !isFetching && fetchNextPage() }} hasMore={hasNextPage} className="mt-6 w-full" loader={<div className="w-full flex justify-center" key={0}><IconLoader2 className="size-10 text-primary animate-spin mt-8 mb-2" /></div>}>
				{
					postsList.length === 0 && !isFetching &&
					<div className="w-full flex gap-1 items-center justify-center italic text-gray-400 text-lg" key={0}>
						{`You don't have any liked posts.`}
					</div>
				}
				<ResponsiveMasonry columnsCountBreakPoints={{ 0: 1, 600: 2, 800: 3, 1280: 4, 1536: 5 }}>
					<Masonry gutter={'20px'}>
						{
							postsList.map((post) => {
								return (<ExploreCard key={post.id} post={post} refetchFn={refetch} />)
							})
						}
					</Masonry>
				</ResponsiveMasonry>
				{
					isFetching && !isFetchingNextPage && postsList.length === 0 &&
					<div className="w-full flex justify-center" key={0}><IconLoader2 className="size-10 text-primary animate-spin mt-8 mb-2" /></div>
				}
			</InfiniteScroll>
		</TabsContent>
	)
}

