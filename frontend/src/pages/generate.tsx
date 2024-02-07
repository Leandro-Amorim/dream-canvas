import ModelSection from "@/components/generate/ModelSection";
import ModifierModal from "@/components/generate/ModifierModal";
import ModifierSection from "@/components/generate/ModifierSection";
import PromptSection from "@/components/generate/PromptSection";
import Main from "@/components/layout/Main";

export default function Home() {
	return (
		<Main>
			<ModifierModal/>
			<PromptSection />
			<ModelSection />
			<ModifierSection />
		</Main>
	);
}
