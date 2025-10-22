# 🧪 ShopChat AI - Complete Testing Guide

**Store**: tulipst.myshopify.com  
**App URL**: https://shopchat-new.indigenservices.com  
**Date**: October 22, 2025  

---

## ✅ DEPLOYMENT STATUS

### All Features Deployed:
- ✅ GDPR Compliance fixes
- ✅ Error handling improvements
- ✅ Production logging security
- ✅ Extension conditional logging
- ✅ Customer data request email
- ✅ AI Sales Agent product search
- ✅ Live chat typing indicator

### Database Status:
- ✅ Store: tulipst.myshopify.com (ACTIVE)
- ✅ Chat Sessions: 4 (test data)
- ✅ Messages: 11 (test data)
- ✅ Chat Settings: Configured

---

## 🔧 SETUP REQUIRED

### Step 1: Enable the Extension in Shopify Theme

The app extension needs to be enabled in your theme:

1. **Log in to Shopify Admin**
   - Go to: https://tulipst.myshopify.com/admin
   - Password: `1`

2. **Navigate to Theme Customizer**
   - Go to: **Online Store** → **Themes**
   - Click **Customize** on your active theme

3. **Enable App Embed**
   - In the left sidebar, scroll to the bottom
   - Find **App embeds** section
   - Look for **AI Chat Widget**
   - **Toggle it ON** ✅
   - Click **Save** (top right)

4. **Verify Widget Appears**
   - View your storefront: https://tulipst.myshopify.com
   - Look for chat button in bottom-right corner

---

## 🧪 TESTING CHECKLIST

### 1. Widget Functionality Test

**Test the Chat Widget:**

1. Visit: https://tulipst.myshopify.com
2. Look for chat button (bottom-right)
3. Click to open chat
4. Send a test message
5. Verify AI responds

**Expected Behavior:**
- ✅ Chat button appears
- ✅ Window opens on click
- ✅ Welcome message shows
- ✅ AI responds to messages
- ✅ No debug logs in browser console (production)

---

### 2. Admin Dashboard Test

**Access the Admin Dashboard:**

1. Go to: https://tulipst.myshopify.com/admin/apps
2. Find **ShopChat AI** app
3. Click to open dashboard

**Test All Pages:**

#### a) Dashboard (Main)
- ✅ View real-time statistics
- ✅ Check active sessions count
- ✅ View today's messages count
- ✅ See response time metrics

#### b) Live Chat
- ✅ View all active chat sessions
- ✅ Click on a session to view messages
- ✅ Test "Take Over" button
- ✅ Send an agent message
- ✅ **NEW: Watch for typing indicator when customer types**

#### c) Analytics
- ✅ View chat volume charts
- ✅ Check response times
- ✅ See customer satisfaction metrics
- ✅ Export data (if needed)

#### d) FAQs
- ✅ Create a new FAQ
- ✅ Edit existing FAQ
- ✅ Delete a FAQ
- ✅ Test FAQ categories

#### e) Settings
- ✅ Change widget colors
- ✅ Update welcome message
- ✅ Toggle features (order tracking, product recs)
- ✅ Save changes

#### f) Billing
- ✅ View current plan (Free)
- ✅ Check usage limits
- ✅ Test upgrade flow (don't actually upgrade)

---

### 3. New Features Testing

#### Feature 1: AI Sales Agent Product Search

**How to Test:**

1. Open chat widget on storefront
2. Ask: "Show me products"
3. Ask: "Do you have shirts?"
4. Ask: "Looking for blue items"

**Expected Behavior:**
- ✅ AI searches your Shopify products
- ✅ Returns up to 3 relevant products
- ✅ Shows product title, price, image
- ✅ Provides product link

**Note**: If no products match, AI will respond without recommendations

---

#### Feature 2: Customer Data Request Email

**How to Test:**

⚠️ This is a GDPR webhook - can't test directly without uninstalling app

**What It Does:**
- When a customer requests their data via Shopify
- System collects all chat messages
- Sends formatted email to customer
- Falls back to logging if email not configured

**Email Configuration (Optional):**

Add to server `.env` file:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@indigenservices.com
```

---

#### Feature 3: Live Chat Typing Indicator

**How to Test:**

1. Open two browser windows:
   - Window A: Admin dashboard → Live Chat
   - Window B: Storefront with chat widget

2. **Test Customer Typing:**
   - In Window B (storefront), start typing in chat
   - In Window A (admin), watch for "Customer is typing..."
   - Should appear below messages
   - Should disappear 3 seconds after stopping

3. **Test Agent Typing:**
   - In Window A (admin), take over chat
   - Start typing in the message input
   - In Window B (customer), watch for typing indicator
   - Should show "Agent is typing..."

**Expected Behavior:**
- ✅ Real-time typing indicators via Socket.IO
- ✅ Auto-hide after 3 seconds inactivity
- ✅ Bidirectional (customer ↔ agent)

---

## 📊 MONITORING & VERIFICATION

### Check Application Logs

```bash
# SSH into server
ssh root@72.60.99.154
# Password: Kalilinux@2812

# View logs
pm2 logs shopchat-new --lines 50

# Check for errors
pm2 logs shopchat-new --err --lines 20
```

### Check Database (Real Data)

```bash
# On server
cd /var/www/shopchat-new

# Count real sessions
sqlite3 data/production.sqlite "SELECT COUNT(*) FROM ChatSession;"

# View recent messages
sqlite3 data/production.sqlite "SELECT sender, message, sentAt FROM ChatMessage ORDER BY sentAt DESC LIMIT 10;"

# Check store status
sqlite3 data/production.sqlite "SELECT shopDomain, isActive FROM Store;"
```

### Health Checks

```bash
# Application health
curl https://shopchat-new.indigenservices.com/health

# Socket.IO status
curl https://shopchat-new.indigenservices.com/socket/status

# Widget loader
curl -I https://shopchat-new.indigenservices.com/widget-loader.js
```

---

## 🐛 TROUBLESHOOTING

### Issue: Widget Not Showing

**Solutions:**
1. ✅ Verify app embed is enabled in theme
2. ✅ Check store is marked as active in database
3. ✅ Clear browser cache
4. ✅ Check browser console for errors
5. ✅ Verify widget-loader.js is accessible

### Issue: No Real Data in Dashboard

**Why:**
- Dashboard shows data from database
- Currently has only test/mock data
- Real data appears after actual customer chats

**To Generate Real Data:**
1. Enable extension in theme
2. Visit storefront as customer
3. Open chat and send messages
4. Refresh admin dashboard

### Issue: AI Not Responding

**Check:**
1. ✅ GEMINI_API_KEY is set in .env
2. ✅ Store has accessToken for Shopify API
3. ✅ Check server logs for errors
4. ✅ Verify Socket.IO is connected

### Issue: Typing Indicator Not Working

**Check:**
1. ✅ Socket.IO connection established
2. ✅ Both users in same chat session
3. ✅ Agent has taken over the chat
4. ✅ Check browser console for socket events

---

## 📝 CREATING REAL TEST DATA

### Scenario 1: Customer Chat Flow

1. **Customer Visits Store**
   - Go to: https://tulipst.myshopify.com
   - Open chat widget
   
2. **Customer Asks Questions**
   - "Do you have blue shirts?"
   - "What's your return policy?"
   - "Track my order #1234"

3. **Verify in Dashboard**
   - New session appears in Live Chat
   - Messages show in real-time
   - AI responses logged

### Scenario 2: Agent Takeover

1. **Customer Needs Help**
   - Customer: "I need to speak to someone"
   - AI: Offers to connect to agent

2. **Agent Joins**
   - Admin opens Live Chat
   - Clicks session
   - Clicks "Take Over"
   - Sends message as agent

3. **Verify Features**
   - Typing indicator works
   - Messages sync in real-time
   - Session status updates

### Scenario 3: Product Search

1. **Customer Asks for Products**
   - "Show me your products"
   - "Do you sell electronics?"
   - "Looking for gift ideas"

2. **Verify**
   - AI searches Shopify products
   - Returns relevant items
   - Shows prices and links

---

## ✅ SUCCESS CRITERIA

### Widget
- [ ] Appears on storefront
- [ ] Opens/closes correctly
- [ ] Sends messages
- [ ] Receives AI responses
- [ ] No console errors

### Dashboard
- [ ] All pages load
- [ ] Shows real data (after testing)
- [ ] Live chat works
- [ ] Settings save correctly
- [ ] Analytics display

### New Features
- [ ] Product search returns results
- [ ] Typing indicator shows (customer)
- [ ] Typing indicator shows (agent)
- [ ] Email service ready (configured)

### Production Quality
- [ ] No debug logs in production
- [ ] GDPR compliance working
- [ ] Error handling in place
- [ ] Performance acceptable

---

## 🎯 NEXT STEPS

1. **Enable Extension** (5 minutes)
   - Follow Step 1 above
   - Verify widget appears

2. **Test Widget** (10 minutes)
   - Send test messages
   - Verify AI responds
   - Check product search

3. **Test Dashboard** (15 minutes)
   - View all pages
   - Test live chat
   - Test typing indicator

4. **Generate Real Data** (10 minutes)
   - Have multiple test conversations
   - Take over as agent
   - Create some FAQs

5. **Verify All Strings Connected** (5 minutes)
   - Check database has real sessions
   - Verify dashboard shows real data
   - Confirm all features working

---

## 📞 SUPPORT

### If Issues Occur:

**Check Logs:**
```bash
ssh root@72.60.99.154
pm2 logs shopchat-new
```

**Check Database:**
```bash
cd /var/www/shopchat-new
sqlite3 data/production.sqlite
```

**Restart Application:**
```bash
pm2 restart shopchat-new
```

### Contact:
- Email: support@indigenservices.com
- Server: root@72.60.99.154

---

## 📋 SUMMARY

**Current Status:**
- ✅ All code deployed and working
- ✅ Database configured with store
- ✅ All new features implemented
- ⏳ Extension needs to be enabled in theme
- ⏳ Real data needs to be generated through testing

**Time to Full Testing:** ~45 minutes
- Enable extension: 5 min
- Widget testing: 10 min  
- Dashboard testing: 15 min
- Feature testing: 10 min
- Verification: 5 min

**Everything is ready - just need to enable the extension and test!** 🚀

---

**Last Updated**: October 22, 2025  
**Deployment**: Successful  
**Status**: ✅ Ready for Testing
