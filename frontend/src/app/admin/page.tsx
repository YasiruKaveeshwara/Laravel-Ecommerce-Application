"use client";

import { useEffect, useMemo, useState } from "react";
import { FiltersPanel } from "@/components/FiltersPanel";
import { ProductGallery } from "@/components/ProductGallery";
import { api } from "@/lib/api";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useRouteGuard } from "@/lib/useRouteGuard";
import type { Product } from "@/types/product";

export default function AdminHome({
	searchParams = {},
}: {
	searchParams?: Record<string, string | string[] | undefined>;
}) {
	const { allowed, pending } = useRouteGuard({ requireAuth: true, requireRole: "administrator" });
	const [items, setItems] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const q = useMemo(
		() => (Array.isArray(searchParams.q) ? searchParams.q[0] : (searchParams.q as string | undefined)),
		[searchParams.q]
	);
	const page = useMemo(
		() => (Array.isArray(searchParams.page) ? searchParams.page[0] : (searchParams.page as string | undefined)),
		[searchParams.page]
	);

	useEffect(() => {
		if (!allowed) return;

		let isMounted = true;
		const controller = new AbortController();
		setLoading(true);
		setError(null);

		api("/products", {
			query: {
				q: q || undefined,
				page: page || 1,
			},
			signal: controller.signal,
		})
			.then((data) => {
				if (!isMounted) return;
				setItems((data?.data as Product[]) || []);
			})
			.catch((err) => {
				if (!isMounted) return;
				if (controller.signal.aborted) return;
				setError(err instanceof Error ? err.message : "Failed to load products");
			})
			.finally(() => {
				if (!isMounted) return;
				setLoading(false);
			});

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [allowed, page, q]);

	if (pending) {
		return <LoadingScreen message='Checking permissions...' description='Hang tight while we verify your access.' />;
	}

	if (!allowed) {
		return null;
	}

	if (loading) {
		return <LoadingScreen message='Loading catalog preview...' description='Fetching products for the admin view.' />;
	}

	if (error) {
		return (
			<div className='mx-auto max-w-6xl px-4 py-10'>
				<div className='rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-card'>
					{error}
				</div>
			</div>
		);
	}

	return (
		<div>
			<section className='mx-auto max-w-6xl px-4 py-10'>
				<div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
					<aside className='lg:col-span-3'>
						<div className='lg:sticky lg:top-20'>
							<FiltersPanel />
						</div>
					</aside>
					<div className='space-y-4 lg:col-span-9'>
						<header className='space-y-1'>
							<h2 className='text-2xl font-semibold'>Live catalog view</h2>
							<p className='text-sm text-muted'>Admin preview of the same grid customers explore.</p>
						</header>
						<ProductGallery products={items} scope='admin' />
					</div>
				</div>
			</section>
		</div>
	);
}
