import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Main({ children }: { children?: ReactNode }) {
	return (
		<main>
			<div className="container">
				<Header />
				<div className="flex flex-col lg:px-10">
					{children}
				</div>
			</div>
			<Footer />
		</main>
	)
}