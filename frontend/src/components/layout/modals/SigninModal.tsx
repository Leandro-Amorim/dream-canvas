import { Button } from "@/components/ui/button"
import { Dialog, DialogContent} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { signinModalOpenState } from "@/lib/atoms";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useQuery } from "@tanstack/react-query";
import { getProviders, signIn } from "next-auth/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useRecoilState } from "recoil"
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().email();

export default function SigninModal() {
	const [open, setOpen] = useRecoilState(signinModalOpenState);

	const [email, setEmail] = useState('');

	const { data: providers, isSuccess } = useQuery({
		queryKey: ['providers'],
		queryFn: async () => {
			return getProviders();
		}
	})

	const icons = {
		'google': 'https://authjs.dev/img/providers/google.svg',
		'github': 'https://authjs.dev/img/providers/github-dark.svg',
	}

	const onSignIn = useCallback(async (provider: string) => {

		if (provider === 'email' && !emailSchema.safeParse(email).success) {
			toast.error('Please enter a valid email');
			return;
		}

		const data = await signIn(provider, { email: provider === 'email' ? email : undefined, redirect: false });

		if (data?.error) {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			});
		}
		else if (provider === 'email') {
			toast.success('Check your email for a link to sign in.');
		}
	}, [email]);

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
									<Button className="grow" variant={'outline'} size={'lg'} key={provider.id} onClick={() => onSignIn(provider.id)}>
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
					<Input placeholder="E-mail address" type="email" className="h-10 w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
					<Button className="w-full mt-3" size={'lg'} onClick={() => onSignIn('email')}>Sign in with e-mail</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
