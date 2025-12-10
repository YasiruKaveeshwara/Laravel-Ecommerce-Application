import { Button } from "@/components/ui/button";
import { summarizePagination } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/types/pagination";

type PaginationControlsProps = {
	meta?: PaginationMeta | null;
	loading?: boolean;
	itemsCount?: number;
	pageSize?: number;
	entityLabel?: string;
	className?: string;
	hideWhenSinglePage?: boolean;
	onPageChange?: (page: number) => void;
};

export function PaginationControls({
	meta,
	loading = false,
	itemsCount,
	pageSize,
	entityLabel = "records",
	className,
	hideWhenSinglePage = true,
	onPageChange,
}: PaginationControlsProps) {
	const summary = summarizePagination(meta, { fallbackCount: itemsCount, pageSize });
	const label = entityLabel.trim() || "records";
	const hasPages = summary.hasMultiplePages || !hideWhenSinglePage;

	if (hideWhenSinglePage && !summary.hasMultiplePages) {
		return null;
	}

	const rangeCopy = summary.hasResults
		? `Showing ${summary.from}-${summary.to} of ${summary.total} ${label}`
		: `Showing 0 ${label}`;

	const prevDisabled = loading || !onPageChange || summary.currentPage <= 1;
	const nextDisabled =
		loading ||
		!onPageChange ||
		summary.currentPage >= summary.lastPage ||
		(!summary.hasMultiplePages && summary.currentPage === summary.lastPage);

	const goToPrevious = () => {
		if (!onPageChange || summary.currentPage <= 1) return;
		onPageChange(Math.max(summary.currentPage - 1, 1));
	};

	const goToNext = () => {
		if (!onPageChange || summary.currentPage >= summary.lastPage) return;
		onPageChange(Math.min(summary.currentPage + 1, summary.lastPage));
	};

	return (
		<div
			className={cn(
				"flex flex-wrap items-center justify-between gap-3 border-t border-border/80 bg-slate-50/60 px-5 py-4 text-sm text-muted",
				className
			)}>
			<span className='font-medium text-slate-700'>{rangeCopy}</span>
			{hasPages && (
				<div className='flex flex-wrap items-center gap-2 text-xs text-slate-500'>
					<Button variant='outline' size='sm' type='button' disabled={prevDisabled} onClick={goToPrevious}>
						Previous
					</Button>
					<span>
						Page {summary.currentPage} of {summary.lastPage}
					</span>
					<Button variant='outline' size='sm' type='button' disabled={nextDisabled} onClick={goToNext}>
						Next
					</Button>
				</div>
			)}
		</div>
	);
}
