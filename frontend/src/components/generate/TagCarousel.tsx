import { Card, CardContent } from "../ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";

export default function TagCarousel() {
	return (
		<div className="w-full px-12">
			<Carousel opts={{ align: "start", }} className="w-full">
				<CarouselContent>
					{Array.from({ length: 20 }).map((_, index) => (
						<CarouselItem key={index} className="basis-32">
							<div className="p-1">
								<Card>
									<CardContent className="flex aspect-square items-center justify-center p-6">
										<span className="text-3xl font-semibold">{index + 1}</span>
									</CardContent>
								</Card>
							</div>
						</CarouselItem>
					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />
			</Carousel>
		</div>

	)
}