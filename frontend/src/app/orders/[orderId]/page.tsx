"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import type { Order } from "@/types/order";
import { OrderDetailView } from "@/components/orders/OrderDetailView";

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = Array.isArray(params?.orderId) ? params?.orderId[0] : params?.orderId;
  const user = useAuth((state) => state.user);
  const hydrate = useAuth((state) => state.hydrate);
  const initialized = useAuth((state) => state.initialized);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setError("Order missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response: Order = await api(`/orders/${orderId}`);
      setOrder(response);
    } catch (err: any) {
      const message = err?.message || "Unable to load this order.";
      setError(message);
      notifyError("Order unavailable", message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!initialized) {
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }
    loadOrder();
  }, [initialized, user, loadOrder]);

  if (!orderId) {
    return (
      <div className='mx-auto max-w-3xl px-4 py-20 text-center text-sm text-muted'>Order ID missing from URL.</div>
    );
  }

  if (!initialized) {
    return (
      <div className='mx-auto flex max-w-3xl items-center justify-center gap-3 px-4 py-20 text-muted'>
        <Loader2 className='h-5 w-5 animate-spin' />
        Checking your access…
      </div>
    );
  }

  if (initialized && !user && !loading) {
    return (
      <div className='mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-20 text-center'>
        <p className='text-lg font-semibold text-slate-900'>Sign in to view this order.</p>
        <div className='flex gap-3'>
          <Button onClick={() => router.push("/login")}>Sign in</Button>
          <Button variant='outline' onClick={() => router.push("/signup")}>
            Create account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-6xl space-y-6 px-4 py-10'>
      <div className='flex flex-wrap items-center gap-3'>
        <Button variant='ghost' className='rounded-2xl px-3' asChild>
          <Link href='/orders'>
            <ArrowLeft className='mr-2 h-4 w-4' /> Back to orders
          </Link>
        </Button>
        <Button variant='outline' className='rounded-2xl px-4' onClick={loadOrder} disabled={loading}>
          <RefreshCcw className='mr-2 h-4 w-4' /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className='flex items-center justify-center gap-3 py-20 text-muted'>
          <Loader2 className='h-5 w-5 animate-spin' />
          Loading order details…
        </div>
      ) : error ? (
        <div className='rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-center text-sm text-rose-700'>
          {error}
        </div>
      ) : order ? (
        <OrderDetailView order={order} context='customer' />
      ) : (
        <div className='rounded-3xl border border-border px-6 py-10 text-center text-sm text-muted'>
          Order not found.
        </div>
      )}
    </div>
  );
}
