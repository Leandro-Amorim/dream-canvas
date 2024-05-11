import Main from "@/components/layout/Main";
import HeroSection from "@/components/homepage/HeroSection";
import WaveAnimation from "@/components/homepage/WaveAnimation";
import FeaturesSection from "@/components/homepage/FeaturesSection";
import PricingSection from "@/components/homepage/PricingSection";

export default function Home() {

	return (


		<Main noContainer={true}>
			<WaveAnimation />
			<HeroSection />
			<FeaturesSection />
			<PricingSection />
		</Main>

	);
}