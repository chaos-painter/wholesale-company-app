import { createContext, useContext, useState, type ReactNode } from 'react';
import type { CartItem, InventoryItem } from '../types';

interface CartContextType {
  items: CartItem[];
  add: (item: InventoryItem, qty?: number) => void;
  remove: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType>(null!);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (item: InventoryItem, qty = 1) =>
    setItems(prev => {
      const ex = prev.find(c => c.item.id === item.id);
      if (ex) {
        return prev.map(c =>
          c.item.id === item.id
            ? { ...c, quantity: Math.min(c.quantity + qty, item.quantity) }
            : c
        );
      }
      return [...prev, { item, quantity: Math.min(qty, item.quantity) }];
    });

  const remove = (id: number) => setItems(prev => prev.filter(c => c.item.id !== id));

  const updateQty = (id: number, qty: number) =>
    setItems(prev =>
      qty <= 0
        ? prev.filter(c => c.item.id !== id)
        : prev.map(c => (c.item.id === id ? { ...c, quantity: qty } : c))
    );

  const clear = () => setItems([]);

  const total = items.reduce((s, c) => s + parseFloat(c.item.unit_price) * c.quantity, 0);
  const count = items.reduce((s, c) => s + c.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
