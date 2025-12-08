"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { rememberProductSelection, type ProductSelectionScope } from "@/lib/productSelection";
import { useCart } from "@/store/cart";

type ProductCardProps = {
  p: Product;
  size?: "compact" | "default";
  detailScope?: ProductSelectionScope;
};

export function ProductCard({ p, size = "default", detailScope = "storefront" }: ProductCardProps) {
  const meta = deriveProductMeta(p);
  const isCompact = size === "compact";
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);
  const showCartCta = detailScope !== "admin";

  const onViewDetails = () => {
    rememberProductSelection(p, detailScope);
    router.push(detailScope === "admin" ? "/admin/products/view" : "/products/view");
  };

  const onAddToCart = () => addItem(p, 1);

  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden border border-border/70 bg-card/90 shadow-card transition hover:-translate-y-1 hover:shadow-2xl",
        isCompact ? "rounded-3xl" : "rounded-[32px]"
      )}>
      <div className={cn("bg-white", isCompact ? "aspect-[4/3]" : "aspect-[4/5]")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image_url || "/placeholder.svg"} alt={p.name} className='h-full w-full object-cover' />
      </div>

      <div className={cn("flex flex-1 flex-col", isCompact ? "gap-2.5 p-4" : "gap-4 p-6")}>
        <div className='space-y-1'>
          <div className='flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-500'>
            <span>{p.brand || "Featured"}</span>
            {p.category && (
              <span className='rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium tracking-normal text-sky-600'>
                {p.category}
              </span>
            )}
          </div>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <p className={cn("font-semibold leading-tight", isCompact ? "text-sm" : "text-lg")}>{p.name}</p>
              <p className={cn("text-muted line-clamp-2", isCompact ? "text-xs" : "text-sm")}>
                {p.description || "Flagship camera system tuned for all-day 5G streaming."}
              </p>
            </div>
            <span className={cn("font-semibold text-sky-600", isCompact ? "text-base" : "text-xl")}>${meta.price}</span>
          </div>
        </div>

        <div className={cn("mt-auto grid gap-2", showCartCta ? "grid-cols-2" : "grid-cols-1")}>
          <Button
            type='button'
            variant='outline'
            className={cn("w-full", isCompact ? "h-9 text-sm" : undefined)}
            onClick={onViewDetails}>
            View details
          </Button>
          {showCartCta && (
            <Button className={cn("w-full", isCompact ? "h-9 text-sm" : undefined)} onClick={onAddToCart}>
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function deriveProductMeta(product: Product) {
  const numericPrice = Number(product.price || 0);
  const fallbackPrice = 29 + (product.id % 5) * 7;
  const price = (numericPrice || fallbackPrice).toFixed(2);
  return { price };
}
