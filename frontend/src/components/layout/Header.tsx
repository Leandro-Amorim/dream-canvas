import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "../ui/navigation-menu";
import Link from "next/link";
import { Button } from "../ui/button";
import Notifications from "./Notifications";

export default function Header() {

	return (
		<div className="flex h-20 md:h-28">
			<div className="flex-1 flex items-center">
				<GitHubLogoIcon height={48} width={48} className="shrink-0 text-primary" />
				<h2 className="pl-2 pb-1 text-3xl font-semibold hidden xl:block">Dream Canvas</h2>
			</div>
			<div className="flex-1 flex items-center justify-center">
				<NavigationMenu>
					<NavigationMenuList>
						<NavigationMenuItem>
							<Link href="/#features" legacyBehavior passHref>
								<NavigationMenuLink className={`${navigationMenuTriggerStyle()} md:min-w-24 xl:min-w-28 !h-10 text-base`}>
									Features
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<Link href="/#pricing" legacyBehavior passHref>
								<NavigationMenuLink className={`${navigationMenuTriggerStyle()} md:min-w-24 xl:min-w-28 !h-10 text-base`}>
									Pricing
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<Link href="/explore" legacyBehavior passHref>
								<NavigationMenuLink className={`${navigationMenuTriggerStyle()} md:min-w-24 xl:min-w-28 !h-10 text-base`}>
									Explore
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</div>
			<div className="flex-1 flex items-center gap-2 justify-end">
				<Notifications />
				<Button variant={'outline'} size={"default"} className="hidden md:flex">Sign in</Button>
				<Button variant={'outline'} size={"sm"} className="flex md:hidden">Sign in</Button>
				<Button size={"default"} className="hidden md:flex" asChild>
					<Link href="/generate">Generate</Link>
				</Button>
				<Button size={"sm"} className="flex md:hidden" asChild>
					<Link href="/generate">Generate</Link>
				</Button>
			</div>
		</div>
	)
}