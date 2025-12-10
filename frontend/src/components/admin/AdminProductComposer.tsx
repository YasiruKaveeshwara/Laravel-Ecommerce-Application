"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notifyError, notifyInfo } from "@/lib/notify";
import { BRAND_PRESET_LABELS, CATEGORY_OPTIONS } from "@/constants/catalog";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";

const DEFAULT_CATEGORY = CATEGORY_OPTIONS[0]?.id ?? "phones";

export type ProductComposerFormState = {
	name: string;
	brand: string;
	category: string;
	price: string;
	description: string;
};

type FormField = keyof ProductComposerFormState;
type FormErrors = Partial<Record<FormField | "image", string>>;

export type ProductComposerSubmitPayload = {
	form: ProductComposerFormState;
	file: File | null;
};

type AdminProductComposerProps = {
	mode: "create" | "edit";
	dataKey: string;
	initialValues?: Partial<ProductComposerFormState>;
	initialPreview?: string | null;
	requireImage?: boolean;
	submitLabel?: string;
	busyLabel?: string;
	onSubmit: (payload: ProductComposerSubmitPayload) => Promise<void> | void;
};

const createEmptyForm = (): ProductComposerFormState => ({
	name: "",
	brand: "",
	category: DEFAULT_CATEGORY,
	price: "",
	description: "",
});

const buildInitialForm = (values?: Partial<ProductComposerFormState>): ProductComposerFormState => ({
	...createEmptyForm(),
	...(values
		? {
				name: values.name ?? "",
				brand: values.brand ?? "",
				category: values.category ?? DEFAULT_CATEGORY,
				price: values.price ? String(values.price) : "",
				description: values.description ?? "",
		  }
		: {}),
});

export function AdminProductComposer({
	mode,
	dataKey,
	initialValues,
	initialPreview,
	requireImage = mode === "create",
	submitLabel,
	busyLabel,
	onSubmit,
}: AdminProductComposerProps) {
	const [form, setForm] = useState<ProductComposerFormState>(() => buildInitialForm(initialValues));
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(initialPreview ?? null);
	const [errors, setErrors] = useState<FormErrors>({});
	const [loading, setLoading] = useState(false);
	const initialSnapshotRef = useRef<{ form: ProductComposerFormState; preview: string | null }>(
		buildSnapshot(initialValues, initialPreview)
	);
	const objectUrlRef = useRef<string | null>(null);

	const isCreate = mode === "create";
	const primaryLabel = submitLabel ?? (isCreate ? "Publish device" : "Save changes");
	const busyText = busyLabel ?? (isCreate ? "Publishing..." : "Saving...");
	const resetLabel = isCreate ? "Reset form" : "Reset changes";
	const publishCardTitle = isCreate ? "Publish" : "Update";
	const publishCardHint = isCreate ? "You can edit/delete from the inventory tab." : "Changes go live immediately.";

	useEffect(() => {
		const snapshot = buildSnapshot(initialValues, initialPreview);
		initialSnapshotRef.current = snapshot;
		setForm(snapshot.form);
		setErrors({});
		setFile(null);
		updatePreview(snapshot.preview, false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dataKey]);

	useEffect(() => {
		return () => {
			if (objectUrlRef.current) {
				URL.revokeObjectURL(objectUrlRef.current);
			}
		};
	}, []);

	const updateField =
		(key: FormField) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
			const value = event.target.value;
			setForm((prev) => ({ ...prev, [key]: value }));
			setErrors((prev) => ({ ...prev, [key]: undefined }));
		};

	const updatePreview = (next: string | null, trackObjectUrl: boolean) => {
		if (objectUrlRef.current) {
			URL.revokeObjectURL(objectUrlRef.current);
			objectUrlRef.current = null;
		}
		if (trackObjectUrl && next) {
			objectUrlRef.current = next;
		}
		setPreview(next);
	};

	const handleFileSelect = (nextFile: File | null) => {
		setFile(nextFile);
		setErrors((prev) => ({ ...prev, image: undefined }));
		if (nextFile) {
			const objectUrl = URL.createObjectURL(nextFile);
			updatePreview(objectUrl, true);
		} else {
			updatePreview(initialSnapshotRef.current.preview, false);
		}
	};

	const resetForm = () => {
		const snapshot = initialSnapshotRef.current;
		setForm(snapshot.form);
		setFile(null);
		setErrors({});
		updatePreview(snapshot.preview, false);
		notifyInfo(
			isCreate ? "Form reset" : "Changes reverted",
			isCreate ? "Start fresh with the latest device details." : "Restored the last saved data for this device."
		);
	};

	const validateForm = () => {
		const nextErrors: FormErrors = {};
		if (!form.name.trim()) {
			nextErrors.name = "Model name is required.";
		}
		if (!form.brand.trim()) {
			nextErrors.brand = "Brand label is required.";
		}
		if (!form.category.trim()) {
			nextErrors.category = "Pick a category.";
		}
		const numericPrice = Number(form.price);
		if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
			nextErrors.price = "Enter a valid positive price.";
		}
		const trimmedDescription = form.description.trim();
		if (trimmedDescription.length < 20) {
			nextErrors.description = "Describe this device in at least 20 characters.";
		}
		if (requireImage && !file && !preview) {
			nextErrors.image = "Upload at least one hero image.";
		}
		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const isValid = validateForm();
		if (!isValid) {
			notifyError("Check fields", "Fix the highlighted inputs before continuing.");
			return;
		}

		setLoading(true);
		try {
			await onSubmit({ form, file });
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className='grid gap-6 lg:grid-cols-[1.7fr,1fr]'>
			<div className='grid gap-6 lg:grid-cols-2'>
				<section className='rounded-3xl border border-border bg-white/80 p-6 shadow-card backdrop-blur'>
					<h2 className='text-lg font-semibold text-slate-900'>Product details</h2>
					<p className='text-sm text-muted'>Tell shoppers what makes this release special.</p>
					<div className='mt-6 grid gap-4 sm:grid-cols-2'>
						<div className='space-y-2'>
							<label className='text-sm font-medium text-slate-700'>Model name</label>
							<Input
								value={form.name}
								onChange={updateField("name")}
								placeholder='e.g., Nova X Ultra 1TB'
								required
								className={cn(errors.name && "border-rose-300 focus:border-rose-400 focus:ring-rose-100")}
								aria-invalid={Boolean(errors.name)}
								aria-describedby={errors.name ? "name-error" : undefined}
							/>
							{errors.name && (
								<p id='name-error' className='text-xs font-semibold text-rose-500'>
									{errors.name}
								</p>
							)}
						</div>

						<div className='space-y-2'>
							<label className='text-sm font-medium text-slate-700'>Category</label>
							<select
								value={form.category}
								onChange={updateField("category")}
								className={cn(
									"rounded-2xl h-10 w-full border border-border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100",
									errors.category && "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
								)}
								aria-invalid={Boolean(errors.category)}
								aria-describedby={errors.category ? "category-error" : undefined}>
								{CATEGORY_OPTIONS.map((option) => (
									<option key={option.id} value={option.id}>
										{option.label}
									</option>
								))}
							</select>
							{errors.category && (
								<p id='category-error' className='text-xs font-semibold text-rose-500'>
									{errors.category}
								</p>
							)}
						</div>

						<div className='space-y-2'>
							<label className='text-sm font-medium text-slate-700'>Price (USD)</label>
							<Input
								type='number'
								min='0'
								step='0.01'
								value={form.price}
								onChange={updateField("price")}
								required
								className={cn(errors.price && "border-rose-300 focus:border-rose-400 focus:ring-rose-100")}
								aria-invalid={Boolean(errors.price)}
								aria-describedby={errors.price ? "price-error" : undefined}
							/>
							{errors.price && (
								<p id='price-error' className='text-xs font-semibold text-rose-500'>
									{errors.price}
								</p>
							)}
						</div>

						<div className='space-y-2'>
							<label className='text-sm font-medium text-slate-700'>Brand</label>
							<Input
								value={form.brand}
								onChange={updateField("brand")}
								className={cn("flex-1", errors.brand && "border-rose-300 focus:border-rose-400 focus:ring-rose-100")}
								required
								aria-invalid={Boolean(errors.brand)}
								aria-describedby={errors.brand ? "brand-error" : undefined}
							/>
							<div className='flex flex-wrap gap-2 text-xs text-muted'>
								{BRAND_PRESET_LABELS.map((preset) => (
									<button
										key={preset}
										type='button'
										onClick={() => {
											setForm((prev) => ({ ...prev, brand: preset }));
											setErrors((prev) => ({ ...prev, brand: undefined }));
										}}
										className={cn(
											"rounded-full border px-3 py-1",
											form.brand === preset ? "border-sky-500 bg-sky-50 text-sky-600" : "border-border"
										)}>
										{preset}
									</button>
								))}
							</div>
							{errors.brand && (
								<p id='brand-error' className='text-xs font-semibold text-rose-500'>
									{errors.brand}
								</p>
							)}
						</div>
					</div>

					<div className='mt-4 space-y-2'>
						<label className='text-sm font-medium text-slate-700'>Description</label>
						<textarea
							value={form.description}
							onChange={updateField("description")}
							rows={5}
							className={cn(
								"w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100",
								errors.description && "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
							)}
							aria-invalid={Boolean(errors.description)}
							aria-describedby={errors.description ? "description-error" : undefined}
							placeholder='Summarize display, camera, chipset, and accessory highlights.'
						/>
						{errors.description && (
							<p id='description-error' className='text-xs font-semibold text-rose-500'>
								{errors.description}
							</p>
						)}
					</div>
				</section>

				<section className='grid-cols-1 cursor-pointer'>
					<ProductImageUploader preview={preview} onFileSelect={handleFileSelect} error={errors.image} />
					<aside className='space-y-6 mt-4'>
						<div className='grid-cols-2 rounded-3xl border border-border bg-white/90 p-6 shadow-card'>
							<h3 className='text-base font-semibold text-slate-900'>{publishCardTitle}</h3>
							<div className='mt-4 space-y-3 text-sm text-muted'>
								<p>• {publishCardHint}</p>
							</div>
							<Button type='submit' disabled={loading} className='mt-4 w-full'>
								{loading ? busyText : primaryLabel}
							</Button>
							<Button type='button' variant='ghost' className='mt-2 w-full' onClick={resetForm} disabled={loading}>
								{resetLabel}
							</Button>
						</div>
					</aside>
				</section>
			</div>
		</form>
	);
}

function buildSnapshot(initialValues?: Partial<ProductComposerFormState>, preview?: string | null) {
	return {
		form: buildInitialForm(initialValues),
		preview: preview ?? null,
	};
}
