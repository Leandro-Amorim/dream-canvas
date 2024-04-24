import Image from "next/image";
import { IconCircle, IconCircleCheckFilled, IconDots, IconDownload, IconPhotoEdit, IconPhotoPlus, IconTrash } from "@tabler/icons-react";
import { Dispatch, MouseEvent, SetStateAction, useCallback, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { IImage } from "@/types/database";
import { DateTime } from 'luxon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { downloadImage } from "@/lib/utils";
import { PhotoView } from 'react-photo-view';
import { useRouter } from "next/router";
import { models } from "@/data/models";

export default function HistoryCardGrid({ image, selected, setSelected, onDelete }: { image: IImage, selected: string[], setSelected: Dispatch<SetStateAction<string[]>>, onDelete: (imageId?: string) => void }) {

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
		<div className="w-full flex flex-col select-none">
			<PhotoView src={image.url}>
				<div className={`w-full relative rounded-md overflow-hidden bg-gray-900`} style={{ aspectRatio: `${image.width}/${image.height}` }}>

					<Image src={image.url} fill={true} alt={image.prompt.prompt} className={`object-cover transition-all ${(hover || isSelected) && 'scale-105'}`} />

					<div className={`absolute transition-all ${isSelected ? 'opacity-100 bg-[rgba(124,58,237,0.5)]' : 'opacity-0'} hover:opacity-100 inset-0 p-4 flex items-end bg-gradient-to-t from-[rgba(0,0,0,0.9)] from-5% via-transparent via-50%`}
						onMouseEnter={() => { setHover(true) }} onMouseLeave={() => { setHover(false) }}>
						<h3 className="font-medium text-white line-clamp-4 text-sm">{image.prompt.prompt}</h3>
						<Button className="absolute top-[6px] left-[6px] w-6 h-6 text-white" size={'icon'} variant={'link'} onClick={toggleSelected}>
							{
								isSelected ? <IconCircleCheckFilled size={22} /> : <IconCircle size={22} />
							}
						</Button>
					</div>

				</div>
			</PhotoView>

			<div className="w-full flex items-center mt-2 justify-between">
				<div className="flex flex-col">
					<h4 className="font-medium text-sm line-clamp-1">{(models[image.prompt.model ?? ''])?.name ?? image.prompt.model}</h4>
					<h4 className="font-medium text-xs text-muted-foreground line-clamp-1">{DateTime.fromSQL(image.createdAt).toRelative({ locale: 'en' })}</h4>
				</div>
				<div className="flex items-center gap-1">
					<Button className="size-8" size={'icon'} variant={'default'} onClick={() => { router.push(`/posts/create?id=${image.id}`) }}><IconPhotoPlus size={18} /></Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild><Button className="size-8" size={'icon'} variant={'outline'}> <IconDots size={20} /> </Button></DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem className="cursor-pointer flex items-center gap-1" onClick={() => { downloadImage(image.url) }}><IconDownload size={16} /> Download</DropdownMenuItem>
							<DropdownMenuItem className="cursor-pointer flex items-center gap-1" onClick={() => { router.push(`/generate?imageId=${image.id}`) }}><IconPhotoEdit size={16} /> Use prompt</DropdownMenuItem>
							<DropdownMenuItem className="!text-red-500 cursor-pointer flex items-center gap-1" onClick={() => { onDelete(image.id) }}><IconTrash size={16} /> Delete</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	)
}