"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { useCartStore, type CartItem } from "@/store/useCartStore";
import type { SupportedCurrency } from "@/lib/products/types";

export type { CartItem } from "@/store/useCartStore";

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  hasHydrated: boolean;
  itemCount: number;
  subtotal: number;
  currency: SupportedCurrency;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string, size: string) => void;
  updateSize: (id: string, oldSize: string, newSize: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useCartStore((state) => state.items);
  const rawIsOpen = useCartStore((state) => state.isOpen);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const markHydrated = useCartStore((state) => state.markHydrated);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateSize = useCartStore((state) => state.updateSize);
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      markHydrated();
      return;
    }
    void useCartStore.persist.rehydrate();
  }, [markHydrated]);

  const safeItems = useMemo(() => (hasHydrated ? items : []), [hasHydrated, items]);
  const isOpen = hasHydrated ? rawIsOpen : false;
  const itemCount = useMemo(() => safeItems.reduce((sum, item) => sum + item.quantity, 0), [safeItems]);
  const subtotal = useMemo(() => safeItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [safeItems]);
  const currency = safeItems[0]?.currency ?? "EUR";

  const value = useMemo<CartContextValue>(() => ({
    items: safeItems,
    isOpen,
    hasHydrated,
    itemCount,
    subtotal,
    currency,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    removeItem,
    updateSize,
    clearCart,
  }), [addItem, clearCart, closeCart, currency, hasHydrated, isOpen, itemCount, openCart, removeItem, safeItems, subtotal, toggleCart, updateSize]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
