import ModelSection from "@/components/generate/ModelSection";
import ModifierModal from "@/components/generate/ModifierModal";
import ModifierSection from "@/components/generate/ModifierSection";
import PromptSection from "@/components/generate/PromptSection";
import Main from "@/components/layout/Main";
import { NextPageContext } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import isUUID from 'is-uuid';
import { IImage } from "@/types/database";
import { db } from "@/server/database/database";
import { and, eq } from "drizzle-orm";
import { NULL_UUID } from "@/lib/utils";
import { images } from "@/server/database/schema";
import { useEffect, useMemo } from "react";
import { useSetRecoilState } from "recoil";
import { modelState, modelTypeState, negativePromptState, promptState, settingsState } from "@/lib/atoms";
import { useSession } from "next-auth/react";
import { modelArray, models } from "@/data/models";

export async function getServerSideProps(context: NextPageContext) {

	//@ts-ignore
	const session = await getServerSession(context.req, context.res, authOptions);
	const userId = session?.user.id ?? NULL_UUID;

	const postId = Array.isArray(context.query.postId) ? context.query.postId[0] : context.query.postId ?? '';
	const imageId = Array.isArray(context.query.imageId) ? context.query.imageId[0] : context.query.imageId ?? '';

	let templateImage = null as IImage | null;

	if (postId && imageId && isUUID.anyNonNil(imageId)) {
		//TODO
	}
	else if (imageId && isUUID.anyNonNil(imageId)) {
		templateImage = await db.query.images.findFirst({
			where: and(eq(images.userId, userId), eq(images.id, imageId))
		}) ?? null;
	}

	return {
		props: {
			templateImage
		},
	}
}

export default function Home({ templateImage }: { templateImage: IImage | null }) {

	const session = useSession();
	const userIsPremium = useMemo(() => {
		return session.data?.user.premium ?? false;
	}, [session]);

	const setModel = useSetRecoilState(modelState);
	const setModelType = useSetRecoilState(modelTypeState);
	const setPrompt = useSetRecoilState(promptState);
	const setNegativePrompt = useSetRecoilState(negativePromptState);
	const setSettings = useSetRecoilState(settingsState);

	useEffect(() => {
		if (templateImage !== null) {
			setPrompt(templateImage.prompt.prompt);
			setNegativePrompt(templateImage.prompt.negativePrompt);
			setSettings((prev) => {
				return {
					...prev,
					hires: {
						enabled: templateImage.prompt.settings.hires.enabled,
						upscaler: templateImage.prompt.settings.hires.upscaler,
						factor: templateImage.prompt.settings.hires.factor,
						steps: templateImage.prompt.settings.hires.steps,
						denoisingStrength: templateImage.prompt.settings.hires.denoisingStrength,

					},
					samplingMethod: templateImage.prompt.settings.samplingMethod,
					scale: templateImage.prompt.settings.scale,
					seed: templateImage.prompt.settings.seed,
					size: templateImage.prompt.settings.size,
					steps: templateImage.prompt.settings.steps,
				}
			})

			const templateModel = models[templateImage.prompt.model ?? ''] ?? modelArray[0];

			let selectedModel = templateModel as Model | undefined;

			if (!userIsPremium && templateModel.premium) {
				selectedModel = modelArray.find((el) => !el.premium);
			}
			setModel(selectedModel?.id ?? null);
			setModelType(selectedModel?.type ?? null);
		}
	}, [templateImage, userIsPremium, setModel, setModelType, setPrompt, setNegativePrompt, setSettings]);
	
	return (
		<Main>
			<ModifierModal />
			<PromptSection />
			<ModelSection />
			<ModifierSection />
		</Main>
	);
}
