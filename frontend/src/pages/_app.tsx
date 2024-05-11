import "@/styles/globals.css";
import "@/styles/homepage.css";
import 'react-photo-view/dist/react-photo-view.css';

import type { AppProps } from "next/app";
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';
import GenerationStatusPoller from "@/components/generate/GenerationStatusPoller";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import Head from "next/head";
export default function App({ Component, pageProps }: AppProps) {
	const queryClient = new QueryClient();
	return (
		<ThemeProvider attribute="class" defaultTheme="light">
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />

				<title key="title">Dream Canvas — Unleash the power of your imagination.</title>
				<meta key={'meta-title'} name="title" content="Dream Canvas — Unleash the power of your imagination." />
				<meta key={'meta-description'} name="description" content="Generate stunning images using the power of AI." />

				<meta key={'og-url'} name="og:url" property="og:url" content={process.env.NEXT_PUBLIC_URL ?? ''} />
				<meta key={'og-type'} name="og:type" property="og:type" content="website" />
				<meta key={'og-title'} name="og:title" property="og:title" content="Dream Canvas — Unleash the power of your imagination." />
				<meta key={'og-description'} name="og:description" property="og:description" content="Generate stunning images using the power of AI." />
				<meta key={'og-image'} name="og:image" property="og:image" content={`${process.env.NEXT_PUBLIC_URL}/card1.jpg`} />

				<meta key={'twitter-card'} name="twitter:card" property="twitter:card" content="summary_large_image" />
				<meta key={'twitter-url'} name="twitter:url" property="twitter:url" content={process.env.NEXT_PUBLIC_URL ?? ''} />
				<meta key={'twitter-title'} name="twitter:title" property="twitter:title" content="Dream Canvas — Unleash the power of your imagination." />
				<meta key={'twitter-description'} name="twitter:description" property="twitter:description" content="Generate stunning images using the power of AI." />
				<meta key={'twitter-image'} name="twitter:image" property="twitter:image" content={`${process.env.NEXT_PUBLIC_URL}/card1.jpg`} />
			</Head>
			<RecoilRoot>
				<SessionProvider session={pageProps.session}>
					<QueryClientProvider client={queryClient}>
						<TooltipProvider delayDuration={300}>
							<Component {...pageProps} />
							<GenerationStatusPoller />
							<Toaster position="bottom-left" />
						</TooltipProvider>
					</QueryClientProvider>
				</SessionProvider>
			</RecoilRoot>
		</ThemeProvider>
	)
}