import Link from "next/link";
import type { ComponentProps, MouseEventHandler } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EditButtonProps = ComponentProps<typeof Button> & {
	label?: string;
	href?: string;
	prefetch?: boolean;
};

export function EditButton({
	label = "Edit",
	href,
	prefetch,
	className,
	variant = "default",
	disabled,
	onClick,
	...props
}: EditButtonProps) {
	const sharedClasses = cn(
		"edit-button inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition",
		"focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500",
		disabled && "pointer-events-none opacity-60",
		variant === "outline"
			? "border border-sky-200 bg-white text-sky-700 hover:bg-sky-50"
			: variant === "ghost"
			? "text-slate-700 hover:bg-slate-100"
			: "bg-sky-600 text-white shadow-card hover:bg-sky-500",
		className
	);

	const content = (
		<>
			<Pencil className='h-4 w-4' aria-hidden='true' />
			<span>{label}</span>
		</>
	);

	if (href) {
		return (
			<Link
				href={href}
				prefetch={prefetch}
				aria-disabled={disabled || undefined}
				className={sharedClasses}
				onClick={disabled ? undefined : (onClick as MouseEventHandler<HTMLAnchorElement> | undefined)}>
				{content}
			</Link>
		);
	}

	return (
		<Button {...props} variant={variant} disabled={disabled} onClick={onClick} className={sharedClasses}>
			{content}
		</Button>
	);
}
