// src/app/page.tsx
import { FiltersPanel } from "@/components/FiltersPanel";
import { HeroBanner } from "@/components/HeroBanner";
import { ProductGallery } from "@/components/ProductGallery";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";

type SearchParams = {
  q?: string;
  page?: string;
};

async function getProducts(searchParams: SearchParams) {
  const data = await api("/products", {
    query: {
      q: searchParams.q || undefined,
      page: searchParams.page || 1,
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

  const data = await getProducts({ q, page });
  const items: Product[] = data?.data || [];

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

            <ProductGallery products={items} scope='storefront' />
          </div>
        </div>
      </section>
    </div>
  );
}
