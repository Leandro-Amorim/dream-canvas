import Main from "@/components/layout/Main";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { IconCirclePlus, IconCrown, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { NextPageContext } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";
import { db } from "@/server/database/database";
import { images } from "@/server/database/schema";
import { and, eq, inArray } from "drizzle-orm";
import isUUID from 'is-uuid';
import { IImage } from "@/types/database";

const formSchema = z.object({
	username: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
})

export async function getServerSideProps(context: NextPageContext) {

	//@ts-ignore
	const session = await getServerSession(context.req, context.res, authOptions);

	if (session?.user === undefined) {
		return {
			redirect: {
				destination: '/api/auth/signin',
				permanent: false,
			},
		}
	}

	const userId = session.user.id;

	const queryIds = [context.query.id ?? []].flat().filter((value) => { return isUUID.anyNonNil(value) });

	let defaultImages: IImage[] = [];
	if (queryIds.length > 0) {
		defaultImages = await db.select().from(images).where(and(eq(images.userId, userId), inArray(images.id, queryIds)))
	}

	return {
		props: {},
	}
}

export default function CreatePost() {

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: '',
		},
	})


	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values)
	}

	return (
		<Main>
			<div className="flex w-full gap-8 xl:gap-10 flex-col xl:flex-row">

				<div className="flex-1 flex flex-col grow gap-4">

					<div className="w-full grow min-h-[500px] bg-secondary rounded-lg relative overflow-hidden p-4">
						<Image src={'/test-post.png'} alt="Post" fill={true} className="object-contain" />
					</div>
					<div className="w-full h-[120px] bg-secondary rounded-lg p-2 gap-2 flex">
						<div className="h-full aspect-square rounded-md relative overflow-hidden shrink-0">
							<Button className="absolute top-1 right-1 z-10 text rounded-full size-5" size={'icon'} variant={"secondary"}><IconX size={14} /></Button>
							<Image src={'/test-post.png'} alt="Post" fill={true} className="object-cover" />
						</div>
						<div className="h-full aspect-square rounded-md relative overflow-hidden shrink-0">
							<Button className="absolute top-1 right-1 z-10 text rounded-full size-5" size={'icon'} variant={"secondary"}><IconX size={14} /></Button>
							<Image src={'/test-post.png'} alt="Post" fill={true} className="object-cover" />
						</div>
						<div className="h-full aspect-square rounded-md relative overflow-hidden shrink-0">
							<Button className="absolute top-1 right-1 z-10 text rounded-full size-5" size={'icon'} variant={"secondary"}><IconX size={14} /></Button>
							<Image src={'/test-post.png'} alt="Post" fill={true} className="object-cover" />
						</div>
						<div className="h-full aspect-square rounded-md relative overflow-hidden shrink-0 bg-white flex items-center justify-center text-primary border-[3px] border-primary">
							<IconCirclePlus size={40} />
						</div>
					</div>

				</div>

				<div className="flex-1">
					<Form {...form} >
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input placeholder="Title" {...field} />
										</FormControl>
										<FormDescription>
											The title of your post.
										</FormDescription>
										<FormMessage />
									</FormItem>

								)}
							/>
							<FormField
								control={form.control}
								name="username"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea className="h-40 resize-none" placeholder="Insert your description..." {...field} />
										</FormControl>
										<FormDescription>
											Description for your post.
										</FormDescription>
										<FormMessage />
									</FormItem>

								)}
							/>
							<div className="w-full flex gap-4">
								<FormField
									control={form.control}
									name="username"
									render={({ field }) => (
										<FormItem className="flex-1 flex flex-col gap-2">
											<FormLabel className="flex gap-1">Anonymous post <Badge variant={"default"} className="flex gap-1 px-[2px] font-bold tracking-normal text-xs"><IconCrown size={14} /></Badge></FormLabel>
											<div className="flex gap-2 items-center">
												<FormControl>
													<Switch {...field} />
												</FormControl>
												<h3 className="text-sm ">Disabled</h3>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="username"
									render={({ field }) => (
										<FormItem className="flex-1 flex flex-col gap-2">
											<FormLabel className="flex gap-1">Hide prompt <Badge variant={"default"} className="flex gap-1 px-[2px] font-bold tracking-normal text-xs"><IconCrown size={14} /></Badge></FormLabel>
											<div className="flex gap-2 items-center">
												<FormControl>
													<Switch {...field} />
												</FormControl>
												<h3 className="text-sm ">Disabled</h3>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<div className="w-full flex justify-end">
								<Button size={'lg'} className="w-full lg:w-auto" type="submit">Submit</Button>
							</div>

						</form>
					</Form>
				</div>

			</div>
		</Main>
	);
}