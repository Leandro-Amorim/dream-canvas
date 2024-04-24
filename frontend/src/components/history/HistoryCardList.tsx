import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { IconCircle, IconCircleCheckFilled, IconDots, IconDownload, IconPhotoEdit, IconPhotoPlus, IconTrash } from "@tabler/icons-react";
import { Dispatch, MouseEvent, SetStateAction, useCallback, useMemo, useState } from "react";
import { PhotoView } from "react-photo-view";
import { IImage } from "@/types/database";
import { useRouter } from "next/router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { downloadImage } from "@/lib/utils";
import { DateTime } from "luxon";
import { models } from "@/data/models";

export default function HistoryCardList({ image, selected, setSelected, onDelete }: { image: IImage, selected: string[], setSelected: Dispatch<SetStateAction<string[]>>, onDelete: (imageId?: string) => void }) {

	const router = useRouter();

	const [hover, setHover] = useState(false);

	const isSelected = useMemo(() => {
		return selected.includes(image.id);
	}, [selected, image.id]);

	const toggleSelected = useCallback((evt: MouseEvent<HTMLButtonElement>) => {
		evt.stopPropagation();
		if (isSelected) {
			setSelected(selected.filter((el) => { return el !== image.id }));
		}
		else {
			setSelected([...selected, image.id])
		}
	}, [isSelected, selected, setSelected, image.id]);


	return (
		<Card className="rounded-md p-0 border-0" onMouseEnter={() => { setHover(true) }} onMouseLeave={() => { setHover(false) }}>
			<CardContent className="p-3 flex gap-4">

				<PhotoView src={image.url}>
					<div className="self-center size-[150px] rounded-md overflow-hidden relative shrink-0">
						<Image src={image.url} fill={true} className={`object-cover transition-all ${(hover || isSelected) && 'scale-105'}`} alt={image.prompt.prompt} />

						<div className={`absolute transition-all ${isSelected ? 'opacity-100 bg-[rgba(124,58,237,0.5)]' : 'opacity-0'} hover:opacity-100 inset-0 `}>
							<Button className="absolute top-[6px] left-[6px] w-6 h-6 text-white" size={'icon'} variant={'link'} onClick={toggleSelected}>
								{
									isSelected ? <IconCircleCheckFilled size={22} /> : <IconCircle size={22} />
								}
							</Button>
						</div>
					</div>
				</PhotoView>

				<div className="grow flex flex-col gap-2">
					<div className="w-full flex justify-between shrink-0">

						<div className="flex flex-col grow">
							<h4 className="font-medium text-base line-clamp-1">{(models[image.prompt.model ?? ''])?.name ?? image.prompt.model}</h4>
							<h4 className="font-medium text-xs text-muted-foreground line-clamp-1">{DateTime.fromSQL(image.createdAt).toRelative({ locale: 'en' })}</h4>
						</div>

						<div className="flex gap-2 items-center shrink-0">
							<Button className="flex items-center pl-2 gap-1" variant={'default'}><IconPhotoPlus size={18} onClick={() => { router.push(`/posts/create?id=${image.id}`) }} />Create Post</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild><Button className="size-9" size={'icon'} variant={'outline'}> <IconDots size={18} /> </Button></DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem className="cursor-pointer flex items-center gap-1" onClick={() => { downloadImage(image.url) }}><IconDownload size={16} /> Download</DropdownMenuItem>
									<DropdownMenuItem className="cursor-pointer flex items-center gap-1" onClick={() => { router.push(`/generate?imageId=${image.id}`) }}><IconPhotoEdit size={16} /> Use prompt</DropdownMenuItem>
									<DropdownMenuItem className="!text-red-500 cursor-pointer flex items-center gap-1" onClick={() => { onDelete(image.id) }}><IconTrash size={16} /> Delete</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

					</div>
					<div className="w-full grow text-sm mt-1">
						{image.prompt.prompt}
					</div>
				</div>

			</CardContent>
		</Card>
	)
}