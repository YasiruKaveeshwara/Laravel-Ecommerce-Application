import { Mail, MapPin, PackageCheck, Phone, User, Truck } from "lucide-react";
import type { ComponentType } from "react";
import type { Order, OrderItem } from "@/types/order";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
	string,
	{ label: string; badge: string; description: string; icon: ComponentType<{ className?: string }> }
> = {
	processing: {
		label: "Processing",
		badge: "border-amber-200 bg-amber-50 text-amber-700",
		description: "We are confirming payment details and preparing your products.",
		icon: PackageCheck,
	},
	shipped: {
		label: "Shipped",
		badge: "border-sky-200 bg-sky-50 text-sky-700",
		description: "The package left our warehouse and is on the way to you.",
		icon: Truck,
	},
	delivered: {
		label: "Delivered",
		badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
		description: "Order delivered successfully. Reach out if anything feels off.",
		icon: PackageCheck,
	},
	cancelled: {
		label: "Cancelled",
		badge: "border-rose-200 bg-rose-50 text-rose-700",
		description: "This order was cancelled. Chat with support if this is unexpected.",
		icon: PackageCheck,
	},
};

const DEFAULT_STATUS = {
	label: "Processing",
	badge: "border-slate-200 bg-slate-50 text-slate-700",
	description: "We are getting everything staged.",
	icon: PackageCheck,
};

export function OrderDetailView({ order, context = "customer" }: { order: Order; context?: "customer" | "admin" }) {
	const items = order.items ?? [];
	const statusMeta = STATUS_META[order.status || ""] || DEFAULT_STATUS;
	const placedOn = formatDate(order.created_at);
	const customerName = `${order.first_name} ${order.last_name}`.trim();
	const orderCode = formatOrderNumber(order.id);
	const timeline = buildTimeline(order);

	return (
		<div className='space-y-6 mt-6'>
			<section className='rounded-3xl border border-border bg-white p-6 shadow-card'>
				<div className='flex flex-wrap items-start gap-4'>
					<div>
						<p className='text-xs font-semibold uppercase tracking-[0.4em] text-slate-500'>Order</p>
						<h1 className='text-3xl font-semibold leading-tight text-slate-900'>#{orderCode}</h1>
						<p className='text-sm text-muted'>Placed {placedOn}</p>
					</div>
					<div className='flex flex-wrap items-center gap-3 ml-auto'>
						<span
							className={cn(
								"inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold",
								statusMeta.badge
							)}>
							<statusMeta.icon className='h-4 w-4' />
							{statusMeta.label}
						</span>
						<div className='rounded-2xl bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800'>
							Total {formatCurrency(order.grand_total)}
						</div>
					</div>
				</div>
				<p className='mt-3 text-sm text-slate-600'>{statusMeta.description}</p>
				<div className='mt-5 grid gap-3 md:grid-cols-3'>
					{timeline.map((step, index) => (
						<div
							key={step.label}
							className={cn(
								"rounded-2xl border border-border/70 px-4 py-3 text-sm",
								step.completed ? "bg-slate-50" : "bg-white"
							)}>
							<p className='mt-1 font-semibold text-slate-900'>{step.label}</p>
							<p className='text-xs text-muted'>{step.caption}</p>
						</div>
					))}
				</div>
			</section>

			<div className='grid gap-6 lg:grid-cols-[1.5fr,1fr]'>
				<section className='rounded-3xl border border-border bg-white p-6 shadow-card'>
					<header className='flex flex-wrap items-center gap-2 border-b border-border/80 pb-4'>
						<div>
							<p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Items</p>
							<h2 className='text-2xl font-semibold text-slate-900'>Fulfillment list</h2>
						</div>
						<span className='ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600'>
							{items.length} products
						</span>
					</header>

					<ul className='divide-y divide-border/80'>
						{items.map((item) => (
							<LineItem key={item.id} item={item} />
						))}
					</ul>
				</section>

				<aside className='space-y-6'>
					<section className='rounded-3xl border border-border bg-white p-6 shadow-card'>
						<h3 className='text-base font-semibold text-slate-900'>Shipping</h3>
						<div className='mt-4 space-y-3 text-sm text-slate-600'>
							<div className='flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3'>
								<MapPin className='h-5 w-5 text-slate-500' />
								<div>
									<p className='font-semibold text-slate-900'>{customerName || "Customer"}</p>
									<p className='text-xs text-slate-500 uppercase tracking-[0.3em]'>Ship to</p>
								</div>
							</div>
							<address className='not-italic leading-relaxed text-slate-700'>{formatAddress(order)}</address>
							<p className='flex items-center gap-2'>
								<Mail className='h-4 w-4 text-slate-400' />
								<a href={`mailto:${order.email}`} className='text-sky-600 hover:underline'>
									{order.email}
								</a>
							</p>
							{order.phone && (
								<p className='flex items-center gap-2'>
									<Phone className='h-4 w-4 text-slate-400' />
									<a href={`tel:${order.phone}`} className='text-slate-700 hover:text-slate-900'>
										{order.phone}
									</a>
								</p>
							)}
						</div>
					</section>

					{context === "admin" && order.user && (
						<section className='rounded-3xl border border-border bg-white p-6 shadow-card'>
							<h3 className='text-base font-semibold text-slate-900'>Account</h3>
							<div className='mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3'>
								<div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600'>
									<User className='h-5 w-5' />
								</div>
								<div className='text-sm'>
									<p className='font-semibold text-slate-900'>
										{(order.user.first_name || "") + " " + (order.user.last_name || "")}
									</p>
									<p className='text-xs text-muted'>#{order.user.id}</p>
								</div>
							</div>
							<p className='mt-4 text-sm text-slate-600'>
								Admins can cross-reference this order with the user profile inside the customer console.
							</p>
						</section>
					)}

					<section className='rounded-3xl border border-border bg-white p-6 shadow-card'>
						<h3 className='text-base font-semibold text-slate-900'>Totals</h3>
						<dl className='mt-4 space-y-3 text-sm text-slate-600'>
							<SummaryRow label='Subtotal' value={formatCurrency(order.subtotal)} />
							<SummaryRow label='Shipping' value={formatCurrency(order.shipping_total)} />
							<SummaryRow label='Tax' value={formatCurrency(order.tax_total)} />
						</dl>
						<div className='mt-4 rounded-2xl bg-slate-50 px-4 py-3'>
							<div className='flex items-center justify-between text-base font-semibold text-slate-900'>
								<span>Total paid</span>
								<span>{formatCurrency(order.grand_total)}</span>
							</div>
							<p className='text-xs text-muted'>Authorized on {placedOn}</p>
						</div>
					</section>
				</aside>
			</div>
		</div>
	);
}

function LineItem({ item }: { item: OrderItem }) {
	const snapshot = item.product_snapshot;
	const image = snapshot?.image_url || "/placeholder.svg";
	return (
		<li className='flex flex-wrap items-center gap-4 py-4'>
			<div className='h-16 w-16 overflow-hidden rounded-2xl bg-slate-100'>
				<img src={image} alt={item.product_name || "Product"} className='h-full w-full object-cover' />
			</div>
			<div className='flex-1 min-w-[200px]'>
				<p className='text-sm font-semibold text-slate-900'>{item.product_name}</p>
				{item.product_brand && <p className='text-xs text-muted'>{item.product_brand}</p>}
				<p className='text-xs text-muted'>Qty {item.quantity}</p>
			</div>
			<div className='text-right text-sm text-slate-700'>
				<p>{formatCurrency(item.unit_price)}</p>
				<p className='text-xs text-muted'>Line {formatCurrency(item.line_total || item.unit_price)}</p>
			</div>
		</li>
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

function buildTimeline(order: Order) {
	const base = [
		{
			label: "Order placed",
			caption: formatDate(order.created_at),
			completed: true,
		},
		{
			label: "Processing",
			caption: "Packaging and QA",
			completed: order.status !== "processing",
		},
		{
			label: "Ready to ship",
			caption: order.status === "delivered" ? "Delivered" : "Awaiting carrier",
			completed: order.status === "shipped" || order.status === "delivered",
		},
	];
	if (order.status === "cancelled") {
		base[1] = {
			label: "Cancelled",
			caption: "Order stopped",
			completed: false,
		};
		base[2] = {
			label: "Closed",
			caption: "No fulfillment",
			completed: false,
		};
	}
	return base;
}

function formatOrderNumber(id: string) {
	if (!id) return "—";
	return id.slice(-6).toUpperCase();
}

function formatDate(value?: string | null) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatAddress(order: Order) {
	const cityState = [order.city, order.state].filter(Boolean).join(", ");
	return [order.address1, order.address2, cityState, order.postal_code, order.country].filter(Boolean).join("\n");
}

function formatCurrency(value: string | number | undefined | null) {
	const amount = Number(value ?? 0);
	return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
		Number.isFinite(amount) ? amount : 0
	);
}
