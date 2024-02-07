import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { IconCrown } from "@tabler/icons-react";
import { useSetRecoilState } from "recoil";
import { modifierModalState } from "@/lib/modalAtoms";

export default function ModifierCard({ modifier, selectedModifiers, userIsPremium }: { modifier: Modifier, selectedModifiers: { [key: string]: number }, userIsPremium: boolean }) {

	const setModal = useSetRecoilState(modifierModalState);

	let isSelected = selectedModifiers[modifier.id] !== undefined;
	isSelected = (modifier.premium && !userIsPremium ? false : isSelected);

	function openModal() {
		if (modifier.premium && !userIsPremium) { return; }

		const triggerWordsIndex: { [key: string]: boolean } = {};
		for (const word of modifier.triggerWords) {
			triggerWordsIndex[word] = false;
		}
		
		setModal({
			id: modifier.id,
			name: modifier.name,
			image: modifier.image,
			open: true,
			selected: isSelected,
			strength: selectedModifiers[modifier.id] ?? 1,
			triggerWords: triggerWordsIndex,
		})
	}

	return (
		<div className="flex flex-col gap-2 cursor-pointer" onClick={openModal}>
			<Card className="w-36 lg:w-48 aspect-[3/4] overflow-hidden">
				<CardContent className="relative h-full n">
					<Image src={modifier.image} alt={modifier.name} fill={true} className={`object-cover transition-all hover:scale-105  ${modifier.premium && !userIsPremium && 'grayscale'}`} />
					<Badge variant={"secondary"} className="absolute top-1 right-1 flex gap-1 px-1  font-bold tracking-normal">{modifier.type}</Badge>
					{
						modifier.premium && !userIsPremium && <Badge variant={"default"} className="absolute bottom-1 right-1 flex gap-1 px-1  font-bold tracking-normal"><IconCrown size={20} />Premium</Badge>
					}
					{
						isSelected && <div className="absolute inset-0 rounded-xl box-content border-4 border-primary" />
					}
				</CardContent>
			</Card>
			<h3 className={`font-medium text-sm lg:text-base${isSelected && 'text-primary'}`}>{modifier.name}</h3>
		</div>

	)
}