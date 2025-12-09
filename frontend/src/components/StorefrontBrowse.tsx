"use client";

import { useMemo, useState } from "react";
import { FiltersPanel } from "@/components/FiltersPanel";
import { StorefrontProductShelf } from "@/components/StorefrontProductShelf";
import type { Product } from "@/types/product";
import type { PaginationMeta } from "@/types/pagination";
import type { StorefrontFilters } from "@/types/storefront";

const DEFAULT_PRICE_RANGE: [number, number] = [0, 5000];
const DEFAULT_CATEGORY = "all";
const DEFAULT_BRAND = "all";
const DEFAULT_SEARCH = "";

const createDefaultFilters = (): StorefrontFilters => ({
  price: [...DEFAULT_PRICE_RANGE] as [number, number],
  category: DEFAULT_CATEGORY,
  brand: DEFAULT_BRAND,
  search: DEFAULT_SEARCH,
});

export function StorefrontBrowse({
  initialItems,
  initialMeta,
  perPage,
  searchTerm,
}: {
  initialItems: Product[];
  initialMeta: PaginationMeta | null;
  perPage: number;
  searchTerm?: string | null;
}) {
  const [draftFilters, setDraftFilters] = useState<StorefrontFilters>(() => createDefaultFilters());
  const [appliedFilters, setAppliedFilters] = useState<StorefrontFilters>(() => createDefaultFilters());
  const hasChanges = useMemo(
    () => JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters),
    [draftFilters, appliedFilters]
  );

  const updatePrice = (next: [number, number]) => setDraftFilters((prev) => ({ ...prev, price: next }));
  const updateCategory = (next: string) => setDraftFilters((prev) => ({ ...prev, category: next }));
  const updateBrand = (next: string) => setDraftFilters((prev) => ({ ...prev, brand: next }));
  const updateSearch = (next: string) => setDraftFilters((prev) => ({ ...prev, search: next }));

  const handleApply = () => {
    setAppliedFilters({
      price: [...draftFilters.price] as [number, number],
      category: draftFilters.category,
      brand: draftFilters.brand,
      search: draftFilters.search,
    });
  };

  const handleReset = () => {
    const reset = createDefaultFilters();
    setDraftFilters(reset);
    setAppliedFilters(reset);
  };

  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
      <aside className='lg:col-span-3'>
        <div className='lg:sticky lg:top-20'>
          <FiltersPanel
            price={draftFilters.price}
            category={draftFilters.category}
            brand={draftFilters.brand}
            search={draftFilters.search}
            onPriceChange={updatePrice}
            onCategoryChange={updateCategory}
            onBrandChange={updateBrand}
            onSearchChange={updateSearch}
            onApply={handleApply}
            onReset={handleReset}
            disableApply={!hasChanges}
          />
        </div>
      </aside>

      <div className='space-y-4 lg:col-span-9'>
        <header className='space-y-1'>
          <h2 className='text-2xl font-semibold'>Trending smartphones</h2>
          <p className='text-sm text-muted'>Curated 5G flagships, foldables, and budget wins refreshed daily.</p>
        </header>

        <StorefrontProductShelf
          initialItems={initialItems}
          initialMeta={initialMeta}
          perPage={perPage}
          searchTerm={searchTerm}
          filters={appliedFilters}
        />
      </div>
    </div>
  );
}
