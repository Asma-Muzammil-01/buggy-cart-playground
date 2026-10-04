import { createFileRoute } from "@tanstack/react-router";
import { PRODUCTS } from "@/lib/store";

let calls = 0;

export const Route = createFileRoute("/api/products")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const chaos = new URL(request.url).searchParams.get("chaos") === "1";
        calls++;
        // BUG (chaos): every 3rd call fails with a 500
        if (chaos && calls % 3 === 0) {
          return Response.json({ error: "Internal Server Error" }, { status: 500 });
        }
        return Response.json({ products: PRODUCTS });
      },
    },
  },
});
