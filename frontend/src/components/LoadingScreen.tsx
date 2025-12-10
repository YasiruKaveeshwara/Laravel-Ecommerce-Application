"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingScreenProps = {
	message?: string;
	description?: string;
	className?: string;
};

export function LoadingScreen({ message = "Loading", description, className }: LoadingScreenProps) {
	return (
		<div
			className={cn(
				"flex items-center justify-center rounded-3xl border border-border bg-white/80 p-10 shadow-card",
				className
			)}>
			<div className='space-y-3 text-center'>
				<Loader2 className='mx-auto h-8 w-8 animate-spin text-sky-500' />
				<p className='text-lg font-semibold text-slate-900'>{message}</p>
				{description && <p className='text-sm text-muted'>{description}</p>}
			</div>
		</div>
	);
}
