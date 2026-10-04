import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type Product = { id: string; name: string; price: number; emoji: string; category: string; description: string };

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Echo Headphones", price: 129, emoji: "🎧", category: "Audio", description: "Wireless over-ear headphones with 40h battery life and active noise cancelling." },
  { id: "p2", name: "Pixel Watch Band", price: 29, emoji: "⌚", category: "Wearables", description: "Breathable silicone band in a dozen colors. Swaps in seconds." },
  { id: "p3", name: "Mech Keyboard", price: 149, emoji: "⌨️", category: "Desk", description: "Hot-swappable 75% mechanical keyboard with tactile switches." },
  { id: "p4", name: "Trail Backpack", price: 89, emoji: "🎒", category: "Outdoor", description: "28L weatherproof daypack with laptop sleeve." },
  { id: "p5", name: "Pour-Over Kit", price: 45, emoji: "☕", category: "Kitchen", description: "Ceramic dripper, glass carafe and 100 paper filters." },
  { id: "p6", name: "Desk Plant", price: 19, emoji: "🪴", category: "Home", description: "Low-maintenance pothos in a matte ceramic pot." },
  { id: "p7", name: "Action Camera", price: 249, emoji: "📷", category: "Audio", description: "4K60 waterproof camera with image stabilization." },
  { id: "p8", name: "Sneakers", price: 99, emoji: "👟", category: "Outdoor", description: "Lightweight everyday runners with recycled knit upper." },
];

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

export type Line = { lineId: string; productId: string; qty: number };

type Ctx = {
  chaos: boolean;
  setChaos: (v: boolean) => void;
  lines: Line[];
  add: (productId: string) => void;
  setQty: (lineId: string, qty: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
  subtotal: number;
  itemCount: number;
  promo: string | null;
  applyPromo: (code: string) => boolean;
  discount: number;
  total: number;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  cartId: string;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [chaos, setChaosState] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [promo, setPromo] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const lastAdd = useRef<Record<string, number>>({});

  useEffect(() => {
    setChaosState(localStorage.getItem("buggycart-chaos") === "1");
  }, []);
  const setChaos = (v: boolean) => {
    setChaosState(v);
    localStorage.setItem("buggycart-chaos", v ? "1" : "0");
  };

  const add = (productId: string) => {
    const now = Date.now();
    const rapid = now - (lastAdd.current[productId] ?? 0) < 400;
    lastAdd.current[productId] = now;
    if (rapid && !chaos) return; // correct: debounce double-clicks
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      // BUG (chaos): rapid second click pushes a duplicate line instead of incrementing
      if (chaos && rapid) return [...prev, { lineId: crypto.randomUUID(), productId, qty: 1 }];
      if (existing) return prev.map((l) => (l === existing ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { lineId: crypto.randomUUID(), productId, qty: 1 }];
    });
  };

  const setQty = (lineId: string, qty: number) =>
    setLines((prev) => prev.map((l) => (l.lineId === lineId ? { ...l, qty: Math.max(1, qty) } : l)));
  const remove = (lineId: string) => setLines((prev) => prev.filter((l) => l.lineId !== lineId));
  const [cartId, setCartId] = useState("initial");
  useEffect(() => { setCartId(crypto.randomUUID()); }, []);
  const clear = () => { setLines([]); setPromo(null); setCartId(crypto.randomUUID()); };

  // BUG (chaos): subtotal keyed by productId, so duplicate lines overwrite each other
  let subtotal: number;
  if (chaos) {
    const byProduct: Record<string, number> = {};
    lines.forEach((l) => { byProduct[l.productId] = (getProduct(l.productId)?.price ?? 0) * l.qty; });
    subtotal = Object.values(byProduct).reduce((a, b) => a + b, 0);
  } else {
    subtotal = lines.reduce((s, l) => s + (getProduct(l.productId)?.price ?? 0) * l.qty, 0);
  }
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);

  const applyPromo = (code: string) => {
    if (code.trim().toUpperCase() === "SAVE10") { setPromo("SAVE10"); return true; }
    return false;
  };
  // BUG (chaos): SAVE10 subtracts $100 flat instead of 10%
  const discount = promo === "SAVE10" ? (chaos ? 100 : Math.round(subtotal * 10) / 100) : 0;
  const total = chaos ? subtotal - discount : Math.max(0, subtotal - discount);

  return (
    <StoreCtx.Provider value={{ chaos, setChaos, lines, add, setQty, remove, clear, subtotal, itemCount, promo, applyPromo, discount, total, cartOpen, setCartOpen, cartId }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

export const money = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(n).toFixed(2)}`;
