import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { IconLoader2 } from "@tabler/icons-react";

interface PriceCardProps {
	title: string,
	price: {
		amount: number,
		loading: boolean
	},
	features: string[],
	button: {
		exists: boolean,
		handler?: () => void,
		loading?: boolean
		enabled?: boolean
	}
}

export default function PriceCard({ data }: { data: PriceCardProps }) {

	const item = {
		hidden: { opacity: 0 },
		show: { opacity: 1 }
	}

	return (
		<motion.div whileHover={{ scale: 1.1, y: -10 }} variants={item} className="w-full">
			<Card className="w-full lg:h-full flex flex-col">
				<CardHeader>
					<CardTitle className="text-primary font-bold">{data.title}</CardTitle>
				</CardHeader>
				<CardContent className="grow flex flex-col">
					<div className="w-full flex items-center">
						{
							data.price?.loading ?
								<Skeleton className="w-full h-12" />
								:
								<div className="w-full">
									<h1 className="text-5xl font-bold inline-block">{data.price?.amount === 0 ? 'Free' : '$' + data.price?.amount}</h1>
									{
										data.price?.amount > 0 &&
										<h1 className="text-3xl font-bold inline-block text-muted-foreground">/Mo</h1>
									}
								</div>
						}
					</div>
					<h1 className="text-xl font-bold mt-8">Includes:</h1>
					<div className="flex flex-col mt-6 gap-3 mb-8">
						{
							data.features?.map((feature, index) => {
								return (
									<div key={index} className="w-full flex gap-2 items-center">
										<CheckCircledIcon className="size-6 text-muted-foreground shrink-0" />
										<span className="line-clamp-1 text-muted-foreground">{feature}</span>
									</div>
								)
							})
						}
					</div>
					{
						data.button?.exists &&
						<Button className="w-full mt-auto self-end flex items-center gap-2" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} size={'lg'} disabled={!data.button?.enabled || data.button?.loading} onClick={() => { data.button?.handler?.() }}>
							{
								data.button?.loading &&
								<IconLoader2 className="animate-spin size-5" />
							}
							Get Started
						</Button>
					}
				</CardContent>
			</Card>
		</motion.div>
	)
}


/**
 * 
 * 
 * 						{
							data.price?.amount === 0 ?
								<h1 className="text-5xl font-bold">Free</h1>
								:
								<>
									<h1 className="text-5xl font-bold inline-block">{data.price?.loading ? <Skeleton /> : data.price?.amount}</h1>
									{

									}
									<h1 className="text-5xl font-bold inline-block">{data.price?.loading ? <Skeleton /> : data.price?.amount}</h1>
								</>
						}
 */