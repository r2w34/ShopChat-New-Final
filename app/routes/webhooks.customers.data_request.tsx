import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { getEmailService } from "../services/email.server";

/**
 * GDPR Compliance: Customer Data Request
 * Triggered when a customer requests their data
 * Must respond within 30 days
 */
export async function action({ request }: ActionFunctionArgs) {
  // Verify this is a POST request
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { shop, payload, topic } = await authenticate.webhook(request);

    console.log("📋 GDPR: Customer data request received", {
      shop,
      topic,
      customerId: payload.customer?.id,
      customerEmail: payload.customer?.email,
      ordersRequested: payload.orders_requested?.length || 0,
    });

    // Find store
    const store = await db.store.findUnique({
      where: { shopDomain: shop },
    });

    if (store) {
      // Find all chat sessions for this customer
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
        messagesFound: customerData.totalMessages,
      });

      // Send customer data via email
      if (payload.customer?.email) {
        const emailService = getEmailService();
        const emailSent = await emailService.sendCustomerDataEmail(
          payload.customer.email,
          customerData
        );
        
        if (emailSent) {
          console.log("✅ Customer data email sent to:", payload.customer.email);
        } else {
          console.warn("⚠️ Failed to send customer data email (data logged for compliance)");
        }
      }
    }

    // Must respond with 200 status to acknowledge receipt
    return json({ success: true }, { status: 200 });
    
  } catch (error: any) {
    console.error("❌ Error processing customer data request:", error);
    
    // If authentication failed (invalid HMAC), return 401
    if (error.message?.includes("HMAC") || error.message?.includes("Unauthorized")) {
      console.error("🔒 HMAC verification failed");
      return new Response("Unauthorized - Invalid HMAC", { status: 401 });
    }
    
    // For other errors, return 500 (Shopify will retry)
    return json(
      { success: false, error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// Reject non-POST requests
export async function loader() {
  return new Response("Method Not Allowed", { status: 405 });
}
