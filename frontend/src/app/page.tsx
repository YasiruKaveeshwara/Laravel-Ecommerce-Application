// src/app/page.tsx
import { FiltersPanel } from "@/components/FiltersPanel";
import { HeroBanner } from "@/components/HeroBanner";
import { api } from "@/lib/api";
import { normalizePaginatedResponse } from "@/lib/pagination";
import { StorefrontProductShelf } from "@/components/StorefrontProductShelf";
import type { Product } from "@/types/product";
import type { PaginatedResponse, PaginationMeta } from "@/types/pagination";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PRODUCTS_PER_PAGE = 12;

type SearchParams = {
  q?: string;
  page?: string | number;
};

const parsePageParam = (value?: string | number | null) => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
  }
  return 1;
};

async function getProducts(searchParams: SearchParams) {
  const data: PaginatedResponse<Product> | Record<string, unknown> = await api("/products", {
    query: {
      q: searchParams.q || undefined,
      page: searchParams.page || 1,
      per_page: PRODUCTS_PER_PAGE,
    },
  });
  return data; // Laravel paginator JSON (expects { data: Product[], ... })
}

export default async function Home({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  // Normalize search params (handle string[] from URL if any)
  const q = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const page = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const requestedPage = parsePageParam(page);

  const data = await getProducts({ q, page: requestedPage });
  const normalized = normalizePaginatedResponse<Product>(data);
  const items: Product[] = normalized.items;
  const meta: PaginationMeta | null = normalized.meta;

  return (
    <div>
      <HeroBanner />

      <section className='mx-auto py-10'>
        {/* Responsive two-column: filters (left) + content (right) */}
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
          {/* Filters: left rail (sticky on large screens) */}
          <aside className='lg:col-span-3'>
            <div className='lg:sticky lg:top-20'>
              <FiltersPanel />
            </div>
          </aside>

          {/* Products: right content */}
          <div className='space-y-4 lg:col-span-9'>
            <header className='space-y-1'>
              <h2 className='text-2xl font-semibold'>Trending smartphones</h2>
              <p className='text-sm text-muted'>Curated 5G flagships, foldables, and budget wins refreshed daily.</p>
            </header>

            <StorefrontProductShelf
              initialItems={items}
              initialMeta={meta}
              perPage={PRODUCTS_PER_PAGE}
              searchTerm={q}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
