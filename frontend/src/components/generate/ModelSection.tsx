import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import ModelCard from "./ModelCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";

export default function ModelSection() {



	return (
		<div className="w-full mt-8 flex flex-col">

			<div className="flex justify-between">
				<div className="flex items-end">
					<h3 className="text-2xl font-semibold">Models</h3>
					<Button variant='link' className="ml-2 p-0 pb-[1px] h-fit">See All</Button>
				</div>
				<div className="relative">
					<MagnifyingGlassIcon className={`w-4 h-4 absolute left-2 top-[19px] -translate-y-1/2`} />
					<Input placeholder="Search for models" className="w-52 pl-7" />
				</div>
			</div>

			<div className="mt-6">
				<div className="w-full px-12">
					<Carousel opts={{ align: "start", }} className="w-full">
						<CarouselContent>
							{Array.from({ length: 20 }).map((_, index) => (
								<CarouselItem key={index} className="basis-[152px] lg:basis-[200px]">
									<ModelCard />
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</div>

			</div>

		</div>
	)
}