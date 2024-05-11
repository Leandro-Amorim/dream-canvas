import { motion, useScroll, useTransform } from 'framer-motion';
import { RefObject } from 'react';
import SampleCard from './SampleCard';
import { PhotoProvider } from 'react-photo-view';

export default function FeaturesCards({ parentRef }: { parentRef: RefObject<HTMLDivElement> }) {

	const { scrollYProgress } = useScroll({
		target: parentRef,
	});

	const baseAngle = useTransform(scrollYProgress, [0, 1], [-90, -200]);
	const diameter = 2400;

	const images = [
		'card1.jpg',
		'card2.jpg',
		'card3.jpg',
		'card4.jpg',
		'card5.jpg',
	]

	return (
		<motion.div className='flex-1 min-h-0 relative overflow-hidden'
			whileInView={{
				opacity: 1,
			}}
			initial={{
				opacity: 0,
			}}
			viewport={{ amount: 'all' }}>
			<motion.div className='absolute left-[50%]'
				style={{
					rotate: baseAngle,
					bottom: -diameter / 2 + 80,
				}}>
				<PhotoProvider maskOpacity={0.97} speed={() => 300} easing={() => 'cubic-bezier(0.215, 0.61, 0.355, 1)'}>
					{
						images.map((image, index) => (
							<SampleCard key={index} deg={index * 20} diameter={diameter} image={`/${image}`} />
						))
					}
				</PhotoProvider>
			</motion.div >
		</motion.div>
	)
}