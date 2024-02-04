import HistoryCardGrid from "@/components/history/HistoryCardGrid";
import HistoryCardList from "@/components/history/HistoryCardList";
import Main from "@/components/layout/Main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { IconLayoutGrid, IconLayoutList, IconPhotoPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import Masonry from "react-responsive-masonry";

export default function History() {

	const [mode, setMode] = useState('grid');

	return (
		<Main>
			<div className="w-full mt-6 flex justify-between">
				<div className="flex gap-1 items-end">
					<h3 className="mr-2">2 selected</h3>
					<Button variant={'secondary'}>Cancel</Button>
					<Button className="flex items-center pl-2 gap-1" variant={'destructive'}><IconTrash size={18} /> Delete</Button>
					<Button className="flex items-center pl-2 gap-1" variant={'default'}><IconPhotoPlus size={18} /> Create Post</Button>

				</div>

				<div className="flex gap-1">
					<div className="flex items-center w-[300px]">
						<MagnifyingGlassIcon className={`w-5 h-5 relative left-7 top-[10px] -translate-y-1/2`} />
						<Input placeholder="Search for prompts" className="w-full pl-8 h-10 text-sm shadow-sm" />
					</div>

					<Tabs defaultValue="prompt" value={mode} onValueChange={setMode}>
						<TabsList className="h-10">
							<TabsTrigger className="size-8" value="grid"><IconLayoutGrid size={18} className="shrink-0" /></TabsTrigger>
							<TabsTrigger className="size-8" value="list"><IconLayoutList size={18} className="shrink-0" /></TabsTrigger>
						</TabsList>
					</Tabs>
				</div>

			</div>

			{
				mode === 'grid' ?
					<Masonry className="mt-6 w-full" columnsCount={5} gutter={'16px'}>
						<HistoryCardGrid />
						<HistoryCardGrid />
						<HistoryCardGrid />
						<HistoryCardGrid />
						<HistoryCardGrid />
					</Masonry>
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