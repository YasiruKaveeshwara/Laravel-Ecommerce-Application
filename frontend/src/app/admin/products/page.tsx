"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Product, ProductCard } from "@/components/ProductCard";
import { useAuth } from "@/store/auth";

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const fetchMe = useAuth((s) => s.fetchMe);

  useEffect(() => {
    fetchMe(); // ensure user loaded (optional)
    const token = localStorage.getItem("token");
    api("/admin/products", { authToken: token })
      .then((res) => setItems(res.data || []))
      .catch((e) => alert(e.message));
  }, [fetchMe]);

  return (
    <div className='space-y-4'>
      <div className='flex items-center'>
        <h1 className='text-2xl font-semibold'>Products</h1>
        <Link
          href='/admin/products/new'
          className='ml-auto rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-1.5 text-sm'>
          New
        </Link>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {items.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}
