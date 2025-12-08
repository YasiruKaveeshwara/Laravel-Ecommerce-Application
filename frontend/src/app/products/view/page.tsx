"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";
import { readProductSelection, clearProductSelection } from "@/lib/productSelection";
import { Button } from "@/components/ui/button";
import { ProductDetail } from "@/components/ProductDetail";

export default function ProductViewPage() {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = readProductSelection("storefront");
    if (!stored) {
      setError("Select a device from the catalog to view its details.");
      setLoading(false);
      return;
    }
    if (stored.snapshot) {
      setProduct(stored.snapshot);
    }
    api("/products/detail", { method: "POST", body: { product_id: stored.id } })
      .then((res: Product) => setProduct(res))
      .catch((err: any) => setError(err?.message || "Unable to load product."))
      .finally(() => setLoading(false));
  }, []);

  const goBack = () => {
    clearProductSelection();
    router.back();
  };

  return (
    <div className='mx-auto max-w-6xl space-y-6 px-4 py-10'>
      <div className='flex items-center justify-between'>
        <Button variant='ghost' className='flex items-center gap-2' onClick={goBack}>
          <ArrowLeft className='h-4 w-4' /> Back
        </Button>
        <Button onClick={() => router.push("/products")}>Browse catalog</Button>
      </div>

      {loading && (
        <div className='rounded-3xl border border-border bg-white/80 p-10 text-center text-muted shadow-card'>
          Loading product...
        </div>
      )}

      {!loading && error && (
        <div className='rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700'>{error}</div>
      )}

      {product && <ProductDetail product={product} context='storefront' />}
    </div>
  );
}
