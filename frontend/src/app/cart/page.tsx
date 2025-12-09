"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notifyInfo, notifySuccess, notifyWarning } from "@/lib/notify";

export default function CartPage() {
  const router = useRouter();
  const items = useCart((state) => state.items);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeItem = useCart((state) => state.removeItem);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!items.length) {
    return (
      <div className='mx-auto flex max-w-3xl flex-col items-center gap-4 py-20 text-center'>
        <p className='text-2xl font-semibold text-slate-900'>Your bag is empty</p>
        <p className='text-sm text-muted'>Add a device to your cart to see it appear here.</p>
        <Button onClick={() => router.push("/")}>Browse devices</Button>
      </div>
    );
  }

  return (
    <div className='mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[2fr,1fr]'>
      <section className='space-y-4'>
        <header className='rounded-3xl border border-border bg-white/80 p-6 shadow-card backdrop-blur'>
          <p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Cart</p>
          <h1 className='text-3xl font-semibold text-slate-900'>Ready to check out?</h1>
          <p className='text-sm text-muted'>Update quantities or remove items before heading to checkout.</p>
        </header>

        <div className='space-y-4'>
          {items.map((item) => (
            <article
              key={item.product.id}
              className='flex flex-col gap-4 rounded-3xl border border-border bg-white/90 p-5 shadow-card sm:flex-row'>
              <img
                src={item.product.image_url || "/placeholder.svg"}
                alt={item.product.name}
                className='h-32 w-32 rounded-2xl object-cover'
              />
              <div className='flex flex-1 flex-col gap-3'>
                <div>
                  <p className='text-sm font-semibold uppercase tracking-[0.3em] text-sky-500'>{item.product.brand}</p>
                  <h2 className='text-xl font-semibold text-slate-900'>{item.product.name}</h2>
                  <p className='text-sm text-muted line-clamp-2'>{item.product.description}</p>
                </div>
                <div className='flex flex-wrap items-center gap-3'>
                  <QuantityInput
                    value={item.quantity}
                    onChange={(next) => {
                      if (next === item.quantity) return;
                      updateQuantity(item.product.id, next);
                      notifySuccess("Quantity updated", `${item.product.name} ×${next}`);
                    }}
                  />
                  <span className='ml-auto text-lg font-semibold text-slate-900'>
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                  <Button
                    type='button'
                    variant='ghost'
                    className='text-rose-600'
                    onClick={() => {
                      removeItem(item.product.id);
                      notifyWarning("Removed from cart", item.product.name);
                    }}>
                    <Trash2 className='h-4 w-4' />
                    Remove
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className='space-y-4'>
        <div className='rounded-3xl border border-border bg-white/90 p-6 shadow-card'>
          <h3 className='text-lg font-semibold text-slate-900'>Summary</h3>
          <dl className='mt-4 space-y-2 text-sm text-slate-600'>
            <SummaryRow label={`Items (${totalItems})`} value={`$${subtotal.toFixed(2)}`} />
            <SummaryRow label='Shipping' value='Calculated at checkout' />
            <SummaryRow label='Taxes' value='Calculated at checkout' />
          </dl>
          <div className='mt-4 border-t border-border pt-4'>
            <div className='flex items-center justify-between text-base font-semibold text-slate-900'>
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
          <Button
            className='mt-4 w-full'
            onClick={() => {
              notifyInfo("Heading to checkout", "Review shipping and payment next.");
              router.push("/checkout");
            }}>
            Proceed to checkout
          </Button>
        </div>

        <div className='rounded-3xl border border-dashed border-slate-200 bg-white/70 p-5 text-sm text-muted'>
          <p>
            Need help? Contact our support team via{" "}
            <Link href='/support' className='text-sky-600 underline'>
              live chat
            </Link>
            .
          </p>
        </div>
      </aside>
    </div>
  );
}

function QuantityInput({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  const clamp = (next: number) => Math.min(Math.max(next, 1), 10);
  return (
    <div className='flex items-center gap-3 rounded-2xl border border-border px-3 py-1'>
      <button type='button' className='text-lg' onClick={() => onChange(clamp(value - 1))} aria-label='Decrease'>
        −
      </button>
      <Input
        type='number'
        value={value}
        min={1}
        max={10}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        className='h-8 w-12 border-none text-center text-sm'
      />
      <button type='button' className='text-lg' onClick={() => onChange(clamp(value + 1))} aria-label='Increase'>
        +
      </button>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between'>
      <span>{label}</span>
      <span className='font-semibold text-slate-900'>{value}</span>
    </div>
  );
}
