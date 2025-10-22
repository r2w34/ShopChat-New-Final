# 🔧 Fix: Mandatory Compliance Webhooks & HMAC Verification

## ⚠️ Error Message:
```
❌ "Provides mandatory compliance webhooks"
❌ "Verifies webhooks with HMAC signatures"
```

## 🔍 What Shopify is Checking:

1. **GDPR Webhooks Registered** - ✅ You have these
   - `customers/data_request` ✅
   - `customers/redact` ✅
   - `shop/redact` ✅

2. **Webhooks Respond Correctly** - ⚠️ Might need fixes
   - Must return HTTP 200 for valid requests
   - Must validate HMAC properly
   - Must handle edge cases

3. **HMAC Verification** - ✅ SDK handles this
   - `authenticate.webhook()` validates automatically
   - But we need to ensure error handling is correct

---

## ✅ THE FIX: Update Webhook Routes

The issue is that your webhooks are TOO SAFE - they return 200 even on errors, which confuses Shopify's automated checker.

### Current Code (ALL 3 GDPR webhooks):

```typescript
try {
  const { shop, payload } = await authenticate.webhook(request);
  // ... do work ...
  return json({ success: true }, { status: 200 });
} catch (error) {
  console.error("Error:", error);
  // ❌ PROBLEM: Returns 200 even on auth failure
  return json({ success: false, error: "Processing failed" }, { status: 200 });
}
```

### Fixed Code:

```typescript
try {
  const { shop, payload } = await authenticate.webhook(request);
  // ... do work ...
  return json({ success: true }, { status: 200 });
} catch (error) {
  console.error("Error:", error);
  // ✅ FIX: Return 401 if authentication fails
  if (error instanceof Response && error.status === 401) {
    return new Response("Unauthorized", { status: 401 });
  }
  // Return 500 for other errors but acknowledge receipt
  return json({ success: false, error: "Processing failed" }, { status: 500 });
}
```

---

## 📝 Files to Update:

### 1. `/app/routes/webhooks.customers.data_request.tsx`
### 2. `/app/routes/webhooks.customers.redact.tsx`
### 3. `/app/routes/webhooks.shop.redact.tsx`

---

## 🔧 COMPLETE FIXED CODE

### customers/data_request.tsx (REPLACE ENTIRE FILE):

```typescript
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

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
    // authenticate.webhook() automatically validates HMAC
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
        shop,
        customerId: payload.customer?.id,
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

      // TODO: In production, send this data to the customer via email
      // For now, log it for compliance purposes
    } else {
      console.log("⚠️ Store not found:", shop);
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
    
    // For other errors, return 500 but still acknowledge receipt
    // Shopify will retry on 500 errors
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
```

---

### customers/redact.tsx (REPLACE ENTIRE FILE):

```typescript
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * GDPR Compliance: Customer Data Deletion
 * Triggered when a customer requests data deletion
 * Must complete within 30 days
 * Sent 10 days after request (or 6 months if recent orders exist)
 */
export async function action({ request }: ActionFunctionArgs) {
  // Verify this is a POST request
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // authenticate.webhook() automatically validates HMAC
    const { shop, payload, topic } = await authenticate.webhook(request);

    console.log("🗑️  GDPR: Customer redaction request received", {
      shop,
      topic,
      customerId: payload.customer?.id,
      customerEmail: payload.customer?.email,
      ordersToRedact: payload.orders_to_redact?.length || 0,
    });

    // Find store
    const store = await db.store.findUnique({
      where: { shopDomain: shop },
    });

    if (store) {
      // Find all sessions for this customer
      const sessions = await db.chatSession.findMany({
        where: {
          storeId: store.id,
          customerEmail: payload.customer?.email,
        },
      });

      let deletedSessions = 0;
      let deletedMessages = 0;

      // Delete all messages and sessions
      for (const session of sessions) {
        // Delete messages first (foreign key constraint)
        const result = await db.chatMessage.deleteMany({
          where: { sessionId: session.id },
        });
        deletedMessages += result.count;

        // Delete session
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
    } else {
      console.log("⚠️ Store not found:", shop);
    }

    // Must respond with 200 status to acknowledge receipt
    return json({ success: true }, { status: 200 });
    
  } catch (error: any) {
    console.error("❌ Error redacting customer data:", error);
    
    // If authentication failed (invalid HMAC), return 401
    if (error.message?.includes("HMAC") || error.message?.includes("Unauthorized")) {
      console.error("🔒 HMAC verification failed");
      return new Response("Unauthorized - Invalid HMAC", { status: 401 });
    }
    
    // For other errors, return 500
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
```

---

### shop/redact.tsx (REPLACE ENTIRE FILE):

```typescript
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

/**
 * GDPR Compliance: Shop Data Deletion
 * Triggered 48 hours after app uninstall
 * Must delete all shop data
 */
export async function action({ request }: ActionFunctionArgs) {
  // Verify this is a POST request
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    // authenticate.webhook() automatically validates HMAC
    const { shop, payload, topic } = await authenticate.webhook(request);

    console.log("🗑️  GDPR: Shop redaction request received", {
      shop,
      topic,
      shopId: payload.shop_id,
      shopDomain: payload.shop_domain,
    });

    // Find store
    const store = await db.store.findUnique({
      where: { shopDomain: shop },
    });

    if (store) {
      let deletedMessages = 0;
      let deletedSessions = 0;
      let deletedFAQs = 0;
      let deletedAnalytics = 0;
      let deletedAutomations = 0;

      // 1. Delete all chat messages (must be first due to foreign keys)
      const messagesResult = await db.chatMessage.deleteMany({
        where: { 
          session: {
            storeId: store.id
          }
        },
      });
      deletedMessages = messagesResult.count;

      // 2. Delete all chat sessions
      const sessionsResult = await db.chatSession.deleteMany({
        where: { storeId: store.id },
      });
      deletedSessions = sessionsResult.count;

      // 3. Delete all FAQs
      const faqsResult = await db.fAQ.deleteMany({
        where: { storeId: store.id },
      });
      deletedFAQs = faqsResult.count;

      // 4. Delete analytics
      const analyticsResult = await db.analytics.deleteMany({
        where: { storeId: store.id },
      });
      deletedAnalytics = analyticsResult.count;

      // 5. Delete automations
      const automationsResult = await db.automation.deleteMany({
        where: { storeId: store.id },
      });
      deletedAutomations = automationsResult.count;

      // 6. Delete chat settings
      await db.chatSettings.deleteMany({
        where: { storeId: store.id },
      });

      // 7. Delete subscriptions
      await db.subscription.deleteMany({
        where: { storeId: store.id },
      });

      // 8. Delete store record (must be last)
      await db.store.delete({
        where: { id: store.id },
      });

      console.log("✅ Shop data completely deleted:", {
        shop,
        storeId: store.id,
        messagesDeleted: deletedMessages,
        sessionsDeleted: deletedSessions,
        faqsDeleted: deletedFAQs,
        analyticsDeleted: deletedAnalytics,
        automationsDeleted: deletedAutomations,
      });
    } else {
      console.log("⚠️ Store not found:", shop);
    }

    // Must respond with 200 status to acknowledge receipt
    return json({ success: true }, { status: 200 });
    
  } catch (error: any) {
    console.error("❌ Error redacting shop data:", error);
    
    // If authentication failed (invalid HMAC), return 401
    if (error.message?.includes("HMAC") || error.message?.includes("Unauthorized")) {
      console.error("🔒 HMAC verification failed");
      return new Response("Unauthorized - Invalid HMAC", { status: 401 });
    }
    
    // For other errors, return 500
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
```

---

## 🔑 Key Changes Made:

### 1. **Method Validation** ✅
```typescript
if (request.method !== "POST") {
  return new Response("Method Not Allowed", { status: 405 });
}
```

### 2. **Proper Error Status Codes** ✅
```typescript
// HMAC failure → 401
if (error.message?.includes("HMAC")) {
  return new Response("Unauthorized", { status: 401 });
}

// Other errors → 500 (so Shopify can retry)
return json({ error: "..." }, { status: 500 });
```

### 3. **Extract Topic for Logging** ✅
```typescript
const { shop, payload, topic } = await authenticate.webhook(request);
```

### 4. **Complete Data Deletion** ✅
- Delete in correct order (foreign keys)
- Delete ALL related data
- Log what was deleted

---

## 🚀 Deployment Steps:

### 1. Update the 3 Files

```bash
# On your local machine or server:
cd /var/www/shopify-ai-chatbot

# Copy the fixed code into these 3 files:
# - app/routes/webhooks.customers.data_request.tsx
# - app/routes/webhooks.customers.redact.tsx
# - app/routes/webhooks.shop.redact.tsx
```

### 2. Rebuild

```bash
npm run build
```

### 3. Restart

```bash
pm2 restart shopify-ai-chatbot
```

### 4. Test Webhooks

```bash
# Check logs to ensure no errors
pm2 logs shopify-ai-chatbot --lines 50
```

---

## 🧪 How Shopify Tests Your Webhooks:

### Automated Test Process:

1. **Sends test webhook to your endpoint**
   - URL: `https://shopchat-new.indigenservices.com/webhooks/customers/data_request`
   - Headers: `X-Shopify-Hmac-Sha256`, `X-Shopify-Topic`, etc.
   - Body: Sample GDPR request

2. **Checks HMAC signature**
   - Your `authenticate.webhook()` validates this automatically
   - If invalid → Must return 401
   - If valid → Continue processing

3. **Expects correct status code**
   - Success → 200
   - Auth failure → 401
   - Server error → 500

4. **Repeats for all 3 GDPR webhooks**
   - `customers/data_request`
   - `customers/redact`
   - `shop/redact`

---

## ✅ Verification Checklist:

After deploying, verify:

- [ ] All 3 webhook files updated
- [ ] App rebuilt successfully
- [ ] PM2 restarted
- [ ] No errors in logs
- [ ] Webhooks return proper status codes:
  - 200 on success
  - 401 on HMAC failure
  - 405 on non-POST
  - 500 on server error

---

## 📞 If Still Failing:

### Check Shopify Partners Dashboard:

1. Go to Partners dashboard
2. Click your app
3. Go to "API access" or "Webhooks"
4. Look for webhook test results
5. Check error messages

### Common Issues:

**Issue 1: "Webhook endpoint not responding"**
- Fix: Ensure your server is running
- Fix: Check Nginx configuration
- Fix: Verify SSL certificate is valid

**Issue 2: "Invalid HMAC signature"**
- Fix: Already handled by SDK
- Fix: Ensure you're using latest SDK version
- Fix: Check that `authenticate.webhook()` is called first

**Issue 3: "Timeout"**
- Fix: Reduce processing time in webhooks
- Fix: Process data asynchronously if needed
- Fix: Return 200 immediately, then process

---

## 🎯 Expected Outcome:

After applying these fixes and resubmitting:

```
✅ Provides mandatory compliance webhooks
✅ Verifies webhooks with HMAC signatures
```

Shopify's automated checker will:
1. Send test requests to your GDPR webhooks
2. Verify you validate HMAC correctly
3. Confirm you return proper status codes
4. Mark your app as compliant ✅

---

## 📝 Summary of What Changed:

### Before (❌ Issue):
```typescript
catch (error) {
  // Always returned 200, even on auth failure
  return json({ error }, { status: 200 });
}
```

### After (✅ Fixed):
```typescript
catch (error) {
  // Return 401 for auth failures
  if (error.message?.includes("HMAC")) {
    return new Response("Unauthorized", { status: 401 });
  }
  // Return 500 for other errors
  return json({ error }, { status: 500 });
}
```

---

**Time to fix:** 15 minutes
**Rebuild time:** 2 minutes
**Re-review time:** Instant (automated check)

Apply these fixes and resubmit! 🚀
