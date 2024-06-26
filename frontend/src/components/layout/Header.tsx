import { GitHubLogoIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "../ui/navigation-menu";
import Link from "next/link";
import { Button } from "../ui/button";
import Notifications from "./Notifications";
import { IconHelp, IconMenu2, IconUser } from "@tabler/icons-react";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Tooltip } from "../ui/tooltip";
import { TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function Header() {

	const [open, setOpen] = useState(false);
	const { setTheme } = useTheme();
	const session = useSession();
	const userId = session.data?.user.id ?? null;
	const isSignedIn = userId !== null;

	const onLogout = async () => {
		await signOut();
	}

	return (
		<>
			<div className="flex h-20 md:h-28">

				<div className="flex-1 flex items-center">
					<Link href="/" className="hidden md:flex items-center">
						<GitHubLogoIcon height={48} width={48} className="shrink-0 text-primary" />
						<h2 className="hidden lg:block pl-2 pb-1 text-2xl font-semibold">Dream Canvas</h2>
					</Link>

					<Button variant={'outline'} size={"icon"} className="flex md:hidden" onClick={() => setOpen(!open)}><IconMenu2 /></Button>
				</div>

				<div className="flex-1 hidden md:flex items-center justify-center">
					<NavigationMenu>
						<NavigationMenuList>
							<NavigationMenuItem>
								<Link href="/#features" legacyBehavior passHref>
									<NavigationMenuLink className={`${navigationMenuTriggerStyle()} min-w-24 lg:min-w-28 !h-10 text-base`}>
										Features
									</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link href="/#pricing" legacyBehavior passHref>
									<NavigationMenuLink className={`${navigationMenuTriggerStyle()} min-w-24 lg:min-w-28 !h-10 text-base`}>
										Pricing
									</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link href="/explore" legacyBehavior passHref>
									<NavigationMenuLink className={`${navigationMenuTriggerStyle()} min-w-24 lg:min-w-28 !h-10 text-base`}>
										Explore
									</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				</div>

				<div className="flex-1 flex items-center gap-2 justify-end">
					{
						isSignedIn &&
						<Notifications />
					}

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="icon">
								<SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
								<MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
								<span className="sr-only">Toggle theme</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setTheme("light")}>
								Light
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("dark")}>
								Dark
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("system")}>
								System
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					{
						!isSignedIn &&
						<Button variant={'outline'} size={"default"} className="flex" asChild>
							<Link href="/signin">Sign in</Link>
						</Button>
					}

					<Button size={"default"} className="flex" asChild>
						<Link href="/generate">Generate</Link>
					</Button>

					{
						isSignedIn &&
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									size="icon"
									className="overflow-hidden rounded-full size-10"
								>

									<Avatar className="size-10">
										<AvatarImage className="object-cover" src={session.data?.user.image ?? ''} alt={session.data?.user.name ?? 'User'} />
										<AvatarFallback><IconUser size={20} className="text-gray-600" /></AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>My Account</DropdownMenuLabel>
								<DropdownMenuItem className="py-1 hover:!bg-popover" asChild>
									<div className="flex justify-between">
										<div className="text-xs flex items-center gap-1">
											Credits
											<Tooltip>
												<TooltipTrigger className="text-muted-foreground"><IconHelp size={16}/></TooltipTrigger>
												<TooltipContent className="bg-gray-950 text-sm">
													<p>You can use premium credits to prioritise your generation. You earn premium credits daily.</p>
												</TooltipContent>
											</Tooltip>
										</div>
										<span className="text-xs">{session.data?.user.premiumCredits}</span>
									</div>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="cursor-pointer" asChild>
									<Link href="/profiles/me">Profile</Link>
								</DropdownMenuItem>
								<DropdownMenuItem className="cursor-pointer" asChild>
									<Link href="/history">History</Link>
								</DropdownMenuItem>
								<DropdownMenuItem className="cursor-pointer" asChild>
									<Link href="/posts/create">Create Post</Link>
								</DropdownMenuItem>
								<DropdownMenuItem className="cursor-pointer" asChild>
									<Link href="/settings">Settings</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="!text-red-500 cursor-pointer" onClick={onLogout}>Logout</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					}

				</div>
			</div>
			<div className={`w-full transition-all ${open ? 'h-[136px]' : 'h-0'} overflow-hidden block md:hidden`}>
				<NavigationMenu orientation="vertical" className="w-full max-w-none [&>*:first-child]:w-full">
					<NavigationMenuList className="flex-col space-x-0">
						<NavigationMenuItem className="w-full flex justify-center">
							<Link href="/#features" legacyBehavior passHref>
								<NavigationMenuLink className={`${navigationMenuTriggerStyle()} !w-full !h-10 text-base`}>
									Features
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
						<NavigationMenuItem className="w-full flex justify-center">
							<Link href="/#pricing" legacyBehavior passHref>
								<NavigationMenuLink className={`${navigationMenuTriggerStyle()} !w-full !h-10 text-base`}>
									Pricing
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
						<NavigationMenuItem className="w-full flex justify-center">
							<Link href="/explore" legacyBehavior passHref>
								<NavigationMenuLink className={`${navigationMenuTriggerStyle()} !w-full !h-10 text-base`}>
									Explore
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</>
	)
}