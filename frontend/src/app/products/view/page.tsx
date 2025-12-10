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
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	useEffect(() => {
		const stored = readProductSelection("storefront");
		if (!stored) {
			const fallback = "Select a device from the catalog to view its details.";
			setStatusMessage(fallback);
			handleError(new Error(fallback), { title: "No device selected", fallbackMessage: fallback });
			setLoading(false);
			return;
		}
		if (stored.snapshot) {
			setProduct(stored.snapshot);
		}
		api("/products/detail", { method: "POST", body: { product_id: stored.id } })
			.then((res: Product) => setProduct(res))
			.catch((err: unknown) => {
				const fallback = "We couldn't refresh that device. Try again from the catalog.";
				setStatusMessage(fallback);
				handleError(err, { title: "Product load failed", fallbackMessage: fallback });
			})
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
