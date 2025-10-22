# 🔧 Register Webhooks Using Shopify CLI

## 📝 Commands to Run

### Step 1: Navigate to your app directory

```bash
cd /var/www/shopify-ai-chatbot
```

### Step 2: Deploy webhooks configuration

```bash
npm run shopify app config push
```

**OR if that doesn't work:**

```bash
shopify app config push
```

**OR:**

```bash
npx shopify app config push
```

### Step 3: Verify webhooks are registered

```bash
npm run shopify webhooks list
```

**OR:**

```bash
shopify webhooks list
```

---

## 🎯 Expected Output

After running `shopify app config push`, you should see:

```
✓ Pushing app configuration...
✓ Webhooks configured:
  • customers/data_request → /webhooks/customers/data_request
  • customers/redact → /webhooks/customers/redact
  • shop/redact → /webhooks/shop/redact
  [+ 14 other webhooks]

✓ Configuration pushed successfully!
```

---

## ⚠️ If You Get Authentication Errors

If you're not logged in to Shopify CLI:

### Login to Shopify Partners:

```bash
shopify auth login
```

This will open a browser to log you in to your Shopify Partners account.

---

## 📋 Complete Command Sequence

**Copy and paste these commands one by one:**

```bash
# 1. Go to app directory
cd /var/www/shopify-ai-chatbot

# 2. Login to Shopify (if needed)
shopify auth login

# 3. Push configuration (including webhooks)
shopify app config push

# 4. Verify webhooks registered
shopify webhooks list

# 5. Check app info
shopify app info
```

---

## 🔍 Verify in Partners Dashboard

After running the commands:

1. Go to https://partners.shopify.com/
2. Click "Apps"
3. Click "AI Support Chatbot" or "ShopChat AI Support"
4. Go to "Configuration"
5. Scroll to "Webhooks" section
6. You should now see all 17 webhooks listed including:
   - ✅ customers/data_request
   - ✅ customers/redact  
   - ✅ shop/redact

---

## 🚀 Alternative Method: Manual Webhook Registration

If CLI doesn't work, you can register webhooks via API:

### Using curl:

```bash
# Set your variables
export SHOPIFY_API_KEY="your_api_key"
export SHOPIFY_API_SECRET="your_api_secret"
export SHOP_DOMAIN="your-store.myshopify.com"
export ACCESS_TOKEN="your_access_token"

# Register customers/data_request webhook
curl -X POST \
  "https://${SHOP_DOMAIN}/admin/api/2025-10/webhooks.json" \
  -H "X-Shopify-Access-Token: ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "topic": "customers/data_request",
      "address": "https://shopchat-new.indigenservices.com/webhooks/customers/data_request",
      "format": "json"
    }
  }'

# Register customers/redact webhook
curl -X POST \
  "https://${SHOP_DOMAIN}/admin/api/2025-10/webhooks.json" \
  -H "X-Shopify-Access-Token: ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "topic": "customers/redact",
      "address": "https://shopchat-new.indigenservices.com/webhooks/customers/redact",
      "format": "json"
    }
  }'

# Register shop/redact webhook
curl -X POST \
  "https://${SHOP_DOMAIN}/admin/api/2025-10/webhooks.json" \
  -H "X-Shopify-Access-Token: ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "topic": "shop/redact",
      "address": "https://shopchat-new.indigenservices.com/webhooks/shop/redact",
      "format": "json"
    }
  }'
```

---

## ✅ Checklist

After running commands, verify:

- [ ] Ran `shopify app config push` successfully
- [ ] Ran `shopify webhooks list` and see 17 webhooks
- [ ] Checked Partners Dashboard → Webhooks section
- [ ] See `customers/data_request` listed
- [ ] See `customers/redact` listed
- [ ] See `shop/redact` listed
- [ ] Resubmit app for review

---

## 📞 If Commands Don't Work

### Check if Shopify CLI is installed:

```bash
shopify version
```

### If not installed:

```bash
npm install -g @shopify/cli @shopify/app
```

### Then try again:

```bash
shopify app config push
```

---

## 🎯 Quick Fix Summary

**Problem**: Webhooks defined in `shopify.app.toml` but not registered with Shopify

**Solution**: Run `shopify app config push` to sync configuration

**Result**: Webhooks will appear in Partners Dashboard and automated checker will pass

---

## ⏱️ Expected Timeline

```
NOW: Run commands (5 minutes)
  ↓
IMMEDIATELY: Webhooks registered
  ↓  
RESUBMIT: App for review
  ↓
1-2 HOURS: Automated check passes ✅
  ↓
1-2 DAYS: Full app review complete
```

---

**Run these commands now and let me know the output!**
