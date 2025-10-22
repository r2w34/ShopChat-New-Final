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
    const body = await request.json();
    
    // Check if this is a session creation request (has customerEmail) or session fetch (has sessionId)
    if (body.customerEmail || body.customerName) {
      // CREATE NEW SESSION
      const { customerEmail, customerName, channel, language, metadata } = body;
      
      // Get shop from metadata URL or from config
      let shop = body.shop;
      if (!shop && metadata?.url) {
        // Extract shop from URL
        const match = metadata.url.match(/([^.]+)\.myshopify\.com/);
        if (match) {
          shop = match[0];
        }
      }

      if (!shop) {
        return json({ error: "Shop domain required" }, { status: 400 });
      }

      // Find or create store
      let store = await db.store.findUnique({
        where: { shopDomain: shop },
      });

      if (!store) {
        // Create store if it doesn't exist (for direct widget access)
        store = await db.store.create({
          data: {
            shopDomain: shop,
            shopName: shop.replace('.myshopify.com', ''),
            isActive: true,
          },
        });
      }

      // Get chat settings for welcome message
      const settings = await db.chatSettings.findUnique({
        where: { storeId: store.id },
      });

      // Generate unique session token
      const sessionToken = `${store.id}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // Create new chat session
      const session = await db.chatSession.create({
        data: {
          storeId: store.id,
          customerEmail: customerEmail || `guest_${Date.now()}@temp.com`,
          customerName: customerName || 'Guest',
          channel: channel || 'widget',
          language: language || 'en',
          status: 'active',
          sessionToken: sessionToken,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      console.log(`✅ New chat session created: ${session.id} for ${shop}`);

      const response = json({
        success: true,
        data: {
          sessionId: session.id,
          welcomeMessage: settings?.welcomeMessage || 'Hi! How can I help you today?',
        },
      });
      return cors(request, response);
      
    } else {
      // FETCH EXISTING SESSION
      const { sessionId, shop } = body;

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
    }
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
