import Main from "@/components/layout/Main";
import { fetchData } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { APIResponse } from "./api/payments/get-premium-price";
import { APIResponse as CheckoutAPIResponse } from "./api/payments/create-checkout-session";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/router";

export default function Home() {

	const router = useRouter();
	const session = useSession();
	const userIsPremium = session.data?.user.premium ?? false;

	const { data, isPending, isError } = useQuery({
		queryKey: ['premium-price'],
		queryFn: () => {
			return fetchData('/api/payments/get-premium-price') as Promise<APIResponse>;
		}
	});

	const price = data?.status === 'success' ? data.data.price : null;

	const { mutate: checkoutMutation } = useMutation<CheckoutAPIResponse>({
		mutationFn: async () => {
			return fetchData('/api/payments/create-checkout-session', {});
		},
		onError(error, variables, context) {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			const url = data.status === 'success' ? data.data.url : '';
			router.push(url);
		}
	})

	const { mutate: portalMutation } = useMutation<CheckoutAPIResponse>({
		mutationFn: async () => {
			return fetchData('/api/payments/create-portal-session', {});
		},
		onError(error, variables, context) {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data, variables, context) {
			const url = data.status === 'success' ? data.data.url : '';
			router.push(url);
		}
	})

	return (
		<Main>
			{
				!isPending && !isError &&
				<span>{price}</span>
			}
			<Button disabled={userIsPremium} onClick={() => { checkoutMutation() }}>Subscribe</Button>
			{
				userIsPremium && <Button onClick={() => { portalMutation() }}>Manage subscription</Button>
			}
		</Main>
	);
}
