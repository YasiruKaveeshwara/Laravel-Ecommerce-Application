"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notifyInfo, notifySuccess, notifyWarning } from "@/lib/notify";
import { ProductImage } from "@/components/ProductImage";

export default function CartPage() {
	const router = useRouter();
	const items = useCart((state) => state.items);
	const updateQuantity = useCart((state) => state.updateQuantity);
	const removeItem = useCart((state) => state.removeItem);

	const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
	const shipping = 0;
	const tax = 0;
	const total = subtotal + shipping + tax;
	const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

	if (!items.length) {
		return (
			<div className='mx-auto flex max-w-3xl flex-col items-center gap-4 py-20 text-center'>
				<p className='text-2xl font-semibold text-slate-900'>Your bag is empty</p>
				<p className='text-sm text-muted'>Add a device to your cart to see it appear here.</p>
				<Button onClick={() => router.push("/")}>Browse devices</Button>
			</div>
		);
	}

	return (
		<div className='mx-auto grid gap-8 lg:grid-cols-[1.2fr,0.8fr]'>
			<header className='rounded-3xl backdrop-blur'>
				<p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Cart</p>
				<h1 className='text-3xl font-semibold text-slate-900'>Ready to check out?</h1>
				<p className='text-sm text-muted'>Update quantities or remove items before heading to checkout.</p>
			</header>
			<div className='grid gap-6 lg:grid-cols-2'>
				<section className='space-y-4'>
					<div className='space-y-4'>
						{items.map((item) => (
							<article
								key={item.product.id}
								className='flex flex-col gap-3 rounded-3xl border border-border bg-white/90 p-4 shadow-card sm:flex-row sm:items-center'>
								<ProductImage
									src={item.product.image_url}
									alt={item.product.name}
									className='h-24 w-24'
									rounded='rounded-2xl'
								/>
								<div className='flex flex-1 flex-col gap-3'>
									<div>
										<p className='text-sm font-semibold uppercase tracking-[0.3em] text-sky-500'>
											{item.product.brand}
										</p>
										<h2 className='text-xl font-semibold text-slate-900'>{item.product.name}</h2>
										<p className='text-sm text-muted line-clamp-2'>{item.product.description}</p>
									</div>
									<div className='flex flex-wrap items-center gap-3'>
										<QuantityInput
											value={item.quantity}
											onChange={(next) => {
												if (next === item.quantity) return;
												updateQuantity(item.product.id, next);
												notifySuccess("Quantity updated", `${item.product.name} ×${next}`);
											}}
										/>
										<span className='ml-auto text-lg font-semibold text-slate-900'>
											${(item.unitPrice * item.quantity).toFixed(2)}
										</span>
										<Button
											type='button'
											variant='ghost'
											className='text-rose-600'
											onClick={() => {
												removeItem(item.product.id);
												notifyWarning("Removed from cart", item.product.name);
											}}>
											<Trash2 className='h-4 w-4' />
											Remove
										</Button>
									</div>
								</div>
							</article>
						))}
					</div>
				</section>

				<section className='rounded-3xl border border-border bg-white/90 p-6 shadow-card lg:sticky lg:top-4 lg:self-start'>
					<h3 className='text-lg font-semibold text-slate-900'>Summary</h3>
					<ul className='mt-3 space-y-3 text-sm text-slate-700'>
						{items.map((item) => (
							<li key={item.product.id} className='flex items-start gap-3'>
								<span className='rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700'>
									×{item.quantity}
								</span>
								<div className='flex-1 space-y-0.5'>
									<p className='font-semibold text-slate-900'>{item.product.name}</p>
									<p className='text-xs text-muted line-clamp-1'>{item.product.brand}</p>
								</div>
								<span className='text-sm font-semibold text-slate-900'>
									{formatCurrency(item.unitPrice * item.quantity)}
								</span>
							</li>
						))}
					</ul>
					<dl className='mt-6 space-y-2 text-sm text-slate-600'>
						<SummaryRow label={`Items (${totalItems})`} value={formatCurrency(subtotal)} />
						<SummaryRow label='Shipping' value={shipping === 0 ? "Free" : formatCurrency(shipping)} />
						<SummaryRow label='Tax' value={formatCurrency(tax)} />
					</dl>
					<div className='mt-4 border-t border-border pt-4'>
						<div className='flex items-center justify-between text-base font-semibold text-slate-900'>
							<span>Total</span>
							<span>{formatCurrency(total)}</span>
						</div>
					</div>
					<Button
						className='mt-4 w-full'
						onClick={() => {
							notifyInfo("Heading to checkout", "Review shipping and payment next.");
							router.push("/checkout");
						}}>
						Proceed to checkout
					</Button>
				</section>
			</div>
		</div>
	);
}

function QuantityInput({ value, onChange }: { value: number; onChange: (next: number) => void }) {
	const clamp = (next: number) => Math.min(Math.max(next, 1), 10);
	return (
		<div className='flex items-center gap-3 rounded-2xl border border-border px-3 py-1'>
			<button type='button' className='text-lg' onClick={() => onChange(clamp(value - 1))} aria-label='Decrease'>
				−
			</button>
			<Input
				type='number'
				value={value}
				min={1}
				max={10}
				onChange={(event) => onChange(clamp(Number(event.target.value)))}
				className='h-8 w-12 border-none text-center text-sm'
			/>
			<button type='button' className='text-lg' onClick={() => onChange(clamp(value + 1))} aria-label='Increase'>
				+
			</button>
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

function formatCurrency(value: number) {
	return new Intl.NumberFormat(undefined, {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
	}).format(value);
}
