import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Input } from "../ui/input";
import ModelCard from "./ModelCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { Skeleton } from "../ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { APIResponse } from "@/pages/api/data/get-models";
import { fetchData } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { modelState, modelTypeState } from "@/lib/atoms";

export default function ModelSection() {

	const { data, isError, isLoading } = useQuery<APIResponse>({
		queryKey: ['models'],
		queryFn: async () => {
			return fetchData('/api/data/get-models');
		}
	});

	const session = useSession();
	const userIsPremium = useMemo(() => {
		return session.data?.user.premium ?? false;
	}, [session]);

	const [selected, setSelected] = useRecoilState(modelState);
	const setType = useSetRecoilState(modelTypeState);

	useEffect(() => {
		if (selected === null && data?.status == 'success' && data.data) {
			const model = data.data.find((el) => !el.premium);
			setSelected(model?.id ?? null);
			setType(model?.type ?? null);
		}
	}, [selected, data, setSelected, setType]);

	const [search, setSearch] = useState('');

	const filteredModels = useMemo(() => {
		if (data?.status === 'success') {
			return data.data.filter((el) => { return el.name.toLowerCase().includes(search.toLowerCase()) })
		}
		return [];
	}, [data, search]);

	return (
		<div className="w-full mt-8 flex flex-col">

			<div className="flex justify-between">
				<div className="flex items-end">
					<h3 className="text-2xl font-semibold">Models</h3>
				</div>
				<div className="relative">
					<MagnifyingGlassIcon className={`w-4 h-4 absolute left-2 top-[19px] -translate-y-1/2`} />
					<Input placeholder="Search for models" className="w-52 pl-7" value={search} onChange={(e) => { setSearch(e.target.value) }} />
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
									filteredModels.map((model) => {
										return (
											<CarouselItem key={`item_${model.id}`} className="basis-[152px] lg:basis-[200px]">
												<ModelCard key={model.id} model={model} selected={selected} setSelected={setSelected} setType={setType} userIsPremium={userIsPremium} />
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