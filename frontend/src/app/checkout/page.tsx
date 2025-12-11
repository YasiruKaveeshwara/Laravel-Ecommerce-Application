"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dismissToast, notifyLoading, notifySuccess, notifyWarning } from "@/lib/notify";
import { api } from "@/lib/api";
import { handleError } from "@/lib/handleError";
import { useAuth } from "@/store/auth";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function CheckoutPage() {
	const router = useRouter();
	const [isPlacingOrder, setIsPlacingOrder] = useState(false);
	const items = useCart((state) => state.items);
	const clearCart = useCart((state) => state.clearCart);
	const user = useAuth((state) => state.user);
	const hydrate = useAuth((state) => state.hydrate);
	const initialized = useAuth((state) => state.initialized);
	const [formDefaults, setFormDefaults] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		address1: "",
		address2: "",
		city: "",
		state: "",
		zip: "",
		country: "",
	});

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	useEffect(() => {
		if (user) {
			setFormDefaults((prev) => ({
				...prev,
				firstName: user.first_name || prev.firstName,
				lastName: user.last_name || prev.lastName,
				email: user.email || prev.email,
			}));
		}
	}, [user]);

	const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
	const shipping = subtotal > 0 ? 15 : 0;
	const taxes = subtotal * 0.08;
	const total = subtotal + shipping + taxes;

	if (!initialized) {
		return (
			<div className='mx-auto max-w-3xl px-4 py-20'>
				<LoadingScreen message='Preparing checkout…' description='Verifying your session and cart.' />
			</div>
		);
	}

	if (!items.length) {
		return (
			<div className='mx-auto flex max-w-3xl flex-col items-center gap-4 py-20 text-center'>
				<p className='text-2xl font-semibold text-slate-900'>There is nothing to checkout.</p>
				<p className='text-sm text-muted'>Add products to your cart before starting the checkout flow.</p>
				<Button onClick={() => router.push("/")}>Browse catalog</Button>
			</div>
		);
	}

	if (!user) {
		return (
			<div className='mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-20 text-center'>
				<p className='text-2xl font-semibold text-slate-900'>Sign in to complete checkout</p>
				<p className='text-sm text-muted'>Orders are linked to your account so you can track them later.</p>
				<div className='flex gap-3'>
					<Button onClick={() => router.push("/login?next=/checkout")}>Sign in</Button>
					<Button variant='outline' onClick={() => router.push("/signup")}>
						Create account
					</Button>
				</div>
			</div>
		);
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isPlacingOrder) return;

		const form = event.currentTarget;
		const formData = new FormData(form);
		const toValue = (key: string) => (formData.get(key) ?? "").toString().trim();
		const roundCurrency = (value: number) => Number(value.toFixed(2));

		if (!user) {
			notifyWarning("Sign in required", "Please sign in to place your order.");
			router.push("/login?next=/checkout");
			return;
		}

		const payload = {
			first_name: toValue("firstName"),
			last_name: toValue("lastName"),
			email: toValue("email"),
			phone: toValue("phone"),
			address1: toValue("address1"),
			address2: toValue("address2"),
			city: toValue("city"),
			state: toValue("state"),
			postal_code: toValue("zip"),
			country: toValue("country"),
			subtotal: roundCurrency(subtotal),
			tax_total: roundCurrency(taxes),
			shipping_total: roundCurrency(shipping),
			grand_total: roundCurrency(total),
			items: items.map((item) => ({
				product_id: item.product.id,
				quantity: item.quantity,
				unit_price: roundCurrency(item.unitPrice),
			})),
		};

		setIsPlacingOrder(true);
		const toastId = notifyLoading("Processing payment…", "Hold tight while we confirm your order.");

		try {
			await api("/orders", { method: "POST", body: payload });
			clearCart();
			form.reset();
			notifySuccess("Order placed!", "We just sent a confirmation email.");
			router.push("/?order=success");
		} catch (error: unknown) {
			handleError(error, { title: "Payment failed", fallbackMessage: "Please try again." });
		} finally {
			dismissToast(toastId);
			setIsPlacingOrder(false);
		}
	};

	return (
		<div className='mx-auto '>
			<header className='rounded-3xl '>
				<p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Checkout</p>
				<h1 className='text-3xl font-semibold text-slate-900'>Secure payment</h1>
				<p className='text-sm text-muted'>Enter your shipping and payment details below to finish your purchase.</p>
			</header>
			<form className='space-y-6 mt-6' onSubmit={handleSubmit}>
				<section className='rounded-3xl border border-border bg-white/90 p-6 shadow-card'>
					<h2 className='text-lg font-semibold text-slate-900'>Shipping details</h2>
					<div className='mt-4 grid gap-4 md:grid-cols-2'>
						<Input name='firstName' placeholder='First name' defaultValue={formDefaults.firstName} required />
						<Input name='lastName' placeholder='Last name' defaultValue={formDefaults.lastName} required />
						<Input name='email' type='email' placeholder='Email address' defaultValue={formDefaults.email} required />
						<Input name='phone' type='tel' placeholder='Phone number' defaultValue={formDefaults.phone} required />
						<Input name='address1' placeholder='Street address' defaultValue={formDefaults.address1} required />
						<Input
							name='address2'
							placeholder='Apartment, suite, etc. (optional)'
							defaultValue={formDefaults.address2}
						/>
						<Input name='city' placeholder='City' defaultValue={formDefaults.city} required />
						<Input name='state' placeholder='State/Province' defaultValue={formDefaults.state} required />
						<Input name='zip' placeholder='ZIP / Postal code' defaultValue={formDefaults.zip} required />
						<Input name='country' placeholder='Country' defaultValue={formDefaults.country} required />
					</div>
					<h2 className='text-lg font-semibold mt-6 text-slate-900'>Payment</h2>
					<div className='mt-4 grid gap-4'>
						<div className='grid gap-4 md:grid-cols-2'>
							<Input name='cardName' placeholder='Name on card' required />
							<Input name='cardNumber' placeholder='Card number' inputMode='numeric' pattern='[0-9 ]*' required />
							<Input name='expiry' placeholder='MM/YY' required />
							<Input name='cvc' placeholder='CVC' inputMode='numeric' maxLength={4} required />
						</div>
					</div>
					<label className='mt-4 flex items-start gap-2 text-sm text-slate-600'>
						<input type='checkbox' required className='mt-1' />
						<span>
							I agree to the{" "}
							<Link href='/terms' className='text-sky-600 underline'>
								terms and conditions
							</Link>
							.
						</span>
					</label>
					<Button type='submit' className='mt-6 w-full' disabled={isPlacingOrder}>
						{isPlacingOrder ? "Processing…" : "Place order"}
					</Button>
					<p className='mt-2 text-center text-xs text-muted' aria-live='polite'>
						Payments are securely processed. You will receive a confirmation email.
					</p>
				</section>
			</form>
		</div>
	);
}

function SummaryRow({ label, value }: { label: string; value: string }) {
	return (
		<div className='flex items-center justify-between'>
			<span>{label}</span>
			<span className='font-semibold text-slate-900'>{value}</span>
		</div>
	);
}
