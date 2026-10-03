import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Shell } from "@/components/Shell";
import { getProduct, money, useStore } from "@/lib/store";

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const p = getProduct(params.id);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Product"} — BuggyCart` },
      { name: "description", content: loaderData?.description ?? "Product details" },
      { property: "og:title", content: `${loaderData?.name ?? "Product"} — BuggyCart` },
      { property: "og:description", content: loaderData?.description ?? "Product details" },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const p = Route.useLoaderData();
  const { add, setCartOpen } = useStore();
  return (
    <Shell>
      <Link to="/" data-testid="back-link" className="text-sm text-muted-foreground hover:text-foreground">← Back to products</Link>
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-3xl bg-muted text-[10rem]">{p.emoji}</div>
        <div>
          <div className="text-sm uppercase tracking-wide text-muted-foreground">{p.category}</div>
          <h1 data-testid="detail-name" className="font-display text-4xl font-bold">{p.name}</h1>
          <div data-testid="detail-price" className="mt-3 font-display text-3xl text-primary">{money(p.price)}</div>
          <p data-testid="detail-description" className="mt-6 text-muted-foreground">{p.description}</p>
          <div className="mt-8 flex gap-3">
            <button data-testid="add-to-cart" onClick={() => add(p.id)} className="btn-primary px-6 py-3">Add to Cart</button>
            <button data-testid="open-cart-detail" onClick={() => setCartOpen(true)} className="btn-outline px-6 py-3">View cart</button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
