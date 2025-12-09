"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { normalizePaginatedResponse } from "@/lib/pagination";
import type { Product } from "@/types/product";
import type { PaginatedResponse, PaginationMeta } from "@/types/pagination";
import { useAuth } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { rememberProductSelection } from "@/lib/productSelection";
import { notifyError, notifyInfo } from "@/lib/notify";
import { BRAND_FILTER_OPTIONS, CATEGORY_FILTER_OPTIONS, type CatalogOption } from "@/constants/catalog";

const DATE_FILTERS = [
  { id: "all", label: "All time", days: null },
  { id: "7", label: "Last 7 days", days: 7 },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "Last 90 days", days: 90 },
];

const PER_PAGE = 20;

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
  const fetchMe = useAuth((s) => s.fetchMe);
  const router = useRouter();

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
    } catch (err: any) {
      const message = err?.message || "Unable to load inventory";
      setError(message);
      notifyError("Inventory fetch failed", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  const totalInventoryValue = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [items]);

  const publishedThisMonth = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return items.filter((item) => (item.created_at ? Date.parse(item.created_at) >= cutoff : false)).length;
  }, [items]);

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
        <SummaryTile
          label='Inventory value'
          value={`$${totalInventoryValue.toFixed(2)}`}
          hint='Based on retail price'
        />
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
          <div className='flex flex-wrap items-end justify-end gap-3 md:col-span-2'>
            <Button variant='ghost' className='rounded-2xl border border-border px-4' onClick={resetFilters}>
              Reset filters
            </Button>
            <Button className='rounded-2xl px-6' onClick={handleApplyFilters} disabled={!filtersDirty}>
              Apply filters
            </Button>
          </div>
        </div>
        <div className='mt-4 text-sm text-muted'>
          Showing {items.length} products · Page {meta?.current_page ?? 1} of {meta?.last_page ?? 1}
        </div>
      </section>

      {error && (
        <div className='rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>{error}</div>
      )}

      <div className='overflow-hidden rounded-3xl border border-border bg-white shadow-card'>
        <table className='w-full text-left text-sm'>
          <thead className='bg-slate-50 text-slate-500'>
            <tr>
              <th className='px-5 py-3 font-medium'>Product</th>
              <th className='px-5 py-3 font-medium'>Brand</th>
              <th className='px-5 py-3 font-medium'>Category</th>
              <th className='px-5 py-3 font-medium'>Price</th>
              <th className='px-5 py-3 font-medium'>Added</th>
              <th className='px-5 py-3 font-medium text-right'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className='px-5 py-8 text-center text-muted'>
                  Loading inventory...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className='px-5 py-8 text-center text-muted'>
                  No products match these filters yet.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className='border-t border-border/80'>
                  <td className='px-5 py-4'>
                    <div className='flex items-center gap-4'>
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className='h-14 w-14 rounded-2xl object-cover shadow-sm'
                      />
                      <div>
                        <p className='font-semibold text-slate-900'>{item.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-5 py-4 text-slate-600'>{item.brand || "—"}</td>
                  <td className='px-5 py-4'>
                    <span className='rounded-full bg-slate-50 px-3 py-1 text-xs font-medium capitalize text-slate-600'>
                      {item.category || "—"}
                    </span>
                  </td>
                  <td className='px-5 py-4 font-semibold text-slate-900'>${Number(item.price || 0).toFixed(2)}</td>
                  <td className='px-5 py-4 text-slate-600'>{formatDate(item.created_at)}</td>
                  <td className='px-5 py-4 text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='border border-border text-slate-700 hover:bg-slate-50'
                        onClick={() => openDetail(item)}>
                        View
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='text-slate-600'
                        onClick={() => notifyInfo("Device editing", "This workflow ships soon.")}>
                        Edit
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => notifyInfo("Archive coming soon", "Bulk delete will land shortly.")}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {meta?.last_page && meta.last_page > 1 && (
          <div className='flex flex-wrap items-center justify-between gap-3 border-t border-border/80 bg-slate-50/60 px-5 py-4 text-sm text-muted'>
            <span>
              Showing {meta.from ?? 0}-{meta.to ?? items.length} of {meta.total ?? items.length} products
            </span>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                type='button'
                disabled={(meta.current_page ?? 1) <= 1 || loading}
                onClick={() => loadProducts(Math.max((meta?.current_page ?? 1) - 1, 1))}>
                Previous
              </Button>
              <span className='text-xs text-slate-500'>
                Page {meta.current_page ?? 1} of {meta.last_page}
              </span>
              <Button
                variant='outline'
                size='sm'
                type='button'
                disabled={!meta.last_page || (meta.current_page ?? 1) >= meta.last_page || loading}
                onClick={() =>
                  loadProducts(
                    meta?.last_page
                      ? Math.min((meta?.current_page ?? 1) + 1, meta.last_page)
                      : (meta?.current_page ?? 1) + 1
                  )
                }>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
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

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
