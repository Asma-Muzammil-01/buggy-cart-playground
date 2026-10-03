import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { getProduct, money, useStore } from "@/lib/store";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <CartSidebar />
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">BuggyCart — a test automation playground</footer>
    </div>
  );
}

function Header() {
  const { itemCount, setCartOpen, chaos, setChaos } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" data-testid="logo" className="font-display text-xl font-bold">
          Buggy<span className="text-primary">Cart</span>
        </Link>
        <nav className="flex items-center gap-2">
          {chaos && <span data-testid="chaos-badge" className="rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">CHAOS</span>}
          <Link to="/cart" data-testid="nav-cart-page" className="btn-ghost">Cart page</Link>
          <div className="relative">
            <button data-testid="settings-button" aria-label="Settings" onClick={() => setOpen(!open)} className="btn-ghost">⚙️ Settings</button>
            {open && (
              <div data-testid="settings-menu" className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card p-4 shadow-lg">
                <label className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium">
                  Enable Chaos Mode
                  <input type="checkbox" data-testid="chaos-toggle" checked={chaos} onChange={(e) => setChaos(e.target.checked)} className="h-5 w-5 accent-[var(--destructive)]" />
                </label>
                <p className="mt-2 text-xs text-muted-foreground">Activates intentional frontend bugs for testing.</p>
              </div>
            )}
          </div>
          <button data-testid="open-cart" onClick={() => setCartOpen(true)} className="btn-primary">
            🛒 <span data-testid="cart-count">{itemCount}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

function CartSidebar() {
  const { cartOpen, setCartOpen, lines, remove, setQty, subtotal } = useStore();
  if (!cartOpen) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-foreground/40" onClick={() => setCartOpen(false)} data-testid="cart-overlay" />
      <aside data-testid="cart-sidebar" className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-display text-lg font-semibold">Your cart</h2>
          <button data-testid="close-cart" aria-label="Close cart" onClick={() => setCartOpen(false)} className="btn-ghost">✕</button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {lines.length === 0 && <p data-testid="cart-empty" className="text-muted-foreground">Cart is empty.</p>}
          {lines.map((l) => {
            const p = getProduct(l.productId)!;
            return (
              <div key={l.lineId} data-testid="sidebar-line" className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="text-3xl">{p.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{money(p.price)}</div>
                </div>
                <input type="number" min={1} value={l.qty} data-testid="sidebar-qty" onChange={(e) => setQty(l.lineId, Number(e.target.value))} className="input w-16" />
                <button data-testid="sidebar-remove" aria-label="Remove" onClick={() => remove(l.lineId)} className="btn-ghost">🗑</button>
              </div>
            );
          })}
        </div>
        <div className="border-t border-border p-4">
          <div className="mb-3 flex justify-between font-semibold">
            <span>Subtotal</span><span data-testid="sidebar-subtotal">{money(subtotal)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/cart" onClick={() => setCartOpen(false)} data-testid="view-cart" className="btn-outline">View cart</Link>
            <Link to="/checkout" onClick={() => setCartOpen(false)} data-testid="sidebar-checkout" className="btn-primary justify-center">Checkout</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
