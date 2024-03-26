import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { signinModalOpenState } from "@/lib/atoms";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { IconLoader2 } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query";
import { getProviders } from "next-auth/react";
import Image from "next/image";
import { useEffect } from "react";
import { useRecoilState } from "recoil"

export default function SigninModal() {
	const [open, setOpen] = useRecoilState(signinModalOpenState);


	const { data: providers, isSuccess } = useQuery({
		queryKey: ['providers'],
		queryFn: async () => {
			return await getProviders();
		}
	})

	useEffect(() => {
		console.log(providers)
	}, [providers])

	const icons = {
		'google': 'https://authjs.dev/img/providers/google.svg',
		'github': 'https://authjs.dev/img/providers/github-dark.svg',
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="w-full max-w-[400px] rounded-lg gap-0 flex flex-col items-center">
				<div className="flex flex-col items-center mt-7">
					<GitHubLogoIcon height={56} width={56} className="shrink-0 text-primary" />
					<h2 className="text-2xl font-bold">Welcome back!</h2>
					<span className="text-[13px] pt-[4px] text-muted-foreground">Please enter your details to sign in or create an account</span>
				</div>
				<div className="w-full flex gap-2 mt-7">
					{
						(isSuccess && providers) ?
							Object.values(providers).map((provider) => {
								return (provider.type === 'oauth' &&
									<Button className="grow" variant={'outline'} size={'lg'}>
										{/*@ts-ignore*/}
										<Image src={icons[provider.id] ?? `https://authjs.dev/img/providers/${provider.id}.svg`} alt={provider.name} width={24} height={24} />
									</Button>
								)
							}) :
							<Skeleton className="w-full h-10" />
					}
				</div>
				<div className="w-full flex gap-[6px] mt-4 items-center text-muted-foreground">
					<Separator className="grow w-0" />
					<span className="text-[13px] pb-[3px]">or</span>
					<Separator className="grow w-0" />
				</div>
				<div className="flex flex-col mt-4 w-full">
					<Input placeholder="E-mail address" className="h-10 w-full" />
					<Button className="w-full mt-3" size={'lg'}>Sign in with e-mail</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
