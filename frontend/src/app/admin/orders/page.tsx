"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowUpRight, Loader2, PackageSearch, RefreshCcw, Search, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { handleError } from "@/lib/handleError";
import type { Order, PaginatedResponse, PaginationMeta } from "@/types/order";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useRouteGuard } from "@/lib/useRouteGuard";

export default function AdminOrdersPage() {
	const guard = useRouteGuard({ requireAuth: true, requireRole: "administrator" });
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [activeSearch, setActiveSearch] = useState("");
	const [orders, setOrders] = useState<Order[]>([]);
	const [meta, setMeta] = useState<PaginationMeta | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const id = setTimeout(() => setActiveSearch(search.trim()), 400);
		return () => clearTimeout(id);
	}, [search]);

	const loadOrders = useCallback(
		async (queryOverride?: string) => {
			setLoading(true);
			setError(null);
			try {
				const searchTerm = (queryOverride ?? activeSearch)?.trim() || undefined;
				const response: PaginatedResponse<Order> = await api("/admin/orders", {
					query: {
						per_page: 50,
						q: searchTerm,
					},
				});
				setOrders(response?.data || []);
				setMeta(response?.meta || null);
			} catch (err: unknown) {
				const fallback = "Unable to load admin orders.";
				const message = handleError(err, { title: "Admin orders unavailable", fallbackMessage: fallback });
				setError(message);
			} finally {
				setLoading(false);
			}
		},
		[activeSearch]
	);

	useEffect(() => {
		if (guard.pending || !guard.allowed) return;
		loadOrders();
	}, [guard.pending, guard.allowed, loadOrders]);

	const resetFilters = () => {
		setSearch("");
		setActiveSearch("");
		loadOrders("");
	};

	const stats = useMemo(() => {
		if (!orders.length) {
			return { total: 0, processing: 0, revenue: 0 };
		}
		const total = orders.length;
		const processing = orders.filter((order) => order.status === "processing").length;
		const revenue = orders.reduce((sum, order) => sum + toNumber(order.grand_total), 0);
		return { total, processing, revenue };
	}, [orders]);

	if (guard.pending) {
		return (
			<div className='mx-auto max-w-3xl px-4 py-24'>
				<LoadingScreen message='Checking access' description='Verifying your administrator session.' />
			</div>
		);
	}

	if (!guard.allowed) return null;

	const emptyStateLoading = loading && orders.length === 0;

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start gap-4'>
				<div>
					<p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Admin · Orders</p>
					<h1 className='text-3xl font-semibold text-slate-900'>Operations board</h1>
					<p className='text-sm text-muted'>Keep fulfillment, customer receipts, and revenue aligned.</p>
				</div>
				<div className='ml-auto flex flex-wrap items-center gap-3'>
					<Button
						variant='ghost'
						className='rounded-2xl border border-border px-4'
						type='button'
						onClick={resetFilters}
						disabled={loading}>
						Reset filters
					</Button>
					<Button className='rounded-2xl px-5' type='button' onClick={() => loadOrders()} disabled={loading}>
						<RefreshCcw className='mr-2 h-4 w-4' /> Refresh list
					</Button>
				</div>
			</div>

			<div className='grid gap-4 md:grid-cols-3'>
				<AdminStat
					label='Orders captured'
					value={meta?.total?.toString() ?? stats.total.toString()}
					hint='In current view'
					icon={<PackageSearch className='h-4 w-4' />}
				/>
				<AdminStat
					label='Processing today'
					value={stats.processing.toString()}
					hint='Awaiting fulfillment'
					icon={<Truck className='h-4 w-4' />}
				/>
				<AdminStat
					label='Revenue (view)'
					value={formatCurrency(stats.revenue)}
					hint='Sum of listed orders'
					icon={<ArrowUpRight className='h-4 w-4' />}
				/>
			</div>

			<section className='rounded-3xl border border-border bg-white/80 p-6 shadow-card'>
				<form
					className='flex flex-wrap items-center gap-3 border-b border-border/80 pb-4'
					onSubmit={(event) => {
						event.preventDefault();
						loadOrders(search.trim());
					}}>
					<div className='relative flex-1 min-w-[220px]'>
						<Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
						<Input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder='Search by name or email'
							className='pl-9'
						/>
					</div>
					<Button type='submit' className='rounded-2xl px-4' disabled={loading}>
						Apply
					</Button>
				</form>

				{error && (
					<div className='mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
						{error}

						<p className='mt-4 text-sm text-muted'>
							Showing {orders.length} of {meta?.total ?? orders.length} orders
						</p>
					</div>
				)}

				{emptyStateLoading ? (
					<LoadingScreen
						message='Syncing orders…'
						description='Pulling the freshest operations data from the server.'
						className='mt-6 bg-white'
					/>
				) : (
					<div className='mt-6 overflow-hidden rounded-3xl border border-border'>
						<table className='w-full text-left text-sm'>
							<thead className='bg-slate-50 text-slate-500'>
								<tr>
									<th className='px-5 py-3 font-medium'>Order</th>
									<th className='px-5 py-3 font-medium'>Customer</th>
									<th className='px-5 py-3 font-medium'>Total</th>
									<th className='px-5 py-3 font-medium'>Status</th>
									<th className='px-5 py-3 font-medium'>Placed</th>
									<th className='px-5 py-3 font-medium text-right'>Action</th>
								</tr>
							</thead>
							<tbody>
								{loading && orders.length > 0 ? (
									<tr>
										<td colSpan={6} className='px-5 py-10 text-center text-muted'>
											<Loader2 className='mr-2 inline h-4 w-4 animate-spin' /> Syncing orders…
										</td>
									</tr>
								) : orders.length === 0 ? (
									<tr>
										<td colSpan={6} className='px-5 py-10 text-center text-muted'>
											No orders match this filter.
										</td>
									</tr>
								) : (
									orders.map((order) => (
										<tr key={order.id} className='border-t border-border/80'>
											<td className='px-5 py-4 text-slate-900 font-semibold'>#{formatOrderNumber(order.id)}</td>
											<td className='px-5 py-4 text-slate-600'>
												<div className='font-semibold text-slate-900'>
													{order.first_name} {order.last_name}
												</div>
												<div className='text-xs text-muted'>{order.email}</div>
											</td>
											<td className='px-5 py-4 font-semibold text-slate-900'>{formatCurrency(order.grand_total)}</td>
											<td className='px-5 py-4'>
												<StatusBadge status={order.status} />
											</td>
											<td className='px-5 py-4 text-slate-600'>{formatDate(order.created_at)}</td>
											<td className='px-5 py-4 text-right'>
												<Button asChild variant='ghost' className='rounded-2xl px-3 text-slate-700 hover:text-sky-600'>
													<Link href={`/admin/orders/${order.id}`}>
														Inspect <ArrowUpRight className='ml-2 h-4 w-4' />
													</Link>
												</Button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</div>
	);
}

function AdminStat({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: ReactNode }) {
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
