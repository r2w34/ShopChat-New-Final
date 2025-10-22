import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "../db.server";
import { generateAIResponse, analyzeSentiment } from "../services/ai.server";
import { logger } from "../utils/logger.server";

export async function action({ request }: ActionFunctionArgs) {
  // CORS is handled by server.mjs global middleware
  
  try {
    // Parse request body - try multiple methods
    let body;
    try {
      // Try to clone and get text first to log it
      const clonedRequest = request.clone();
      const text = await clonedRequest.text();
      logger.debug("📨 Raw request body:", text);
      
      // Now parse the original request
      body = text ? JSON.parse(text) : {};
      logger.debug("📦 Parsed body:", JSON.stringify(body));
    } catch (parseError) {
      logger.error("❌ Failed to parse request body:", parseError);
      return json({ error: "Invalid JSON", details: parseError.message }, { status: 400 });
    }

    const { message, shop, customer, sessionId } = body;
    logger.debug("✅ Extracted fields:", { message, shop, hasCustomer: !!customer, sessionId });

    if (!message || !shop) {
      logger.error("❌ Missing required fields:", { message: !!message, shop: !!shop });
      return json({ 
        error: "Missing required fields",
        details: { messageProvided: !!message, shopProvided: !!shop }
      }, { status: 400 });
    }

    // Find or create store
    let store = await db.store.findUnique({
      where: { shopDomain: shop },
    });

    if (!store) {
      // Create store if it doesn't exist
      store = await db.store.create({
        data: {
          shopDomain: shop,
          shopName: shop,
          plan: "free",
          isActive: true,
        },
      });
    }

    // Get or create session
    let session;
    if (sessionId) {
      session = await db.chatSession.findUnique({
        where: { id: sessionId },
      });
    }

    if (!session) {
      // Generate a unique session token
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      session = await db.chatSession.create({
        data: {
          storeId: store.id,
          sessionToken: sessionToken,
          customerEmail: customer?.email || `guest_${Date.now()}@temp.com`,
          customerName: customer?.name || "Guest",
          status: "active",
          channel: "widget",
          language: "en",
        },
      });
    }

    // Save customer message
    await db.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: customer?.name || customer?.email || "Guest",
        message: message,
        isAI: false,
      },
    });

    // Get FAQs for context
    const faqs = await db.fAQ.findMany({
      where: {
        storeId: store.id,
        enabled: true,
      },
      take: 10,
    });

    // Generate AI response using Gemini
    const aiResponse = await generateAIResponse(message, {
      shop: shop,
      customer: customer,
      faqs: faqs,
    });

    // Analyze sentiment
    const sentiment = await analyzeSentiment(message);

    // Save AI response
    await db.chatMessage.create({
      data: {
        sessionId: session.id,
        sender: "AI Assistant",
        message: aiResponse,
        isAI: true,
      },
    });

    // Update session (updatedAt will be automatically updated by Prisma)
    await db.chatSession.update({
      where: { id: session.id },
      data: {
        sentiment: sentiment,
      },
    });

    const response = json({
      reply: aiResponse,
      sessionId: session.id,
      sentiment: sentiment,
    });

    return response;
  } catch (error) {
    console.error("Chat API error:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    const response = json(
      { 
        error: "Failed to process message",
        reply: "I apologize, but I'm having trouble right now. Please try again or contact support.",
        debug: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
    return response;
  }
}

export async function loader({ request }: ActionFunctionArgs) {
  // Handle CORS preflight for GET/OPTIONS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
  
  return new Response(JSON.stringify({ message: "Use POST method" }), {
    status: 405,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
