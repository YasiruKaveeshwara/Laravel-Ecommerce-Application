import { ProductCard, type Product } from "@/components/ProductCard";

export function ProductGallery({ products }: { products: Product[] }) {
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
        <ProductCard key={product.id} p={product} size='compact' />
      ))}
    </div>
  );
}
