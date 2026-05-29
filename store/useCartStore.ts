"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SupportedCurrency } from "@/lib/products/types";

export type CartItem = {
  id: string;
  variantId?: string;
  name: string;
  price: number;
  currency: SupportedCurrency;
  size: string;
  image: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string, size: string) => void;
  updateSize: (id: string, oldSize: string, newSize: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      addItem: (item) => set((state) => {
        const quantity = item.quantity ?? 1;
        const existing = state.items.find((entry) => entry.id === item.id && entry.size === item.size);
        if (existing) {
          return {
            isOpen: true,
            items: state.items.map((entry) =>
              entry.id === item.id && entry.size === item.size
                ? { ...entry, quantity: entry.quantity + quantity }
                : entry,
            ),
          };
        }
        return { isOpen: true, items: [...state.items, { ...item, quantity }] };
      }),
      removeItem: (id, size) => set((state) => ({
        items: state.items.filter((entry) => !(entry.id === id && entry.size === size)),
      })),
      updateSize: (id, oldSize, newSize) => set((state) => {
        const target = state.items.find((entry) => entry.id === id && entry.size === oldSize);
        if (!target) return state;
        const duplicate = state.items.find((entry) => entry.id === id && entry.size === newSize);
        if (duplicate) {
          return {
            items: state.items
              .filter((entry) => !(entry.id === id && entry.size === oldSize))
              .map((entry) => entry.id === id && entry.size === newSize
                ? { ...entry, quantity: entry.quantity + target.quantity }
                : entry),
          };
        }
        return {
          items: state.items.map((entry) =>
            entry.id === id && entry.size === oldSize ? { ...entry, size: newSize } : entry,
          ),
        };
      }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "velmere-cart-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);
