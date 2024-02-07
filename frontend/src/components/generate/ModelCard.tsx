import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { IconCrown } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useCallback } from "react";

export default function ModelCard({ model, selected, setSelected, userIsPremium }: { model: Model, selected: string | null, setSelected: Dispatch<SetStateAction<string | null>>, userIsPremium: boolean }) {

	const isSelected = selected === model.id;

	const setModel = useCallback(() => {
		if (model.premium && !userIsPremium) { return; }
		setSelected(model.id);
	}, [model.id, model.premium, userIsPremium, setSelected]);

	return (
		<div className="flex flex-col gap-2 cursor-pointer" onClick={setModel}>
			<Card className="w-36 lg:w-48 aspect-[3/4] overflow-hidden relative">
				<CardContent className="relative h-full">

					<Image src={model.image} alt={model.name} fill={true} className={`object-cover transition-all hover:scale-105 ${model.premium && !userIsPremium && 'grayscale'}`} />
					{
						model.premium && !userIsPremium && <Badge variant={"default"} className="absolute bottom-1 right-1 flex gap-1 px-1 font-bold tracking-normal"><IconCrown size={20} />Premium</Badge>
					}
					{
						isSelected && <div className="absolute inset-0 rounded-xl box-content border-4 border-primary" />
					}
				</CardContent>

			</Card>
			<h3 className={`font-medium text-sm lg:text-base ${isSelected && 'text-primary'}`}>{model.name}</h3>
		</div>

	)
}