import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "../ui/navigation-menu";
import Link from "next/link";
import { Button } from "../ui/button";

export default function Header() {

	return (
		<div className="flex h-28">
			<div className="flex-1 flex items-center px-2">
				<GitHubLogoIcon height={48} width={48} className="shrink-0" />
				<h2 className="pl-2 pb-1 text-3xl font-semibold">Dream Canvas</h2>
			</div>
			<div className="flex-1 flex items-center justify-center">
				<NavigationMenu>
					<NavigationMenuList>
						<NavigationMenuItem>
							<Link href="/#features" legacyBehavior passHref>
								<NavigationMenuLink className={`${navigationMenuTriggerStyle()} min-w-28 !h-10 text-base`}>
									Features
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<Link href="/#pricing" legacyBehavior passHref>
								<NavigationMenuLink className={`${navigationMenuTriggerStyle()} min-w-28 !h-10 text-base`}>
									Pricing
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<Link href="/explore" legacyBehavior passHref>
								<NavigationMenuLink className={`${navigationMenuTriggerStyle()} min-w-28 !h-10 text-base`}>
									Explore
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</div>
			<div className="flex-1 flex items-center gap-3 justify-end">
				<Button variant={'outline'} size={"lg"}>Sign in</Button>
				<Button size={"lg"}>Generate</Button>
			</div>
		</div>
	)
}