import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import GlobalModals from "./modals/GlobalModals";

export default function Main({ children }: { children?: ReactNode }) {
	return (
		<main>
			<div className="container">
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