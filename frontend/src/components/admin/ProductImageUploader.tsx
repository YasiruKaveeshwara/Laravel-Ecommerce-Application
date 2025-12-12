"use client";

import Image from "next/image";
import { useId, useState, type ChangeEvent, type DragEvent } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProductImageUploaderProps = {
	preview?: string | null;
	error?: string;
	onFileSelect: (file: File | null) => void;
	className?: string;
	description?: string;
	helperText?: string;
	note?: string;
	ctaText?: string;
};

export function ProductImageUploader({
	preview,
	error,
	onFileSelect,
	className,
	description = "Drag & drop hero art (recommended 1:1, JPG/PNG).",
	helperText = "Max 5MB. Watermarking handled automatically.",
	note = "Click to browse or drop files anywhere in this frame.",
	ctaText = "Gallery upload",
}: ProductImageUploaderProps) {
	const inputId = useId();
	const [isDragging, setIsDragging] = useState(false);

	const preventDefaults = (event: DragEvent<HTMLElement>) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const handleFile = (file: File | null) => {
		onFileSelect(file ?? null);
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const nextFile = event.target.files?.[0] ?? null;
		handleFile(nextFile);
		setIsDragging(false);
	};

	const handleDragEnter = (event: DragEvent<HTMLElement>) => {
		preventDefaults(event);
		setIsDragging(true);
	};

	const handleDragOver = (event: DragEvent<HTMLElement>) => {
		preventDefaults(event);
		if (!isDragging) {
			setIsDragging(true);
		}
	};

	const handleDragLeave = (event: DragEvent<HTMLElement>) => {
		preventDefaults(event);
		const nextTarget = event.relatedTarget as Node | null;
		if (nextTarget && event.currentTarget.contains(nextTarget)) {
			return;
		}
		setIsDragging(false);
	};

	const handleDrop = (event: DragEvent<HTMLElement>) => {
		preventDefaults(event);
		setIsDragging(false);
		const droppedFile = event.dataTransfer?.files?.[0] ?? null;
		handleFile(droppedFile);
	};

	return (
		<div className={cn("grid cursor-pointer", className)}>
			<input id={inputId} type='file' accept='image/*' className='sr-only' onChange={handleChange} />
			<label
				htmlFor={inputId}
				onDragEnter={handleDragEnter}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={cn(
					"relative rounded-3xl border border-dashed border-sky-200 bg-white/70 p-6 text-center shadow-card backdrop-blur transition-colors lg:self-start",
					isDragging && "border-2 border-sky-400 bg-sky-50/80",
					error && "border-rose-300 bg-rose-50/60"
				)}>
				<div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-sky-600'>
					<Upload className='h-8 w-8' />
				</div>
				<p className='mt-4 text-lg font-semibold text-slate-900'>{ctaText}</p>
				<p className='text-sm text-muted'>{isDragging ? "Release to drop your hero art." : description}</p>
				{preview && (
					<Image
						src={preview}
						alt='Preview'
						width={640}
						height={640}
						unoptimized
						className='mx-auto mt-4 h-64 w-full max-w-xl rounded-3xl object-cover'
					/>
				)}
				<p className='mt-4 text-xs text-muted'>{helperText}</p>
				<p className='mt-2 text-xs font-semibold text-sky-600'>{note}</p>
				{error && <p className='mt-2 text-xs font-semibold text-rose-500'>{error}</p>}
			</label>
		</div>
	);
}
