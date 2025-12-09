"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useRouter } from "next/navigation";
import { notifyInfo, notifySuccess } from "@/lib/notify";
import { Pencil, Trash2 } from "lucide-react";

type ProductDetailProps = {
	product: Product;
	context?: "storefront" | "admin";
	onAdminEdit?: () => void;
	onAdminDelete?: () => void;
};

export function ProductDetail({ product, context = "storefront", onAdminEdit, onAdminDelete }: ProductDetailProps) {
	const brandLabel = formatLabel(product.brand) ?? "Pulse";
	const [quantity, setQuantity] = useState(1);
	const addItem = useCart((state) => state.addItem);
	const router = useRouter();
	const priceValue = Number(product.price || 0);
	const subtotal = (priceValue * quantity || 0).toFixed(2);
	const isAdmin = context === "admin";

	const adjust = (delta: number) =>
		setQuantity((prev) => {
			const next = prev + delta;
			return Math.min(Math.max(next, 1), 10);
		});

	const handleAdd = () => {
		addItem(product, quantity);
		notifySuccess("Added to cart", `${product.name} ×${quantity}`);
	};

	const handleBuyNow = () => {
		addItem(product, quantity);
		notifyInfo("Redirecting to checkout", `${product.name} added to your cart.`);
		router.push("/checkout");
	};

	return (
		<section className='grid gap-6 lg:grid-cols-2 lg:items-stretch'>
			<div className='h-full rounded-3xl border border-border bg-white/90 p-6 shadow-card backdrop-blur'>
				<div className='flex h-full rounded-3xl border border-border bg-gradient-to-br from-slate-50 to-white shadow-card'>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={product.image_url || "/placeholder.svg"}
						alt={product.name}
						className='h-full w-full rounded-2xl object-cover'
					/>
				</div>
			</div>

			<div className='flex h-full flex-col space-y-5'>
				<div className='h-full rounded-3xl border border-border bg-white/90 p-6 shadow-card backdrop-blur'>
					<p className='text-xs font-semibold uppercase tracking-[0.35em] text-sky-500'>{brandLabel}</p>
					<h2 className='mt-2 text-4xl font-semibold leading-tight text-slate-900'>{product.name}</h2>
					<p className='mt-3 text-sm text-muted'>
						{product.description || "A flagship tuned for next-gen mobile life."}
					</p>
					<p className='mt-5 text-3xl font-semibold text-sky-600'>${priceValue.toFixed(2)}</p>

					<dl className='grid gap-4 mt-4 text-sm text-slate-600 sm:grid-cols-2'>
						<DetailItem label='Category' value={formatLabel(product.category) ?? "Unassigned"} />
						<DetailItem label='Brand' value={brandLabel} />

						{isAdmin && (
							<>
								<DetailItem label='Added' value={formatDate(product.created_at)} />
								<DetailItem label='Updated' value={formatDate(product.updated_at)} />
							</>
						)}
					</dl>
					{!isAdmin ? (
						<div className='mt-5 space-y-4'>
							<div className='flex items-center justify-between'>
								<span className='text-sm font-medium text-slate-600'>Quantity</span>
								<div className='flex items-center gap-3'>
									<button
										type='button'
										className='h-10 w-10 rounded-2xl border border-border text-lg font-semibold'
										onClick={() => adjust(-1)}
										aria-label='Decrease quantity'>
										−
									</button>
									<span className='w-8 text-center text-lg font-semibold text-slate-900'>{quantity}</span>
									<button
										type='button'
										className='h-10 w-10 rounded-2xl border border-border text-lg font-semibold'
										onClick={() => adjust(1)}
										aria-label='Increase quantity'>
										+
									</button>
								</div>
							</div>
							<p className='text-sm text-muted'>
								Subtotal: <span className='font-semibold text-slate-900'>${subtotal}</span>
							</p>
							<div className='grid gap-3 sm:grid-cols-2'>
								<Button className='w-full' onClick={handleAdd}>
									Add to cart
								</Button>
								<Button variant='outline' className='w-full' onClick={handleBuyNow}>
									Buy now
								</Button>
							</div>
						</div>
					) : (
						<div className='mt-5 grid gap-3 sm:grid-cols-2'>
							<Button type='button' className='rounded-2xl px-5' onClick={onAdminEdit}>
								<Pencil className='h-4 w-4 mr-2' /> Edit device
							</Button>
							<Button
								type='button'
								variant='outline'
								className='rounded-2xl border border-rose-200 px-5 text-rose-600'
								onClick={onAdminDelete}>
								<Trash2 className='h-4 w-4 mr-2' />
								Delete
							</Button>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}

function DetailItem({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>{label}</dt>
			<dd className='text-base font-semibold text-slate-900'>{value}</dd>
		</div>
	);
}

function formatDate(value?: string | null) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatLabel(value?: string | null) {
	if (!value) return undefined;
	return value.charAt(0).toUpperCase() + value.slice(1);
}
