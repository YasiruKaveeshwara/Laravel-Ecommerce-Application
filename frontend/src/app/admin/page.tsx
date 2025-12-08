import { FiltersPanel } from "@/components/FiltersPanel";
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
  return data;
}

export default async function AdminHome({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const q = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q;
  const page = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;
  const data = await getProducts({ q, page });
  const items: Product[] = data?.data || [];

  return (
    <div>
      <section className='mx-auto max-w-6xl px-4 py-10'>
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
          <aside className='lg:col-span-3'>
            <div className='lg:sticky lg:top-20'>
              <FiltersPanel />
            </div>
          </aside>
          <div className='space-y-4 lg:col-span-9'>
            <header className='space-y-1'>
              <h2 className='text-2xl font-semibold'>Live catalog view</h2>
              <p className='text-sm text-muted'>Admin preview of the same grid customers explore.</p>
            </header>
            <ProductGallery products={items} scope='admin' />
          </div>
        </div>
      </section>
    </div>
  );
}
