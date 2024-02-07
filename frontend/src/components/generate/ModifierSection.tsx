import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Input } from "../ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import ModifierCard from "./ModifierCard";
import { APIResponse } from "@/pages/api/data/get-modifiers";
import { fetchData } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Skeleton } from "../ui/skeleton";
import { useRecoilValue } from "recoil";
import { modifiersState } from "@/lib/atoms";

export default function ModifierSection() {

	const { data, isError, isLoading } = useQuery<APIResponse>({
		queryKey: ['modifiers'],
		queryFn: async () => {
			return fetchData('/api/data/get-modifiers');
		}
	});

	const session = useSession();
	const userIsPremium = useMemo(() => {
		return session.data?.user.premium ?? false;
	}, [session]);

	const selectedModifiers = useRecoilValue(modifiersState);

	const [search, setSearch] = useState('');

	const filteredModifiers = useMemo(() => {
		if (data?.status === 'success') {
			return data.data.filter((el) => { return el.name.toLowerCase().includes(search.toLowerCase()) })
		}
		return [];
	}, [data, search]);

	return (
		<div className="w-full mt-8 flex flex-col">

			<div className="flex justify-between">
				<div className="flex items-end">
					<h3 className="text-2xl font-semibold">Modifiers</h3>
				</div>
				<div className="relative">
					<MagnifyingGlassIcon className={`w-4 h-4 absolute left-2 top-[19px] -translate-y-1/2`} />
					<Input placeholder="Search for modifiers" className="w-52 pl-7" value={search} onChange={(e) => { setSearch(e.target.value) }} />
				</div>
			</div>

			<div className="mt-6">
				<div className="w-full px-12">
					<Carousel opts={{ align: "start", }} className="w-full">
						<CarouselContent>
							{
								isError || isLoading || data?.status == 'error' ?
									Array.from({ length: 5 }).map((_, index) => (
										<CarouselItem key={index} className="basis-[152px] lg:basis-[200px]">
											<Skeleton className="w-36 h-[220px] lg:w-48 lg:h-72 rounded-xl" />
										</CarouselItem>
									))
									:
									filteredModifiers.map((modifier) => {
										return (
											<CarouselItem key={`item_${modifier.id}`} className="basis-[152px] lg:basis-[200px]">
												<ModifierCard key={modifier.id} modifier={modifier} selectedModifiers={selectedModifiers} userIsPremium={userIsPremium} />
											</CarouselItem>
										)
									})
							}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</div>

			</div>

		</div>
	)
}