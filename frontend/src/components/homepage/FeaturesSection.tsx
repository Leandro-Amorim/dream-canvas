import { motion, useScroll, useTransform, } from 'framer-motion'
import { useRef } from 'react';
import FeaturesCards from './FeaturesCards';
import FeaturesText from './FeaturesText';

export default function FeaturesSection() {

	const parentRef = useRef(null);
	const dividerRef = useRef(null);

	const { scrollYProgress } = useScroll({
		target: dividerRef,
		offset: ["start end", "end start"],
	});

	const scale = useTransform(scrollYProgress, [0, 0.5, 0.5, 1], [0.5, 0.5, 0.5, 1.5]);

	return (
		<div id="features" ref={parentRef} className="h-[4000px] z-20 relative bg-primary">

			<motion.div viewport={{ amount: 0.5 }} whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: -100 }} transition={{ bounce: 0, duration: 0.5 }}
				className="h-screen sticky top-0 flex flex-col">
				<FeaturesText parentRef={parentRef} />
				<FeaturesCards parentRef={parentRef} />
			</motion.div>

			<motion.div layout style={{ scaleY: scale }} className="w-full absolute bottom-[-1px] z-30">
				<div ref={dividerRef} className="shape-divider">
					<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
						<path d="M600,112.77C268.63,112.77,0,65.52,0,7.23V120H1200V7.23C1200,65.52,931.37,112.77,600,112.77Z" className="shape-fill fill-popover"></path>
					</svg>
				</div>
			</motion.div>

		</div>
	)
}