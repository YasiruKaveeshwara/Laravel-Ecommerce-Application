"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";
import { useAuth } from "@/store/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { rememberProductSelection } from "@/lib/productSelection";
import { notifyError, notifyInfo } from "@/lib/notify";

const DATE_FILTERS = [
  { id: "all", label: "All time", days: null },
  { id: "7", label: "Last 7 days", days: 7 },
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "90", label: "Last 90 days", days: 90 },
];

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const fetchMe = useAuth((s) => s.fetchMe);
  const router = useRouter();

  useEffect(() => {
    fetchMe();
    const token = localStorage.getItem("token");
    api("/admin/products", { authToken: token })
      .then((res) => setItems(res.data || []))
      .catch((error: any) => {
        const message = error?.message || "Unable to load inventory";
        notifyError("Inventory fetch failed", message);
      })
      .finally(() => setLoading(false));
  }, [fetchMe]);

  const brandOptions = useMemo(() => {
    const unique = Array.from(new Set(items.map((p) => (p.brand || "").trim()).filter(Boolean)));
    return ["all", ...unique];
  }, [items]);

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(items.map((p) => (p.category || "").trim()).filter(Boolean)));
    return ["all", ...unique];
  }, [items]);

  const filteredItems = useMemo(() => {
    const now = Date.now();
    const selectedDateFilter = DATE_FILTERS.find((filter) => filter.id === dateFilter);
    const cutoff = selectedDateFilter?.days ? now - selectedDateFilter.days * 24 * 60 * 60 * 1000 : null;

    return items
      .filter((item) => {
        const term = search.trim().toLowerCase();
        const matchesSearch = term
          ? item.name.toLowerCase().includes(term) || (item.brand || "").toLowerCase().includes(term)
          : true;
        const matchesBrand = brandFilter === "all" || (item.brand || "").toLowerCase() === brandFilter.toLowerCase();
        const matchesCategory =
          categoryFilter === "all" || (item.category || "").toLowerCase() === categoryFilter.toLowerCase();
        const createdAt = item.created_at ? Date.parse(item.created_at) : null;
        const matchesDate = cutoff ? (createdAt ? createdAt >= cutoff : false) : true;
        return matchesSearch && matchesBrand && matchesCategory && matchesDate;
      })
      .sort((a, b) => {
        const dateA = a.created_at ? Date.parse(a.created_at) : 0;
        const dateB = b.created_at ? Date.parse(b.created_at) : 0;
        return dateB - dateA;
      });
  }, [items, search, brandFilter, categoryFilter, dateFilter]);

  const totalInventoryValue = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  }, [filteredItems]);

  const publishedThisMonth = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return items.filter((item) => (item.created_at ? Date.parse(item.created_at) >= cutoff : false)).length;
  }, [items]);

  const resetFilters = () => {
    setSearch("");
    setBrandFilter("all");
    setCategoryFilter("all");
    setDateFilter("all");
  };

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
          <Button variant='ghost' className='rounded-2xl border border-border px-4' onClick={resetFilters}>
            Reset filters
          </Button>
          <Link href='/admin/products/new'>
            <Button className='rounded-2xl px-5'>Add device</Button>
          </Link>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <SummaryTile label='Total devices' value={items.length.toString()} hint='Live in catalog' />
        <SummaryTile label='Published last 30 days' value={publishedThisMonth.toString()} hint='Recent launches' />
        <SummaryTile
          label='Inventory value'
          value={`$${totalInventoryValue.toFixed(2)}`}
          hint='Based on retail price'
        />
      </div>

      <section className='rounded-3xl border border-border bg-white/80 p-6 shadow-card backdrop-blur'>
        <div className='grid gap-4 md:grid-cols-4'>
          <div className='md:col-span-2 space-y-2'>
            <label className='text-sm font-medium text-slate-700'>Search</label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder='Search model or brand'
                className='pl-9'
              />
            </div>
          </div>
          <SelectField label='Brand' value={brandFilter} onChange={setBrandFilter} options={brandOptions} />
          <SelectField label='Category' value={categoryFilter} onChange={setCategoryFilter} options={categoryOptions} />
          <SelectField
            label='Added date'
            value={dateFilter}
            onChange={setDateFilter}
            options={DATE_FILTERS.map((filter) => filter.id)}
            labels={DATE_FILTERS.reduce<Record<string, string>>(
              (acc, filter) => ({ ...acc, [filter.id]: filter.label }),
              {}
            )}
          />
        </div>
        <div className='mt-4 text-sm text-muted'>
          Showing {filteredItems.length} of {items.length} products
        </div>
      </section>

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
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className='px-5 py-8 text-center text-muted'>
                  No products match these filters yet.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
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
                        <p className='text-xs text-muted'>SKU #{item.id}</p>
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
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  labels,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) {
  return (
    <div className='space-y-2'>
      <label className='text-sm font-medium text-slate-700'>{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className='w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100'>
        {options.map((option) => (
          <option key={option} value={option} className='capitalize'>
            {labels?.[option] || option.charAt(0).toUpperCase() + option.slice(1)}
          </option>
        ))}
      </select>
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
