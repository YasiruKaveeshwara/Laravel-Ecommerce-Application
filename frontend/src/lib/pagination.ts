import type { PaginationMeta } from "@/types/pagination";

export type NormalizedPagination<T> = {
	items: T[];
	meta: PaginationMeta | null;
	links: Record<string, unknown> | null;
};

export function normalizePaginatedResponse<T>(payload: unknown): NormalizedPagination<T> {
	if (!payload) {
		return { items: [], meta: null, links: null };
	}

	const anyPayload = payload as any;

	if (Array.isArray(payload)) {
		return { items: payload as T[], meta: null, links: null };
	}

	if (Array.isArray(anyPayload?.data)) {
		if (anyPayload.meta) {
			return {
				items: anyPayload.data as T[],
				meta: anyPayload.meta as PaginationMeta,
				links: anyPayload.links ?? null,
			};
		}

		const legacyMeta: PaginationMeta = {
			current_page: anyPayload.current_page,
			last_page: anyPayload.last_page,
			per_page: anyPayload.per_page,
			total: anyPayload.total,
			from: anyPayload.from,
			to: anyPayload.to,
		};
		const hasLegacyMeta = Object.values(legacyMeta).some((value) => typeof value !== "undefined" && value !== null);

		return {
			items: anyPayload.data as T[],
			meta: hasLegacyMeta ? legacyMeta : null,
			links: anyPayload.links ?? null,
		};
	}

	return { items: [], meta: null, links: null };
}

export type PaginationSummary = {
	currentPage: number;
	lastPage: number;
	perPage: number;
	total: number;
	from: number;
	to: number;
	hasResults: boolean;
	hasMultiplePages: boolean;
};

type SummarizeOptions = {
	fallbackCount?: number;
	pageSize?: number;
};

export function summarizePagination(meta?: PaginationMeta | null, options: SummarizeOptions = {}): PaginationSummary {
	const fallbackCount = Math.max(options.fallbackCount ?? 0, 0);
	const fallbackPageSize = options.pageSize ?? fallbackCount;
	const currentPage = Math.max(meta?.current_page ?? 1, 1);
	const perPageCandidate = meta?.per_page ?? fallbackPageSize ?? 0;
	const perPage = Math.max(perPageCandidate, 1);
	const totalCandidate = meta?.total ?? (meta?.last_page && perPage ? meta.last_page * perPage : fallbackCount);
	const total = Math.max(totalCandidate ?? 0, 0);
	const hasResults = total > 0;
	const computedFrom = hasResults ? meta?.from ?? (currentPage - 1) * perPage + 1 : 0;
	const countForRange = meta?.to && meta?.from ? meta.to - meta.from + 1 : fallbackCount || perPage;
	const computedTo = hasResults ? computedFrom + Math.max(countForRange - 1, 0) : 0;
	const to = hasResults ? Math.min(meta?.to ?? computedTo, total) : 0;
	const lastPageCandidate = meta?.last_page ?? (perPage ? Math.ceil(Math.max(total, 1) / perPage) : currentPage);
	const lastPage = Math.max(lastPageCandidate, 1);
	const hasMultiplePages = lastPage > 1;

	return {
		currentPage,
		lastPage,
		perPage,
		total,
		from: computedFrom,
		to,
		hasResults,
		hasMultiplePages,
	};
}
