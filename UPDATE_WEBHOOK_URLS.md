# 🔧 Update GDPR Webhook URLs in Shopify Partners

## 🚨 CURRENT ISSUE

Your Shopify Partners dashboard shows **WRONG webhook URLs**:

```
❌ Customers redact URL: https://shopchatai.indigenservices.com/webhooks
❌ Customers data request URL: https://shopchatai.indigenservices.com/webhooks  
❌ Shop redact URL: https://shopchatai.indigenservices.com/webhooks
```

**These need to be updated to:**

```
✅ Customers redact URL: https://shopchat-new.indigenservices.com/webhooks
✅ Customers data request URL: https://shopchat-new.indigenservices.com/webhooks
✅ Shop redact URL: https://shopchat-new.indigenservices.com/webhooks
```

---

## ✅ HOW TO FIX (2 MINUTES)

### Method 1: Update via Shopify Partners Dashboard

1. **Go to Shopify Partners:**
   ```
   https://partners.shopify.com
   ```

2. **Select your app** (ShopChat AI Chatbot)

3. **Go to "Configuration" tab**

4. **Scroll down to "Privacy compliance webhook subscriptions"**

5. **Update each URL:**
   - **Customers redact URL:**
     ```
     https://shopchat-new.indigenservices.com/webhooks
     ```
   
   - **Customers data request URL:**
     ```
     https://shopchat-new.indigenservices.com/webhooks
     ```
   
   - **Shop redact URL:**
     ```
     https://shopchat-new.indigenservices.com/webhooks
     ```

6. **Set API version:**
   ```
   2025-10
   ```

7. **Click "Save"**

---

### Method 2: Update via Shopify CLI (Faster)

```bash
cd /workspace/ShopChat-New-Final

# Deploy configuration to Partners
shopify app deploy
```

This will automatically sync your `shopify.app.toml` webhooks to Partners.

---

## 🔍 VERIFICATION

After updating, verify webhooks are working:

### Test GDPR Data Request:

```bash
curl -X POST https://shopchat-new.indigenservices.com/webhooks/customers/data_request \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: customers/data_request" \
  -d '{
    "shop_domain": "test-store.myshopify.com",
    "customer": {
      "id": 123,
      "email": "test@example.com"
    }
  }'
```

**Expected:** Should return 200 OK

### Test Customer Redact:

```bash
curl -X POST https://shopchat-new.indigenservices.com/webhooks/customers/redact \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: customers/redact" \
  -d '{
    "shop_domain": "test-store.myshopify.com",
    "customer": {
      "id": 123,
      "email": "test@example.com"
    }
  }'
```

**Expected:** Should return 200 OK

### Test Shop Redact:

```bash
curl -X POST https://shopchat-new.indigenservices.com/webhooks/shop/redact \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: shop/redact" \
  -d '{
    "shop_domain": "test-store.myshopify.com",
    "shop_id": 123
  }'
```

**Expected:** Should return 200 OK

---

## 📋 WEBHOOK ENDPOINTS

Your app has these specific GDPR webhook routes:

### 1. Customers Data Request
```
Route: /webhooks/customers/data_request
File: app/routes/webhooks.customers.data_request.tsx
Function: Collects and emails customer data
```

### 2. Customers Redact
```
Route: /webhooks/customers/redact
File: app/routes/webhooks.customers.redact.tsx
Function: Deletes customer chat data
```

### 3. Shop Redact
```
Route: /webhooks/shop/redact
File: app/routes/webhooks.shop.redact.tsx
Function: Deletes all shop data
```

### 4. Generic Webhook Handler
```
Route: /webhooks
File: app/routes/webhooks.tsx
Function: Handles other webhooks (orders, app uninstall, etc.)
```

---

## 🎯 WHY THIS MATTERS

**Without correct webhook URLs:**
- ❌ GDPR compliance won't work
- ❌ Customer data requests will fail
- ❌ Data redaction won't work
- ❌ App Store approval may be rejected

**With correct webhook URLs:**
- ✅ GDPR compliant
- ✅ Data requests work automatically
- ✅ Ready for App Store
- ✅ Legal compliance maintained

---

## 🔄 AUTOMATIC WEBHOOK REGISTRATION

Your webhooks are defined in `shopify.app.toml`:

```toml
[webhooks]
api_version = "2025-10"

  [[webhooks.subscriptions]]
  compliance_topics = ["customers/data_request", "customers/redact", "shop/redact"]
  uri = "https://shopchat-new.indigenservices.com/webhooks"
```

**To sync to Partners:**
```bash
shopify app deploy
```

---

## ✅ QUICK CHECKLIST

After updating webhooks:

- [ ] All 3 GDPR webhook URLs updated to `shopchat-new.indigenservices.com`
- [ ] API version set to `2025-10`
- [ ] Configuration saved in Partners
- [ ] Test each webhook endpoint (optional)
- [ ] Verify "Privacy compliance" section shows ✅ green checks

---

## 🚀 FASTER ALTERNATIVE

Instead of manual updates, just run:

```bash
cd /workspace/ShopChat-New-Final
shopify app config push
```

This pushes your `shopify.app.toml` directly to Partners!

---

## 📊 CURRENT vs CORRECT

| Webhook | Current (Wrong) | Correct (New) |
|---------|----------------|---------------|
| Data Request | `shopchatai...` | `shopchat-new...` |
| Customer Redact | `shopchatai...` | `shopchat-new...` |
| Shop Redact | `shopchatai...` | `shopchat-new...` |
| API Version | 2025-10 ✅ | 2025-10 ✅ |

---

## ⚠️ IMPORTANT NOTES

1. **Update ALL 3 webhook URLs** - Don't leave any on old domain
2. **Save changes** - Must click "Save" in Partners
3. **May take 5-10 minutes** to propagate
4. **Test after updating** - Verify webhooks respond

---

## 🎯 SUMMARY

**Do this NOW:**

1. Login to Partners: https://partners.shopify.com
2. Select app → Configuration
3. Update 3 webhook URLs to: `https://shopchat-new.indigenservices.com/webhooks`
4. Save changes
5. Done! ✅

**Time needed:** 2 minutes

**Priority:** HIGH (GDPR compliance)

---

**Updated:** October 22, 2025  
**Status:** ⚠️ Needs immediate update  
**Impact:** GDPR compliance, App Store approval

