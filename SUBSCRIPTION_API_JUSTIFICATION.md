# Subscription API Access Justification

## For Shopify App Store Submission Form

---

## ⚠️ IMPORTANT NOTE

**ShopChat AI does NOT need Subscription APIs access.**

Our app uses Shopify's **Billing API** for app subscriptions (charging merchants), NOT the Subscription APIs (for managing customer product subscriptions).

---

## What to Do

### If the form asks about "Subscription APIs" access:

**Option 1: Select "No" or "Not Required"**

If there's an option to indicate you don't need this API, select it.

---

### If you MUST provide a description (and can't skip):

**Copy this response**:

```
Our app does NOT use the Subscription APIs. 

We only use the Billing API to charge merchants for app usage (our SaaS subscription plans). 

We do not create, manage, or access customer product subscriptions. 

If this scope is being requested automatically, it may be an error. We can remove it from our app requirements.
```

---

## 📋 Clarification: What APIs We Actually Use

### ✅ APIs We USE:

1. **Billing API** (for app subscription charges)
   - Purpose: Charge merchants monthly fees for using our app
   - Plans: Free, $9.99, $29.99, $99.99/month
   - This is SHOPIFY BILLING, not Subscription APIs

2. **Admin API** (for store data)
   - Products: Read product info for recommendations
   - Orders: Read order info for tracking
   - Customers: Read customer info for personalization
   - Script Tags: Install chat widget

3. **Webhooks** (for GDPR compliance)
   - Customer data request
   - Customer data deletion
   - Shop data deletion

### ❌ APIs We DON'T USE:

- **Subscription APIs** ← NOT USED
- **Payments API** ← NOT USED
- **Fulfillment API** ← NOT USED
- **Multi-location API** ← NOT USED

---

## 🎯 If Shopify Asks for Clarification

**Email Response Template**:

```
Subject: Subscription API Access - ShopChat AI

Hello Shopify App Review Team,

We noticed our app submission form asks about Subscription API access. 
We want to clarify that our app does NOT require access to the 
Subscription APIs.

WHAT WE USE:
- Billing API: For charging merchants app subscription fees (our pricing plans)
- Admin API: For reading product, order, and customer data
- Webhooks: For GDPR compliance

WHAT WE DON'T USE:
- Subscription APIs: We do not create or manage customer product subscriptions
- Our app is a chat support tool, not a subscription management tool

If the Subscription API scope was added automatically during app 
creation, we can remove it from our requirements. Please let us know 
how to proceed.

Our app scopes:
- read_products
- read_orders
- read_customers
- read_script_tags
- write_script_tags
- read_analytics

Thank you for your assistance!

Best regards,
ShopChat AI Team
support@indigenservices.com
```

---

## 🤔 Why This Confusion Happens

**Shopify Billing API vs Subscription APIs**:

| Billing API | Subscription APIs |
|-------------|-------------------|
| For app developers | For merchants |
| Charges for using your app | Manages customer subscriptions |
| Monthly app fees | Recurring product orders |
| What WE use ✅ | What we DON'T use ❌ |

**Example**:
- **Billing API**: "Merchant pays $29.99/month for ShopChat AI app"
- **Subscription APIs**: "Customer subscribes to monthly coffee delivery"

We only do the first one!

---

## ✅ Correct Scopes for Our App

```
read_products          ✅ For product recommendations
read_orders            ✅ For order tracking
read_customers         ✅ For personalization
read_script_tags       ✅ To check widget installation
write_script_tags      ✅ To install widget
read_analytics         ✅ For dashboard stats
```

**Note**: No subscription-related scopes needed!

---

## 📞 If You Need Help

If Shopify's form is confusing or requires this field:

1. **Try to skip it**: Look for "Not applicable" or "Skip" button
2. **Use the short response**: Copy the 10-character minimum response below
3. **Contact Shopify**: Email partners@shopify.com for clarification

### Minimum 10-Character Response (if forced):

```
Not applicable to our app functionality.
```

Or:

```
We use Billing API only, not Subscription APIs.
```

---

## 🎯 Bottom Line

**DO NOT request Subscription APIs access.**

You only need:
- ✅ Billing API (already have it)
- ✅ Admin API (already have it)
- ✅ Webhooks (already configured)

If the form requires a response, use the templates above.

---

**Need more help?** Contact Shopify Partners support at partners@shopify.com
