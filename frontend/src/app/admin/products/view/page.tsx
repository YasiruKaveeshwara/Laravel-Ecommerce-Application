"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";
import { clearProductSelection, readProductSelection, rememberProductSelection } from "@/lib/productSelection";
import { Button } from "@/components/ui/button";
import { ProductDetail } from "@/components/ProductDetail";
import { notifyInfo } from "@/lib/notify";
import { LoadingScreen } from "@/components/LoadingScreen";
import { handleError } from "@/lib/handleError";
import { useRouteGuard } from "@/lib/useRouteGuard";

export default function AdminProductViewPage() {
	const router = useRouter();
	const guard = useRouteGuard({ requireAuth: true, requireRole: "administrator" });
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	if (guard.pending) {
		return (
			<div className='mx-auto max-w-3xl px-4 py-24'>
				<LoadingScreen message='Checking access' description='Verifying your administrator session.' />
			</div>
		);
	}

	if (!guard.allowed) return null;

	useEffect(() => {
		const stored = readProductSelection("admin");
		if (!stored) {
			const fallback = "Select a device from inventory to view its details.";
			setStatusMessage(fallback);
			handleError(new Error(fallback), { title: "No device selected", fallbackMessage: fallback });
			setLoading(false);
			return;
		}
		if (stored.snapshot) {
			setProduct(stored.snapshot);
		}
		api("/admin/products/detail", { method: "POST", body: { product_id: stored.id } })
			.then((res: Product) => setProduct(res))
			.catch((err: unknown) => {
				const fallback = "We couldn't refresh that device. Try selecting it again from inventory.";
				setStatusMessage(fallback);
				handleError(err, { title: "Product load failed", fallbackMessage: fallback });
			})
			.finally(() => setLoading(false));
	}, []);

	const goBack = () => {
		clearProductSelection();
		router.back();
	};

	const heroTitle = product ? product.name : "Device overview";
	const heroSubtitle = product?.description || "Review imagery, pricing, and catalog metadata.";

	const handleEdit = () => {
		if (!product) {
			return;
		}
		rememberProductSelection(product, "admin");
		router.push("/admin/products/edit");
	};

	const handleArchive = () => {
		notifyInfo("Archive workflow in progress", "Expect this shortly.");
	};

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start gap-4'>
				<div>
					<p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Product detail</p>
					<h1 className='text-3xl font-semibold text-slate-900'>{heroTitle}</h1>
					<p className='text-sm text-muted'>{heroSubtitle}</p>
				</div>
				<div className='ml-auto flex flex-wrap items-center gap-3'>
					<Button variant='ghost' className='rounded-2xl border border-border px-4' type='button' onClick={goBack}>
						<ArrowLeft className='h-4 w-4 mr-2' /> Inventory
					</Button>
				</div>
			</div>

			{loading && !product && (
				<LoadingScreen message='Loading product' description='Syncing catalog details from admin.' />
			)}

			{!loading && !product && (
				<div className='rounded-3xl border border-border bg-white/80 p-10 text-center text-muted shadow-card'>
					{statusMessage ?? "Select a device from inventory to view its details."}
				</div>
			)}

			{product && (
				<ProductDetail product={product} context='admin' onAdminEdit={handleEdit} onAdminDelete={handleArchive} />
			)}
		</div>
	);
}
