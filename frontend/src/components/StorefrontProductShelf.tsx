"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/components/ProductGallery";
import { api } from "@/lib/api";
import { normalizePaginatedResponse } from "@/lib/pagination";
import type { Product } from "@/types/product";
import type { PaginationMeta } from "@/types/pagination";
import type { StorefrontFilters } from "@/types/storefront";

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
  const canGoPrev = currentPage > 1;
  const canGoNext = lastPage ? currentPage < lastPage : false;
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
      } catch (err: any) {
        const message = err?.message || "Unable to load more products.";
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

  const rangeLabel = useMemo(() => {
    if (!meta) {
      return `Showing ${items.length} items`;
    }
    const from = meta.from ?? (currentPage - 1) * perPage + 1;
    const to = meta.to ?? from + items.length - 1;
    return `Showing ${from}-${to} of ${meta.total ?? items.length} devices`;
  }, [meta, items.length, currentPage, perPage]);

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

      {meta?.last_page && meta.last_page > 1 && (
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-white/70 px-4 py-3 text-sm text-muted'>
          <span>{rangeLabel}</span>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              className='rounded-2xl px-4'
              disabled={!canGoPrev || loading}
              onClick={() => fetchPage(currentPage - 1)}>
              Previous
            </Button>
            <span className='text-xs text-muted'>
              Page {currentPage} of {meta.last_page}
            </span>
            <Button
              type='button'
              variant='outline'
              className='rounded-2xl px-4'
              disabled={!canGoNext || loading}
              onClick={() => fetchPage(currentPage + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
