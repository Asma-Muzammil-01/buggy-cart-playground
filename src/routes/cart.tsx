import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { getProduct, money, useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — BuggyCart" },
      { name: "description", content: "Review cart items and apply promo codes." },
      { property: "og:title", content: "Your Cart — BuggyCart" },
      { property: "og:description", content: "Review cart items and apply promo codes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

export function PromoBox() {
  const { applyPromo, promo } = useStore();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div>
      <div className="flex gap-2">
        <input data-testid="promo-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" className="input flex-1" maxLength={20} />
        <button data-testid="promo-apply" onClick={() => setMsg(applyPromo(code) ? "Promo applied!" : "Invalid code")} className="btn-outline">Apply</button>
      </div>
      {msg && <p data-testid="promo-message" className="mt-1 text-xs text-muted-foreground">{msg}</p>}
      {promo && <p data-testid="promo-active" className="mt-1 text-xs text-primary">Active: {promo} (10% off)</p>}
    </div>
  );
}

export function Totals() {
  const { subtotal, discount, total } = useStore();
  return (
    <dl className="space-y-1 text-sm">
      <div className="flex justify-between"><dt>Subtotal</dt><dd data-testid="summary-subtotal">{money(subtotal)}</dd></div>
      <div className="flex justify-between"><dt>Discount</dt><dd data-testid="summary-discount">-{money(discount)}</dd></div>
      <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><dt>Total</dt><dd data-testid="summary-total">{money(total)}</dd></div>
    </dl>
  );
}

function ServerTotals() {
  const { lines, chaos, cartId } = useStore();
  const [data, setData] = useState<{ subtotal: number; itemCount: number } | null>(null);
  const key = JSON.stringify(lines.map((l) => [l.productId, l.qty]));
  useEffect(() => {
    if (!lines.length) { setData(null); return; }
    let live = true;
    fetch("/api/cart/totals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartId, chaos, lines: lines.map(({ productId, qty }) => ({ productId, qty })) }),
    }).then((r) => r.json()).then((d) => { if (live) setData(d); }).catch(() => {});
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, chaos, cartId]);
  if (!data) return null;
  return (
    <div data-testid="server-totals" className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
      Server check: <span data-testid="server-item-count">{data.itemCount}</span> items ·{" "}
      <span data-testid="server-subtotal">{money(data.subtotal)}</span>
    </div>
  );
}

function CartPage() {
  const { lines, remove, setQty, chaos } = useStore();
  // BUG (chaos): more than 3 lines shifts the layout out of alignment
  const misaligned = chaos && lines.length > 3;
  return (
    <Shell>
      <h1 className="font-display text-3xl font-bold">Cart</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div data-testid="cart-table" className="lg:col-span-2">
          {lines.length === 0 && <p data-testid="cart-page-empty" className="text-muted-foreground">Nothing here yet. <Link to="/" className="text-primary underline">Shop now</Link></p>}
          {lines.map((l, i) => {
            const p = getProduct(l.productId)!;
            const off = misaligned && i >= 3;
            return (
              <div key={l.lineId} data-testid="cart-row" className={`grid grid-cols-[3rem_1fr_6rem_6rem_2.5rem] items-center gap-4 border-b border-border py-4 ${off ? "ml-6 -mr-6 pt-7" : ""}`}>
                <span className="text-3xl">{p.emoji}</span>
                <span data-testid="cart-row-name" className="font-medium">{p.name}</span>
                <input type="number" min={1} value={l.qty} data-testid="cart-row-qty" onChange={(e) => setQty(l.lineId, Number(e.target.value))} className={`input w-20 ${off ? "translate-y-2" : ""}`} />
                <span data-testid="cart-row-price" className={off ? "text-left" : "text-right"}>{money(p.price * l.qty)}</span>
                <button data-testid="cart-row-remove" aria-label="Remove" onClick={() => remove(l.lineId)} className="btn-ghost">✕</button>
              </div>
            );
          })}
        </div>
        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-5">
          <PromoBox />
          <Totals />
          <ServerTotals />
          <Link to="/checkout" data-testid="cart-checkout" className="btn-primary w-full justify-center">Proceed to checkout</Link>
        </aside>
      </div>
    </Shell>
  );
}
