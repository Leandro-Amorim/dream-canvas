import { useRouter } from "next/router";
import PriceCard from "./PriceCard";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchData } from "@/lib/utils";
import { APIResponse } from "@/pages/api/payments/get-premium-price";
import { APIResponse as CheckoutAPIResponse } from "@/pages/api/payments/create-checkout-session";
import { toast } from "sonner";
export default function PricingSection() {

	const router = useRouter();
	const session = useSession();
	const authenticated = session.status === 'authenticated';
	const userIsPremium = session.data?.user.premium ?? false;

	const { data, isPending, isError } = useQuery({
		queryKey: ['premium-price'],
		queryFn: () => {
			return fetchData('/api/payments/get-premium-price') as Promise<APIResponse>;
		}
	});
	const price = data?.status === 'success' ? (data.data.price ?? 0) / 100 : 0;

	const { mutate: checkoutMutation, isPending: checkoutPending, isError: checkoutError } = useMutation<CheckoutAPIResponse>({
		mutationFn: async () => {
			return fetchData('/api/payments/create-checkout-session', {});
		},
		onError() {
			toast.error('There was an error processing this action', {
				description: 'Please try again later.'
			})
		},
		onSuccess(data) {
			const url = data.status === 'success' ? data.data.url : '';
			router.push(url);
		}
	})


	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.3
			}
		}
	}

	return (
		<motion.div className="w-full container" id="pricing" variants={container} initial="hidden" whileInView={"show"} viewport={{ amount: "some" }}>
			<h1 className="text-5xl font-bold text-center mt-28">Choose the best plan for <span className="text-primary">you.</span></h1>
			<motion.div className="w-full flex justify-around pt-28 flex-col lg:flex-row gap-8 mb-8">
				<PriceCard data={
					{
						title: 'Anonymous',
						price: { amount: 0, loading: false },
						features: [
							`${process.env.NEXT_PUBLIC_DAILY_FREE_IP_GENERATIONS} free generations per day`,
							'Access to free models and modifiers',
							'Generated pictures are posted anonymously',
							'Subject to free queue being full and server limits',
							'No sign-up required',
						],
						button: { exists: false }
					}
				} />
				<PriceCard data={
					{
						title: 'Free',
						price: { amount: 0, loading: false },
						features: [
							`${process.env.NEXT_PUBLIC_DAILY_FREE_USER_GENERATIONS} free generations per day`,
							`${process.env.NEXT_PUBLIC_DAILY_PREMIUM_CREDITS} premium credits per day`,
							'Access to free models and modifiers',
							'Generated pictures are posted anonymously',
							'Subject to free queue being full and server limits'
						],
						button: {
							exists: true,
							enabled: !authenticated,
							handler: () => {
								router.push('/signin');
							}
						}
					}
				} />
				<PriceCard data={
					{
						title: 'Premium',
						price: { amount: price, loading: isPending || isError },
						features: [
							'Unlimited generations per day',
							'Access to premium models and modifiers',
							'Generated pictures are private',
							'Ability to hide image prompt on posts',
						],
						button: {
							exists: true,
							enabled: !userIsPremium,
							loading: checkoutPending || checkoutError,
							handler: () => {
								if (!authenticated) {
									router.push('/signin');
								} else {
									checkoutMutation();
								}
							}
						}
					}
				} />
			</motion.div>
		</motion.div>

	)
}