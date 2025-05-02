import { create } from "zustand";
import { type StateCreator } from "zustand";
import { Id } from "@/convex/_generated/dataModel";

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
}

type CartStoreCreator = StateCreator<CartStore>;

export const useCartStore = create<CartStore>(
  (set, get): CartStore => ({
    items: [],
    addItem: (item: CartItem) => {
      set((state: CartStore) => {
        const existingItem = state.items.find(
          (i) => i.productId === item.productId
        );
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          };
        }
        return { items: [...state.items, item] };
      });
    },
    removeItem: (productId: string) => {
      set((state: CartStore) => ({
        items: state.items.filter((i) => i.productId !== productId),
      }));
    },
    updateQuantity: (productId: string, quantity: number) => {
      set((state: CartStore) => ({
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      }));
    },
    clearCart: () => {
      set({ items: [] });
    },
    getItemQuantity: (productId: string) => {
      const item = get().items.find((i) => i.productId === productId);
      return item?.quantity || 0;
    },
  })
);
