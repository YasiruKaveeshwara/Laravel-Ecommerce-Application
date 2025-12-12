import type { ComponentProps } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DeleteButtonProps = ComponentProps<typeof Button> & {
	label?: string;
};

export function DeleteButton({
	label = "Delete",
	className,
	variant = "ghost",
	type = "button",
	...props
}: DeleteButtonProps) {
	return (
		<Button
			type={type}
			variant={variant}
			{...props}
			className={cn(
				"delete-button inline-flex items-center gap-2 rounded-full px-4 text-sm font-semibold text-rose-600",
				variant === "outline" ? "border border-rose-200 hover:bg-rose-50" : "hover:bg-rose-50",
				props.disabled && "opacity-70",
				className
			)}>
			<Trash2 className='h-4 w-4' aria-hidden='true' />
			<span>{label}</span>
		</Button>
	);
}
