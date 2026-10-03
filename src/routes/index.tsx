import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { PRODUCTS, money, useStore } from "@/lib/store";

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

function Index() {
  const { add } = useStore();
  return (
    <Shell>
      <section className="mb-10 rounded-3xl bg-hero p-10">
        <h1 className="font-display text-4xl font-bold md:text-5xl">Shop, break, test.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">A fully working store — until you flip on Chaos Mode in Settings.</p>
      </section>
      <div data-testid="product-grid" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((p) => (
          <article key={p.id} data-testid={`product-card-${p.id}`} className="card-product">
            <Link to="/product/$id" params={{ id: p.id }} data-testid="product-link" className="block">
              <div className="flex aspect-square items-center justify-center rounded-xl bg-muted text-7xl">{p.emoji}</div>
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
    </Shell>
  );
}
