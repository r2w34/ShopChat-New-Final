# 🔧 Register Webhooks Manually (Without CLI)

## ⚠️ Problem: Shopify CLI not installed / command not found

## ✅ Solution: Register webhooks through Partners Dashboard

---

## 📝 Step-by-Step Instructions

### Step 1: Go to Shopify Partners Dashboard

1. Open browser
2. Go to: **https://partners.shopify.com/**
3. Log in with your account

---

### Step 2: Navigate to Your App Configuration

1. Click **"Apps"** in the left sidebar
2. Find and click **"AI Support Chatbot"** or **"ShopChat AI Support"**
3. Click on the app version: **"ai-support-chatbot-31"** (or current active version)
4. Scroll down to **"Webhooks"** section

---

### Step 3: Add GDPR Compliance Webhooks (3 Required)

Click **"Add webhook"** or **"Configure webhooks"** button

#### Webhook 1: customers/data_request

```
Topic: customers/data_request
URL: https://shopchat-new.indigenservices.com/webhooks/customers/data_request
Format: JSON
API Version: 2025-10
```

Click **"Add webhook"** ✅

---

#### Webhook 2: customers/redact

```
Topic: customers/redact
URL: https://shopchat-new.indigenservices.com/webhooks/customers/redact
Format: JSON
API Version: 2025-10
```

Click **"Add webhook"** ✅

---

#### Webhook 3: shop/redact

```
Topic: shop/redact
URL: https://shopchat-new.indigenservices.com/webhooks/shop/redact
Format: JSON
API Version: 2025-10
```

Click **"Add webhook"** ✅

---

### Step 4: Add Optional Webhooks (Recommended for Full Functionality)

These are not required for approval but improve app functionality:

#### app/uninstalled

```
Topic: app/uninstalled
URL: https://shopchat-new.indigenservices.com/webhooks/app/uninstalled
Format: JSON
API Version: 2025-10
```

#### orders/create

```
Topic: orders/create
URL: https://shopchat-new.indigenservices.com/webhooks/orders/create
Format: JSON
API Version: 2025-10
```

#### orders/updated

```
Topic: orders/updated
URL: https://shopchat-new.indigenservices.com/webhooks/orders/updated
Format: JSON
API Version: 2025-10
```

#### products/create

```
Topic: products/create
URL: https://shopchat-new.indigenservices.com/webhooks/products/create
Format: JSON
API Version: 2025-10
```

#### products/update

```
Topic: products/update
URL: https://shopchat-new.indigenservices.com/webhooks/products/update
Format: JSON
API Version: 2025-10
```

---

### Step 5: Save Changes

1. After adding all webhooks, click **"Save"**
2. Verify all webhooks appear in the list
3. Make sure status shows **"Active"** or **"Enabled"**

---

## ✅ Verification Checklist

After adding webhooks, verify you see:

**REQUIRED (Must Have):**
- [ ] ✅ customers/data_request
- [ ] ✅ customers/redact
- [ ] ✅ shop/redact

**RECOMMENDED (Should Have):**
- [ ] app/uninstalled
- [ ] orders/create
- [ ] orders/updated
- [ ] products/create
- [ ] products/update

---

## 🎯 What the Webhooks Page Should Look Like

You should see a table like this:

| Topic | Endpoint | Format | Status |
|-------|----------|--------|--------|
| customers/data_request | https://shopchat-new.indigenservices.com/webhooks/customers/data_request | JSON | Active |
| customers/redact | https://shopchat-new.indigenservices.com/webhooks/customers/redact | JSON | Active |
| shop/redact | https://shopchat-new.indigenservices.com/webhooks/shop/redact | JSON | Active |
| app/uninstalled | https://shopchat-new.indigenservices.com/webhooks/app/uninstalled | JSON | Active |
| ... | ... | ... | ... |

---

## 📸 Visual Guide

### Where to Find Webhooks Section:

```
Partners Dashboard
  └── Apps
      └── AI Support Chatbot
          └── Configuration
              └── App setup
                  └── Webhooks ← HERE
                      └── [Add webhook] button
```

---

## 🚨 If You Don't See "Add Webhook" Button

### Alternative: Use API Configuration Tab

1. In Partners Dashboard
2. Go to your app
3. Click **"API access"** or **"Configuration"** tab
4. Look for **"Event subscriptions"** or **"Webhooks"**
5. Click **"Create webhook"** or **"Subscribe to events"**

---

## 🔄 Alternative Method: Import from TOML

Some Partners Dashboard versions allow importing configuration:

1. Go to your app in Partners Dashboard
2. Look for **"Import configuration"** or **"Sync from file"**
3. It may auto-detect your `shopify.app.toml` file
4. Click **"Import"** to sync all webhooks at once

---

## 🧪 Test Webhooks (After Registration)

### Option 1: Use Shopify's Test Feature

1. In Partners Dashboard → Webhooks
2. Click on a webhook (e.g., `customers/data_request`)
3. Look for **"Send test webhook"** button
4. Click it
5. Check your server logs: `pm2 logs shopify-ai-chatbot`
6. You should see: "📋 GDPR: Customer data request received"

### Option 2: Test with curl

```bash
# This won't work without valid HMAC, but tests endpoint is reachable
curl -X POST https://shopchat-new.indigenservices.com/webhooks/customers/data_request \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Should return 401 (because no valid HMAC)
# But confirms endpoint exists
```

---

## ✅ After Webhooks Are Registered

### 1. Verify in Dashboard

Go to: Partners Dashboard → Your App → Configuration → Webhooks

You should see at least 3 webhooks listed.

### 2. Resubmit App for Review

1. Go to your app listing
2. Click **"Resubmit for review"**
3. Shopify's automated checker will run again
4. This time it should pass: ✅ "Provides mandatory compliance webhooks"

### 3. Wait for Approval

- Automated checks: Instant (after resubmission)
- Full review: 1-2 business days

---

## 📊 Complete Webhook List (All 17 from your config)

For full functionality, add all these webhooks:

```
REQUIRED FOR APP STORE:
1. customers/data_request → /webhooks/customers/data_request
2. customers/redact → /webhooks/customers/redact
3. shop/redact → /webhooks/shop/redact

APP LIFECYCLE:
4. app/uninstalled → /webhooks/app/uninstalled
5. app/scopes_update → /webhooks/app/scopes_update

PRODUCTS (for recommendations):
6. products/create → /webhooks/products/create
7. products/update → /webhooks/products/update
8. products/delete → /webhooks/products/delete

ORDERS (for tracking):
9. orders/create → /webhooks/orders/create
10. orders/updated → /webhooks/orders/updated
11. orders/fulfilled → /webhooks/orders/fulfilled
12. orders/cancelled → /webhooks/orders/cancelled

CUSTOMERS (for personalization):
13. customers/create → /webhooks/customers/create
14. customers/update → /webhooks/customers/update

CARTS (for abandonment):
15. carts/create → /webhooks/carts/create
16. carts/update → /webhooks/carts/update

CHECKOUTS (for optimization):
17. checkouts/create → /webhooks/checkouts/create
18. checkouts/update → /webhooks/checkouts/update
```

**NOTE:** Only the first 3 are REQUIRED for app approval. The rest are optional but recommended for full functionality.

---

## 🎯 Priority

### Do This First (Required):
1. ✅ customers/data_request
2. ✅ customers/redact
3. ✅ shop/redact

### Do This Later (After Approval):
4-18. All other webhooks (can add anytime)

---

## 📞 If You Can't Find Webhooks Section

### Contact Shopify Support

If you really can't find the webhooks section in Partners Dashboard:

1. Go to: https://partners.shopify.com/
2. Click **"Help"** or **"Support"** in top-right
3. Start a chat or create a ticket
4. Say: "I need to register GDPR webhooks for my app but can't find the option"
5. They'll guide you or do it for you

---

## 🚀 Quick Summary

**Problem**: Webhooks not registered (CLI not installed)

**Solution**: Manually add in Partners Dashboard

**Steps**:
1. Partners Dashboard → Apps → Your App → Configuration → Webhooks
2. Click "Add webhook"
3. Add 3 required webhooks (customers/data_request, customers/redact, shop/redact)
4. Save
5. Resubmit app for review

**Time**: 10 minutes

**Result**: ✅ Automated checker will pass

---

## 💡 Pro Tip

After your app is approved, you can install Shopify CLI later for easier management:

```bash
npm install -g @shopify/cli @shopify/app
```

But for now, manual registration through dashboard is faster! ✅

---

**Do this now and you'll be approved within 1-2 days!** 🎉
