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

	if (Array.isArray(payload)) {
		return { items: payload as T[], meta: null, links: null };
	}

	const recordPayload = isRecord(payload) ? payload : null;

	if (recordPayload && Array.isArray(recordPayload.data)) {
		if (recordPayload.meta) {
			return {
				items: recordPayload.data as T[],
				meta: recordPayload.meta as PaginationMeta,
				links: (recordPayload.links as Record<string, unknown> | null | undefined) ?? null,
			};
		}

		const legacyMeta: PaginationMeta = {
			current_page: toNumber(recordPayload.current_page),
			last_page: toNumber(recordPayload.last_page),
			per_page: toNumber(recordPayload.per_page),
			total: toNumber(recordPayload.total),
			from: toNumber(recordPayload.from),
			to: toNumber(recordPayload.to),
		};
		const hasLegacyMeta = Object.values(legacyMeta).some((value) => typeof value !== "undefined" && value !== null);

		return {
			items: recordPayload.data as T[],
			meta: hasLegacyMeta ? legacyMeta : null,
			links: (recordPayload.links as Record<string, unknown> | null | undefined) ?? null,
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

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function toNumber(value: unknown): number | undefined {
	return typeof value === "number" ? value : undefined;
}
