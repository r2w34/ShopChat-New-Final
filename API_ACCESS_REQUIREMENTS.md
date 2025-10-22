# API Access Requirements - What ShopChat AI Needs

## Quick Answer Summary

| Feature | Need It? | Reason |
|---------|----------|--------|
| **Your app is a sales channel** | ❌ NO | We're a chat support app, not a sales channel |
| **Product Scheduled Publishing** | ❌ NO | Not a sales channel |
| **Sell bundles** | ❌ NO | Not a sales channel |
| **Protected customer data access** | ✅ YES | We need customer emails for chat |
| **Read all orders scope** | ❌ NO | 60 days is enough for order tracking |
| **Access subscriptions APIs** | ❌ NO | We use Billing API, not Subscription APIs |
| **Access payment mandate scopes** | ❌ NO | We don't process payments |
| **Access post-purchase extensions** | ❌ NO | Not relevant to chat support |
| **Access Chat in checkout extensions** | ❌ NO | Our chat is on storefront, not checkout |
| **Access standard product reviews** | ❌ NO | Not a reviews app |
| **Access Advanced DOM Events** | ❌ NO | Not a heatmap/session recording app |
| **Allow network access in extensions** | ❌ NO | Not using checkout extensions |
| **Request payment processing** | ❌ NO | We don't process payments |

---

## ✅ WHAT YOU NEED (Only 1!)

### 1. Protected Customer Data Access ✅ REQUIRED

**Why we need it:**
- Our chat app collects customer emails when they chat
- We need customer names for personalization
- We access order history for order tracking feature
- We use customer data for AI responses

**What to write in the request form:**

```
PROTECTED CUSTOMER DATA ACCESS REQUEST

App Name: ShopChat AI (AI Support Chatbot)
App Type: Customer Support / Live Chat

Why we need access:
Our AI chat support app requires access to protected customer data to provide 
personalized customer service. Specifically:

1. CUSTOMER EMAILS: When customers use the chat widget, we collect their email 
   to:
   - Identify returning customers
   - Send chat transcripts
   - Enable order tracking by email
   - Provide personalized support

2. CUSTOMER NAMES: We access customer first/last names to:
   - Personalize chat greetings ("Hi Sarah!")
   - Provide better customer experience
   - Match chat sessions to customer accounts

3. ORDER HISTORY: We read customer order data to:
   - Enable "Track my order" feature in chat
   - Show order status when customers ask
   - Provide shipping information
   - Help customers with order-related questions

4. CUSTOMER PREFERENCES: We access customer data to:
   - Provide personalized product recommendations
   - Remember customer preferences
   - Improve AI response quality

DATA USAGE:
- All customer data is used solely for providing chat support
- Data is stored securely with encryption
- Data is retained for 90 days (per our Privacy Policy)
- GDPR webhooks implemented for data deletion requests
- We do NOT sell or share customer data with third parties (except Google 
  Gemini AI for generating responses)

SECURITY MEASURES:
- SSL/TLS encryption for data in transit
- Encrypted database storage
- OAuth authentication
- GDPR compliant (all 3 mandatory webhooks implemented)
- Privacy Policy: https://shopchatai.indigenservices.com/privacy-policy

API SCOPES WE USE:
- read_customers: Access customer email, name, and basic info
- read_orders: Access order history for tracking feature
- read_products: For product recommendations

We request access to protected customer data to provide high-quality, 
personalized customer support through our AI chatbot.
```

**Character count**: ~1,700 characters

---

## ❌ WHAT YOU DON'T NEED (Everything Else)

### Sales Channel Features ❌ NOT NEEDED

**Why:** ShopChat AI is a **customer support** app, not a sales channel.

- ❌ Your app is a sales channel
- ❌ Product Scheduled Publishing
- ❌ Sell bundles

**If asked:** "Not applicable - our app is a customer support tool, not a sales channel."

---

### Read All Orders Scope ❌ NOT NEEDED

**Why:** The standard `read_orders` scope gives 60 days of order history, which is plenty for order tracking.

**If asked:** 
```
We do not need the read_all_orders scope. The standard read_orders scope 
(60 days) is sufficient for our order tracking feature. Most customers ask 
about recent orders within the last 60 days.
```

---

### Subscriptions APIs ❌ NOT NEEDED

**Why:** We use the **Billing API** for app charges, not Subscription APIs for product subscriptions.

**If asked:**
```
Not applicable. We use the Billing API for app subscription charges, not 
Subscription APIs for managing customer product subscriptions. Our app is 
a chat support tool, not a subscription management tool.
```

---

### Payment Features ❌ NOT NEEDED

- ❌ Access payment mandate scopes
- ❌ Request payment processing

**Why:** We don't process any payments. Shopify handles all billing.

**If asked:** "Not applicable - our app does not process payments or collect payment information."

---

### Checkout/Post-Purchase Extensions ❌ NOT NEEDED

- ❌ Access post-purchase extensions
- ❌ Access Chat in checkout extensions
- ❌ Allow network access in checkout extensions

**Why:** Our chat widget lives on the storefront, not in checkout.

**If asked:**
```
Not applicable. Our chat widget is embedded on the storefront pages 
(homepage, product pages, etc.), not in the checkout flow. We do not 
use checkout extensions.
```

---

### Reviews/DOM Events ❌ NOT NEEDED

- ❌ Access standard product reviews
- ❌ Access Advanced DOM Events

**Why:** We're a chat app, not a reviews app or analytics app.

**If asked:** "Not applicable - our app does not manage reviews or track DOM events."

---

## 📝 Step-by-Step: How to Request Protected Customer Data Access

### In Your Shopify Partners Dashboard:

1. Go to your app settings
2. Look for "API access requests" or "Protected customer data access"
3. Click "Request access"
4. Fill out the form:

**Form Fields:**

```
App Name: AI Support Chatbot

App Description:
AI-powered customer support chat widget that provides instant responses 
to customer questions, order tracking, and product recommendations.

Why do you need access to protected customer data?
[PASTE THE LONG TEXT FROM SECTION 1 ABOVE]

What customer data do you need?
☑ Customer email addresses
☑ Customer names
☑ Order history
☐ Payment information (NO - we don't need this)

How will you use this data?
- Personalize chat support
- Enable order tracking
- Send chat transcripts
- Provide product recommendations

How will you protect this data?
- SSL/TLS encryption
- Encrypted database storage
- GDPR compliant (webhooks implemented)
- 90-day retention policy
- Privacy Policy published

Privacy Policy URL:
https://shopchatai.indigenservices.com/privacy-policy

Terms of Service URL:
https://shopchatai.indigenservices.com/terms-of-service
```

---

## ✅ Summary Checklist

### Before Submitting App:

- [ ] ✅ **Request Protected Customer Data Access** (REQUIRED)
  - Fill out form with text from Section 1
  - Explain why you need customer emails/names/orders
  - Reference your Privacy Policy
  - Wait for approval (usually 1-2 days)

- [ ] ❌ **Skip all sales channel features** (NOT NEEDED)
  - Don't check "Your app is a sales channel"
  - Don't enable product publishing
  - Don't enable bundles

- [ ] ❌ **Skip read_all_orders scope** (NOT NEEDED)
  - Standard read_orders is sufficient

- [ ] ❌ **Skip Subscription APIs** (NOT NEEDED)
  - You use Billing API instead

- [ ] ❌ **Skip all payment features** (NOT NEEDED)
  - Don't request payment processing
  - Don't request payment mandates

- [ ] ❌ **Skip checkout extensions** (NOT NEEDED)
  - Don't enable post-purchase
  - Don't enable chat in checkout
  - Don't enable network access

- [ ] ❌ **Skip reviews/DOM features** (NOT NEEDED)
  - Don't request product reviews
  - Don't request DOM events

---

## 🎯 What Will Happen

### After Requesting Protected Customer Data Access:

1. **Shopify Reviews** (1-2 business days)
   - They verify your Privacy Policy
   - They check your data usage explanation
   - They review your security measures

2. **Approval or Questions**
   - ✅ Approved: You can access customer data
   - ❓ Questions: They may ask for clarification
   - ❌ Denied: Rare - usually they just ask for more info

3. **After Approval**
   - Your app can access customer emails, names, orders
   - Must maintain Privacy Policy
   - Must keep GDPR webhooks working
   - Must follow data protection rules

---

## 📧 If Shopify Asks Questions

**Common Question 1:** "Why do you need customer emails?"

**Answer:**
```
We collect customer emails in our chat widget so we can:
1. Identify returning customers for personalized support
2. Enable order tracking (customers can track orders by email)
3. Send chat transcripts if customers request them
4. Match chat sessions to customer accounts for better service

We do not use emails for marketing or share them with third parties 
(except Google Gemini AI for generating AI responses, as disclosed in 
our Privacy Policy).
```

---

**Common Question 2:** "How do you protect customer data?"

**Answer:**
```
We protect customer data through:

TECHNICAL MEASURES:
- SSL/TLS encryption for all data in transit
- Encrypted database storage (SQLite with encryption)
- OAuth authentication (no passwords stored)
- Secure API access with proper scopes
- Regular security updates

COMPLIANCE:
- GDPR webhooks implemented (all 3 mandatory)
  * customers/data_request (export data)
  * customers/redact (delete customer data)
  * shop/redact (delete all shop data)
- HMAC signature verification on all webhooks
- Privacy Policy published and compliant
- 90-day data retention policy

THIRD-PARTY:
- Only Google Gemini AI receives customer messages (for AI responses)
- Disclosed in Privacy Policy
- Google's privacy policy applies to their processing

Privacy Policy: https://shopchatai.indigenservices.com/privacy-policy
```

---

**Common Question 3:** "Do you sell or share customer data?"

**Answer:**
```
NO. We do not sell customer data.

We only share customer messages with Google Gemini AI to generate 
AI responses. This is:
1. Disclosed in our Privacy Policy
2. Necessary for the app to function (AI-powered chat)
3. Covered by Google's privacy policy and terms
4. The only third-party we share data with

We do NOT:
- Sell data to anyone
- Share data with advertisers
- Use data for marketing (except our own app support)
- Share data with other apps or services
```

---

## 🎓 Best Practices

### 1. Be Transparent
Always explain exactly what you do with customer data. Don't hide anything.

### 2. Minimize Data Collection
Only request access to data you actually need. We need:
- ✅ Customer emails (for chat identification)
- ✅ Customer names (for personalization)
- ✅ Order history (for order tracking)
- ❌ Payment information (we don't need this)

### 3. Security First
Implement all security measures:
- ✅ GDPR webhooks
- ✅ Encryption
- ✅ HMAC verification
- ✅ OAuth
- ✅ Privacy Policy

### 4. Update Privacy Policy
Make sure your Privacy Policy:
- Lists what data you collect
- Explains how you use it
- Discloses third-party sharing (Google Gemini)
- Includes GDPR rights
- Has contact information

---

## 📊 Timeline

```
TODAY:
☐ Request Protected Customer Data Access
☐ Fill out form with provided text
☐ Submit request

1-2 DAYS LATER:
☐ Shopify reviews request
☐ May ask clarifying questions
☐ Usually approved quickly

AFTER APPROVAL:
☐ Complete rest of app submission
☐ Submit app for review
☐ Wait for app approval (3-5 days)

TOTAL: ~1 week to full approval
```

---

## ✅ Final Checklist

- [ ] Request ONLY Protected Customer Data Access
- [ ] Use the provided text template
- [ ] Reference your Privacy Policy
- [ ] Explain data security measures
- [ ] Skip ALL other API access requests
- [ ] Wait for approval before submitting app

---

## 📞 Need Help?

**If Shopify asks questions you can't answer:**
- Forward their question to: support@indigenservices.com
- Include: Screenshot of question, your app name, context

**If your request is denied:**
- Read their feedback carefully
- Update your Privacy Policy if needed
- Revise your explanation
- Resubmit with more detail

---

**Bottom Line:**

✅ **Request ONLY**: Protected Customer Data Access
❌ **Skip EVERYTHING ELSE**: Sales channel, subscriptions, payments, checkout, reviews, etc.

**You're a chat support app. You only need customer data for providing support.**

Simple! 🎯
