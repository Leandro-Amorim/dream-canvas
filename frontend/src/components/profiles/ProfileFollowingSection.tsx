import { TabsContent } from "../ui/tabs";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import FollowerCard from "./FollowerCard";
import { useCallback, useMemo } from "react";
import { APIResponse } from "@/pages/api/profiles/get-followers";
import { fetchData } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroller";
import { IconLoader2 } from "@tabler/icons-react";

export default function ProfileFollowingSection({ profileId, refetchProfile, isOwnProfile }: { profileId: string, refetchProfile: () => void, isOwnProfile: boolean }) {

	const fetchProfiles = useCallback(async ({ pageParam }: { pageParam?: { id: string, followedAt: string } }): Promise<APIResponse> => {
		return await fetchData('/api/profiles/get-following', {
			profileId,
			cursor: pageParam
		});
	}, [profileId]);

	const { isFetching, isFetchingNextPage, data, fetchNextPage, hasNextPage, refetch: refetchProfiles } = useInfiniteQuery({
		queryKey: ['following', profileId],
		queryFn: fetchProfiles,
		getNextPageParam: (lastPage) => {
			if (lastPage.status !== 'success' || lastPage.data.length == 0) { return undefined; }

			const lastItem = lastPage.data.at(-1);
			if (!lastItem) { return undefined; }

			return {
				id: lastItem.id,
				followedAt: lastItem.followedAt,
			}
		},
		initialPageParam: undefined,
	})

	const profilesList = useMemo(() => {
		return data?.pages.flatMap((page) => {
			return (page.status === 'success' ? page.data : [])
		}) ?? []
	}, [data]);

	const refetch = useCallback(() => {
		refetchProfiles();
		if (isOwnProfile) {
			refetchProfile();
		}

	}, [refetchProfiles, refetchProfile, isOwnProfile])

	return (
		<TabsContent value="following">

			<InfiniteScroll loadMore={() => { !isFetching && fetchNextPage() }} hasMore={hasNextPage} className="mt-6 w-full" loader={<div className="w-full flex justify-center" key={0}><IconLoader2 className="size-10 text-primary animate-spin mt-8 mb-2" /></div>}>
				{
					profilesList.length === 0 && !isFetching &&
					<div className="w-full flex gap-1 items-center justify-center italic text-gray-400 text-lg" key={0}>
						{`This user isn't following anyone.`}
					</div>
				}
				<ResponsiveMasonry columnsCountBreakPoints={{ 0: 1, 660: 2, 1000: 3, 1400: 4, 1650: 5 }}>
					<Masonry gutter={'20px'}>
						{
							profilesList.map((profile) => {
								return (
								<FollowerCard key={profile.id} profile={profile} refetchFn={refetch} />
								)
							})
						}
					</Masonry>
				</ResponsiveMasonry>
				{
					isFetching && !isFetchingNextPage && profilesList.length === 0 &&
					<div className="w-full flex justify-center" key={0}><IconLoader2 className="size-10 text-primary animate-spin mt-8 mb-2" /></div>
				}
			</InfiniteScroll>

		</TabsContent>
	)
}