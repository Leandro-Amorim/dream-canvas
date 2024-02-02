import ModelSection from "@/components/generate/ModelSection";
import ModifierSection from "@/components/generate/ModifierSection";
import PromptSection from "@/components/generate/PromptSection";
import Main from "@/components/layout/Main";

export default function Home() {
	return (
		<Main>
			<PromptSection />
			<ModelSection />
			<ModifierSection />
		</Main>
	);
}
