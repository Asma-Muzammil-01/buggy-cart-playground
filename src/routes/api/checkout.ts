import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({ chaos: z.boolean(), total: z.number(), items: z.number().int().min(1) });

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Invalid body" }, { status: 400 });
        // BUG (chaos): checkout takes 8 seconds to respond
        if (parsed.data.chaos) await new Promise((r) => setTimeout(r, 8000));
        const orderId = "BC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
        return Response.json({ orderId, total: parsed.data.total });
      },
    },
  },
});
