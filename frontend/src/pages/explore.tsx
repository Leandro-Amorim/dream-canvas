import ExploreCard from "@/components/explore/ExploreCard";
import PostModal from "@/components/explore/PostModal";
import Main from "@/components/layout/Main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { IconFilter, IconLoader2, IconSearch } from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { APIResponse } from "./api/posts/get-posts";
import { fetchData } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import InfiniteScroll from "react-infinite-scroller";
import { useDebounce } from "@/lib/hooks";
import { modelArray } from "@/data/models";

export default function Explore() {

	const [search, setSearch] = useState('');
	const debouncedSearch = useDebounce(search, 500);
	const [mode, setMode] = useState('new' as 'new' | 'popular' | 'following');
	const [model, setModel] = useState('all');
	const [content, setContent] = useState('all' as 'all' | 'only_posts');
	const [timeframe, setTimeframe] = useState('all' as 'day' | 'week' | 'month' | 'year' | 'all');

	const fetchPosts = useCallback(async ({ pageParam }: { pageParam?: { id: string, likeCount: number, createdAt: string } }): Promise<APIResponse> => {
		return await fetchData('/api/posts/get-posts', {
			search,
			mode,
			model,
			content,
			timeframe,
			cursor: pageParam
		});
	}, [search, mode, model, content, timeframe]);

	const { isFetching, isFetchingNextPage, data, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery({
		queryKey: [debouncedSearch, mode, model, content, timeframe],
		queryFn: fetchPosts,
		getNextPageParam: (lastPage) => {
			if (lastPage.status !== 'success' || lastPage.data.length == 0) { return undefined; }

			const lastItem = lastPage.data.at(-1);
			if (!lastItem) { return undefined; }

			return {
				id: lastItem.id,
				likeCount: lastItem.likeCount,
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

	const [showFilter, setShowFilter] = useState(false);

	return (
		<Main>
			<PostModal />
			<div className="flex flex-col mt-8 lg:mt-16 items-center">

				<div className="w-full md:max-w-[600px] relative">
					<MagnifyingGlassIcon className={`w-6 h-6 absolute left-2 top-[25px] -translate-y-1/2`} />
					<Input placeholder="Search..." className="w-full pl-9 h-12 text-base shadow-sm" value={search} onChange={(evt) => { setSearch(evt.target.value) }} />
				</div>
				<div className="w-full h-10 mt-6 flex gap-2 justify-between">
					<Select value={mode} onValueChange={(value) => { setMode(value as 'new' | 'popular' | 'following') }}>
						<SelectTrigger className="grow md:w-[200px] md:grow-0">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="new">New</SelectItem>
							<SelectItem value="popular">Popular</SelectItem>
							<SelectItem value="following">Following</SelectItem>
						</SelectContent>
					</Select>
					<Button variant={'secondary'} className="flex items-center gap-1 px-3 w-full grow md:grow-0 md:w-auto" onClick={() => { setShowFilter(!showFilter) }}><IconFilter size={18} /> Filters</Button>
				</div>
				<div className={`w-full flex flex-wrap transition-all overflow-hidden ${showFilter ? 'h-[195px] md:h-[86px] mt-6' : 'h-0 mt-0'}`}>

					<div className="flex-1 flex flex-col gap-3 px-1 pb-1">
						<h3 className="font-medium ">Model</h3>
						<Select value={model} onValueChange={(value) => { setModel(value) }}>
							<SelectTrigger className="w-full h-12">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All models</SelectItem>
								{
									modelArray.map((model) => {
										return (<SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>)
									})
								}
							</SelectContent>
						</Select>
					</div>
					<div className="flex-1 flex flex-col gap-3 px-1 pb-1">
						<h3 className="font-medium ">Content type</h3>
						<Select value={content} onValueChange={(value) => { setContent(value as 'all' | 'only_posts') }}>
							<SelectTrigger className="w-full h-12">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Show posts and anonymous generations</SelectItem>
								<SelectItem value='only_posts'>Show only posts</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex-[100%] md:flex-1 mt-5 md:mt-0 flex flex-col gap-3 px-1 pb-1">
						<h3 className="font-medium ">Timeframe</h3>
						<Select value={timeframe} onValueChange={(value) => { setTimeframe(value as 'all' | 'day' | 'week' | 'month' | 'year') }}>
							<SelectTrigger className="w-full h-12">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="day">Last day</SelectItem>
								<SelectItem value="week">Last week</SelectItem>
								<SelectItem value="month">Last month</SelectItem>
								<SelectItem value="year">Last year</SelectItem>
								<SelectItem value="all">All time</SelectItem>
							</SelectContent>
						</Select>
					</div>

				</div>

				<InfiniteScroll loadMore={() => { !isFetching && fetchNextPage() }} hasMore={hasNextPage} className="mt-8 w-full" loader={<div className="w-full flex justify-center" key={0}><IconLoader2 className="size-10 text-primary animate-spin mt-8 mb-2" /></div>}>
					{
						postsList.length === 0 && !isFetching &&
						<div className="w-full flex gap-1 items-center justify-center italic text-gray-400 text-lg" key={0}>
							No results found for your search.
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
			</div>
		</Main>
	);
}