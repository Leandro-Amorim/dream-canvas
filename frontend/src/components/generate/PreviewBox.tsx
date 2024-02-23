import { Card, CardContent } from "../ui/card";
import happyRobot from "$/happy-robot.json";
import sadRobot from "$/sad-robot.json";
import dynamic from 'next/dynamic';
import { APIResponse } from "@/pages/api/generation/generate";
import { useRecoilValue } from "recoil";
import { generationStatusState } from "@/lib/atoms";
import { useMemo } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";

const LottieAnimation = dynamic(() => import('../layout/LottieAnimation'), { ssr: false });


export default function PreviewBox({ mutationData, mutationStatus, isAnonymous }: { mutationStatus: "error" | "idle" | "pending" | "success", mutationData: APIResponse | undefined, isAnonymous: boolean }) {

	const generationStatus = useRecoilValue(generationStatusState);

	const content = useMemo(() => {
		if (generationStatus.status === 'QUEUED') {
			return <PreviewContent loading={true} title={'Your image is being generated'} description='Request was queued' />
		}
		else if (generationStatus.status === 'PROCESSING') {
			return <PreviewContent loading={true} title={'Your image is being generated'} description='Request is being processed' />
		}
		else if (generationStatus.status === 'COMPLETED') {
			return <PreviewContent imageUrl={generationStatus.data?.url} />
		}
		else if (generationStatus.status === 'FAILED' || mutationStatus === 'error') {
			return <PreviewContent error={true} title={'There was an error when generating the image'} description={generationStatus.data?.refunded ? 'Don\'t worry, your spent credits have been refunded.' : 'Please try again later.'} />
		}
		else if (mutationData?.status === 'error') {
			const reasons = {
				'MALFORMED_REQUEST': ['There was an error when generating the image', 'Please try again with another prompt.'],
				'NO_GENERATIONS_LEFT': ['You don\'t have any more free generations', isAnonymous ? 'Please create a free account to earn more.' : 'Please upgrade your plan to get unlimited generations.'],
				'SYSTEM_RESOURCES_DEPLETED': ['The free queue is full', 'Please switch to a premium plan or use high-priority generation.'],
				'FREE_QUEUE_FULL': ['The free queue is full', 'Please switch to a premium plan or use high-priority generation.'],
				'NOT_ENOUGH_CREDITS': ['You don\'t have any more credits', 'Please upgrade your plan or use your free generations.'],
				'INTERNAL_SERVER_ERROR': ['There was an error when generating the image', 'Please try again later.']
			}
			return <PreviewContent error={true} title={reasons[mutationData.reason][0]} description={reasons[mutationData.reason][1]} isAnonymous={isAnonymous} showButton={
				['NO_GENERATIONS_LEFT', 'SYSTEM_RESOURCES_DEPLETED', 'FREE_QUEUE_FULL', 'NOT_ENOUGH_CREDITS'].includes(mutationData.reason)
			} />
		}
		else if (mutationStatus === 'pending' || mutationStatus === 'idle') {
			return <PreviewContent title={'Enter a prompt to start creating amazing arts!'} />
		}
	}, [generationStatus, mutationData, mutationStatus, isAnonymous]);

	return (
		<Card className="w-full h-[420px] lg:h-full overflow-hidden">
			<CardContent className="flex flex-col h-full items-center justify-center relative">
				{content}
			</CardContent>
		</Card>
	)
}

function PreviewContent({ error = false, loading = false, imageUrl, title, description, showButton = false, isAnonymous = false }: { error?: boolean, loading?: boolean, imageUrl?: string, title?: string, description?: string, showButton?: boolean, isAnonymous?: boolean }) {

	if (imageUrl) {
		return (
			<div className="inset-0 absolute overflow-hidden">
				<Image src={imageUrl} fill={true} alt="Test" className={`object-contain`} />
			</div>
		)
	}
	else return (
		<>
			{
				!loading && <LottieAnimation animationData={error ? sadRobot : happyRobot} loop={true} className="size-96 -mt-20 pointer-events-none" />
			}
			<div className={`flex flex-col w-96 items-center gap-1 ${loading ? 'h-full justify-center' : '-mt-20'}`}>
				{
					loading && <IconLoader2 className="size-12 text-primary animate-spin mt-8 mb-2" />
				}
				<span className="text-lg font-semibold">{title}</span>
				<span className="text-sm font-normal text-gray-600 text-center">{description}</span>
				{
					showButton && <Button className="mt-2" asChild>
						<Link href={isAnonymous ? '/api/auth/signin' : '/#pricing'}>{isAnonymous ? 'Sign up' : 'Go premium'}</Link>
					</Button>
				}
			</div>
		</>
	)
}