"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";
import { clearProductSelection, readProductSelection } from "@/lib/productSelection";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { ProductDetail } from "@/components/ProductDetail";

export default function AdminProductViewPage() {
  const router = useRouter();
  const fetchMe = useAuth((state) => state.fetchMe);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    const stored = readProductSelection("admin");
    if (!stored) {
      setError("Select a device from inventory to view its details.");
      setLoading(false);
      return;
    }
    if (stored.snapshot) {
      setProduct(stored.snapshot);
    }
    api("/admin/products/detail", { method: "POST", body: { product_id: stored.id } })
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
      <div className='flex flex-wrap items-center gap-3'>
        <Button variant='ghost' className='flex items-center gap-2' onClick={goBack}>
          <ArrowLeft className='h-4 w-4' /> Back
        </Button>
        <div className='ml-auto flex gap-3'>
          <Button
            variant='outline'
            className='flex items-center gap-2'
            disabled={!product}
            onClick={() => alert("Edit experience coming soon")}>
            <Pencil className='h-4 w-4' /> Edit device
          </Button>
          <Button
            variant='outline'
            className='flex items-center gap-2 border-rose-300 text-rose-600'
            disabled={!product}
            onClick={() => alert("Archive workflow coming soon")}>
            <Trash2 className='h-4 w-4' /> Archive
          </Button>
        </div>
      </div>

      {loading && (
        <div className='rounded-3xl border border-border bg-white/80 p-10 text-center text-muted shadow-card'>
          Loading product...
        </div>
      )}

      {!loading && error && (
        <div className='rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700'>{error}</div>
      )}

      {product && <ProductDetail product={product} context='admin' />}
    </div>
  );
}
