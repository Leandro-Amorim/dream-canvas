import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { RefObject, useEffect, useState } from 'react';
export default function FeaturesText({ parentRef }: { parentRef: RefObject<HTMLDivElement> }) {


	//TITLE

	const titles = [
		'photorealistic',
		'cartoon',
		'you'
	];

	const titleVariants = {
		enter: () => {
			return {
				y: 50,
				opacity: 0
			};
		},
		center: {
			zIndex: 1,
			y: 0,
			opacity: 1
		},
		exit: () => {
			return {
				zIndex: 0,
				opacity: 0
			};
		}
	};

	const [titleIndex, setTitleIndex] = useState(0);

	useEffect(() => {
		const timer = setTimeout(() => {
			let next = titleIndex + 1;
			if (next === titles.length) {
				next = 0;
			}
			setTitleIndex(next);
		}, 3 * 1000);
		return () => { clearTimeout(timer) }
	}, [titleIndex, setTitleIndex, titles.length]);


	//DESCRIPTION

	const { scrollYProgress } = useScroll({
		target: parentRef,
	});

	const captions = [
		'Various models and modifiers in different styles (realistic, cartoon, etc)',
		'Interact with other people\'s images and prompts',
		'Made with Stable Diffusion XL: The most advanced text-to-image model'
	];

	const [captionIndex, setCaptionIndex] = useState(0);

	useMotionValueEvent(scrollYProgress, "change", (latest) => {
		const idx = Math.min(Math.floor(latest * captions.length), captions.length - 1);
		setCaptionIndex(idx);
	})

	const captionVariants = {
		enter: () => {
			return {
				y: 80,
				opacity: 0
			};
		},
		center: {
			zIndex: 1,
			y: 0,
			opacity: 1
		},
		exit: () => {
			return {
				zIndex: 0,
				opacity: 0
			};
		}
	};

	return (
		<motion.div className="flex-1 min-h-0 flex flex-col pl-12 xl:pl-32 container relative"
			whileInView={{ x: 0 }} viewport={{ amount: 'all', margin: '0px 1000px' }} initial={{ x: -100 }} transition={{ bounce: 0, duration: 0.5 }}>


			<div className='flex flex-wrap mt-16 md:mt-24 lg:mt-32 whitespace-break-spaces'>
				<h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white">Made for </h1>
				<motion.div className='relative' variants={titleVariants}
					key={titleIndex}
					initial="enter"
					animate="center"
					exit="exit"
					transition={{
						y: { type: "spring", stiffness: 800, damping: 200 },
						opacity: { duration: 1 }
					}}>
					<h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white break-all">{titles[titleIndex]}.</h1>
				</motion.div>
			</div>

			<div className='text-white/85 font-semibold text-lg md:text-xl lg:text-3xl relative pt-20 md:pt-24 lg:pt-28'>
				<motion.div
					className='relative'
					key={captionIndex}
					variants={captionVariants}
					initial="enter"
					animate="center"
					exit="exit"
					transition={{
						y: { type: "spring", stiffness: 800, damping: 200 },
						opacity: { duration: 1 }
					}}>{captions[captionIndex]}</motion.div>
			</div>
		</motion.div>
	)
}