"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
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

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
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
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((value) => !value), []);

  const addItem = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.id === item.id && entry.size === item.size);
      if (existing) {
        return current.map((entry) =>
          entry.id === item.id && entry.size === item.size
            ? { ...entry, quantity: entry.quantity + (item.quantity ?? 1) }
            : entry,
        );
      }
      return [...current, { ...item, quantity: item.quantity ?? 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string, size: string) => {
    setItems((current) => current.filter((entry) => !(entry.id === id && entry.size === size)));
  }, []);

  const updateSize = useCallback((id: string, oldSize: string, newSize: string) => {
    setItems((current) =>
      current.map((entry) =>
        entry.id === id && entry.size === oldSize ? { ...entry, size: newSize } : entry,
      ),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const currency = items[0]?.currency ?? "EUR";

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
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
    }),
    [
      addItem,
      clearCart,
      closeCart,
      currency,
      isOpen,
      itemCount,
      items,
      openCart,
      removeItem,
      subtotal,
      toggleCart,
      updateSize,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
