"use client";

import { type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmDialogTone = "neutral" | "danger";

type ConfirmDialogProps = {
	open: boolean;
	title: string;
	description?: ReactNode;
	children?: ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	confirmTone?: ConfirmDialogTone;
	confirmLoading?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	disableOutsideClose?: boolean;
};

export function ConfirmDialog({
	open,
	title,
	description,
	children,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	confirmTone = "neutral",
	confirmLoading = false,
	onConfirm,
	onCancel,
	disableOutsideClose = false,
}: ConfirmDialogProps) {
	if (typeof document === "undefined" || !open) {
		return null;
	}

	const handleBackdropClick = () => {
		if (!disableOutsideClose) {
			onCancel();
		}
	};

	return createPortal(
		<div className='fixed inset-0 z-[1000] flex items-center justify-center px-4'>
			<div className='absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]' onClick={handleBackdropClick} />
			<div
				role='dialog'
				aria-modal='true'
				className='relative z-[1001] w-full max-w-md rounded-3xl border border-border/70 bg-white p-8 text-center shadow-2xl'>
				<button
					type='button'
					className='absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100'
					onClick={onCancel}
					aria-label='Close dialog'>
					<X className='h-4 w-4' />
				</button>
				<div className='flex flex-col items-center gap-4'>
					<div
						className={cn(
							"flex h-16 w-16 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-500",
							confirmTone === "danger" && "border-rose-200 bg-rose-50 text-rose-500"
						)}>
						<AlertTriangle className='h-8 w-8' />
					</div>
					<div className='space-y-2'>
						<h2 className='text-2xl font-semibold text-slate-900'>{title}</h2>
						{description && <p className='text-sm text-slate-600'>{description}</p>}
						{children && <div className='text-sm text-slate-600'>{children}</div>}
					</div>
				</div>
				<div className='mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4'>
					<Button
						variant='ghost'
						className='h-11 flex-1 rounded-2xl border border-slate-200 bg-slate-100/70 text-slate-600 hover:bg-slate-200'
						onClick={onCancel}
						disabled={confirmLoading}>
						{cancelLabel}
					</Button>
					<Button
						variant='outline'
						className={cn(
							"h-11 flex-1 rounded-2xl border px-4 text-base font-semibold text-white transition",
							confirmTone === "danger"
								? "border-rose-600 bg-rose-600 hover:bg-rose-700"
								: "border-sky-600 bg-sky-600 hover:bg-sky-700"
						)}
						onClick={onConfirm}
						disabled={confirmLoading}>
						{confirmLoading ? "Processing…" : confirmLabel}
					</Button>
				</div>
			</div>
		</div>,
		document.body
	);
}
