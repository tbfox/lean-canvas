import { serve } from "bun";
import index from "./index.html";
import {
  createCanvas,
  deleteCanvas,
  getCanvas,
  listCanvases,
  updateCanvas,
} from "./db";

async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? body : {};
  } catch {
    return {};
  }
}

const server = serve({
  routes: {
    "/api/canvases": {
      async GET() {
        return Response.json(listCanvases());
      },
      async POST(req) {
        const body = await readJson(req);
        const name = typeof body.name === "string" ? body.name : "";
        return Response.json(createCanvas(name, body.fields), { status: 201 });
      },
    },

    "/api/canvases/:id": {
      async GET(req) {
        const canvas = getCanvas(req.params.id);
        if (!canvas) return Response.json({ error: "Not found" }, { status: 404 });
        return Response.json(canvas);
      },
      async PUT(req) {
        const body = await readJson(req);
        const canvas = updateCanvas(req.params.id, body);
        if (!canvas) return Response.json({ error: "Not found" }, { status: 404 });
        return Response.json(canvas);
      },
      async DELETE(req) {
        if (!deleteCanvas(req.params.id))
          return Response.json({ error: "Not found" }, { status: 404 });
        return new Response(null, { status: 204 });
      },
    },

    // Serve index.html for all unmatched routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Lean Canvas running at ${server.url}`);
