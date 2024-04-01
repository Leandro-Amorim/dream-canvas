import Main from "@/components/layout/Main";
const LottieAnimation = dynamic(() => import('@/components/layout/LottieAnimation'), { ssr: false });
import happyRobot from "$/happy-robot.json";
import dynamic from "next/dynamic";
export default function CheckoutSuccess() {
	return (
		<Main>
			<div className="w-full mt-12 flex flex-col md:flex-row justify-center items-center">
				<LottieAnimation animationData={happyRobot} loop={true} className="shrink-0 mt-10 size-80 scale-150 md:translate-x-[10px] pointer-events-none " />
				<div className="ml-2 flex flex-col gap-6 justify-center z-10 break-words max-w-[600px]">
					<span className="text-6xl font-bold">Success!</span>
					<span className="text-xl text-muted-foreground">{`You can now enjoy your premium benefits.`}</span>
				</div>
			</div>
		</Main>
	)
}