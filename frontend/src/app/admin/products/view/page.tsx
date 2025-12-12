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
	const [selection] = useState(() => readProductSelection("admin"));
	const [product, setProduct] = useState<Product | null>(() => selection?.snapshot ?? null);
	const [loading, setLoading] = useState(() => Boolean(selection));
	const [statusMessage, setStatusMessage] = useState<string | null>(() =>
		selection ? null : "Select a device from inventory to view its details."
	);

	useEffect(() => {
		if (!selection || guard.pending || !guard.allowed) return;
		let cancelled = false;
		const fetchProduct = async () => {
			try {
				const response: Product = await api("/admin/products/detail", {
					method: "POST",
					body: { product_id: selection.id },
				});
				if (!cancelled) {
					setProduct(response);
				}
			} catch (err: unknown) {
				if (cancelled) return;
				const fallback = "We couldn't refresh that device. Try selecting it again from inventory.";
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
	}, [selection, guard.pending, guard.allowed]);

	useEffect(() => {
		if (selection || guard.pending || !guard.allowed) return;
		const fallback = "Select a device from inventory to view its details.";
		handleError(new Error(fallback), { title: "No device selected", fallbackMessage: fallback });
	}, [selection, guard.pending, guard.allowed]);

	if (guard.pending) {
		return (
			<div className='mx-auto max-w-3xl px-4 py-24'>
				<LoadingScreen message='Checking access' description='Verifying your administrator session.' />
			</div>
		);
	}

	if (!guard.allowed) return null;

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
