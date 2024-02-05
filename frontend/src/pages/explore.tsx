import ExploreCard from "@/components/explore/ExploreCard";
import PostModal from "@/components/explore/PostModal";
import Main from "@/components/layout/Main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { IconFilter } from "@tabler/icons-react";
import { useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"

export default function Explore() {

	const [showFilter, setShowFilter] = useState(false);

	return (
		<Main>
			<PostModal />
			<div className="flex flex-col mt-8 lg:mt-16 items-center">

				<div className="w-full md:max-w-[600px] relative">
					<MagnifyingGlassIcon className={`w-6 h-6 absolute left-2 top-[25px] -translate-y-1/2`} />
					<Input placeholder="Search..." className="w-full pl-9 h-12 text-base shadow-sm" />
				</div>

				<div className="w-full h-10 mt-6 flex gap-2 justify-between">
					<Select defaultValue='popular'>
						<SelectTrigger className="grow md:w-[120px] md:grow-0">
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
						<Select defaultValue='juggernaut_xl'>
							<SelectTrigger className="w-full h-12">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="juggernaut_xl">Juggernaut XL</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex-1 flex flex-col gap-3 px-1 pb-1">
						<h3 className="font-medium ">Content type</h3>
						<Select defaultValue='2'>
							<SelectTrigger className="w-full h-12">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">Show posts and anonymous generations</SelectItem>
								<SelectItem value="2">Show only posts</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex-[100%] md:flex-1 mt-5 md:mt-0 flex flex-col gap-3 px-1 pb-1">
						<h3 className="font-medium ">Timeframe</h3>
						<Select defaultValue='all_time'>
							<SelectTrigger className="w-full h-12">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all_time">All time</SelectItem>
							</SelectContent>
						</Select>
					</div>

				</div>
				<div className="mt-8 flex w-full">
					<ResponsiveMasonry className="w-full" columnsCountBreakPoints={{ 0: 1, 600: 2, 800: 3, 1280: 4, 1536: 5 }}>
						<Masonry gutter="20px">
							<ExploreCard />
							<ExploreCard />
							<ExploreCard />
							<ExploreCard />
							<ExploreCard />
						</Masonry>
					</ResponsiveMasonry>
				</div>
			</div>
		</Main>
	);
}