"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { notifySuccess } from "@/lib/notify";
import { handleError } from "@/lib/handleError";
import { AdminProductComposer, type ProductComposerSubmitPayload } from "@/components/admin/AdminProductComposer";
import { useRouteGuard } from "@/lib/useRouteGuard";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function NewProduct() {
	const router = useRouter();
	const guard = useRouteGuard({ requireAuth: true, requireRole: "administrator" });

	if (guard.pending) {
		return (
			<div className='mx-auto max-w-3xl px-4 py-24'>
				<LoadingScreen message='Checking access' description='Verifying your administrator session.' />
			</div>
		);
	}

	if (!guard.allowed) return null;

	const handleSubmit = async ({ form, file }: ProductComposerSubmitPayload) => {
		if (!file) {
			return;
		}

		const payload = new FormData();
		payload.append("name", form.name.trim());
		payload.append("brand", form.brand.trim());
		payload.append("category", form.category);
		payload.append("price", form.price.toString());
		payload.append("description", form.description.trim());
		payload.append("image", file);

		try {
			await api("/admin/products", { method: "POST", isForm: true, body: payload });
			notifySuccess("Device published", `${form.name} is now live in inventory.`);
			router.push("/admin/products");
		} catch (error: unknown) {
			handleError(error, { title: "Publish failed", fallbackMessage: "Unable to save product." });
		}
	};

	const goBack = () => router.back();

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start gap-4'>
				<div>
					<p className='text-sm font-semibold uppercase tracking-[0.3em] text-slate-500'>Products</p>
					<h1 className='text-3xl font-semibold text-slate-900'>Add a device</h1>
					<p className='text-sm text-muted'>Match the same admin look-and-feel used in inventory and customer views.</p>
				</div>
				<div className='ml-auto flex flex-wrap items-center gap-3'>
					<Button variant='ghost' className='rounded-2xl border border-border px-4' type='button' onClick={goBack}>
						<ArrowLeft className='h-4 w-4 mr-2' /> Inventory
					</Button>
				</div>
			</div>

			<AdminProductComposer mode='create' dataKey='new' onSubmit={handleSubmit} />
		</div>
	);
}
