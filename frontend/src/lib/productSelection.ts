import type { Product } from "@/types/product";

export type ProductSelectionScope = "storefront" | "admin";

type StoredSelection = {
  id: string;
  scope: ProductSelectionScope;
  snapshot?: Product;
  updated_at: number;
};

const STORAGE_KEY = "pulse:selectedProduct";

function isBrowser() {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function rememberProductSelection(product: Product, scope: ProductSelectionScope) {
  if (!isBrowser()) return;
  const normalizedId = String(product.id);
  const payload: StoredSelection = {
    id: normalizedId,
    scope,
    snapshot: { ...product, id: normalizedId },
    updated_at: Date.now(),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function readProductSelection(scope: ProductSelectionScope): StoredSelection | null {
  if (!isBrowser()) return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredSelection & { id: string | number };
    if (parsed.scope !== scope) {
      return null;
    }
    return { ...parsed, id: typeof parsed.id === "string" ? parsed.id : String(parsed.id) };
  } catch {
    return null;
  }
}

export function clearProductSelection() {
  if (!isBrowser()) return;
  sessionStorage.removeItem(STORAGE_KEY);
}
