import HistoryCardGrid from "@/components/history/HistoryCardGrid";
import HistoryCardList from "@/components/history/HistoryCardList";
import Main from "@/components/layout/Main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { IconLayoutGrid, IconLayoutList, IconPhotoPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

export default function History() {

	const [mode, setMode] = useState('grid');

	return (
		<Main>
			<div className="w-full mt-6 flex flex-col-reverse gap-4 sm:flex-row justify-between">
				<div className="flex-1 flex justify-between sm:justify-start">
					<div className="flex items-end mr-2">
						<h3>99 selected</h3>
					</div>
					<div className="flex gap-1">
						<Button variant={'secondary'} className="h-10">Cancel</Button>
						<Button className="flex sm:hidden lg:flex items-center pl-2 gap-1 h-10" variant={'destructive'}><IconTrash size={18} /> Delete</Button>
						<Button className="flex sm:hidden lg:flex items-center pl-2 gap-1 h-10" variant={'default'}><IconPhotoPlus size={18} /> Create Post</Button>

						<Button className="hidden sm:flex lg:hidden items-center shrink-0 size-10" size={'icon'} variant={'destructive'}><IconTrash size={18} /></Button>
						<Button className="hidden sm:flex lg:hidden items-center shrink-0 size-10" size={'icon'} variant={'default'}><IconPhotoPlus size={18} /></Button>
					</div>
				</div>
				<div className="flex-1 flex gap-1 justify-end">
					<div className="sm:max-w-[290px] grow relative">
						<MagnifyingGlassIcon className={`w-5 h-5 absolute left-2 top-[21px] -translate-y-1/2`} />
						<Input placeholder="Search for prompts" className="w-full pl-8 h-10 text-sm shadow-sm" />
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
				mode === 'grid' ?
					<ResponsiveMasonry className="mt-6 w-full" columnsCountBreakPoints={{ 0: 1, 600: 2, 800: 3, 1280: 4, 1536: 5 }}>
						<Masonry gutter={'20px'}>
							<HistoryCardGrid />
							<HistoryCardGrid />
							<HistoryCardGrid />
							<HistoryCardGrid />
							<HistoryCardGrid />
						</Masonry>
					</ResponsiveMasonry>
					:
					<div className="mt-6 w-full flex flex-col gap-2">
						<HistoryCardList />
						<HistoryCardList />
						<HistoryCardList />
					</div>
			}


		</Main>
	)
}

/**
 * -Select
 * 
 * -Use settings
 * -Download
 * -Delete
 * -Post
 * 
 */