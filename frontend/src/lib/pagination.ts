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
