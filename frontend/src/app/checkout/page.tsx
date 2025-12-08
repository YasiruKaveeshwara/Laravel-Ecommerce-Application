"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CheckoutPage() {
  const router = useRouter();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const items = useCart((state) => state.items);
  const clearCart = useCart((state) => state.clear);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = subtotal > 0 ? 15 : 0;
  const taxes = subtotal * 0.08;
  const total = subtotal + shipping + taxes;

  if (!items.length) {
    return (
      <div className='mx-auto flex max-w-3xl flex-col items-center gap-4 py-20 text-center'>
        <p className='text-2xl font-semibold text-slate-900'>There is nothing to checkout.</p>
        <p className='text-sm text-muted'>Add products to your cart before starting the checkout flow.</p>
        <Button onClick={() => router.push("/")}>Browse catalog</Button>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPlacingOrder(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    clearCart();
    router.push("/?order=success");
  };

  return (
    <div className='mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.5fr,1fr]'>
      <form className='space-y-6' onSubmit={handleSubmit}>
        <header className='rounded-3xl border border-border bg-white/80 p-6 shadow-card backdrop-blur'>
          <p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Checkout</p>
          <h1 className='text-3xl font-semibold text-slate-900'>Secure payment</h1>
          <p className='text-sm text-muted'>Enter your shipping and payment details below to finish your purchase.</p>
        </header>

        <section className='rounded-3xl border border-border bg-white/90 p-6 shadow-card'>
          <h2 className='text-lg font-semibold text-slate-900'>Shipping details</h2>
          <div className='mt-4 grid gap-4 md:grid-cols-2'>
            <Input name='firstName' placeholder='First name' required />
            <Input name='lastName' placeholder='Last name' required />
            <Input name='email' type='email' placeholder='Email address' className='md:col-span-2' required />
            <Input name='phone' type='tel' placeholder='Phone number' className='md:col-span-2' required />
            <Input name='address1' placeholder='Street address' className='md:col-span-2' required />
            <Input name='address2' placeholder='Apartment, suite, etc. (optional)' className='md:col-span-2' />
            <Input name='city' placeholder='City' required />
            <Input name='state' placeholder='State/Province' required />
            <Input name='zip' placeholder='ZIP / Postal code' required />
            <Input name='country' placeholder='Country' required />
          </div>
        </section>

        <section className='rounded-3xl border border-border bg-white/90 p-6 shadow-card'>
          <h2 className='text-lg font-semibold text-slate-900'>Payment</h2>
          <div className='mt-4 grid gap-4'>
            <Input name='cardName' placeholder='Name on card' required />
            <Input name='cardNumber' placeholder='Card number' inputMode='numeric' pattern='[0-9 ]*' required />
            <div className='grid gap-4 md:grid-cols-2'>
              <Input name='expiry' placeholder='MM/YY' required />
              <Input name='cvc' placeholder='CVC' inputMode='numeric' maxLength={4} required />
            </div>
          </div>
          <label className='mt-4 flex items-start gap-2 text-sm text-slate-600'>
            <input type='checkbox' required className='mt-1' />
            <span>
              I agree to the{" "}
              <Link href='/terms' className='text-sky-600 underline'>
                terms and conditions
              </Link>
              .
            </span>
          </label>
          <Button type='submit' className='mt-6 w-full' disabled={isPlacingOrder}>
            {isPlacingOrder ? "Processing…" : "Place order"}
          </Button>
          <p className='mt-2 text-center text-xs text-muted' aria-live='polite'>
            Payments are securely processed. You will receive a confirmation email.
          </p>
        </section>
      </form>

      <aside className='space-y-4'>
        <div className='rounded-3xl border border-border bg-white/90 p-6 shadow-card'>
          <h3 className='text-lg font-semibold text-slate-900'>Order summary</h3>
          <ul className='mt-4 space-y-4'>
            {items.map((item) => (
              <li key={item.product.id} className='flex items-center gap-4'>
                <img
                  src={item.product.image_url || "/placeholder.svg"}
                  alt={item.product.name}
                  className='h-16 w-16 rounded-2xl object-cover'
                />
                <div className='flex-1 text-sm text-slate-600'>
                  <p className='font-semibold text-slate-900'>{item.product.name}</p>
                  <p>Qty {item.quantity}</p>
                </div>
                <span className='text-sm font-semibold text-slate-900'>
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <dl className='mt-6 space-y-2 text-sm text-slate-600'>
            <SummaryRow label='Subtotal' value={`$${subtotal.toFixed(2)}`} />
            <SummaryRow label='Shipping' value={shipping ? `$${shipping.toFixed(2)}` : "Free"} />
            <SummaryRow label='Estimated tax' value={`$${taxes.toFixed(2)}`} />
          </dl>
          <div className='mt-4 border-t border-border pt-4'>
            <div className='flex items-center justify-between text-base font-semibold text-slate-900'>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <p className='mt-4 text-xs text-muted'>
            Shipping and tax are estimates. Final amounts are confirmed when the order ships.
          </p>
        </div>

        <div className='rounded-3xl border border-dashed border-slate-200 bg-white/70 p-5 text-sm text-muted'>
          <p>
            Need to make changes?{" "}
            <Link href='/cart' className='text-sky-600 underline'>
              Return to your cart
            </Link>
            .
          </p>
        </div>
      </aside>
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
