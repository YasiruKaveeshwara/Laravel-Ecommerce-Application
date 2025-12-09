"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


const CATEGORY_OPTIONS = [
  { id: "all", label: "All" },
  { id: "flagship", label: "Flagships" },
  { id: "foldables", label: "Foldables" },
  { id: "midrange", label: "Mid-range" },
  { id: "budget", label: "Budget" },
];

const BRAND_OPTIONS = [
  { id: "all", label: "All" },
  { id: "samsung", label: "Samsung" },
  { id: "apple", label: "Apple" },
  { id: "pixel", label: "Pixel" },
  { id: "oneplus", label: "OnePlus" },
  { id: "xiaomi", label: "Xiaomi" },
  { id: "sony", label: "Sony" },
  { id: "honor", label: "Honor" },
];

const PRICE_MIN = 0;
const PRICE_MAX = 500;

export function FiltersPanel() {
  const [price, setPrice] = useState<[number, number]>([50, 350]);
  const [sort, setSort] = useState("all");
  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");

  const resetFilters = () => {
    setPrice([50, 350]);
    setSort("all");
    setCategory("all");
    setBrand("all");
  };

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
          <div>
            <div className='flex items-center justify-between text-sm font-medium'>
              <span>Price Range</span>
              <span className='text-muted'>
                {formattedPrice.min} - {formattedPrice.max}
              </span>
            </div>
            <DualRangeSlider value={price} onChange={setPrice} />
          </div>

          
          <FilterGroup title='Category' options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
          <FilterGroup title='Brand' options={BRAND_OPTIONS} value={brand} onChange={setBrand} />

          
        </section>

        <div className='mt-6 flex gap-3'>
          <Button className='flex-1'>Apply</Button>
          <Button
            type='button'
            onClick={resetFilters}
            variant='ghost'
            className='flex-1 text-sm text-muted hover:text-text'>
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
  options: Array<{ id: string; label: string }>;
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
    onChange([Math.max(PRICE_MIN, next), max]);
  };

  const updateMax = (next: number) => {
    if (next <= min) return;
    onChange([min, Math.min(PRICE_MAX, next)]);
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
        value={min}
        onChange={(event) => updateMin(Number(event.target.value))}
      />
      <input
        className='price-slider'
        type='range'
        min={PRICE_MIN}
        max={PRICE_MAX}
        value={max}
        onChange={(event) => updateMax(Number(event.target.value))}
      />
    </div>
  );
}
