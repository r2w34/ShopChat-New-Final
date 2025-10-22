# 🚀 Final Deployment Checklist

## Current Status
- ✅ Server running and healthy
- ✅ CORS configured correctly
- ✅ API endpoints working
- ✅ Database connected
- ✅ Gemini AI configured
- ⚠️ App embed not loading on storefront

---

## Extension Deployment Steps (ON YOUR PC)

### Step 1: Clean Start
```powershell
cd C:\shopchat-AI-shopify
git reset --hard origin/main
git pull origin main
```

### Step 2: Deploy Extension
```powershell
npm run deploy
```

**Wait for**: "Deployed successfully" message

### Step 3: Enable in Theme
1. Go to **Shopify Admin**
2. **Online Store** → **Themes** → **Customize**
3. Click **"App embeds"** (left sidebar, scroll down)
4. Find **"AI Chat Widget"**
5. **Toggle it ON** (should turn blue/green)
6. Click **"Save"** (top right)

### Step 4: Test
1. Open your storefront: https://volter-store.myshopify.com
2. Open browser console (F12)
3. Look for: `🤖 AI Chat Widget: Initializing...`
4. Should see chat button in bottom right corner
5. Click and send a message

---

## Expected Console Logs

### When Widget Loads:
```
🤖 AI Chat Widget: Initializing...
✅ AI Chat Config: {apiUrl: "...", shop: "volter-store.myshopify.com", ...}
✅ Widget script loaded
AI Chat Widget: Loading...
Widget Config: {...}
AI Chat Widget: HTML created
AI Chat Widget: Initializing interactions
AI Chat Widget: Ready!
```

### When You Send a Message:
```
AI Chat Widget: Sending message: hello
Sending message to: https://shopchat-new.indigenservices.com/api/chat/message
Payload: {message: 'hello', shop: 'volter-store.myshopify.com'}
Response status: 200
Response data: {reply: "..."}
```

---

## If Extension Still Not Showing in App Embeds

### Option A: Re-link the App
```powershell
npm run shopify app config link
# Select your app: Shopchat-ai
```

### Option B: Check Extension UUID
```powershell
cat .env | findstr SHOPIFY
```
Should show extension IDs

### Option C: Force Clean Deploy
```powershell
Remove-Item -Path "node_modules" -Recurse -Force
Remove-Item -Path ".shopify" -Recurse -Force -ErrorAction SilentlyContinue
npm install
npm run shopify auth login
npm run shopify app config link
npm run deploy
```

---

## Troubleshooting

### Issue: "AI Chat Widget" not in App Embeds list
**Solution**: Extension didn't deploy. Run `npm run deploy` again.

### Issue: Console shows nothing about widget
**Solution**: App embed is disabled. Enable it in theme editor.

### Issue: Console shows initialization but no button
**Solution**: Check if widget-loader.js is loading (should see "Widget Config" log)

### Issue: CORS errors
**Solution**: Already fixed on server. Hard refresh (Ctrl+Shift+R)

### Issue: 404 errors
**Solution**: Server restarted successfully. Should be working now.

---

## Current Extension Structure

```
extensions/chat-widget/
├── shopify.extension.toml          # Main config
├── blocks/
│   └── chat-embed.liquid            # App embed block (target: body)
└── locales/
    └── en.default.json              # English translations
```

### shopify.extension.toml
```toml
name = "AI Chat Widget"
type = "theme"
handle = "ai-chat-widget"
```

### chat-embed.liquid (Key Parts)
- **Schema**: Defines settings (API URL, position, colors)
- **Target**: `body` (injects before `</body>`)
- **Script**: Loads widget from API URL

---

## Server Status

### API Endpoints
- ✅ `GET /health` - Working
- ✅ `GET /socket/status` - Working  
- ✅ `POST /api/chat/message` - Working
- ✅ `OPTIONS /api/*` - CORS preflight configured

### Environment
- ✅ Server: https://shopchat-new.indigenservices.com
- ✅ PM2: Running (PID 89735, uptime: stable)
- ✅ Nginx: Proxying correctly
- ✅ SSL: Valid certificate
- ✅ CORS: Enabled globally
- ✅ Database: Connected (SQLite)
- ✅ AI: Gemini 2.0 Flash configured

---

## What We Fixed Today

1. ✅ App embed extension structure (proper Shopify format)
2. ✅ CORS duplicate headers removed
3. ✅ OPTIONS preflight handler added
4. ✅ Syntax error in api.chat.message.tsx fixed
5. ✅ Build error resolved
6. ✅ Server restarted successfully
7. ✅ All GPT references changed to Gemini
8. ✅ Settings page error fixed
9. ✅ Database schema validated

---

## Next: Deploy on Your PC

**Run these commands in PowerShell:**

```powershell
cd C:\shopchat-AI-shopify
git reset --hard origin/main
git pull origin main
npm run deploy
```

Then enable in theme editor and test! 🚀
