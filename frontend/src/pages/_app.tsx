import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/components/layout/ThemeProvider"

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider attribute="class" defaultTheme="light">
			<Component {...pageProps} />
		</ThemeProvider>
	)
}