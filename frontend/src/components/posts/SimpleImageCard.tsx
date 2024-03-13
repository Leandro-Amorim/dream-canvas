import Image from "next/image";
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";
import { IImage } from "@/types/database";
import { DateTime } from 'luxon';

export default function SimpleImageCard({ image, images, setImages }: { image: IImage, images: IImage[], setImages: Dispatch<SetStateAction<IImage[]>> }) {

	const [hover, setHover] = useState(false);

	const isSelected = useMemo(() => {
		return images.find((el) => { return el.id === image.id }) !== undefined;
	}, [images, image.id]);

	const toggleSelected = useCallback(() => {
		if (isSelected) {
			setImages(images.filter((el) => { return el.id !== image.id }));
		}
		else {
			setImages([...images, image])
		}
	}, [isSelected, images, setImages, image]);

	return (
		<div className="w-full flex flex-col select-none" onClick={toggleSelected}>
			<div className={`w-full relative rounded-md overflow-hidden bg-gray-900 cursor-pointer`} style={{ aspectRatio: `${image.width}/${image.height}` }}>

				<Image src={image.url} fill={true} alt={image.prompt.prompt} className={`object-cover transition-all ${(hover || isSelected) && 'scale-105'}`} />

				<div className={`absolute transition-all ${isSelected ? 'opacity-100 bg-[rgba(124,58,237,0.5)]' : 'opacity-0'} hover:opacity-100 inset-0 p-4 flex items-end bg-gradient-to-t from-[rgba(0,0,0,0.9)] from-5% via-transparent via-50%`}
					onMouseEnter={() => { setHover(true) }} onMouseLeave={() => { setHover(false) }}>
					<h3 className="font-medium text-white line-clamp-4 text-sm">{image.prompt.prompt}</h3>
				</div>

			</div>
			<div className="w-full flex items-center mt-2 justify-between">
				<div className="flex flex-col">
					<h4 className="font-medium text-sm line-clamp-1">{image.prompt.model}</h4>
					<h4 className="font-medium text-xs text-muted-foreground line-clamp-1">{DateTime.fromSQL(image.createdAt).toRelative({ locale: 'en' })}</h4>
				</div>
			</div>
		</div>
	)
}