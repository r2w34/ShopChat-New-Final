import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { cors } from "../utils/cors.server";
import db from "../db.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const { sessionId, shop } = await request.json();

    if (!sessionId || !shop) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    const store = await db.store.findUnique({
      where: { shopDomain: shop },
    });

    if (!store) {
      return json({ error: "Store not found" }, { status: 404 });
    }

    const session = await db.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return json({ error: "Session not found" }, { status: 404 });
    }

    const response = json({ session });
    return cors(request, response);
  } catch (error) {
    console.error("Session API error:", error);
    const response = json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
    return cors(request, response);
  }
}

export async function loader() {
  return json({ message: "Use POST method" }, { status: 405 });
}
