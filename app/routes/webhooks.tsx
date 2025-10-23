import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * Unified Webhook Handler
 * Routes compliance webhooks to appropriate handlers
 */
export async function action({ request }: ActionFunctionArgs) {
  // Verify this is a POST request
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // authenticate.webhook() automatically validates HMAC signature
    // This uses the SHOPIFY_API_SECRET from .env to verify the webhook is authentic
    // If HMAC is invalid, it will throw an error
    const { shop, payload, topic } = await authenticate.webhook(request);

    console.log("📨 Webhook received", {
      shop,
      topic,
      timestamp: new Date().toISOString(),
    });

    // Acknowledge receipt immediately with 200 OK (Shopify requirement)
    // Process webhook asynchronously to avoid timeout (5 second limit)
    setImmediate(() => {
      processWebhookAsync(shop, topic, payload).catch(err => {
        console.error("❌ Async webhook processing error:", err);
      });
    });

    // Return 200 OK immediately (< 1 second response time)
    return json({ received: true }, { status: 200 });
    
  } catch (error: any) {
    console.error("❌ Error processing webhook:", {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    });
    
    // Check if this is an authentication error (invalid HMAC)
    // The Shopify SDK throws a Response object with 401 status
    if (error instanceof Response) {
      console.error("🔒 Authentication failed - returning error response");
      return error; // Return the 401 response from SDK
    }
    
    // Check error message for HMAC/auth keywords
    const errorMsg = error.message?.toLowerCase() || "";
    if (errorMsg.includes("hmac") || 
        errorMsg.includes("unauthorized") || 
        errorMsg.includes("authentication") ||
        errorMsg.includes("invalid signature")) {
      console.error("🔒 HMAC verification failed");
      return new Response("Unauthorized", { status: 401 });
    }
    
    // For other errors, return 500
    console.error("⚠️ Internal server error during webhook processing");
    return json(
      { success: false, error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// Async webhook processor (runs after 200 OK is sent)
async function processWebhookAsync(shop: string, topic: string, payload: any) {
  try {
    switch (topic) {
      case "CUSTOMERS_DATA_REQUEST":
        await handleCustomersDataRequest(shop, payload);
        break;
      
      case "CUSTOMERS_REDACT":
        await handleCustomersRedact(shop, payload);
        break;
      
      case "SHOP_REDACT":
        await handleShopRedact(shop, payload);
        break;
      
      default:
        console.log(`⚠️ Unhandled webhook topic: ${topic}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${topic} webhook:`, error);
    // Error is logged but doesn't affect the 200 OK already sent
  }
}

// GDPR: Customer Data Request Handler
async function handleCustomersDataRequest(shop: string, payload: any) {
  console.log("📋 GDPR: Customer data request", {
    shop,
    customerId: payload.customer?.id,
    customerEmail: payload.customer?.email,
  });

  const store = await db.store.findUnique({
    where: { shopDomain: shop },
  });

  if (store) {
    const sessions = await db.chatSession.findMany({
      where: {
        storeId: store.id,
        customerEmail: payload.customer?.email,
      },
      include: {
        messages: true,
      },
    });

    const customerData = {
      shop,
      email: payload.customer?.email,
      totalSessions: sessions.length,
      totalMessages: sessions.reduce((acc, s) => acc + s.messages.length, 0),
      sessions: sessions.map(session => ({
        id: session.id,
        createdAt: session.createdAt,
        messages: session.messages.map(msg => ({
          role: msg.role,
          message: msg.message,
          createdAt: msg.createdAt,
        })),
      })),
    };

    console.log("✅ Customer data collected:", {
      email: payload.customer?.email,
      sessionsFound: customerData.totalSessions,
    });

    // Data email sending is handled in webhooks.customers.data_request.tsx
  }
}

// GDPR: Customer Data Deletion Handler
async function handleCustomersRedact(shop: string, payload: any) {
  console.log("🗑️ GDPR: Customer redaction", {
    shop,
    customerId: payload.customer?.id,
    customerEmail: payload.customer?.email,
  });

  const store = await db.store.findUnique({
    where: { shopDomain: shop },
  });

  if (store) {
    const sessions = await db.chatSession.findMany({
      where: {
        storeId: store.id,
        customerEmail: payload.customer?.email,
      },
    });

    let deletedSessions = 0;
    let deletedMessages = 0;

    for (const session of sessions) {
      const result = await db.chatMessage.deleteMany({
        where: { sessionId: session.id },
      });
      deletedMessages += result.count;

      await db.chatSession.delete({
        where: { id: session.id },
      });
      deletedSessions++;
    }

    console.log("✅ Customer data deleted:", {
      email: payload.customer?.email,
      sessionsDeleted: deletedSessions,
      messagesDeleted: deletedMessages,
    });
  }
}

// GDPR: Shop Data Deletion Handler
async function handleShopRedact(shop: string, payload: any) {
  console.log("🗑️ GDPR: Shop redaction", {
    shop,
    shopId: payload.shop_id,
  });

  const store = await db.store.findUnique({
    where: { shopDomain: shop },
  });

  if (store) {
    // Delete in correct order (foreign keys)
    
    // 1. Delete messages
    const messagesResult = await db.chatMessage.deleteMany({
      where: { 
        session: {
          storeId: store.id
        }
      },
    });

    // 2. Delete sessions
    const sessionsResult = await db.chatSession.deleteMany({
      where: { storeId: store.id },
    });

    // 3. Delete FAQs
    const faqsResult = await db.fAQ.deleteMany({
      where: { storeId: store.id },
    });

    // 4. Delete analytics
    await db.analytics.deleteMany({
      where: { storeId: store.id },
    });

    // 5. Delete automations
    await db.automation.deleteMany({
      where: { storeId: store.id },
    });

    // 6. Delete chat settings
    await db.chatSettings.deleteMany({
      where: { storeId: store.id },
    });

    // 7. Delete subscriptions
    await db.subscription.deleteMany({
      where: { storeId: store.id },
    });

    // 8. Delete store (last)
    await db.store.delete({
      where: { id: store.id },
    });

    console.log("✅ Shop data deleted:", {
      shop,
      messagesDeleted: messagesResult.count,
      sessionsDeleted: sessionsResult.count,
      faqsDeleted: faqsResult.count,
    });
  }
}

// Reject non-POST requests
export async function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}
