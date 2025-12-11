"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { handleError } from "@/lib/handleError";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/LoadingScreen";
import { AdminProductComposer, type ProductComposerSubmitPayload } from "@/components/admin/AdminProductComposer";
import { readProductSelection, rememberProductSelection } from "@/lib/productSelection";
import { notifySuccess } from "@/lib/notify";
import { useRouteGuard } from "@/lib/useRouteGuard";

export default function EditProductPage() {
	const router = useRouter();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const guard = useRouteGuard({ requireAuth: true, requireRole: "administrator" });

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
			const fallback = "Select a device from inventory to edit its details.";
			setStatusMessage(fallback);
			setLoading(false);
			return;
		}

		setLoading(true);
		api(`/admin/products/${stored.id}`)
			.then((res: Product) => {
				setProduct(res);
				setStatusMessage(null);
			})
			.catch((error: unknown) => {
				const fallback = "Unable to load that device for editing.";
				setStatusMessage(fallback);
				handleError(error, { title: "Product load failed", fallbackMessage: fallback });
			})
			.finally(() => setLoading(false));
	}, []);

	const initialValues = useMemo(() => {
		if (!product) {
			return undefined;
		}
		return {
			name: product.name,
			brand: product.brand ?? "",
			category: product.category ?? "",
			price: product.price ?? "",
			description: product.description ?? "",
		};
	}, [product]);

	const handleSubmit = async ({ form, file }: ProductComposerSubmitPayload) => {
		if (!product) {
			return;
		}

		const payload = new FormData();
		payload.append("_method", "PUT");
		payload.append("name", form.name.trim());
		payload.append("brand", form.brand.trim());
		payload.append("category", form.category);
		payload.append("price", form.price.toString());
		payload.append("description", form.description.trim());
		if (file) {
			payload.append("image", file);
		}

		try {
			const updated: Product = await api(`/admin/products/${product.id}`, {
				method: "POST", // send as POST so PHP/Laravel can receive multipart files, _method handles verb
				isForm: true,
				body: payload,
			});
			notifySuccess("Device updated", `${updated.name} changes saved.`);
			rememberProductSelection(updated, "admin");
			router.push("/admin/products/view");
		} catch (error: unknown) {
			handleError(error, { title: "Update failed", fallbackMessage: "Unable to save product changes." });
		}
	};

	const goBack = () => router.back();

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start gap-4'>
				<div>
					<p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Products</p>
					<h1 className='text-3xl font-semibold text-slate-900'>Edit device</h1>
					<p className='text-sm text-muted'>Keep catalog details synced without leaving the inventory experience.</p>
				</div>
				<div className='ml-auto flex flex-wrap items-center gap-3'>
					<Button variant='ghost' className='rounded-2xl border border-border px-4' type='button' onClick={goBack}>
						<ArrowLeft className='h-4 w-4 mr-2' /> Inventory
					</Button>
				</div>
			</div>

			{loading && !product && (
				<LoadingScreen
					message='Loading product'
					description='Syncing catalog details for editing.'
					className='border-none bg-transparent shadow-none'
				/>
			)}

			{!loading && !product && (
				<div className='rounded-3xl border border-border bg-white/80 p-10 text-center text-muted shadow-card'>
					{statusMessage ?? "Select a device from inventory to edit it."}
				</div>
			)}

			{product && (
				<AdminProductComposer
					mode='edit'
					dataKey={product.id}
					initialValues={initialValues}
					initialPreview={product.image_url ?? null}
					onSubmit={handleSubmit}
				/>
			)}
		</div>
	);
}
