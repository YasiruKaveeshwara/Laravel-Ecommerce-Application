"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";
import { clearProductSelection, readProductSelection } from "@/lib/productSelection";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { ProductDetail } from "@/components/ProductDetail";
import { notifyError, notifyInfo } from "@/lib/notify";

export default function AdminProductViewPage() {
	const router = useRouter();
	const fetchMe = useAuth((state) => state.fetchMe);
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchMe();
	}, [fetchMe]);

	useEffect(() => {
		const stored = readProductSelection("admin");
		if (!stored) {
			setError("Select a device from inventory to view its details.");
			setLoading(false);
			return;
		}
		if (stored.snapshot) {
			setProduct(stored.snapshot);
		}
		api("/admin/products/detail", { method: "POST", body: { product_id: stored.id } })
			.then((res: Product) => setProduct(res))
			.catch((err: any) => {
				const message = err?.message || "Unable to load product.";
				setError(message);
				notifyError("Product load failed", message);
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
		notifyInfo("Edit panel coming soon", "Publishing tools are being finalized.");
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

			{!loading && error && (
				<div className='rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700'>{error}</div>
			)}

			{product && (
				<ProductDetail product={product} context='admin' onAdminEdit={handleEdit} onAdminDelete={handleArchive} />
			)}
		</div>
	);
}
