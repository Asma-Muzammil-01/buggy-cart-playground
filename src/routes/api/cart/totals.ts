import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getProduct } from "@/lib/store";

const Body = z.object({
  cartId: z.string().max(64),
  chaos: z.boolean(),
  lines: z.array(z.object({ productId: z.string(), qty: z.number().int().min(1) })).max(100),
});

const cache = new Map<string, { subtotal: number; itemCount: number }>();

export const Route = createFileRoute("/api/cart/totals")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
        const { cartId, chaos, lines } = parsed.data;
        // BUG (chaos): once a cart has items, returns the first cached result and ignores qty changes
        const hit = cache.get(cartId);
        if (chaos && hit) return Response.json({ ...hit, cached: true });
        const result = {
          subtotal: lines.reduce((s, l) => s + (getProduct(l.productId)?.price ?? 0) * l.qty, 0),
          itemCount: lines.reduce((s, l) => s + l.qty, 0),
        };
        if (lines.length) cache.set(cartId, result); else cache.delete(cartId);
        return Response.json({ ...result, cached: false });
      },
    },
  },
});
