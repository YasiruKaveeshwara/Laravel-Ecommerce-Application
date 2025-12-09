import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/types/product";

export type CartItem = {
  product: Product;
  quantity: number;
  unitPrice: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

function normalizePrice(product: Product) {
  const price = Number(product.price ?? 0);
  return Number.isFinite(price) ? price : 0;
}

function normalizeId(value: Product["id"] | string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  length: 0,
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const normalizedId = normalizeId(product?.id);
        if (!normalizedId || quantity <= 0) return;
        const normalizedProduct = { ...product, id: normalizedId } as Product;
        set((state) => {
          const existing = state.items.find((item) => normalizeId(item.product.id) === normalizedId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                normalizeId(item.product.id) === normalizedId ? { ...item, quantity: item.quantity + quantity } : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                product: normalizedProduct,
                quantity,
                unitPrice: normalizePrice(normalizedProduct),
              },
            ],
          };
        });
      },
      removeItem: (productId) => {
        const normalizedId = normalizeId(productId);
        if (!normalizedId) return;
        set((state) => ({ items: state.items.filter((item) => normalizeId(item.product.id) !== normalizedId) }));
      },
      updateQuantity: (productId, quantity) => {
        const normalizedId = normalizeId(productId);
        if (!normalizedId) return;
        if (quantity <= 0) {
          get().removeItem(normalizedId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            normalizeId(item.product.id) === normalizedId ? { ...item, quantity } : item
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "pulse-cart",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : noopStorage)),
      version: 2,
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== "object") {
          return { items: [] };
        }
        if (version < 2) {
          const existingItems = Array.isArray(persistedState.items) ? persistedState.items : [];
          return {
            ...persistedState,
            items: existingItems.map((item) => ({
              ...item,
              product: { ...item.product, id: normalizeId(item.product?.id) } as Product,
            })),
          };
        }
        return persistedState;
      },
    }
  )
);
