import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Shell } from "@/components/Shell";
import { PromoBox, Totals } from "./cart";
import { getProduct, money, useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — BuggyCart" },
      { name: "description", content: "Multi-step checkout wizard: shipping, payment, review." },
      { property: "og:title", content: "Checkout — BuggyCart" },
      { property: "og:description", content: "Multi-step checkout wizard: shipping, payment, review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

const shippingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  address: z.string().trim().min(1, "Address is required").max(200),
  zip: z.string().trim().regex(/^\d{5}$/, "Zip must be 5 digits"),
});
const paymentSchema = z.object({
  card: z.string().transform((s) => s.replace(/\s/g, "")).pipe(z.string().regex(/^\d{16}$/, "Card must be 16 digits")),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY"),
  cvc: z.string().regex(/^\d{3}$/, "CVC must be 3 digits"),
});

const STEPS = ["Shipping", "Payment", "Review"];

function Checkout() {
  const { lines, chaos, total, clear } = useStore();
  const [step, setStep] = useState(0);
  const [ship, setShip] = useState({ name: "", email: "", address: "", zip: "" });
  const [pay, setPay] = useState({ card: "", expiry: "", cvc: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const validate = (schema: z.ZodTypeAny, data: object) => {
    const r = schema.safeParse(data);
    if (r.success) { setErrors({}); return true; }
    const e: Record<string, string> = {};
    r.error.issues.forEach((i) => { e[String(i.path[0])] = i.message; });
    setErrors(e);
    return false;
  };

  const submitShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    // BUG (chaos): zip containing "0" locks the submit button forever
    if (chaos && ship.zip.includes("0")) { setLocked(true); return; }
    if (validate(shippingSchema, ship)) setStep(1);
  };
  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate(paymentSchema, pay)) setStep(2);
  };
  const placeOrder = () => {
    setOrderId("BC-" + Math.random().toString(36).slice(2, 8).toUpperCase());
    clear();
  };

  if (orderId) return (
    <Shell>
      <div data-testid="order-confirmation" className="mx-auto max-w-md rounded-3xl border border-border bg-card p-10 text-center">
        <div className="text-5xl">🎉</div>
        <h1 className="mt-4 font-display text-2xl font-bold">Order placed!</h1>
        <p className="mt-2 text-muted-foreground">Order ID: <span data-testid="order-id" className="font-mono">{orderId}</span></p>
        <Link to="/" className="btn-primary mt-6">Continue shopping</Link>
      </div>
    </Shell>
  );

  if (lines.length === 0) return (
    <Shell><p data-testid="checkout-empty">Your cart is empty. <Link to="/" className="text-primary underline">Go shopping</Link></p></Shell>
  );

  const field = (label: string, key: string, value: string, onChange: (v: string) => void, placeholder = "") => (
    <label className="block text-sm font-medium">
      {label}
      <input data-testid={`input-${key}`} name={key} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="input mt-1 w-full" />
      {errors[key] && <span data-testid={`error-${key}`} className="mt-1 block text-xs text-destructive">{errors[key]}</span>}
    </label>
  );

  return (
    <Shell>
      <ol data-testid="wizard-steps" className="mb-8 flex gap-2">
        {STEPS.map((s, i) => (
          <li key={s} data-testid={`step-${i}`} data-active={i === step} className={`flex-1 rounded-full py-2 text-center text-sm font-medium ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}. {s}</li>
        ))}
      </ol>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          {step === 0 && (
            <form data-testid="shipping-form" onSubmit={submitShipping} className="space-y-4" noValidate>
              {field("Full name", "name", ship.name, (v) => setShip({ ...ship, name: v }))}
              {field("Email", "email", ship.email, (v) => setShip({ ...ship, email: v }))}
              {field("Address", "address", ship.address, (v) => setShip({ ...ship, address: v }))}
              {field("Zip code", "zip", ship.zip, (v) => setShip({ ...ship, zip: v }), "12345")}
              <button type="submit" data-testid="shipping-submit" disabled={locked} aria-busy={locked} className="btn-primary w-full justify-center disabled:opacity-60">
                {locked ? "Processing…" : "Continue to payment"}
              </button>
            </form>
          )}
          {step === 1 && (
            <form data-testid="payment-form" onSubmit={submitPayment} className="space-y-4" noValidate>
              {field("Card number", "card", pay.card, (v) => setPay({ ...pay, card: v }), "4242 4242 4242 4242")}
              <div className="grid grid-cols-2 gap-4">
                {field("Expiry", "expiry", pay.expiry, (v) => setPay({ ...pay, expiry: v }), "MM/YY")}
                {field("CVC", "cvc", pay.cvc, (v) => setPay({ ...pay, cvc: v }), "123")}
              </div>
              <div className="flex gap-2">
                <button type="button" data-testid="payment-back" onClick={() => setStep(0)} className="btn-outline">Back</button>
                <button type="submit" data-testid="payment-submit" className="btn-primary flex-1 justify-center">Review order</button>
              </div>
            </form>
          )}
          {step === 2 && (
            <div data-testid="review-step" className="space-y-4">
              <h2 className="font-display text-xl font-semibold">Review</h2>
              <p className="text-sm text-muted-foreground">Shipping to {ship.name}, {ship.address}, {ship.zip}</p>
              <p className="text-sm text-muted-foreground">Card ending {pay.card.replace(/\s/g, "").slice(-4)}</p>
              <ul className="divide-y divide-border">
                {lines.map((l) => { const p = getProduct(l.productId)!; return (
                  <li key={l.lineId} data-testid="review-line" className="flex justify-between py-2"><span>{p.emoji} {p.name} × {l.qty}</span><span>{money(p.price * l.qty)}</span></li>
                ); })}
              </ul>
              <div className="flex gap-2">
                <button data-testid="review-back" onClick={() => setStep(1)} className="btn-outline">Back</button>
                <button data-testid="place-order" onClick={placeOrder} className="btn-primary flex-1 justify-center">Place order · {money(total)}</button>
              </div>
            </div>
          )}
        </div>
        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-5">
          <PromoBox />
          <Totals />
        </aside>
      </div>
    </Shell>
  );
}
