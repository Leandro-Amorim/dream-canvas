import { GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Separator } from "../ui/separator";

export default function Footer() {

	return (
		<footer className="mt-16 lg:mt-32 bg-secondary">

			<div className="container py-12 flex flex-col md:flex-row gap-6 md:gap-0">

				<div className="flex-1 grow-[3] flex flex-col gap-3 h-fit">
					<div className="flex-1 flex items-center">
						<GitHubLogoIcon height={32} width={32} className="shrink-0" />
						<h2 className="pl-1 pb-1 text-xl font-semibold">Dream Canvas</h2>
					</div>
					<p className="text-sm text-muted-foreground">Unleash the power of your imagination.</p>
				</div>

				<div className="flex-1">
					<h3 className="text-lg font-semibold">About</h3>
					<div className="mt-4 flex flex-col gap-2">
						<Link href={'/#features'} className="text-sm text-muted-foreground">Features</Link>
						<Link href={'/#pricing'} className="text-sm text-muted-foreground">Pricing</Link>
						<Link href={'/support'} className="text-sm text-muted-foreground">Support</Link>
					</div>
				</div>

				<div className="flex-1">
					<h3 className="text-lg font-semibold">Content</h3>
					<div className="mt-4 flex flex-col gap-2">
						<Link href={'/generate'} className="text-sm text-muted-foreground">Generate</Link>
						<Link href={'/explore'} className="text-sm text-muted-foreground">Explore</Link>
					</div>
				</div>

				<div className="flex-1">
					<h3 className="text-lg font-semibold">Community</h3>
					<div className="mt-4 flex flex-col gap-2">
						<Link href={'/'} className="text-sm text-muted-foreground">Join Discord</Link>
						<Link href={'/'} className="text-sm text-muted-foreground">Follow on Twitter</Link>
					</div>
				</div>
			</div>

			<div className="container">
				<Separator />
				<div className="h-16 py-4 flex justify-between">
					<Link href={'/'} className="text-sm text-muted-foreground">© 2024 Dream Canvas. All rights reserved.</Link>
					<div className="flex gap-4">
						<Link href={'/'} className="text-sm text-muted-foreground">Contact</Link>
						<Link href={'/'} className="text-sm text-muted-foreground">Privacy</Link>
					</div>
				</div>
			</div>

		</footer>
	)
}