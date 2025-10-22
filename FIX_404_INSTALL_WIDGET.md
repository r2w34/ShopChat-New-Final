# Fix: 404 Error on Install Widget Page

## Problem
The "Install Widget" button and links throughout the app were returning a 404 error.

## Root Causes

### 1. Route URL Mismatch
There was a mismatch between the route URLs referenced in the code and the actual route file name:

- **Actual Route File**: `app/routes/app.install.tsx` → creates route `/app/install`
- **Referenced URLs**: `/app/install-widget` (incorrect)

The dashboard and other pages were linking to `/app/install-widget`, which doesn't exist, causing the 404 error.

### 2. Wrong Domain in Theme Extension
The theme extension was pointing to the wrong domain:
- **Old URL**: `https://twittstock.com`
- **Correct URL**: `https://shopchatai.indigenservices.com`

This would have prevented the widget from loading properly on customer stores.

## Solution

### Fix 1: Corrected Route URLs
Updated all references to the install widget route from `/app/install-widget` to `/app/install` in:
- `app/routes/app._index.tsx` (Dashboard page)
  - Welcome banner "1. Install Widget" button
  - Quick Actions "⚡ Install Widget" button  
  - Recent Conversations "Install Widget Now" button

### Fix 2: Updated Theme Extension URLs
Updated the theme extension snippet to use the correct domain:
- `extensions/theme-extension/snippets/ai-chat-widget.liquid`
  - Changed `apiUrl` from `https://twittstock.com` to `https://shopchatai.indigenservices.com`
  - Changed script `src` from `https://twittstock.com/embed.js` to `https://shopchatai.indigenservices.com/embed.js`

## Files Changed
- `app/routes/app._index.tsx` - Fixed 3 button URLs
- `extensions/theme-extension/snippets/ai-chat-widget.liquid` - Fixed domain URLs

## Verification
The navigation menu in `app/routes/app.tsx` already had the correct route `/app/install`.

## Deployment
1. ✅ Committed changes to git
2. ✅ Pushed to GitHub (main branch)
3. ✅ Pulled latest code on VPS server
4. ✅ Rebuilt the app with `npm run build`
5. ✅ Restarted PM2 process

## Testing
The install widget page should now be accessible at:
- **URL**: https://shopchatai.indigenservices.com/app/install
- **Via Navigation**: Click "Install Widget" in the left menu
- **Via Dashboard**: Click any "Install Widget" button on the dashboard

## App Configuration
Your Shopify app is configured correctly with:
- App URL: https://shopchatai.indigenservices.com
- Theme Extension Handle: ai-chat-widget-main
- Redirect URLs properly configured
- All necessary scopes granted

## Next Steps
1. Test the install widget page by accessing it through your Shopify admin
2. The page provides instructions for enabling the chat widget via Theme Customizer
3. The widget can be installed using the Theme Extension (recommended) or Script Tag API

---
**Fixed on**: October 17, 2025
**Deployed to**: https://shopchatai.indigenservices.com
