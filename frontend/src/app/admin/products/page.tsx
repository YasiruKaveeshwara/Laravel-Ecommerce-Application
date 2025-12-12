"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { api } from "@/lib/api";
import { normalizePaginatedResponse, summarizePagination } from "@/lib/pagination";
import type { Product } from "@/types/product";
import type { PaginatedResponse, PaginationMeta } from "@/types/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { rememberProductSelection } from "@/lib/productSelection";
import { notifySuccess } from "@/lib/notify";
import { handleError } from "@/lib/handleError";
import { BRAND_FILTER_OPTIONS, CATEGORY_FILTER_OPTIONS, type CatalogOption } from "@/constants/catalog";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { PaginationControls } from "@/components/PaginationControls";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { EditButton } from "@/components/EditButton";
import { DeleteButton } from "@/components/DeleteButton";

const DATE_FILTERS = [
	{ id: "all", label: "All time", days: null },
	{ id: "7", label: "Last 7 days", days: 7 },
	{ id: "30", label: "Last 30 days", days: 30 },
	{ id: "90", label: "Last 90 days", days: 90 },
];

const PER_PAGE = 20;

const currencyFormatter = new Intl.NumberFormat(undefined, {
	style: "currency",
	currency: "USD",
	minimumFractionDigits: 2,
});

const relativeTimeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

type AdminFilters = {
	search: string;
	brand: string;
	category: string;
	minPrice: string;
	maxPrice: string;
	date: string;
};

const createDefaultFilters = (): AdminFilters => ({
	search: "",
	brand: "all",
	category: "all",
	minPrice: "",
	maxPrice: "",
	date: "all",
});

export default function AdminProducts() {
	const [items, setItems] = useState<Product[]>([]);
	const [filters, setFilters] = useState<AdminFilters>(() => createDefaultFilters());
	const [appliedFilters, setAppliedFilters] = useState<AdminFilters>(() => createDefaultFilters());
	const appliedFiltersRef = useRef<AdminFilters>(appliedFilters);
	const [loading, setLoading] = useState(true);
	const [meta, setMeta] = useState<PaginationMeta | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [productPendingDelete, setProductPendingDelete] = useState<Product | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const router = useRouter();
	const guard = useRouteGuard({ requireAuth: true, requireRole: "administrator" });

	useEffect(() => {
		appliedFiltersRef.current = appliedFilters;
	}, [appliedFilters]);

	const loadProducts = useCallback(async (targetPage = 1, override?: AdminFilters) => {
		setLoading(true);
		setError(null);
		try {
			const token = localStorage.getItem("token");
			const activeFilters = override ?? appliedFiltersRef.current;
			const searchTerm = activeFilters.search.trim();
			const minPriceValue = Number.parseFloat(activeFilters.minPrice);
			const maxPriceValue = Number.parseFloat(activeFilters.maxPrice);
			const hasMin = Number.isFinite(minPriceValue);
			const hasMax = Number.isFinite(maxPriceValue);
			const dateRange = activeFilters.date !== "all" ? Number(activeFilters.date) : undefined;
			const response: PaginatedResponse<Product> | Record<string, unknown> = await api("/admin/products", {
				authToken: token,
				query: {
					page: targetPage,
					per_page: PER_PAGE,
					q: searchTerm || undefined,
					brand: activeFilters.brand !== "all" ? activeFilters.brand : undefined,
					category: activeFilters.category !== "all" ? activeFilters.category : undefined,
					min_price: hasMin ? minPriceValue : undefined,
					max_price: hasMax ? maxPriceValue : undefined,
					added_within_days: dateRange && Number.isFinite(dateRange) ? dateRange : undefined,
				},
			});
			const normalized = normalizePaginatedResponse<Product>(response);
			setItems(normalized.items);
			setMeta(normalized.meta);
		} catch (err: unknown) {
			const fallback = "Unable to load inventory.";
			const message = handleError(err, { title: "Inventory fetch failed", fallbackMessage: fallback });
			setError(message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadProducts(1);
	}, [loadProducts]);

	if (guard.pending) {
		return (
			<div className='mx-auto max-w-3xl px-4 py-24'>
				<LoadingScreen
					message='Checking access'
					description='Verifying your administrator session.'
					className='border-none bg-transparent shadow-none'
				/>
			</div>
		);
	}

	if (!guard.allowed) {
		return null;
	}

	const totalInventoryValue = useMemo(() => {
		return items.reduce((sum, item) => sum + Number(item.price || 0), 0);
	}, [items]);

	const totalInventoryValueDisplay = useMemo(() => formatCurrency(totalInventoryValue), [totalInventoryValue]);

	const uniqueBrandsCount = useMemo(() => {
		const brands = new Set(
			items.map((item) => item.brand?.trim().toLowerCase()).filter((brand): brand is string => Boolean(brand))
		);
		return brands.size;
	}, [items]);

	const premiumCount = useMemo(() => {
		return items.filter((item) => Number(item.price ?? 0) >= 1000).length;
	}, [items]);

	const publishedThisMonth = useMemo(() => {
		const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
		return items.filter((item) => (item.created_at ? Date.parse(item.created_at) >= cutoff : false)).length;
	}, [items]);

	const paginationSummary = useMemo(
		() => summarizePagination(meta, { fallbackCount: items.length, pageSize: PER_PAGE }),
		[meta, items.length]
	);

	const paginationCopy = paginationSummary.hasResults
		? `Showing ${paginationSummary.from}-${paginationSummary.to} of ${paginationSummary.total} products`
		: "Showing 0 products";
	const paginationPositionCopy = `Page ${paginationSummary.currentPage} of ${paginationSummary.lastPage}`;

	const handleApplyFilters = () => {
		const next = { ...filters };
		setAppliedFilters(next);
		loadProducts(1, next);
	};

	const resetFilters = () => {
		const next = createDefaultFilters();
		setFilters(next);
		setAppliedFilters(next);
		loadProducts(1, next);
	};

	const filtersDirty = useMemo(() => {
		return (
			filters.search !== appliedFilters.search ||
			filters.brand !== appliedFilters.brand ||
			filters.category !== appliedFilters.category ||
			filters.minPrice !== appliedFilters.minPrice ||
			filters.maxPrice !== appliedFilters.maxPrice ||
			filters.date !== appliedFilters.date
		);
	}, [filters, appliedFilters]);

	const openDetail = (product: Product) => {
		rememberProductSelection(product, "admin");
		router.push("/admin/products/view");
	};

	const openEditor = (product: Product) => {
		rememberProductSelection(product, "admin");
		router.push("/admin/products/edit");
	};

	const requestDelete = (product: Product) => {
		setProductPendingDelete(product);
	};

	const closeDeleteDialog = () => setProductPendingDelete(null);

	const performDelete = async () => {
		if (!productPendingDelete) return;
		setDeleteLoading(true);
		const currentPage = meta?.current_page ?? 1;
		try {
			await api(`/admin/products/${productPendingDelete.id}`, { method: "DELETE" });
			setItems((prev) => prev.filter((item) => item.id !== productPendingDelete.id));
			notifySuccess("Device deleted", `${productPendingDelete.name} was removed from inventory.`);
			setProductPendingDelete(null);
			loadProducts(currentPage);
		} catch (err) {
			handleError(err, { title: "Delete failed", fallbackMessage: "Unable to remove device." });
		} finally {
			setDeleteLoading(false);
		}
	};

	const emptyStateLoading = loading && items.length === 0;

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start gap-4'>
				<div>
					<p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Inventory</p>
					<h1 className='text-3xl font-semibold text-slate-900'>Device catalog</h1>
					<p className='text-sm text-muted'>Monitor launches, forecast stock, and act quickly.</p>
				</div>
				<div className='ml-auto flex items-center gap-3'>
					<Link href='/admin/products/new'>
						<Button className='rounded-2xl px-5'>Add device</Button>
					</Link>
				</div>
			</div>

			<div className='grid gap-4 md:grid-cols-3'>
				<SummaryTile label='Total devices' value={(meta?.total ?? items.length).toString()} hint='Live in catalog' />
				<SummaryTile label='Published last 30 days' value={publishedThisMonth.toString()} hint='Recent launches' />
				<SummaryTile label='Inventory value' value={totalInventoryValueDisplay} hint='Based on retail price' />
			</div>

			<section className='rounded-3xl border border-border bg-white/80 p-6 shadow-card backdrop-blur'>
				<div className='grid gap-4 md:grid-cols-4'>
					<div className='space-y-2 md:col-span-2'>
						<label className='text-sm font-medium text-slate-700'>Search</label>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
							<Input
								value={filters.search}
								onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
								placeholder='Search model or brand'
								className='pl-9'
							/>
						</div>
					</div>
					<SelectField
						label='Brand'
						value={filters.brand}
						onChange={(next) => setFilters((prev) => ({ ...prev, brand: next }))}
						options={BRAND_FILTER_OPTIONS}
					/>
					<SelectField
						label='Category'
						value={filters.category}
						onChange={(next) => setFilters((prev) => ({ ...prev, category: next }))}
						options={CATEGORY_FILTER_OPTIONS}
					/>
					<SelectField
						label='Added date'
						value={filters.date}
						onChange={(next) => setFilters((prev) => ({ ...prev, date: next }))}
						options={DATE_FILTERS.map((filter) => ({ id: filter.id, label: filter.label }))}
					/>
					<NumberField
						label='Min price'
						value={filters.minPrice}
						placeholder='0'
						onChange={(value) => setFilters((prev) => ({ ...prev, minPrice: value }))}
					/>
					<NumberField
						label='Max price'
						value={filters.maxPrice}
						placeholder='5000'
						onChange={(value) => setFilters((prev) => ({ ...prev, maxPrice: value }))}
					/>
					<div className='flex items-end justify-end gap-3'>
						<Button variant='ghost' className='rounded-2xl border border-border px-4' onClick={resetFilters}>
							Reset filters
						</Button>
						<Button className='rounded-2xl px-6' onClick={handleApplyFilters} disabled={!filtersDirty}>
							Apply filters
						</Button>
					</div>
				</div>
				<div className='mt-4 text-sm text-muted'>
					{paginationCopy} · {paginationPositionCopy}
				</div>
			</section>

			{error && (
				<div className='rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>{error}</div>
			)}

			<div className='rounded-3xl border border-border bg-gradient-to-b from-white via-white to-slate-50 shadow-card'>
				{emptyStateLoading ? (
					<LoadingScreen
						message='Syncing inventory…'
						description='Pulling devices, filters, and pricing insights.'
						className='border-none bg-transparent shadow-none'
					/>
				) : (
					<>
						<div className='overflow-x-auto px-2 pb-2'>
							<table className='w-full border-separate border-spacing-y-3 text-sm text-slate-600'>
								<thead className='text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500'>
									<tr>
										<th className='px-5 py-2 text-left'>Product</th>
										<th className='px-5 py-2 text-left'>Brand</th>
										<th className='px-5 py-2 text-left'>Category</th>
										<th className='px-5 py-2 text-left'>Price</th>
										<th className='px-5 py-2 text-left'>Added</th>
										<th className='px-5 py-2 text-right'>Actions</th>
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr>
											<td colSpan={6} className='rounded-3xl bg-white/80 px-5 py-10 text-center text-muted'>
												<LoadingScreen
													message='Loading products…'
													description='Fetching devices from your inventory.'
													className='border-none bg-transparent shadow-none'
												/>
											</td>
										</tr>
									) : items.length === 0 ? (
										<tr>
											<td colSpan={6} className='rounded-3xl bg-white/80 px-5 py-10 text-center text-muted'>
												No products match these filters yet.
											</td>
										</tr>
									) : (
										items.map((item) => {
											const relativeAdded = formatRelativeTime(item.created_at);
											const priceDisplay = formatCurrency(item.price);
											return (
												<tr
													key={item.id}
													className='align-middle rounded-3xl border border-border/70 bg-white/90 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-xl cursor-pointer'
													onClick={() => openDetail(item)}
													onKeyDown={(event) => {
														if (event.key === "Enter" || event.key === " ") {
															event.preventDefault();
															openDetail(item);
														}
													}}
													tabIndex={0}
													role='button'>
													<td className='px-5 py-2 align-middle first:rounded-l-3xl'>
														<div className='flex items-center gap-4'>
															<div className='relative'>
																<ProductImage
																	src={item.image_url}
																	alt={item.name}
																	className='h-16 w-16 shadow-lg ring-1 ring-slate-100'
																	rounded='rounded-2xl'
																/>
															</div>
															<div>
																<p className='font-semibold text-slate-900'>{item.name}</p>
															</div>
														</div>
													</td>
													<td className='px-5 py-4 align-middle'>
														<span className='inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600'>
															{item.brand || "Unbranded"}
														</span>
													</td>
													<td className='px-5 py-4 align-middle'>
														<span className='inline-flex rounded-2xl bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700 ring-1 ring-slate-200'>
															{item.category || "Uncategorized"}
														</span>
													</td>
													<td className='px-5 py-2 align-middle'>
														<p className='text-base font-semibold text-slate-900'>{priceDisplay}</p>
													</td>
													<td className='px-5 py-2 align-middle text-slate-600'>
														<p>{formatDate(item.created_at)}</p>
														{relativeAdded && <p className='text-xs font-semibold text-emerald-600'>{relativeAdded}</p>}
													</td>
													<td className='px-5 py-4 align-middle text-right'>
														<div className='flex flex-wrap justify-end gap-2'>
															<EditButton
																className='rounded-full'
																label='Edit device'
																onClick={(event) => {
																	event.stopPropagation();
																	openEditor(item);
																}}
															/>
															<DeleteButton
																variant='outline'
																size='sm'
																label='Delete device'
																className='rounded-full'
																onClick={(event) => {
																	event.stopPropagation();
																	requestDelete(item);
																}}
															/>
														</div>
													</td>
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>

						<PaginationControls
							meta={meta}
							itemsCount={items.length}
							pageSize={PER_PAGE}
							loading={loading}
							entityLabel='products'
							onPageChange={(page) => loadProducts(page)}
						/>
					</>
				)}
			</div>
			<ConfirmDialog
				open={Boolean(productPendingDelete)}
				title='Delete device?'
				description='This permanently removes the device from the admin catalog and customer storefront.'
				confirmLabel='Delete device'
				cancelLabel='Keep device'
				confirmTone='danger'
				confirmLoading={deleteLoading}
				onCancel={closeDeleteDialog}
				onConfirm={performDelete}
				disableOutsideClose={deleteLoading}>
				{productPendingDelete && (
					<div className='rounded-2xl bg-rose-50 p-4 text-sm text-rose-700'>
						<p className='font-semibold text-rose-900'>{productPendingDelete.name}</p>
						<p>
							{productPendingDelete.brand && (
								<span className='font-medium text-rose-800'>{productPendingDelete.brand}</span>
							)}
							{productPendingDelete.brand && <span className='mx-1 text-rose-500'>•</span>}
							{formatCurrency(productPendingDelete.price)}
						</p>
					</div>
				)}
			</ConfirmDialog>
		</div>
	);
}

function SelectField({
	label,
	value,
	onChange,
	options,
}: {
	label: string;
	value: string;
	onChange: (next: string) => void;
	options: CatalogOption[];
}) {
	return (
		<div className='space-y-2'>
			<label className='text-sm font-medium text-slate-700'>{label}</label>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className='w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100'>
				{options.map((option) => (
					<option key={option.id} value={option.id} className='capitalize'>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}

function NumberField({
	label,
	value,
	placeholder,
	onChange,
}: {
	label: string;
	value: string;
	placeholder?: string;
	onChange: (next: string) => void;
}) {
	return (
		<div className='space-y-2'>
			<label className='text-sm font-medium text-slate-700'>{label}</label>
			<Input
				type='number'
				inputMode='decimal'
				min='0'
				step='50'
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				className='rounded-2xl'
			/>
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

function formatCurrency(value?: string | number | null) {
	const numericValue = Number(value ?? 0);
	return currencyFormatter.format(Number.isFinite(numericValue) ? numericValue : 0);
}

function formatDate(value?: string | null) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatRelativeTime(value?: string | null) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const diffMs = Date.now() - date.getTime();
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;
	const month = 30 * day;

	if (Math.abs(diffMs) < minute) {
		return "just now";
	}
	if (Math.abs(diffMs) < hour) {
		const minutes = Math.round(diffMs / minute) || 1;
		return relativeTimeFormatter.format(-minutes, "minute");
	}
	if (Math.abs(diffMs) < day) {
		const hours = Math.round(diffMs / hour) || 1;
		return relativeTimeFormatter.format(-hours, "hour");
	}
	if (Math.abs(diffMs) < month) {
		const days = Math.round(diffMs / day) || 1;
		return relativeTimeFormatter.format(-days, "day");
	}
	const months = Math.round(diffMs / month) || 1;
	return relativeTimeFormatter.format(-months, "month");
}
