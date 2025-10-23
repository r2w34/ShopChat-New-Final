# 🎯 UPDATE SHOPIFY PARTNERS - DO THIS NOW (2 MINUTES)

## ✅ YOUR NEW DOMAIN IS READY

```
Domain: https://shopchat-new.indigenservices.com
Client ID: c3bbfd4c456bb19a81aac204f238be0b
Status: ✅ ONLINE AND WORKING
```

---

## 📋 WHAT TO UPDATE IN PARTNERS

You need to update **3 things** in Shopify Partners Dashboard:

### 1. App URL
### 2. Redirect URLs
### 3. Webhook URLs

---

## 🚀 STEP-BY-STEP GUIDE

### STEP 1: Login to Partners

```
https://partners.shopify.com
```

---

### STEP 2: Select Your App

1. Click **"Apps"** in left sidebar
2. Find app with Client ID: **c3bbfd4c456bb19a81aac204f238be0b**
3. Click on it to open

---

### STEP 3: Go to Configuration

1. Click **"Configuration"** tab
2. Scroll to find these sections

---

### STEP 4: Update App URL

**Find: "App URL" section**

Change from:
```
https://shopchatai.indigenservices.com
```

To:
```
https://shopchat-new.indigenservices.com
```

✅ Click "Save" (if there's a save button)

---

### STEP 5: Update Redirect URLs

**Find: "Allowed redirection URL(s)" section**

Make sure you have these 3 URLs:
```
https://shopchat-new.indigenservices.com/auth/callback
https://shopchat-new.indigenservices.com/auth/shopify/callback
https://shopchat-new.indigenservices.com/api/auth/callback
```

**How to add:**
1. Click "Add URL" or "Edit"
2. Paste each URL
3. Click "Add" or "Save"

**Remove old URLs** (if present):
```
https://shopchatai.indigenservices.com/auth/callback
https://shopchatai.indigenservices.com/auth/shopify/callback
https://shopchatai.indigenservices.com/api/auth/callback
```

✅ Save changes

---

### STEP 6: Update Webhook URLs

**Find: "Privacy compliance webhook subscriptions" section**

You'll see 3 webhook URLs to update:

#### A. Customers data request URL:
```
Change to: https://shopchat-new.indigenservices.com/webhooks
```

#### B. Customers redact URL:
```
Change to: https://shopchat-new.indigenservices.com/webhooks
```

#### C. Shop redact URL:
```
Change to: https://shopchat-new.indigenservices.com/webhooks
```

**API Version:** Make sure it's set to **2025-10**

✅ Save changes

---

### STEP 7: Save All Changes

1. Scroll to bottom of page
2. Click **"Save"** button (big button at bottom)
3. Wait for confirmation message

---

### STEP 8: Wait for Verification (5-10 minutes)

Shopify will automatically:
- Test your webhook URLs
- Verify HMAC signatures
- Update status to ✅ green checkmarks

**You don't need to do anything - just wait!**

---

## 🔍 VERIFICATION

After 5-10 minutes:

1. **Go back to Partners Dashboard**
2. **Select your app**
3. **Go to "Distribution" tab**
4. **Check these sections:**

### Should ALL show ✅ Green:
```
✅ Verifies webhooks with HMAC signatures
✅ Customers data request URL
✅ Customers redact URL  
✅ Shop redact URL
✅ Using latest App Bridge script
✅ Using session tokens
```

---

## 📊 BEFORE vs AFTER

### BEFORE (Current - Incorrect):
```
App URL: shopchatai.indigenservices.com ❌
Webhooks: shopchatai.indigenservices.com ❌
HMAC: FAILED ❌
```

### AFTER (Correct):
```
App URL: shopchat-new.indigenservices.com ✅
Webhooks: shopchat-new.indigenservices.com ✅
HMAC: PASSED ✅
```

---

## ⚡ QUICK CHECKLIST

Use this while updating Partners:

### Configuration Tab:
- [ ] App URL = `https://shopchat-new.indigenservices.com`
- [ ] Redirect URL 1 = `https://shopchat-new.indigenservices.com/auth/callback`
- [ ] Redirect URL 2 = `https://shopchat-new.indigenservices.com/auth/shopify/callback`
- [ ] Redirect URL 3 = `https://shopchat-new.indigenservices.com/api/auth/callback`
- [ ] Customer data request = `https://shopchat-new.indigenservices.com/webhooks`
- [ ] Customer redact = `https://shopchat-new.indigenservices.com/webhooks`
- [ ] Shop redact = `https://shopchat-new.indigenservices.com/webhooks`
- [ ] API version = `2025-10`
- [ ] Clicked "Save" at bottom

### Distribution Tab (After 10 min):
- [ ] HMAC verification = ✅ Green
- [ ] All 3 webhooks = ✅ Green
- [ ] App Bridge = ✅ Green
- [ ] Session tokens = ✅ Green

---

## 🎯 COPY-PASTE VALUES

**App URL:**
```
https://shopchat-new.indigenservices.com
```

**Redirect URL 1:**
```
https://shopchat-new.indigenservices.com/auth/callback
```

**Redirect URL 2:**
```
https://shopchat-new.indigenservices.com/auth/shopify/callback
```

**Redirect URL 3:**
```
https://shopchat-new.indigenservices.com/api/auth/callback
```

**Customer Data Request URL:**
```
https://shopchat-new.indigenservices.com/webhooks
```

**Customer Redact URL:**
```
https://shopchat-new.indigenservices.com/webhooks
```

**Shop Redact URL:**
```
https://shopchat-new.indigenservices.com/webhooks
```

**API Version:**
```
2025-10
```

---

## 🚨 TROUBLESHOOTING

### Can't find Configuration tab?
- Make sure you're in the correct app
- Look for Client ID: c3bbfd4c456bb19a81aac204f238be0b

### Can't find webhook section?
- Scroll down on Configuration page
- Look for "Privacy compliance webhook subscriptions"

### Changes not saving?
- Make sure you click "Save" at bottom
- Check for error messages
- Try refreshing page and updating again

### HMAC still failing after 10 minutes?
- Check you saved ALL 3 webhook URLs
- Verify they ALL point to shopchat-new (not shopchatai)
- Wait another 10 minutes
- Check Distribution tab again

---

## ✅ SUCCESS INDICATORS

**You'll know it worked when:**

1. ✅ Configuration page shows all new URLs
2. ✅ No error messages when saving
3. ✅ Distribution tab shows green checkmarks (after 10 min)
4. ✅ HMAC verification status changes to "Passed"

---

## 🎉 AFTER UPDATING

Once all checkmarks are green:

1. **Install app on test store:**
   ```
   Partners → Your App → Test on development store → Select store → Install
   ```

2. **Use the app for 3 minutes:**
   - Click through all pages
   - Create a test FAQ
   - Change a setting
   - View analytics

3. **Wait 2-4 hours** for embedded app check to pass

4. **Check Partners** → Should show all requirements met! ✅

---

## 📞 NEED HELP?

If stuck, check:
- Partners Dashboard → Apps → Configuration
- Make sure Client ID matches: c3bbfd4c456bb19a81aac204f238be0b
- All URLs use https://shopchat-new.indigenservices.com

---

**Time Required:** 2 minutes to update + 10 minutes wait = ✅ FIXED

**Priority:** HIGH - Do this NOW!

**Next Step:** After this is done, install app and use it to pass embedded app check.

---

**Created:** October 23, 2025, 13:03 UTC  
**Status:** ⏳ Waiting for you to update Partners  
**Action:** Update Partners Dashboard NOW

