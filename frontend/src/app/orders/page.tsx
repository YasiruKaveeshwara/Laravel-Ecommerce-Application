"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, Package, RefreshCcw, Sparkles, TicketPercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import { handleError } from "@/lib/handleError";
import type { Order, PaginatedResponse } from "@/types/order";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function OrdersPage() {
	const router = useRouter();
	const user = useAuth((state) => state.user);
	const hydrate = useAuth((state) => state.hydrate);
	const initialized = useAuth((state) => state.initialized);
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	const loadOrders = useCallback(async () => {
		if (!user) {
			setOrders([]);
			return;
		}
		setLoading(true);
		setErrorMessage(null);
		try {
			const response: PaginatedResponse<Order> = await api("/orders", { query: { per_page: 100 } });
			setOrders(response?.data || []);
		} catch (error: unknown) {
			const fallback = "Unable to load orders right now.";
			const message = handleError(error, { title: "Orders unavailable", fallbackMessage: fallback });
			setErrorMessage(message);
		} finally {
			setLoading(false);
		}
	}, [user?.id]);

	useEffect(() => {
		if (!initialized) {
			return;
		}
		if (!user) {
			setOrders([]);
			setLoading(false);
			return;
		}
		loadOrders();
	}, [initialized, user, loadOrders]);

	if (!initialized) {
		return (
			<div className='mx-auto max-w-3xl px-4 py-24'>
				<LoadingScreen message='Checking your account…' description='Making sure your profile and session are ready.' />
			</div>
		);
	}

	if (!user) {
		return (
			<div className='mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center'>
				<Sparkles className='h-10 w-10 text-slate-400' />
				<h1 className='text-3xl font-semibold text-slate-900'>Sign in to view your orders</h1>
				<p className='text-sm text-muted'>Track shipments, download receipts, and revisit product details.</p>
				<div className='flex flex-wrap justify-center gap-3'>
					<Button onClick={() => router.push("/login")}>Sign in</Button>
					<Button variant='outline' onClick={() => router.push("/signup")}>
						Create account
					</Button>
				</div>
			</div>
		);
	}

	const stats = useMemo(() => {
		if (!orders.length) {
			return {
				totalOrders: 0,
				totalSpend: 0,
				avgTicket: 0,
				lastOrder: null as string | null,
			};
		}
		const totalSpend = orders.reduce((sum, order) => sum + toNumber(order.grand_total), 0);
		const lastOrder = orders[0]?.created_at ?? orders[orders.length - 1]?.created_at ?? null;
		return {
			totalOrders: orders.length,
			totalSpend,
			avgTicket: totalSpend / orders.length,
			lastOrder,
		};
	}, [orders]);

	return (
		<div className='mx-auto max-w-6xl space-y-6 px-4 py-10'>
			<header className='rounded-3xl border border-border bg-white/80 p-6 shadow-card backdrop-blur'>
				<div className='flex flex-wrap items-center gap-4'>
					<div>
						<p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Orders</p>
						<h1 className='text-3xl font-semibold text-slate-900'>Delivery pulse</h1>
						<p className='text-sm text-muted'>Everything you have purchased from Pulse Mobile lives here.</p>
					</div>
					<div className='flex flex-wrap items-center gap-3 ml-auto'>
						<Button
							variant='ghost'
							className='rounded-2xl border border-border px-4'
							onClick={loadOrders}
							disabled={loading}>
							<RefreshCcw className='mr-2 h-4 w-4' /> Refresh
						</Button>
						<Button className='rounded-2xl px-5' asChild>
							<Link href='/products'>Shop more</Link>
						</Button>
					</div>
				</div>
			</header>

			<section className='grid gap-4 md:grid-cols-3'>
				<StatTile
					label='Orders placed'
					value={stats.totalOrders.toString()}
					hint='Lifetime orders with this account'
					icon={<Package className='h-4 w-4' />}
				/>
				<StatTile
					label='Lifetime spend'
					value={formatCurrency(stats.totalSpend)}
					hint='All confirmed charges'
					icon={<Sparkles className='h-4 w-4' />}
				/>
				<StatTile
					label='Avg. ticket'
					value={formatCurrency(stats.avgTicket)}
					hint='Average per order'
					icon={<TicketPercent className='h-4 w-4' />}
				/>
			</section>

			{errorMessage && (
				<div className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
					{errorMessage}
				</div>
			)}

			<section className='rounded-3xl border border-border bg-white p-6 shadow-card'>
				<div className='flex flex-wrap items-center gap-3 border-b border-border/80 pb-4'>
					<div>
						<h2 className='text-2xl font-semibold text-slate-900'>Timeline</h2>
						<p className='text-sm text-muted'>Newest orders first.</p>
					</div>
					<div className='ml-auto text-sm text-muted'>Last synced {new Date().toLocaleTimeString()}</div>
				</div>

				{loading ? (
					<LoadingScreen
						message='Syncing your orders'
						description='Grabbing the latest purchases and tracking updates.'
						className='border-none bg-transparent py-12 shadow-none'
					/>
				) : orders.length === 0 ? (
					<div className='py-16 text-center text-sm text-muted'>No orders yet. Start with our featured catalog.</div>
				) : (
					<ul className='divide-y divide-border'>
						{orders.map((order) => (
							<li key={order.id} className='py-5'>
								<OrderListRow order={order} />
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}

function StatTile({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: ReactNode }) {
	return (
		<div className='rounded-3xl border border-border bg-white/80 p-5 shadow-card'>
			<p className='text-xs uppercase tracking-[0.3em] text-slate-500'>{label}</p>
			<div className='mt-2 flex items-baseline gap-2'>
				<span className='text-2xl font-semibold text-slate-900'>{value}</span>
				<span className='text-slate-400'>{icon}</span>
			</div>
			<p className='text-xs text-muted'>{hint}</p>
		</div>
	);
}

function OrderListRow({ order }: { order: Order }) {
	const createdAt = formatDate(order.created_at);
	const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || order.items?.length || 0;
	const previewItem = order.items?.[0];

	return (
		<div className='flex flex-wrap items-center gap-4'>
			<div>
				<p className='text-sm font-semibold text-slate-900'>#{formatOrderNumber(order.id)}</p>
				<p className='text-xs text-muted'>{createdAt}</p>
			</div>
			<StatusBadge status={order.status} />
			<div className='min-w-[200px] flex-1 text-sm text-slate-600'>
				{previewItem ? (
					<p>
						{previewItem.product_name} {itemCount > 1 && <span className='text-muted'>+ {itemCount - 1} more</span>}
					</p>
				) : (
					<p className='text-muted'>Products bundled with this order.</p>
				)}
			</div>
			<div className='text-right text-sm font-semibold text-slate-900'>{formatCurrency(order.grand_total)}</div>
			<Button asChild variant='ghost' className='rounded-2xl px-3 text-slate-700 hover:text-sky-600'>
				<Link href={`/orders/${order.id}`}>
					View details <ArrowUpRight className='ml-2 h-4 w-4' />
				</Link>
			</Button>
		</div>
	);
}

function StatusBadge({ status }: { status?: string | null }) {
	const map: Record<string, { text: string; className: string }> = {
		processing: { text: "Processing", className: "border-amber-200 bg-amber-50 text-amber-700" },
		shipped: { text: "Shipped", className: "border-sky-200 bg-sky-50 text-sky-700" },
		delivered: { text: "Delivered", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
		cancelled: { text: "Cancelled", className: "border-rose-200 bg-rose-50 text-rose-700" },
	};
	const meta = (status && map[status]) || {
		text: "Processing",
		className: "border-slate-200 bg-slate-50 text-slate-700",
	};
	return (
		<span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${meta.className}`}>
			{meta.text}
		</span>
	);
}

function formatOrderNumber(id?: string) {
	if (!id) return "—";
	return id.slice(-6).toUpperCase();
}

function formatDate(value?: string | null) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(value?: string | number | null) {
	const amount = Number(value ?? 0);
	return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
		Number.isFinite(amount) ? amount : 0
	);
}

function toNumber(value?: string | number | null) {
	const amount = Number(value ?? 0);
	return Number.isFinite(amount) ? amount : 0;
}
