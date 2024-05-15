import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import GlobalModals from "./modals/GlobalModals";
import JobAdAlert from "./JobAdAlert";

export default function Main({ children, noContainer = false }: { children?: ReactNode, noContainer?: boolean }) {
	return (
		<main className="min-h-screen flex flex-col">
			<div className={'grow'}>
				<GlobalModals />
				<JobAdAlert/>
				<div className={'w-full container'}>
					<Header />
				</div>
				<div className={`flex flex-col ${noContainer ? '' : 'container lg:px-10'}`}>
					{children}
				</div>
			</div>
			<Footer />
		</main>
	)
}