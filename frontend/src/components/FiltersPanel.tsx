"use client";

import { useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND_FILTER_OPTIONS, CATEGORY_FILTER_OPTIONS, type CatalogOption } from "@/constants/catalog";

const PRICE_MIN = 0;
const PRICE_MAX = 5000;
const PRICE_STEP = 50;

type FiltersPanelProps = {
  price: [number, number];
  category: string;
  brand: string;
  search: string;
  onPriceChange: (next: [number, number]) => void;
  onCategoryChange: (next: string) => void;
  onBrandChange: (next: string) => void;
  onSearchChange: (next: string) => void;
  onApply: () => void;
  onReset: () => void;
  disableApply?: boolean;
};

export function FiltersPanel({
  price,
  category,
  brand,
  search,
  onPriceChange,
  onCategoryChange,
  onBrandChange,
  onSearchChange,
  onApply,
  onReset,
  disableApply,
}: FiltersPanelProps) {
  const formattedPrice = useMemo(
    () => ({
      min: `$${price[0].toFixed(0)}`,
      max: `$${price[1].toFixed(0)}`,
    }),
    [price]
  );

  return (
    <div className='space-y-5'>
      <Card className='p-5'>
        <div className='mb-6 flex items-center gap-2 text-sm font-semibold text-sky-600'>
          <SlidersHorizontal className='h-4 w-4' /> Filters
        </div>
        <section className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-slate-700'>Search by name</label>
            <div className='relative'>
              <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder='e.g. Galaxy Ultra'
                className='pl-9'
              />
            </div>
          </div>

          <div>
            <div className='flex items-center justify-between text-sm font-medium'>
              <span>Price Range</span>
              <span className='text-muted'>
                {formattedPrice.min} - {formattedPrice.max}
              </span>
            </div>
            <DualRangeSlider value={price} onChange={onPriceChange} />
          </div>

          <FilterGroup
            title='Category'
            options={CATEGORY_FILTER_OPTIONS}
            value={category}
            onChange={onCategoryChange}
          />
          <FilterGroup title='Brand' options={BRAND_FILTER_OPTIONS} value={brand} onChange={onBrandChange} />
        </section>

        <div className='mt-6 flex gap-3'>
          <Button type='button' className='flex-1' onClick={onApply} disabled={disableApply}>
            Apply
          </Button>
          <Button type='button' onClick={onReset} variant='ghost' className='flex-1 text-sm text-muted hover:text-text'>
            Reset
          </Button>
        </div>
      </Card>

      <Card className='space-y-4 bg-white p-5 shadow-card'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm text-muted'>Featured Drop</p>
            <p className='text-lg font-semibold'>Nova X Pro</p>
          </div>
          <span className='rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600'>$999</span>
        </div>
        <p className='text-sm text-muted'>
          1" LTPO display, A18 Neural Engine, triple camera capture — ships in cobalt blue.
        </p>
        <Button className='w-full'>Pre-order</Button>
      </Card>
    </div>
  );
}

function FilterGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: CatalogOption[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className='space-y-2'>
      <h4 className='text-sm font-medium'>{title}</h4>
      <div className='flex flex-wrap gap-2'>
        {options.map((option) => (
          <button
            key={option.id}
            type='button'
            onClick={() => onChange(option.id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              option.id === value
                ? "border-transparent bg-sky-500 text-white shadow"
                : "border-border text-muted hover:text-text"
            }`}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DualRangeSlider({ value, onChange }: { value: [number, number]; onChange: (next: [number, number]) => void }) {
  const [min, max] = value;

  const updateMin = (next: number) => {
    if (next >= max) return;
    const clamped = Math.max(PRICE_MIN, Math.min(next, PRICE_MAX));
    const stepped = Math.min(max - PRICE_STEP, Math.round(clamped / PRICE_STEP) * PRICE_STEP);
    onChange([Math.max(PRICE_MIN, stepped), max]);
  };

  const updateMax = (next: number) => {
    if (next <= min) return;
    const clamped = Math.max(PRICE_MIN, Math.min(next, PRICE_MAX));
    const stepped = Math.max(min + PRICE_STEP, Math.round(clamped / PRICE_STEP) * PRICE_STEP);
    onChange([min, Math.min(PRICE_MAX, stepped)]);
  };

  const trackStyle = {
    left: `${(min / PRICE_MAX) * 100}%`,
    right: `${100 - (max / PRICE_MAX) * 100}%`,
  } as const;

  return (
    <div className='relative mt-4'>
      <div className='h-2 rounded-full bg-border' />
      <div className='absolute top-0 h-2 rounded-full bg-sky-500' style={trackStyle} />
      <input
        className='price-slider'
        type='range'
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={PRICE_STEP}
        value={min}
        onChange={(event) => updateMin(Number(event.target.value))}
      />
      <input
        className='price-slider'
        type='range'
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={PRICE_STEP}
        value={max}
        onChange={(event) => updateMax(Number(event.target.value))}
      />
    </div>
  );
}
