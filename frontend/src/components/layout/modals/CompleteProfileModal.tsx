import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchDataForm } from "@/lib/utils";
import { IconLoader2, IconPhotoPlus, IconUser, IconX } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ZodError, z } from "zod";

export default function CompleteProfileModal() {

	const session = useSession();
	const userId = session.data?.user.id ?? null;

	const open = useMemo(() => {
		if (userId === null) { return false; }
		const signupCompleted = session.data?.user.signupCompleted ?? false;
		return !signupCompleted;
	}, [userId, session.data?.user]);

	const [form, setForm] = useState({
		image: undefined as undefined | null | File,
		coverImage: undefined as undefined | null | File,
		name: '',
		description: '',
	});

	useEffect(() => {
		setForm((prev) => {
			return {
				...prev,
				name: session.data?.user.name ?? '',
				description: session.data?.user.description ?? '',
			}
		})
	}, [session.data?.user]);

	const imageInputRef = useRef<HTMLInputElement>(null);
	const coverImageInputRef = useRef<HTMLInputElement>(null);

	const imageUrl = useMemo(() => {
		if (form.image === null) { return undefined; }
		return form.image !== undefined ? URL.createObjectURL(form.image) : session.data?.user.image ?? '';
	}, [form.image, session]);

	const coverImageUrl = useMemo(() => {
		if (form.coverImage === null) { return undefined; }
		return form.coverImage !== undefined ? URL.createObjectURL(form.coverImage) : session.data?.user.coverImage ?? '';
	}, [form.coverImage, session]);

	const nameLength = useMemo(() => {
		return form.name.length;
	}, [form.name]);

	const descriptionLength = useMemo(() => {
		return form.description.length;
	}, [form.description]);

	const validateForm = useCallback(() => {

		const imageSchema = z.custom<File>(file => file instanceof File, 'The selected file is not a valid image.')
			.refine(
				file => ['image/jpg', 'image/jpeg', 'image/png'].includes(file?.type),
				'The selected file is not a valid image.'
			)
			.refine(file => file?.size <= 2 * 1024 * 1024, "The image size must be less than 2MB.").optional().nullable();

		const schema = z.object({
			name: z.string().min(3, 'Name must contain at least 3 characters.').max(32, 'Name must contain at most 32 characters.'),
			description: z.string().max(150, 'Description must contain at most 150 characters.').optional(),
			image: imageSchema,
			coverImage: imageSchema,
		});
		try {
			schema.parse(form);
			return true;
		}
		catch (error) {
			if (error instanceof ZodError) {
				for (const err of error.issues) {
					toast.error(err.message);
				}
			}
			return false;
		}
	}, [form]);

	const { mutate: profileMutation, isPending: profilePending } = useMutation({
		mutationFn: async () => {
			return fetchDataForm('/api/profiles/update', form);
		},
		onError() {
			toast.error('There was an error updating your profile', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			toast.success('Profile updated successfully', {
				description: 'Your profile has been updated successfully.'
			});
			session.update({});
		}
	})

	const onSubmit = useCallback(() => {
		const valid = validateForm();
		if (valid) {
			profileMutation();
		}
	}, [validateForm, profileMutation])

	return (
		<Dialog open={open}>
			<DialogContent className="w-full max-w-[1000px] rounded-lg gap-0 pb-6 max-h-full overflow-auto" hideCloseButton={true}>
				<DialogHeader>
					<DialogTitle className="font-medium text-lg line-clamp-1 mb-2">Complete profile</DialogTitle>
				</DialogHeader>

				<Card className="overflow-hidden">
					<input ref={imageInputRef} type="file" hidden name="image" accept="image/*" onChange={(e) => { setForm({ ...form, image: e.target.files?.[0] }) }} />
					<input ref={coverImageInputRef} type="file" hidden name="coverImage" accept="image/*" onChange={(e) => { setForm({ ...form, coverImage: e.target.files?.[0] }) }} />
					<CardContent className="p-0">
						<div className="w-full flex flex-col items-center overflow-hidden relative pb-4 ">
							<div className="w-full h-[180px] absolute bg-secondary/90">
								{
									coverImageUrl && <Image src={coverImageUrl} alt="Cover image" fill={true} className="object-cover" />
								}
								<div className="absolute right-1 top-1 flex gap-1">
									<Button variant="default" size="icon" className="size-7"
										onClick={() => { coverImageInputRef.current?.click() }}
									><IconPhotoPlus size={16} /></Button>
									<Button variant="destructive" size="icon" className="size-7"
										onClick={() => { setForm({ ...form, coverImage: null }) }}
									><IconX size={16} /></Button>
								</div>
							</div>
							<div className="w-full max-w-[600px] mt-20 shrink-0 flex z-[1]">
								<div className="flex-1 px-2 flex flex-col items-center min-w-[190px] text-center">
									<Avatar className="size-[150px] shrink-0 border shadow-md">
										<AvatarImage className="object-cover" src={imageUrl} alt={'User'} />
										<AvatarFallback><IconUser size={80} className="text-gray-600" /></AvatarFallback>
									</Avatar>
									<div className="size-[150px] absolute">
										<Button variant="default" size="icon" className="rounded-full absolute top-2 right-2 size-7"
											onClick={() => { imageInputRef.current?.click() }}
										><IconPhotoPlus size={16} /></Button>
										<Button variant="destructive" size="icon" className="rounded-full absolute top-10 -right-2 size-7"
											onClick={() => { setForm({ ...form, image: null }) }}
										><IconX size={16} /></Button>
									</div>
								</div>
							</div>
						</div>
						<div className="w-full px-4 pb-6 flex flex-col gap-4">
							<div>
								<Label htmlFor="name">Display name</Label>
								<Input maxLength={32} className="mt-2" id="name" placeholder="Insert a display name..."
									value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
								<span className={`text-xs ${nameLength > 32 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>{nameLength}/32</span>
							</div>
							<div>
								<Label htmlFor="name">Description</Label>
								<Textarea maxLength={150} className="mt-2 h-40 resize-none" placeholder="Insert a description..."
									value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
								<span className={`text-xs ${descriptionLength > 150 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>{descriptionLength}/150</span>
							</div>

						</div>
					</CardContent>
				</Card>

				<DialogFooter className="pt-4 flex justify-end">
					<Button size={'lg'} disabled={profilePending} className="flex items-center gap-2" onClick={() => { onSubmit() }}>
						{
							profilePending && <IconLoader2 className="animate-spin size-5" />
						}
						Save</Button>
				</DialogFooter>

			</DialogContent>
		</Dialog >
	)
}