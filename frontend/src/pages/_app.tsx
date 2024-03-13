import "@/styles/globals.css";
import 'react-photo-view/dist/react-photo-view.css';

import type { AppProps } from "next/app";
import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider, } from '@tanstack/react-query';
import { RecoilRoot } from 'recoil';
import GenerationStatusPoller from "@/components/generate/GenerationStatusPoller";
import { TooltipProvider } from "@/components/ui/tooltip";
export default function App({ Component, pageProps }: AppProps) {
	const queryClient = new QueryClient();
	return (
		<ThemeProvider attribute="class" defaultTheme="light">
			<RecoilRoot>
				<SessionProvider session={pageProps.session}>
					<QueryClientProvider client={queryClient}>
						<TooltipProvider delayDuration={300}>
							<Component {...pageProps} />
							<GenerationStatusPoller />
						</TooltipProvider>
					</QueryClientProvider>
				</SessionProvider>
			</RecoilRoot>
		</ThemeProvider>
	)
}