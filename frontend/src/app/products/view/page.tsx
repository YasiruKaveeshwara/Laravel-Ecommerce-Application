"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";
import { readProductSelection, clearProductSelection } from "@/lib/productSelection";
import { Button } from "@/components/ui/button";
import { ProductDetail } from "@/components/ProductDetail";
import { LoadingScreen } from "@/components/LoadingScreen";
import { handleError } from "@/lib/handleError";

export default function ProductViewPage() {
	const router = useRouter();
	const [selection] = useState(() => readProductSelection("storefront"));
	const [product, setProduct] = useState<Product | null>(() => selection?.snapshot ?? null);
	const [loading, setLoading] = useState(() => Boolean(selection));
	const [statusMessage, setStatusMessage] = useState<string | null>(() =>
		selection ? null : "Select a device from the catalog to view its details."
	);

	useEffect(() => {
		if (selection) return;
		const fallback = "Select a device from the catalog to view its details.";
		handleError(new Error(fallback), { title: "No device selected", fallbackMessage: fallback });
	}, [selection]);

	useEffect(() => {
		if (!selection) return;
		let cancelled = false;
		const fetchProduct = async () => {
			try {
				const response: Product = await api("/products/detail", { method: "POST", body: { product_id: selection.id } });
				if (!cancelled) {
					setProduct(response);
				}
			} catch (err: unknown) {
				if (cancelled) return;
				const fallback = "We couldn't refresh that device. Try again from the catalog.";
				setStatusMessage(fallback);
				handleError(err, { title: "Product load failed", fallbackMessage: fallback });
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};
		fetchProduct();
		return () => {
			cancelled = true;
		};
	}, [selection]);

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

			{loading && !product && (
				<LoadingScreen message='Loading product' description='Fetching the latest specs and gallery assets.' />
			)}

			{!loading && !product && (
				<div className='rounded-3xl border border-border bg-white/80 p-10 text-center text-muted shadow-card'>
					{statusMessage ?? "Select a device from the catalog to view its details."}
				</div>
			)}

			{product && <ProductDetail product={product} context='storefront' />}
		</div>
	);
}
