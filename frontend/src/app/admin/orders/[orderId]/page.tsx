"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, RefreshCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import { handleError } from "@/lib/handleError";
import type { Order } from "@/types/order";
import { OrderDetailView } from "@/components/orders/OrderDetailView";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function AdminOrderDetailPage() {
	const params = useParams<{ orderId: string }>();
	const orderId = Array.isArray(params?.orderId) ? params.orderId[0] : params?.orderId;
	const router = useRouter();
	const user = useAuth((state) => state.user);
	const hydrate = useAuth((state) => state.hydrate);
	const initialized = useAuth((state) => state.initialized);

	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	const loadOrder = useCallback(async () => {
		if (!user || user.role !== "administrator" || !orderId) {
			setLoading(false);
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const response: Order = await api(`/admin/orders/${orderId}`);
			setOrder(response);
		} catch (err: unknown) {
			const fallback = "Unable to load this admin order.";
			const message = handleError(err, { title: "Order detail unavailable", fallbackMessage: fallback });
			setError(message);
		} finally {
			setLoading(false);
		}
	}, [user, orderId]);

	useEffect(() => {
		if (!initialized) {
			return;
		}
		if (!user || user.role !== "administrator") {
			setLoading(false);
			return;
		}
		loadOrder();
	}, [initialized, user, loadOrder]);

	if (!orderId) {
		return (
			<div className='mx-auto max-w-3xl px-4 py-20 text-center text-sm text-muted'>Order ID missing from URL.</div>
		);
	}

	if (!initialized) {
		return (
			<div className='mx-auto max-w-3xl px-4 py-20'>
				<LoadingScreen message='Loading admin context…' description='Verifying your permissions for this order.' />
			</div>
		);
	}

	if (!user || user.role !== "administrator") {
		return (
			<div className='mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-20 text-center'>
				<ShieldCheck className='h-10 w-10 text-slate-400' />
				<h1 className='text-2xl font-semibold text-slate-900'>Admin privileges required</h1>
				<Button onClick={() => router.push("/")}>Go home</Button>
			</div>
		);
	}

	const orderSummary = order
		? [
				{ label: "Status", value: statusLabel(order.status), hint: `Updated ${formatDate(order.updated_at)}` },
				{ label: "Items", value: itemCount(order).toString(), hint: "Nested SKUs" },
				{ label: "Total", value: formatCurrency(order.grand_total), hint: `Placed ${formatDate(order.created_at)}` },
		  ]
		: [];

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start gap-4'>
				<div>
					<p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Admin · Orders</p>
					<h1 className='text-3xl font-semibold text-slate-900'>Order workspace</h1>
					<p className='text-sm text-muted'>Detailed ledger view for #{formatOrderNumber(orderId)}</p>
				</div>
				<div className='ml-auto flex flex-wrap items-center gap-3'>
					<Button variant='ghost' className='rounded-2xl border border-border px-4' asChild>
						<Link href='/admin/orders'>
							<ArrowLeft className='mr-2 h-4 w-4' /> Back to list
						</Link>
					</Button>
					<Button variant='outline' className='rounded-2xl px-4' onClick={loadOrder} disabled={loading}>
						<RefreshCcw className='mr-2 h-4 w-4' /> Refresh data
					</Button>
				</div>
			</div>

			{loading ? (
				<LoadingScreen
					message='Loading order…'
					description='Pulling every line item and receipt detail.'
					className='bg-transparent shadow-none'
				/>
			) : error ? (
				<div className='rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-center text-sm text-rose-700'>
					{error}
				</div>
			) : order ? (
				<>
					<div className='grid gap-4 md:grid-cols-3'>
						{orderSummary.map((tile) => (
							<SummaryTile key={tile.label} label={tile.label} value={tile.value} hint={tile.hint} />
						))}
					</div>
					<OrderDetailView order={order} context='admin' />
				</>
			) : (
				<div className='rounded-3xl border border-border px-6 py-10 text-center text-sm text-muted'>
					Order not found.
				</div>
			)}
		</div>
	);
}

function SummaryTile({ label, value, hint }: { label: string; value: string; hint: string }) {
	return (
		<div className='rounded-3xl border border-border bg-white/80 p-5 shadow-card'>
			<p className='text-xs uppercase tracking-[0.3em] text-slate-500'>{label}</p>
			<p className='mt-2 text-2xl font-semibold text-slate-900'>{value}</p>
			<p className='text-xs text-muted'>{hint}</p>
		</div>
	);
}

function itemCount(order: Order | null) {
	if (!order?.items?.length) return 0;
	return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

function statusLabel(status?: string | null) {
	if (!status) return "Processing";
	return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatCurrency(value?: string | number | null) {
	const amount = Number(value ?? 0);
	return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
		Number.isFinite(amount) ? amount : 0
	);
}

function formatDate(value?: string | null) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatOrderNumber(id?: string | null) {
	if (!id) return "—";
	return id.slice(-6).toUpperCase();
}
