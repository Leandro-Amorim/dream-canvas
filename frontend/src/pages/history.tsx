import HistoryCardGrid from "@/components/history/HistoryCardGrid";
import HistoryCardList from "@/components/history/HistoryCardList";
import Main from "@/components/layout/Main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { IconLayoutGrid, IconLayoutList, IconLoader2, IconPhotoPlus, IconTrash } from "@tabler/icons-react";
import { NextPageContext } from "next";
import { getServerSession } from "next-auth";
import { useCallback, useMemo, useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { fetchData } from "@/lib/utils";
import { imagesCursor } from "@/server/database/cursors";
import { APIResponse } from "./api/images/get-images";
import InfiniteScroll from 'react-infinite-scroller';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { useDebounce } from "@/lib/hooks";
import { PhotoProvider } from "react-photo-view";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { APIResponse as DeleteAPIResponse } from "./api/images/delete";
import { useRouter } from "next/router";

export async function getServerSideProps(context: NextPageContext) {

	//@ts-ignore
	const session = await getServerSession(context.req, context.res, authOptions);

	if (session?.user === undefined) {
		return {
			redirect: {
				destination: '/api/auth/signin',
				permanent: false,
			},
		}
	}

	return {
		props: {},
	}
}

export default function History() {

	const router = useRouter();

	async function fetchImages({ pageParam }: { pageParam?: string }): Promise<APIResponse> {
		return await fetchData('/api/images/get-images', { cursor: pageParam });
	}

	const { isFetching, isFetchingNextPage, data, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery({
		queryKey: ['images'],
		queryFn: fetchImages,
		//@ts-expect-error
		getNextPageParam: (lastPage) => (lastPage.status === 'success' && lastPage.data.length > 0) ? imagesCursor.serialize(lastPage.data.at(-1)) : undefined,
		initialPageParam: undefined,
	});

	const [mode, setMode] = useState('grid');
	const [selected, setSelected] = useState<string[]>([]);

	const [search, setSearch] = useState('');
	const debouncedSearch = useDebounce(search, 500);

	const [modalOpen, setModalOpen] = useState(false);
	const [toDelete, setToDelete] = useState<string[]>([]);

	const openDeleteModal = useCallback((imageId?: string) => {
		setModalOpen(true);
		imageId ? setToDelete([imageId]) : setToDelete([...selected]);
	}, [selected]);

	const closeDeleteModal = useCallback((success: boolean) => {
		if (success) {
			setSelected([]);
			refetch();
		}
		setToDelete([]);
		setModalOpen(false);
	}, [refetch]);

	const imageList = useMemo(() => {
		return data?.pages.flatMap((page) => {
			return (page.status === 'success' ? page.data : [])
		}).filter((image) => {
			return image.prompt.prompt.toLowerCase().includes(debouncedSearch.toLowerCase());
		}) ?? []
	}, [data, debouncedSearch]);

	return (
		<Main>
			<DeleteImagesModal open={modalOpen} onClose={closeDeleteModal} toDelete={toDelete} />
			<div className="w-full mt-6 flex flex-col-reverse gap-4 sm:flex-row justify-between">
				{
					selected.length > 0 &&
					<div className="flex-1 flex justify-between sm:justify-start">
						<div className="flex items-end mr-2">
							<h3>{selected.length} selected</h3>
						</div>
						<div className="flex gap-1">
							<Button variant={'secondary'} className="h-10" onClick={() => { setSelected([]) }}>Cancel</Button>
							<Button className="flex sm:hidden lg:flex items-center pl-2 gap-1 h-10" variant={'destructive'} onClick={() => { openDeleteModal() }}><IconTrash size={18} />Delete</Button>
							<Button className="flex sm:hidden lg:flex items-center pl-2 gap-1 h-10" variant={'default'}
								onClick={() => { router.push(`/posts/create?id=${selected.join('&id=')}`) }}>
								<IconPhotoPlus size={18} />
								Create Post
							</Button>

							<Button className="hidden sm:flex lg:hidden items-center shrink-0 size-10" size={'icon'} variant={'destructive'}><IconTrash size={18} /></Button>
							<Button className="hidden sm:flex lg:hidden items-center shrink-0 size-10" size={'icon'} variant={'default'}><IconPhotoPlus size={18} /></Button>
						</div>
					</div>
				}

				<div className="flex-1 flex gap-1 justify-end">
					<div className="sm:max-w-[290px] grow relative">
						<MagnifyingGlassIcon className={`w-5 h-5 absolute left-2 top-[21px] -translate-y-1/2`} />
						<Input placeholder="Search for prompts" className="w-full pl-8 h-10 text-sm shadow-sm" value={search} onChange={(ev) => { setSearch(ev.target.value) }} />
					</div>

					<Tabs value={mode} onValueChange={setMode}>
						<TabsList className="h-10 shrink-0">
							<TabsTrigger className="size-8" value="grid"><IconLayoutGrid size={18} className="shrink-0" /></TabsTrigger>
							<TabsTrigger className="size-8" value="list"><IconLayoutList size={18} className="shrink-0" /></TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{
				<InfiniteScroll loadMore={() => { !isFetching && fetchNextPage() }} hasMore={hasNextPage} className="mt-6 w-full" loader={<div className="w-full flex justify-center" key={0}><IconLoader2 className="size-10 text-primary animate-spin mt-8 mb-2" /></div>}>
					{
						mode === 'grid' ?
							<PhotoProvider maskOpacity={0.97} speed={() => 300} easing={() => 'cubic-bezier(0.215, 0.61, 0.355, 1)'}>
								<ResponsiveMasonry columnsCountBreakPoints={{ 0: 1, 600: 2, 800: 3, 1280: 4, 1536: 5 }}>
									<Masonry gutter={'20px'}>

										{
											imageList.map((image) => {
												return (<HistoryCardGrid key={image.id} image={image} selected={selected} setSelected={setSelected} onDelete={openDeleteModal} />)
											})
										}

									</Masonry>
								</ResponsiveMasonry>
							</PhotoProvider>
							:
							<PhotoProvider maskOpacity={0.97} speed={() => 300} easing={() => 'cubic-bezier(0.215, 0.61, 0.355, 1)'}>
								<div className="flex flex-col gap-4">
									{
										imageList.map((image) => {
											return (<HistoryCardList key={image.id} image={image} selected={selected} setSelected={setSelected} onDelete={openDeleteModal} />)
										})
									}
								</div>
							</PhotoProvider>
					}
					{
						isFetching && !isFetchingNextPage && imageList.length === 0 &&
						<div className="w-full flex justify-center" key={0}><IconLoader2 className="size-10 text-primary animate-spin mt-8 mb-2" /></div>
					}
				</InfiniteScroll>
			}


		</Main>
	)
}

function DeleteImagesModal({ open, onClose, toDelete }: { open: boolean, onClose: (success: boolean) => void, toDelete: string[] }) {

	const mutation = useMutation({
		mutationFn: (imageIds: string[]): Promise<DeleteAPIResponse> => {
			return fetchData('/api/images/delete', { imageIds });
		},
		onSettled(data) {
			onClose(data?.status === 'success');
		},
	})

	return (
		<Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(false) } }}>
			<DialogContent className="w-full max-w-[600px] rounded-lg gap-0 pb-6">
				<DialogHeader>
					<DialogTitle><h3 className="font-medium text-lg line-clamp-1 mb-2">Delete image(s)</h3></DialogTitle>
				</DialogHeader>

				<h3 className="text-sm">Are you sure you want to delete the selected image(s)?</h3>

				<DialogFooter className="mt-4 gap-2 sm:gap-0">
					<Button variant={'outline'} onClick={() => { onClose(false) }}>Cancel</Button>
					<Button className="flex items-center gap-1" disabled={mutation.isPending} variant={'destructive'} onClick={() => { mutation.mutateAsync(toDelete) }}>
						{mutation.isPending && <IconLoader2 className="mr-[2px] size-5 animate-spin" />}
						Delete
					</Button>
				</DialogFooter>

			</DialogContent>
		</Dialog>
	)
}