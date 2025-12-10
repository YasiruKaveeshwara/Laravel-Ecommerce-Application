"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { ProductGallery } from "@/components/ProductGallery";
import { api } from "@/lib/api";
import { normalizePaginatedResponse } from "@/lib/pagination";
import { handleError } from "@/lib/handleError";
import type { Product } from "@/types/product";
import type { PaginationMeta } from "@/types/pagination";
import type { StorefrontFilters } from "@/types/storefront";
import { PaginationControls } from "@/components/PaginationControls";

interface StorefrontProductShelfProps {
	initialItems: Product[];
	initialMeta: PaginationMeta | null;
	perPage: number;
	searchTerm?: string | null;
	filters: StorefrontFilters;
}

export function StorefrontProductShelf({
	initialItems,
	initialMeta,
	perPage,
	searchTerm,
	filters,
}: StorefrontProductShelfProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [items, setItems] = useState<Product[]>(initialItems);
	const [meta, setMeta] = useState<PaginationMeta | null>(initialMeta);
	const [page, setPage] = useState<number>(initialMeta?.current_page ?? 1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const currentPage = meta?.current_page ?? page;
	const lastPage = meta?.last_page ?? currentPage;
	const filterSignature = JSON.stringify(filters);
	const initialFilterSignature = useRef(filterSignature);

	const fetchPage = useCallback(
		async (targetPage: number, options?: { force?: boolean }) => {
			if (!options?.force && (targetPage < 1 || targetPage === currentPage || (lastPage && targetPage > lastPage))) {
				return;
			}

			setLoading(true);
			setError(null);
			try {
				const [minPrice, maxPrice] = filters.price;
				const keyword = filters.search?.trim() || searchTerm || undefined;
				const response = await api("/products", {
					query: {
						q: keyword,
						page: targetPage,
						per_page: perPage,
						min_price: minPrice,
						max_price: maxPrice,
						category: filters.category !== "all" ? filters.category : undefined,
						brand: filters.brand !== "all" ? filters.brand : undefined,
					},
				});
				const normalized = normalizePaginatedResponse<Product>(response);
				setItems(normalized.items);
				setMeta(normalized.meta);
				setPage(normalized.meta?.current_page ?? targetPage);
				if (containerRef.current) {
					containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
				} else {
					window.scrollTo({ top: 0, behavior: "smooth" });
				}
			} catch (err: unknown) {
				const fallback = "Unable to load more products.";
				const message = handleError(err, { title: "Catalog unavailable", fallbackMessage: fallback });
				setError(message);
			} finally {
				setLoading(false);
			}
		},
		[currentPage, lastPage, perPage, searchTerm, filters]
	);

	useEffect(() => {
		if (filterSignature === initialFilterSignature.current) {
			return;
		}
		initialFilterSignature.current = filterSignature;
		fetchPage(1, { force: true });
	}, [filterSignature, fetchPage]);

	return (
		<div ref={containerRef} className='space-y-4'>
			{error && (
				<div className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>{error}</div>
			)}

			{loading && (
				<div className='flex items-center gap-2 text-sm text-muted'>
					<Loader2 className='h-4 w-4 animate-spin' /> Loading products…
				</div>
			)}

			<ProductGallery products={items} scope='storefront' />

			<PaginationControls
				meta={meta}
				itemsCount={items.length}
				pageSize={perPage}
				loading={loading}
				entityLabel='devices'
				className='rounded-2xl border border-border/80 bg-white/70 px-4 py-3 text-muted'
				onPageChange={(page) => fetchPage(page)}
			/>
		</div>
	);
}
