import Main from "@/components/layout/Main";
import { ToggleThemeButton } from "@/components/layout/buttons/ToggleThemeButton";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<Main>
			<Button>Shadcn</Button>
			<ToggleThemeButton/>
		</Main>
	);
}
