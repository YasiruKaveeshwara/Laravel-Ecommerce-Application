"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useRouter } from "next/navigation";
import { notifyInfo, notifySuccess } from "@/lib/notify";

const FEATURE_BULLETS = [
  "Pro-grade camera tuning with optical stabilization",
  "Adaptive 120Hz display calibrated for daylight",
  "48-hour battery profile with smart charge",
];

type ProductDetailProps = {
  product: Product;
  context?: "storefront" | "admin";
};

export function ProductDetail({ product, context = "storefront" }: ProductDetailProps) {
  const brandLabel = product.brand || "Pulse Mobile";
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((state) => state.addItem);
  const router = useRouter();
  const priceValue = Number(product.price || 0);
  const subtotal = (priceValue * quantity || 0).toFixed(2);

  const adjust = (delta: number) =>
    setQuantity((prev) => {
      const next = prev + delta;
      return Math.min(Math.max(next, 1), 10);
    });

  const handleAdd = () => {
    addItem(product, quantity);
    notifySuccess("Added to cart", `${product.name} ×${quantity}`);
  };
  const handleBuyNow = () => {
    addItem(product, quantity);
    notifyInfo("Redirecting to checkout", `${product.name} added to your cart.`);
    router.push("/checkout");
  };
  return (
    <section className='grid gap-8 lg:grid-cols-[1.1fr,0.9fr]'>
      <div className='space-y-4'>
        <div className='overflow-hidden rounded-[36px] border border-border bg-gradient-to-br from-slate-50 to-white shadow-card'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className='h-full w-full object-cover'
          />
        </div>
        <div className='rounded-3xl border border-border bg-white/80 p-6 shadow-card backdrop-blur'>
          <p className='text-xs font-semibold uppercase tracking-[0.35em] text-slate-500'>Highlights</p>
          <ul className='mt-4 space-y-2 text-sm text-slate-600'>
            {FEATURE_BULLETS.map((line) => (
              <li key={line} className='flex items-start gap-2'>
                <span className='mt-1 h-1.5 w-1.5 rounded-full bg-sky-500' />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className='space-y-6'>
        <div className='space-y-3 rounded-3xl border border-border bg-white/90 p-6 shadow-card backdrop-blur'>
          <div className='text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-500'>{brandLabel}</div>
          <h1 className='text-4xl font-semibold leading-tight text-slate-900'>{product.name}</h1>
          <p className='text-sm text-muted'>{product.description || "A flagship tuned for next-gen mobile life."}</p>
          <div className='text-3xl font-semibold text-sky-600'>${Number(product.price || 0).toFixed(2)}</div>
        </div>

        <div className='rounded-3xl border border-border bg-white/80 p-6 shadow-card'>
          <dl className='grid gap-4 text-sm text-slate-600 sm:grid-cols-2'>
            <DetailItem label='Category' value={product.category || "Unassigned"} />
            <DetailItem label='Added' value={formatDate(product.created_at)} />
            <DetailItem label='Status' value='In stock' />
          </dl>
        </div>

        {context === "storefront" && (
          <div className='rounded-3xl border border-border bg-white/90 p-6 shadow-card space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium text-slate-600'>Quantity</span>
              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  className='h-10 w-10 rounded-2xl border border-border text-lg font-semibold'
                  onClick={() => adjust(-1)}
                  aria-label='Decrease quantity'>
                  −
                </button>
                <span className='w-8 text-center text-lg font-semibold text-slate-900'>{quantity}</span>
                <button
                  type='button'
                  className='h-10 w-10 rounded-2xl border border-border text-lg font-semibold'
                  onClick={() => adjust(1)}
                  aria-label='Increase quantity'>
                  +
                </button>
              </div>
            </div>
            <p className='text-sm text-muted'>
              Subtotal: <span className='font-semibold text-slate-900'>${subtotal}</span>
            </p>
            <div className='grid gap-3 sm:grid-cols-2'>
              <Button className='w-full' onClick={handleAdd}>
                Add to cart
              </Button>
              <Button variant='outline' className='w-full' onClick={handleBuyNow}>
                Buy now
              </Button>
            </div>
          </div>
        )}

        {context === "admin" && (
          <div className='rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-sm text-slate-600'>
            <p className='font-semibold text-slate-900'>Admin notes</p>
            <p>Image path: {product.image_path || "—"}</p>
            <p>Original asset: {product.original_image_path || "—"}</p>
            <p>Last updated: {formatDate(product.updated_at)}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>{label}</dt>
      <dd className='text-base font-semibold text-slate-900'>{value}</dd>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
