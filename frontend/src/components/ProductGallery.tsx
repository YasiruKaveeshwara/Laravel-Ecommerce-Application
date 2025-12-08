import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types/product";
import type { ProductSelectionScope } from "@/lib/productSelection";

type GalleryProps = {
  products: Product[];
  scope?: ProductSelectionScope;
};

export function ProductGallery({ products, scope = "storefront" }: GalleryProps) {
  if (!products?.length) {
    return (
      <div className='rounded-2xl border border-dashed border-border p-10 text-center text-muted'>
        No products yet. Add your first product from the admin backoffice.
      </div>
    );
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
      {products.map((product) => (
        <ProductCard key={product.id} p={product} size='compact' detailScope={scope} />
      ))}
    </div>
  );
}
