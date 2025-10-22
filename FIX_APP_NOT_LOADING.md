# 🔧 Fix: App Not Loading After Client ID Change

## Issue
After changing the Client ID from `04c93bf898928e67c50132955f9ed710` to `cd129da562757dce12515300f4dc8fbb`, the app no longer loads in the Shopify admin.

## Root Cause
When you change the Client ID, all existing OAuth sessions become invalid. Merchants need to re-authorize the app with the new credentials.

---

## ✅ SOLUTION: Reinstall the App

### Option 1: Reinstall from Partners Dashboard (RECOMMENDED)

1. **Go to Partners Dashboard**
   - URL: https://partners.shopify.com/
   - Login to your account

2. **Navigate to Your App**
   - Click "Apps" in sidebar
   - Click "ShopChat AI Chatbot"

3. **Select Test Store**
   - Click "Test your app" section
   - Click "Select store"
   - Choose your development store

4. **Install App**
   - Click "Install app"
   - You'll see the OAuth grant screen
   - Click "Install" to authorize

5. **App Should Load**
   - After install, you'll be redirected to the app
   - App should load correctly with new Client ID

---

### Option 2: Uninstall & Reinstall

If Option 1 doesn't work:

1. **Uninstall Current App**
   - Go to your Shopify admin
   - Navigate to: Apps
   - Find "ShopChat AI Chatbot"
   - Click "..." → "Uninstall"

2. **Clear Browser Cache**
   ```
   Chrome: Ctrl+Shift+Delete → Clear all data
   Firefox: Ctrl+Shift+Delete → Clear all data
   ```

3. **Reinstall from Partners Dashboard**
   - Follow Option 1 steps above

---

### Option 3: Direct Install URL (If you have it)

If you have the direct install URL:

```
https://shopchatai.indigenservices.com/auth?shop=YOUR-STORE.myshopify.com
```

Replace `YOUR-STORE` with your actual store name.

---

## 🔍 Why This Happens

### OAuth Session Storage
When you install an app, Shopify stores:
- Client ID
- Access token
- Session information

### When Client ID Changes
- Old sessions are tied to old Client ID
- New Client ID = New OAuth flow required
- Old access tokens are invalid
- App can't authenticate

### The Fix
Re-authenticate (reinstall) to create new session with new Client ID.

---

## ⚠️ Important Notes

### 1. All Stores Need to Reinstall

If merchants have already installed your app with the old Client ID, they will need to:
- See the app not loading
- Uninstall and reinstall
- Or you notify them of the update

### 2. Production Impact

**If app is already live with merchants:**
- ❌ Changing Client ID will break their installations
- ⚠️ They'll need to reinstall
- 📧 You'll need to notify them

**If app is NOT yet live:**
- ✅ Safe to change Client ID
- ✅ Only affects test stores
- ✅ Just reinstall on test stores

### 3. Database Data Preserved

Good news: Your database data is still intact!
- Store records: ✅ Preserved
- Chat sessions: ✅ Preserved
- FAQs: ✅ Preserved
- Settings: ✅ Preserved

Only the OAuth session needs to be recreated.

---

## 🐛 Additional Troubleshooting

### If App Still Doesn't Load After Reinstall:

#### 1. Check Browser Console for Errors

Open Developer Tools (F12) and look for:

**Good Signs (Normal):**
```
WebSocket connection to 'wss://argus.shopifycloud.com/...' failed
```
^ This is a Shopify internal error, ignore it

**Bad Signs (Issues):**
```
401 Unauthorized
403 Forbidden
Mixed Content Error
CORS Error
```

#### 2. Check Server Logs

```bash
pm2 logs shopify-ai-chatbot --lines 50
```

Look for:
- Authentication errors
- Client ID mismatches
- OAuth failures

#### 3. Verify Environment Variables

```bash
cd /var/www/shopify-ai-chatbot
grep -E "SHOPIFY_API_KEY|SHOPIFY_API_SECRET" .env
```

Should show:
```
SHOPIFY_API_KEY=cd129da562757dce12515300f4dc8fbb
SHOPIFY_API_SECRET=YOUR_SECRET_HERE
```

#### 4. Verify shopify.app.toml

```bash
cd /var/www/shopify-ai-chatbot
grep "client_id" shopify.app.toml
```

Should show:
```
client_id = "cd129da562757dce12515300f4dc8fbb"
```

#### 5. Restart PM2 (if needed)

```bash
pm2 restart shopify-ai-chatbot
pm2 logs shopify-ai-chatbot --lines 20
```

---

## 🔐 OAuth Flow Check

After reinstall, the OAuth flow should be:

1. **You click "Install app"**
   ↓
2. **Redirect to OAuth grant screen**
   - Shows app name
   - Shows permissions requested
   - Shows "Install" button
   ↓
3. **You click "Install"**
   ↓
4. **App authenticates with new Client ID**
   ↓
5. **Redirect to app dashboard**
   ↓
6. **App loads successfully** ✅

### If OAuth Flow Breaks:

**Symptoms:**
- Infinite redirect loop
- "Invalid request" error
- Blank screen
- 401 errors

**Fixes:**
1. Check redirect URLs in Partners Dashboard match .env
2. Verify Client ID and Secret are correct
3. Clear browser cookies for Shopify
4. Try incognito/private browsing window

---

## 📝 Checklist After Client ID Change

- [ ] Updated shopify.app.toml (client_id)
- [ ] Updated .env (SHOPIFY_API_KEY)
- [ ] Updated .env (SHOPIFY_API_SECRET)
- [ ] Restarted PM2
- [ ] Uninstalled old app from test store
- [ ] Cleared browser cache
- [ ] Reinstalled app from Partners Dashboard
- [ ] OAuth grant screen appeared
- [ ] Clicked "Install"
- [ ] App loaded successfully

---

## 🎯 Quick Fix Steps (Copy-Paste)

```bash
# On your server:
cd /var/www/shopify-ai-chatbot

# Verify credentials
grep -E "SHOPIFY_API_KEY|SHOPIFY_API_SECRET" .env
grep "client_id" shopify.app.toml

# Should show:
# SHOPIFY_API_KEY=cd129da562757dce12515300f4dc8fbb
# SHOPIFY_API_SECRET=YOUR_SECRET_HERE
# client_id = "cd129da562757dce12515300f4dc8fbb"

# Restart app
pm2 restart shopify-ai-chatbot

# Check logs
pm2 logs shopify-ai-chatbot --lines 20
```

Then in browser:
1. Go to Partners Dashboard
2. Test your app → Select store → Install app
3. Complete OAuth flow
4. App should load ✅

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Updated toml but not .env
**Fix**: Update BOTH files with new Client ID

### ❌ Mistake 2: Forgot to restart PM2
**Fix**: Always restart after changing .env

### ❌ Mistake 3: Didn't reinstall app
**Fix**: Must reinstall to create new OAuth session

### ❌ Mistake 4: Using old browser session
**Fix**: Clear cache or use incognito

### ❌ Mistake 5: Client ID mismatch
**Fix**: Ensure .env, toml, and Partners Dashboard all match

---

## 💡 Pro Tips

### 1. Test in Incognito First
Before clearing your main browser cache, test in incognito window.

### 2. Keep Old Client ID Documented
Document what the old Client ID was, in case you need to rollback.

### 3. Notify Merchants (If Live)
If app is live and you change Client ID, send email to all merchants:

```
Subject: Action Required: Reinstall ShopChat AI App

Dear Merchant,

We've updated our app with security improvements. To continue using 
ShopChat AI, please:

1. Uninstall the current version
2. Reinstall from the Shopify App Store

Your data (chat history, FAQs, settings) will be preserved.

Questions? Contact support@indigenservices.com

Thank you!
```

### 4. Update in Stages
- Test on development store first ✅
- Verify it works
- Then update production

---

## ✅ Verification

After reinstall, verify:

1. **App loads in admin** ✅
2. **Dashboard displays data** ✅
3. **Settings page works** ✅
4. **Widget loads on storefront** ✅
5. **Chat functionality works** ✅
6. **No console errors** (except Shopify WebSocket - ignore that)

---

## 🎉 Success!

Once you reinstall, your app will work perfectly with the new Client ID!

The WebSocket error you saw (`wss://argus.shopifycloud.com`) is just Shopify's internal monitoring - it's not related to your app and can be ignored.

---

**Need more help?**
- Check PM2 logs: `pm2 logs shopify-ai-chatbot`
- Check browser console (F12)
- Verify all credentials match
- Try incognito mode

**You've got this!** 🚀
