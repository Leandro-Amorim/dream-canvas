import { GearIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { generationRequestState, generationStatusState, generationToastState, modelTypeState, modifiersState, negativePromptState, promptState, settingsState } from "@/lib/atoms";
import { useEffect, useMemo } from "react";
import { fetchData, parseModifiers } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import { IconDice3Filled, IconLoader2 } from "@tabler/icons-react";
import { Switch } from "../ui/switch";
import { Skeleton } from "../ui/skeleton";
import { samplingMethodsArray, sizesNormal, sizesNormalArray, sizesXL, sizesXLArray, upscalerMethodsArray } from "@/data/settings";
import { useDebounce } from "@/lib/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { APIResponse } from "@/pages/api/generation/get_cost";
import { APIResponse as GenerateAPIResponse } from "@/pages/api/generation/generate";
import { GenerationRequest } from "@/types/generation";
import PreviewBox from "./PreviewBox";

export default function PromptSection() {

	const session = useSession();
	const userIsPremium = useMemo(() => {
		return session.data?.user.premium ?? false;
	}, [session]);

	const [prompt, setPrompt] = useRecoilState(promptState);
	const [negativePrompt, setNegativePrompt] = useRecoilState(negativePromptState);
	const setModifiers = useSetRecoilState(modifiersState);

	useEffect(() => {
		setModifiers(parseModifiers(prompt));
	}, [prompt, setModifiers]);

	const modelType = useRecoilValue(modelTypeState);
	const [settings, setSettings] = useRecoilState(settingsState);

	useEffect(() => {
		const newIndex = (modelType === 'base' ? sizesNormal : sizesXL);
		const newArr = (modelType === 'base' ? sizesNormalArray : sizesXLArray);
		if (newIndex[settings.size] === undefined) {
			setSettings((prev) => { return { ...prev, size: newArr[0].value } });
		}
	}, [modelType, settings.size, setSettings]);

	const generation = useRecoilValue(generationRequestState);
	const debouncedGeneration = useDebounce(generation, 500);

	const { data, isError, isLoading } = useQuery<APIResponse>({
		queryKey: [debouncedGeneration],
		queryFn: async () => {
			return fetchData('/api/generation/get_cost', debouncedGeneration);
		},
		enabled: userIsPremium === false && settings.highPriority
	});

	const [generationStatus, setGenerationStatus] = useRecoilState(generationStatusState);
	const [generationToast, setGenerationToast] = useRecoilState(generationToastState);

	const mutation = useMutation({
		mutationFn: (generation: GenerationRequest): Promise<GenerateAPIResponse> => {
			return fetchData('/api/generation/generate', generation);
		},
		onMutate: () => {
			setGenerationStatus({
				id: null,
				type: null,
				status: null,
				data: null,
			});
		},
		onSuccess(data) {
			if (data.status === 'success') {
				setGenerationStatus({
					id: data.data.id,
					type: data.data.type,
					data: null,
					status: 'QUEUED',
				})
				setGenerationToast({
					open: true,
				})
			}
		},
	})

	useEffect(() => {
		if ((generationStatus.status === 'COMPLETED' || generationStatus.status === 'FAILED') && generationToast.open) {
			setGenerationToast({
				open: false,
			})
		}
	}, []);

	return (
		<div className="flex flex-col">

			<div className="flex flex-col lg:flex-row lg:gap-6">

				<div className="flex-[6]">
					<div className="flex flex-col">
						<h3 className="text-2xl font-semibold">Prompt</h3>
						<Textarea className="mt-4 h-[216px] resize-none bg-secondary" placeholder="Insert your prompt here." value={prompt} onChange={(e) => { setPrompt(e.target.value) }} />
					</div>

					<div className="flex flex-col mt-6">
						<h3 className="text-2xl font-semibold">Negative Prompt</h3>
						<Textarea className="mt-4 h-[194px] resize-none bg-secondary" placeholder="Insert your negative prompt here." value={negativePrompt} onChange={(e) => { setNegativePrompt(e.target.value) }} />
					</div>
				</div>

				<div className="flex-[4] mt-4 lg:mt-12">
					<PreviewBox mutationData={mutation.data} mutationStatus={mutation.status} isAnonymous={session?.data?.user === undefined} />
				</div>

			</div>

			<div className="w-full flex gap-2 mt-4 justify-end">
				<Button className="h-12 text-base grow sm:grow-0 sm:w-[220px] flex items-center gap-1" disabled={mutation.isPending || mutation.isError || generationStatus.status === 'PROCESSING' || generationStatus.status === 'QUEUED'} onClick={() => { mutation.mutate(generation) }}>
					{
						(mutation.isPending || mutation.isError || generationStatus.status === 'PROCESSING' || generationStatus.status === 'QUEUED') && <IconLoader2 className="mr-[2px] size-5 animate-spin" />
					}
					Generate
					{
						userIsPremium === false && settings.highPriority &&
						<div>
							{
								isError || isLoading || data?.status === 'error' ?
									<Skeleton className="w-12 h-6 bg-muted" />
									:
									<span className="text-xs font-medium text-primary-foreground pt-[1px]">({data?.data} Credits)</span>
							}
						</div>
					}
				</Button>
				<Popover>
					<PopoverTrigger asChild><Button variant="outline" size="icon" className="size-12"><GearIcon className="w-5 h-5" /></Button></PopoverTrigger>
					<PopoverContent side="top" align="end" className="flex flex-col w-[600px]">
						<h3 className="font-medium text-lg mb-4">Settings</h3>

						<div className="mb-4">
							<h3 className="font-medium line-clamp-1 mb-2 text-sm">Canvas Size</h3>
							<Select value={settings.size} onValueChange={(val) => { setSettings((prev) => { return { ...prev, size: val } }) }}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{
										modelType === null ? [] :
											(modelType === 'base' ? sizesNormalArray : sizesXLArray).map((el) => {
												return (<SelectItem key={el.value} value={el.value}>{el.label}</SelectItem>)
											})
									}
								</SelectContent>
							</Select>
						</div>

						<div className="flex gap-4 mb-4">
							<div className="flex-1">
								<h3 className="font-medium line-clamp-1 mb-2 text-sm">Sampling Method</h3>
								<Select value={settings.samplingMethod} onValueChange={(val) => { setSettings((prev) => { return { ...prev, samplingMethod: val } }) }}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{
											samplingMethodsArray.map((el) => {
												return (<SelectItem key={el.value} value={el.value}>{el.label}</SelectItem>)
											})
										}
									</SelectContent>
								</Select>
							</div>
							<div className="flex-1">
								<h3 className="font-medium line-clamp-1 mb-2 text-sm">Seed</h3>
								<div className="flex gap-2">
									<Input className="grow" type="number" step={1} value={settings.seed} onChange={(e) => { setSettings((prev) => { return { ...prev, seed: e.target.valueAsNumber } }) }} />
									<Button size={'icon'} className="shrink-0" onClick={() => { setSettings((prev) => { return { ...prev, seed: -1 } }) }}><IconDice3Filled /></Button>
								</div>
							</div>
						</div>

						<div className="flex gap-4 mb-4">
							<div className="flex-1">
								<h3 className="font-medium line-clamp-1 mb-2 text-sm">Steps</h3>
								<div className="flex gap-2">
									<Slider min={1} max={150} step={1} value={[settings.steps]} onValueChange={(val) => { setSettings((prev) => { return { ...prev, steps: val[0] } }) }} />
									<Input className="basis-20" type="number" min={1} max={150} step={1} value={settings.steps} onChange={(e) => { setSettings((prev) => { return { ...prev, steps: e.target.valueAsNumber } }) }} />
								</div>
							</div>
							<div className="flex-1">
								<h3 className="font-medium line-clamp-1 mb-2 text-sm">Scale</h3>
								<div className="flex gap-2">
									<Slider min={1} max={30} step={1} value={[settings.scale]} onValueChange={(val) => { setSettings((prev) => { return { ...prev, scale: val[0] } }) }} />
									<Input className="basis-20" type="number" min={1} max={30} step={1} value={settings.scale} onChange={(e) => { setSettings((prev) => { return { ...prev, scale: e.target.valueAsNumber } }) }} />
								</div>
							</div>
						</div>


						<h3 className="font-medium line-clamp-1 mb-2 text-sm flex gap-2"><Switch checked={settings.hires.enabled} onCheckedChange={(checked) => { setSettings((prev) => { return { ...prev, hires: { ...prev.hires, enabled: checked } } }) }} />Hires Fix</h3>


						<div className={`bg-muted rounded-xl p-4 mb-2 ${settings.hires.enabled ? 'block' : 'hidden'}`}>
							<div className="flex gap-4 mb-4">
								<div className="flex-1">
									<h3 className="font-medium line-clamp-1 mb-2 text-sm">Upscaler</h3>
									<Select value={settings.hires.upscaler} onValueChange={(val) => { setSettings((prev) => { return { ...prev, hires: { ...prev.hires, upscaler: val } } }) }}>
										<SelectTrigger className="bg-background">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{
												upscalerMethodsArray.map((el) => {
													return (<SelectItem key={el.value} value={el.value}>{el.label}</SelectItem>)
												})
											}
										</SelectContent>
									</Select>
								</div>
								<div className="flex-1">
									<h3 className="font-medium line-clamp-1 mb-2 text-sm">Upscaling Factor</h3>
									<div className="flex gap-2">
										<Slider min={1} max={2} step={0.1} value={[settings.hires.factor]} onValueChange={(val) => { setSettings((prev) => { return { ...prev, hires: { ...prev.hires, factor: val[0] } } }) }} />
										<Input className="basis-24 bg-background" type="number" min={1} max={2} step={0.1} value={settings.hires.factor} onChange={(e) => { setSettings((prev) => { return { ...prev, hires: { ...prev.hires, factor: e.target.valueAsNumber } } }) }} />
									</div>
								</div>
							</div>
							<div className="flex gap-4 mb-0">
								<div className="flex-1">
									<h3 className="font-medium line-clamp-1 mb-2 text-sm">Hires Steps</h3>
									<div className="flex gap-2">
										<Slider min={1} max={50} step={1} value={[settings.hires.steps]} onValueChange={(val) => { setSettings((prev) => { return { ...prev, hires: { ...prev.hires, steps: val[0] } } }) }} />
										<Input className="basis-24 bg-background" type="number" min={1} max={50} step={1} value={settings.hires.steps} onChange={(e) => { setSettings((prev) => { return { ...prev, hires: { ...prev.hires, steps: e.target.valueAsNumber } } }) }} />
									</div>
								</div>
								<div className="flex-1">
									<h3 className="font-medium line-clamp-1 mb-2 text-sm">Denoising Strength</h3>
									<div className="flex gap-2">
										<Slider min={0} max={1} step={0.01} value={[settings.hires.denoisingStrength]} onValueChange={(val) => { setSettings((prev) => { return { ...prev, hires: { ...prev.hires, denoisingStrength: val[0] } } }) }} />
										<Input className="basis-24 bg-background" type="number" min={0} max={1} step={0.01} value={settings.hires.denoisingStrength} onChange={(e) => { setSettings((prev) => { return { ...prev, hires: { ...prev.hires, denoisingStrength: e.target.valueAsNumber } } }) }} />
									</div>
								</div>
							</div>
						</div>
						{
							!userIsPremium &&
							<div className="mt-2">
								<h3 className="font-medium line-clamp-1 mb-2 text-sm flex gap-2"><Switch checked={settings.highPriority} onCheckedChange={(checked) => { setSettings((prev) => { return { ...prev, highPriority: checked } }) }} />High Priority</h3>
							</div>
						}

					</PopoverContent>
				</Popover>
			</div>
		</div >

	)
}