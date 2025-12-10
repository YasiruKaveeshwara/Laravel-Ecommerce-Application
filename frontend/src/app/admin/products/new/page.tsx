"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { notifyError, notifyInfo, notifySuccess } from "@/lib/notify";
import { BRAND_PRESET_LABELS, CATEGORY_OPTIONS } from "@/constants/catalog";
import { handleError } from "@/lib/handleError";

type ProductForm = {
	name: string;
	brand: string;
	category: string;
	price: string;
	description: string;
};

const DEFAULT_CATEGORY = CATEGORY_OPTIONS[0]?.id ?? "";

const createEmptyForm = (): ProductForm => ({
	name: "",
	brand: "",
	category: DEFAULT_CATEGORY,
	price: "",
	description: "",
});

type FormField = keyof ProductForm;
type FormErrors = Partial<Record<FormField | "image", string>>;

export default function NewProduct() {
	const router = useRouter();
	const uploadInputId = useId();
	const [form, setForm] = useState<ProductForm>(() => createEmptyForm());
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});

	const updateField =
		(key: FormField) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
			const value = event.target.value;
			setForm((prev) => ({ ...prev, [key]: value }));
			setErrors((prev) => ({ ...prev, [key]: undefined }));
		};

	const selectFile = (nextFile: File | null) => {
		setFile(nextFile);
		setPreview(nextFile ? URL.createObjectURL(nextFile) : null);
		setErrors((prev) => ({ ...prev, image: undefined }));
	};

	const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const nextFile = event.target.files?.[0] ?? null;
		selectFile(nextFile);
		setIsDragging(false);
	};

	const handleDragEnter = (event: React.DragEvent<HTMLElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setIsDragging(true);
	};

	const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
		event.preventDefault();
		event.stopPropagation();
		if (!isDragging) {
			setIsDragging(true);
		}
	};

	const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
		event.preventDefault();
		event.stopPropagation();
		const nextTarget = event.relatedTarget as Node | null;
		if (nextTarget && event.currentTarget.contains(nextTarget)) {
			return;
		}
		setIsDragging(false);
	};

	const handleDrop = (event: React.DragEvent<HTMLElement>) => {
		event.preventDefault();
		event.stopPropagation();
		setIsDragging(false);
		const droppedFile = event.dataTransfer?.files?.[0] ?? null;
		selectFile(droppedFile);
	};

	const resetForm = () => {
		setForm(createEmptyForm());
		setFile(null);
		setPreview(null);
		setErrors({});
		notifyInfo("Form reset", "Start fresh with the latest device details.");
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
		if (!file) {
			nextErrors.image = "Upload at least one hero image.";
		}
		setErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const isValid = validateForm();
		if (!isValid) {
			notifyError("Check fields", "Fix the highlighted inputs before publishing.");
			return;
		}
		if (!file) {
			return;
		}
		setLoading(true);
		const payload = new FormData();
		payload.append("name", form.name);
		payload.append("brand", form.brand);
		payload.append("category", form.category);
		payload.append("price", form.price);
		payload.append("description", form.description);
		payload.append("image", file);

		try {
			await api("/admin/products", { method: "POST", isForm: true, body: payload });
			notifySuccess("Device published", `${form.name} is now live in inventory.`);
			router.push("/admin/products");
		} catch (error: unknown) {
			handleError(error, { title: "Publish failed", fallbackMessage: "Unable to save product." });
		} finally {
			setLoading(false);
		}
	};

	function goBack() {
		router.back();
	}

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

			<form onSubmit={onSubmit} className='grid gap-6 lg:grid-cols-[1.7fr,1fr]'>
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
										"rounded-2xl h-10 w-full flex gap-2 border border-border bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-100",
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
								<div className='flex gap-2'>
									<Input
										value={form.brand}
										onChange={updateField("brand")}
										className={cn(
											"flex-1",
											errors.brand && "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
										)}
										required
										aria-invalid={Boolean(errors.brand)}
										aria-describedby={errors.brand ? "brand-error" : undefined}
									/>
								</div>
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
						<div className='grid cursor-pointer'>
							<Input
								id={uploadInputId}
								type='file'
								accept='image/*'
								onChange={onFileChange}
								className='sr-only cursor-pointer'
								aria-label='Upload product image'
							/>
							<label
								htmlFor={uploadInputId}
								onDragEnter={handleDragEnter}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								className={cn(
									"relative rounded-3xl border border-dashed border-sky-200 bg-white/70 p-6 text-center shadow-card backdrop-blur transition-colors lg:self-start",
									isDragging && "border-2 border-sky-400 bg-sky-50/80",
									errors.image && "border-rose-300 bg-rose-50/60"
								)}>
								<div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-sky-600'>
									<Upload className='h-8 w-8' />
								</div>
								<p className='mt-4 text-lg font-semibold text-slate-900'>Gallery upload</p>
								<p className='text-sm text-muted'>
									{isDragging ? "Release to drop your hero art." : "Drag & drop hero art (recommended 1:1, JPG/PNG)."}
								</p>
								{preview && (
									<img
										src={preview}
										alt='Preview'
										className='mx-auto mt-4 h-64 w-full max-w-xl rounded-3xl object-cover'
									/>
								)}
								<p className='mt-4 text-xs text-muted'>Max 5MB. Watermarking handled automatically.</p>
								<p className='mt-2 text-xs font-semibold text-sky-600'>
									Click to browse or drop files anywhere in this frame.
								</p>
								{errors.image && <p className='mt-2 text-xs font-semibold text-rose-500'>{errors.image}</p>}
							</label>
						</div>
						<div>
							<aside className='space-y-6 mt-4'>
								<div className=' grid-cols-2 rounded-3xl border border-border bg-white/90 p-6 shadow-card'>
									<h3 className='text-base font-semibold text-slate-900'>Publish</h3>
									<div className='mt-4 space-y-3 text-sm text-muted'>
										<p>• You can edit/delete from the inventory tab.</p>
									</div>
									<Button type='submit' disabled={loading} className='mt-4 w-full'>
										{loading ? "Publishing..." : "Publish device"}
									</Button>
									<Button type='button' variant='ghost' className='mt-2 w-full' onClick={resetForm}>
										Reset form
									</Button>
								</div>
							</aside>
						</div>
					</section>
				</div>
			</form>
		</div>
	);
}
