import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { money, useStore, type Product } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BuggyCart — Test Automation Playground Store" },
      { name: "description", content: "A mock e-commerce store with toggleable bugs for Cypress and Playwright practice." },
      { property: "og:title", content: "BuggyCart — Test Automation Playground" },
      { property: "og:description", content: "Practice automated testing on a store with intentional Chaos Mode bugs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Sort = "featured" | "price-asc" | "price-desc";

function ProductImage({ emoji }: { emoji: string }) {
  const { chaos } = useStore();
  const [ready, setReady] = useState(!chaos);
  useEffect(() => {
    if (!chaos) { setReady(true); return; }
    setReady(false);
    // BUG (chaos): images render 3 seconds late
    const t = setTimeout(() => setReady(true), 3000);
    return () => clearTimeout(t);
  }, [chaos]);
  return (
    <div className="flex aspect-square items-center justify-center rounded-xl bg-muted text-7xl">
      {ready ? <span data-testid="product-image" role="img" aria-label="product image">{emoji}</span> : <span data-testid="product-image-loading" className="h-12 w-12 animate-pulse rounded-full bg-border" />}
    </div>
  );
}

function Index() {
  const { add, chaos } = useStore();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("featured");

  const load = useCallback(async () => {
    setError(null);
    setProducts(null);
    try {
      const res = await fetch(`/api/products${chaos ? "?chaos=1" : ""}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setProducts((await res.json()).products);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    }
  }, [chaos]);

  useEffect(() => { load(); }, [load]);

  const sorted = products ? [...products] : [];
  if (sort !== "featured") {
    const dir = sort === "price-asc" ? 1 : -1;
    // BUG (chaos): sorts prices as text ("129" < "19" < "249"...)
    sorted.sort((a, b) => chaos ? String(a.price).localeCompare(String(b.price)) * dir : (a.price - b.price) * dir);
  }

  return (
    <Shell>
      <section className="mb-10 rounded-3xl bg-hero p-10">
        <h1 className="font-display text-4xl font-bold md:text-5xl">Shop, break, test.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">A fully working store — until you flip on Chaos Mode in Settings.</p>
      </section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-semibold">Products</h2>
        <label className="flex items-center gap-2 text-sm">
          Sort by
          <select data-testid="sort-select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="input">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>
      {error && (
        <div data-testid="products-error" role="alert" className="rounded-2xl border border-destructive p-6 text-center">
          <p className="text-destructive">Couldn't load products: {error}</p>
          <button data-testid="products-retry" onClick={load} className="btn-outline mt-3">Retry</button>
        </div>
      )}
      {!error && !products && <p data-testid="products-loading" className="text-muted-foreground">Loading products…</p>}
      {products && (
        <div data-testid="product-grid" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((p) => (
            <article key={p.id} data-testid={`product-card-${p.id}`} className="card-product">
              <Link to="/product/$id" params={{ id: p.id }} data-testid="product-link" className="block">
                <ProductImage emoji={p.emoji} />
                <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{p.category}</div>
                <h3 data-testid="product-name" className="font-semibold">{p.name}</h3>
              </Link>
              <div className="mt-2 flex items-center justify-between">
                <span data-testid="product-price" className="font-display text-lg font-bold">{money(p.price)}</span>
                <button data-testid="add-to-cart" onClick={() => add(p.id)} className="btn-primary">Add to Cart</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Shell>
  );
}
