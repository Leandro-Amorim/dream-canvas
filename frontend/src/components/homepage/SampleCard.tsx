import { motion, useTransform, } from "framer-motion";
import Image from "next/image";
import { PhotoView } from "react-photo-view";

const width = 240;
const height = 350;

export default function SampleCard({ deg, diameter, image }: { deg: number, diameter: number, image: string }) {

	const xx = useTransform(() => {
		return Math.cos(deg * Math.PI / 180) * (diameter / 2) - width / 2
	})

	const yy = useTransform(() => {
		return Math.sin(deg * Math.PI / 180) * (diameter / 2) - height / 2
	})

	return (
		<motion.div style={{
			rotate: deg + 90,
			x: xx,
			y: yy,
			width,
			height
		}}
			whileHover={{ scale: 1.1 }}
			className="absolute card bg-secondary rounded-lg cursor-pointer overflow-hidden">
			<PhotoView src={image}>
				<Image src={image} fill={true} className="object-cover" alt="Sample Image" />
			</PhotoView>
		</motion.div>
	)
}
