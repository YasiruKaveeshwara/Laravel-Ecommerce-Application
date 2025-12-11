"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type ProductImageProps = {
	src?: string | null;
	alt: string;
	className?: string; // applied to outer wrapper; use to size the component
	fallbackClassName?: string;
	rounded?: string;
};

const palette = [
	"from-sky-500 to-blue-600",
	"from-indigo-500 to-purple-600",
	"from-emerald-500 to-teal-600",
	"from-amber-500 to-orange-600",
	"from-rose-500 to-pink-600",
	"from-slate-500 to-slate-700",
];

export function ProductImage({ src, alt, className, fallbackClassName, rounded = "rounded-2xl" }: ProductImageProps) {
	const [failed, setFailed] = useState(false);
	const showFallback = !src || failed;

	const initials = buildInitials(alt);
	const colorIdx = Math.abs(hashString(alt)) % palette.length;
	const gradient = palette[colorIdx];

	return (
		<div className={cn("relative overflow-hidden", rounded, className)}>
			{showFallback ? (
				<div
					className={cn(
						"flex h-full w-full items-center justify-center bg-linear-to-br text-white text-lg font-semibold tracking-wide",
						gradient,
						fallbackClassName
					)}>
					<span>{initials}</span>
				</div>
			) : (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={src} alt={alt} className='h-full w-full object-cover' onError={() => setFailed(true)} />
			)}
		</div>
	);
}

function buildInitials(name: string) {
	if (!name) return "P";
	const parts = name.trim().split(/\s+/).slice(0, 2);
	const letters = parts.map((part) => part.charAt(0).toUpperCase());
	return letters.join("") || "P";
}

function hashString(value: string) {
	let hash = 0;
	for (let i = 0; i < value.length; i += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(i);
		hash |= 0;
	}
	return hash;
}
