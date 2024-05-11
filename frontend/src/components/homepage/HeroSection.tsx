import Image from "next/image";
import hero from '../../../public/hero.png'
import { Variants, motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function HeroSection() {


	/**HERO SECTION ANIMATIONS */

	const textContainer: Variants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.3
			}
		}
	}

	const upperText: Variants = {
		hidden: { opacity: 0 },
		show: { opacity: 1 }
	}

	const bottomText: Variants = {
		hidden: { opacity: 0, y: 50 },
		show: { opacity: 1, y: 0, transition: { duration: 1, type: "spring", bounce: 0.25 } }
	}

	const image: Variants = {
		hidden: { opacity: 0, x: 50 },
		show: { opacity: 1, x: 0, transition: { duration: 1.5, type: "spring", bounce: 0.25, delay: 0.5 } }
	}

	/** SHAPE DIVIDER ANIMATIONS */

	const shapeRef = useRef(null);

	const { scrollYProgress } = useScroll({
		target: shapeRef,
		offset: ["start end", "end start"],
	});
	const scale = useTransform(scrollYProgress, [0, 0.5, 0.5, 1], [0.5, 0.5, 0.5, 1.5]);

	return (
		<div className="w-full relative ">

			<div className="container flex h-[570px]">
				<motion.div variants={textContainer} initial="hidden" whileInView={"show"} viewport={{ amount: "some" }} className="basis-0 grow-[1] xl:grow-[2] flex flex-col justify-end pb-40 md:pb-36 lg:pb-28 pl-4 md:pl-12 z-10">
					<motion.h1 variants={upperText} className="mb-4 text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-none">Unleash the power of your </motion.h1>
					<motion.h1 variants={bottomText} className="mb-4 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none glassy-text break-all">IMAGINATION</motion.h1>
				</motion.div>

				<motion.div variants={image} whileInView={"show"} initial="hidden" viewport={{ amount: "some" }} className="basis-0 grow-[2.5] relative hidden xl:block z-10 overflow-hidden">
					<Image src={hero} alt="Hero image" className="object-contain object-left-bottom list-image-none scale-110 translate-y-4" fill />
				</motion.div>
			</div>

			<motion.div layout style={{ scaleY: scale }} className="w-full absolute bottom-[-1px] z-20">
				<div ref={shapeRef} className="shape-divider">
					<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
						<path d="M600,112.77C268.63,112.77,0,65.52,0,7.23V120H1200V7.23C1200,65.52,931.37,112.77,600,112.77Z" className="shape-fill fill-primary"></path>
					</svg>
				</div>
			</motion.div>

		</div>
	)
}