import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import GlobalModals from "./modals/GlobalModals";

export default function Main({ children }: { children?: ReactNode }) {
	return (
		<main className="min-h-screen flex flex-col">
			<div className="container grow">
				<GlobalModals/>
				<Header />
				<div className="flex flex-col lg:px-10">
					{children}
				</div>
			</div>
			<Footer />
		</main>
	)
}