'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    title: string;
    price: number;
    kilogram: number;
    images: { url: string }[];
    condition: string;
  };
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const existing = get().items.find((i) => i.productId === newItem.productId);
        if (existing) {
          set((s) => ({
            items: s.items.map((i) =>
              i.productId === newItem.productId
                ? { ...i, quantity: i.quantity + newItem.quantity }
                : i
            ),
          }));
        } else {
          set((s) => ({
            items: [...s.items, { ...newItem, id: crypto.randomUUID() }],
          }));
        }
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      removeItem: (productId) => {
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),
    }),
    { name: 'greenpurse-cart' }
  )
);