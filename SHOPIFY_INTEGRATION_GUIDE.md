# Shopify Integration Guide - ShopChat AI

## 📋 Overview

This document explains how ShopChat AI integrates with Shopify using official Shopify app development best practices from https://shopify.dev/docs/apps.

---

## 🏗️ Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SHOPIFY ECOSYSTEM                            │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Shopify Admin                              │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │         ShopChat AI (Embedded App)                     │  │   │
│  │  │  - OAuth Authentication                                │  │   │
│  │  │  - App Bridge Integration                              │  │   │
│  │  │  - Admin Pages (Dashboard, Settings, etc.)            │  │   │
│  │  │  - Polaris UI Components                              │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ▲                                        │
│                              │ OAuth / Admin API                     │
│                              │                                        │
│  ┌───────────────────────────┴──────────────────────────────────┐   │
│  │              Shopify APIs & Services                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │   │
│  │  │ Admin API  │  │ Storefront │  │  Webhooks  │            │   │
│  │  │  (GraphQL) │  │    API     │  │   System   │            │   │
│  │  └────────────┘  └────────────┘  └────────────┘            │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                              │                                        │
│                              │ REST/GraphQL + Webhooks                │
│                              ▼                                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ShopChat AI Backend                               │
│             https://shopchat-new.indigenservices.com                   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Remix App (Server-Side Rendering)                           │   │
│  │  - Authentication (/auth/*)                                  │   │
│  │  - Embedded App Routes (/app/*)                              │   │
│  │  - API Routes (/api/*)                                       │   │
│  │  - Webhook Handlers (/webhooks/*)                            │   │
│  │  - Widget Serving (/widget-loader.js, etc.)                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Services Layer                                               │   │
│  │  - AI Service (Gemini)                                       │   │
│  │  - Shopify Service (API client)                              │   │
│  │  - Billing Service                                            │   │
│  │  - Socket.IO Service                                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Database (SQLite + Prisma)                                   │   │
│  │  - Session storage (OAuth tokens)                            │   │
│  │  - Store data                                                 │   │
│  │  - Chat history                                               │   │
│  │  - Analytics                                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ Script Tag / Widget Serving
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Shopify Storefront                                │
│                     (Customer-Facing)                                │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Online Store (Liquid Theme)                                  │   │
│  │  <script src="...widget-loader.js"></script>                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                               │                                       │
│                               ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Chat Widget (JavaScript)                                     │   │
│  │  - Button (visible)                                           │   │
│  │  - Chat window (hidden by default)                           │   │
│  │  - Socket.IO connection for real-time                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ WebSocket (Socket.IO)
                               │ + REST API calls
                               ▼
                    [ShopChat AI Backend]
```

---

## 🔐 Authentication Flow (OAuth 2.0)

### Installation & Authorization

```
1. Merchant clicks "Install App" in Shopify App Store
   ↓
2. Redirected to: https://shopchat-new.indigenservices.com/auth/shopify
   ↓
3. Shopify shows permission consent screen (scopes)
   ↓
4. Merchant approves
   ↓
5. Shopify redirects to: /auth/callback?code=xxx&shop=store.myshopify.com
   ↓
6. Backend exchanges code for access token
   ↓
7. Access token saved in database (Session model)
   ↓
8. Merchant redirected to app dashboard (/app)
```

### Implementation

```typescript
// app/shopify.server.ts
import { shopifyApp } from '@shopify/shopify-app-remix';

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES?.split(','),
  appUrl: process.env.SHOPIFY_APP_URL,
  authPathPrefix: '/auth',
  sessionStorage: new PrismaSessionStorage(prisma),
  // ... webhook configurations
});

export default shopify;
export const authenticate = shopify.authenticate;
```

### Auth Routes

1. **GET /auth/login** - Initiate OAuth
2. **GET /auth/shopify** - Redirect to Shopify OAuth
3. **GET /auth/callback** - Handle OAuth callback
4. **GET /auth/shopify/callback** - Alternative callback route

---

## 🎯 Scopes & Permissions

### Configured Scopes (from `shopify.app.toml`)

```toml
scopes = "write_app_proxy,read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_content,write_content,read_themes,write_themes,read_script_tags,write_script_tags,read_checkouts,write_checkouts,read_marketing_events,write_marketing_events,read_analytics,read_translations,write_translations,read_locales,read_shipping,write_shipping,read_inventory,write_inventory,read_merchant_managed_fulfillment_orders,write_merchant_managed_fulfillment_orders,read_online_store_pages,write_online_store_pages,read_price_rules,write_price_rules,read_discounts,write_discounts"
```

### Scope Purpose Breakdown

| Scope | Purpose | Used For |
|-------|---------|----------|
| `read_products`, `write_products` | Product catalog access | Product search, recommendations, AI responses |
| `read_orders`, `write_orders` | Order management | Order tracking feature |
| `read_customers`, `write_customers` | Customer data | Personalization, order history |
| `read_script_tags`, `write_script_tags` | Script installation | Auto-install widget on storefront |
| `read_themes`, `write_themes` | Theme access | Theme extension integration |
| `read_checkouts`, `write_checkouts` | Checkout data | Abandonment tracking |
| `read_analytics` | Store analytics | Usage analytics, insights |
| `read_content`, `write_content` | Store content | FAQ integration |
| `write_app_proxy` | App proxy | Storefront widget access |

### Requesting Scopes

Scopes are requested during installation and must be approved by merchant.

**Reference**: https://shopify.dev/docs/apps/structure

---

## 📦 Embedded App (Admin)

### App Bridge Integration

```typescript
// app/routes/app.tsx (App Layout)
import { AppProvider } from '@shopify/app-bridge-react';

export default function App() {
  return (
    <AppProvider
      apiKey={process.env.SHOPIFY_API_KEY}
      host={shopify.config.host}
    >
      <AppLayout>
        <Outlet />
      </AppLayout>
    </AppProvider>
  );
}
```

### Embedded App Pages

All routes under `/app/*` are embedded in Shopify Admin:

```
/app                    → Dashboard (app._index.tsx)
/app/analytics          → Analytics page (app.analytics.tsx)
/app/settings           → Settings page (app.settings.tsx)
/app/billing            → Billing page (app.billing.tsx)
/app/faqs               → FAQ management (app.faqs.tsx)
/app/install            → Widget installation (app.install.tsx)
/app/realtime           → Real-time dashboard (app.realtime.tsx)
/app/help               → Help page (app.help.tsx)
```

### Polaris UI Components

Using Shopify Polaris for consistent UI:

```typescript
import {
  Page,
  Layout,
  Card,
  Button,
  Banner,
  DataTable,
  // ... more components
} from '@shopify/polaris';
```

**Reference**: https://shopify.dev/docs/apps/build/admin

---

## 🔔 Webhooks

### Webhook Configuration

```toml
# shopify.app.toml
[webhooks]
api_version = "2024-10"

[[webhooks.subscriptions]]
uri = "/webhooks/app/uninstalled"
topics = ["app/uninstalled"]
```

### Implemented Webhooks (17 total)

#### App Lifecycle
- **app/uninstalled** → `/webhooks/app/uninstalled`
  - Clean up data when app is removed
  - Delete sessions, stop services
  
- **app/scopes_update** → `/webhooks/app/scopes_update`
  - Handle permission changes

#### Products (Real-time Catalog Sync)
- **products/create** → `/webhooks/products/create`
- **products/update** → `/webhooks/products/update`
- **products/delete** → `/webhooks/products/delete`

Purpose: Keep product catalog in sync for AI responses

#### Orders (Order Tracking)
- **orders/create** → `/webhooks/orders/create`
- **orders/updated** → `/webhooks/orders/updated`
- **orders/fulfilled** → `/webhooks/orders/fulfilled`
- **orders/cancelled** → `/webhooks/orders/cancelled`

Purpose: Real-time order status for customer inquiries

#### Customers (Personalization)
- **customers/create** → `/webhooks/customers/create`
- **customers/update** → `/webhooks/customers/update`

Purpose: Personalized chat experiences

#### Carts & Checkouts (Abandonment)
- **carts/create**, **carts/update**
- **checkouts/create**, **checkouts/update**

Purpose: Track abandonment, proactive support

#### GDPR Compliance (Mandatory)
- **customers/data_request** → `/webhooks/customers/data_request`
  - Export customer data on request
  
- **customers/redact** → `/webhooks/customers/redact`
  - Delete customer data on request
  
- **shop/redact** → `/webhooks/shop/redact`
  - Delete store data after app uninstall

### Webhook Handler Example

```typescript
// app/routes/webhooks.orders.create.tsx
import { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  const { topic, shop, session, payload } = await authenticate.webhook(request);
  
  console.log(`Received ${topic} webhook for ${shop}`);
  
  // Process order data
  const order = payload as any;
  await saveOrderToDatabase(shop, order);
  
  // Notify real-time dashboard via Socket.IO
  socketService.emit(`store:${shop}`, {
    type: 'order_created',
    data: order
  });
  
  return new Response(null, { status: 200 });
}
```

**Reference**: https://shopify.dev/docs/apps/webhooks

---

## 🛒 Storefront Integration

### Script Tag Installation

Two methods to add widget to storefront:

#### Method 1: Automatic (API)

```typescript
// app/routes/api.install-widget.tsx
export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  
  const scriptTag = new admin.rest.resources.ScriptTag({ session });
  scriptTag.event = "onload";
  scriptTag.src = "https://shopchat-new.indigenservices.com/widget-loader.js";
  scriptTag.display_scope = "all"; // Show on all pages
  
  await scriptTag.save({ update: true });
  
  return json({ success: true, scriptId: scriptTag.id });
}
```

#### Method 2: Manual (Theme)

Merchant adds to `theme.liquid`:

```liquid
<!-- Add before </body> tag -->
<script>
  window.AIChatConfig = {
    shop: '{{ shop.permanent_domain }}',
    primaryColor: '#5C6AC4',
    position: 'bottom-right'
  };
</script>
<script src="https://shopchat-new.indigenservices.com/widget-loader.js"></script>
```

**Reference**: https://shopify.dev/docs/apps/build/online-store

### App Proxy (Optional)

For accessing app data from storefront without CORS:

```toml
# shopify.app.toml
[app_proxy]
url = "/proxy/widget"
prefix = "apps"
subpath = "ai-chat"
```

**Accessible at**: `https://store.myshopify.com/apps/ai-chat/*`

---

## 📊 Admin API Usage

### GraphQL Admin API

Used for querying and mutating store data:

```typescript
// Example: Fetch products
const PRODUCTS_QUERY = `
  query {
    products(first: 10) {
      edges {
        node {
          id
          title
          description
          variants(first: 5) {
            edges {
              node {
                id
                price
                inventoryQuantity
              }
            }
          }
        }
      }
    }
  }
`;

const response = await admin.graphql(PRODUCTS_QUERY);
const data = await response.json();
```

### REST Admin API

Used for simpler operations:

```typescript
// Example: Get script tags
const response = await admin.rest.resources.ScriptTag.all({
  session: session,
});

const scriptTags = response.data;
```

---

## 🎨 Theme Extension (App Block)

### Extension Structure

```
extensions/
└── chat-widget/
    ├── blocks/
    │   └── chat-widget.liquid
    ├── locales/
    │   └── en.default.json
    └── shopify.extension.toml
```

### Extension Configuration

```toml
# extensions/chat-widget/shopify.extension.toml
type = "theme"
name = "AI Chat Widget"

[settings]
  [[settings.blocks]]
  type = "chat-widget"
  name = "AI Chat Widget"
  settings = [
    {
      type = "color",
      id = "primary_color",
      label = "Primary Color",
      default = "#5C6AC4"
    },
    {
      type = "select",
      id = "position",
      label = "Position",
      options = [
        { value = "bottom-right", label = "Bottom Right" },
        { value = "bottom-left", label = "Bottom Left" }
      ],
      default = "bottom-right"
    }
  ]
```

### Usage in Theme Customizer

Merchants can:
1. Go to **Admin → Online Store → Themes**
2. Click **Customize** on active theme
3. Add **AI Chat Widget** block from left sidebar
4. Configure colors, position, etc.
5. Save and publish

**Reference**: https://shopify.dev/docs/apps/build/app-extensions

---

## 💳 Billing Integration

### Subscription Plans

```typescript
// app/services/billing.server.ts
export const BILLING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    interval: 'monthly',
    features: ['100 messages/month', 'Basic support']
  },
  basic: {
    name: 'Basic',
    price: 9.99,
    interval: 'monthly',
    features: ['1,000 messages/month', 'Email support', '5 FAQ categories']
  },
  pro: {
    name: 'Pro',
    price: 29.99,
    interval: 'monthly',
    features: ['10,000 messages/month', 'Priority support', 'Unlimited FAQs']
  },
  enterprise: {
    name: 'Enterprise',
    price: 99.99,
    interval: 'monthly',
    features: ['Unlimited messages', '24/7 support', 'API access']
  }
};
```

### Creating a Charge

```typescript
const charge = await admin.rest.resources.RecurringApplicationCharge.create({
  session: session,
  name: 'Pro Plan',
  price: 29.99,
  return_url: `${process.env.HOST}/app/billing/callback`,
  test: process.env.NODE_ENV !== 'production'
});

// Redirect merchant to approve
return redirect(charge.confirmation_url);
```

---

## 🔧 Development Tools

### Shopify CLI

```bash
# Start development server
npm run dev
# or
shopify app dev

# Deploy app
shopify app deploy

# Generate code
shopify app generate extension
```

### Configuration Files

1. **shopify.app.toml** - Main app configuration
2. **shopify.web.toml** - Web service configuration
3. **.env** - Environment variables

---

## 📚 Shopify Documentation References

### Applied Documentation

✅ **Build Embedded Admin** - https://shopify.dev/docs/apps/build/admin
- Implemented App Bridge
- Created admin pages with Polaris
- Embedded app routes

✅ **Online Store Integration** - https://shopify.dev/docs/apps/build/online-store
- Script tag installation
- Widget on storefront
- Theme integration

✅ **Webhooks** - https://shopify.dev/docs/apps/webhooks
- 17 webhook handlers
- Real-time data sync
- GDPR compliance

✅ **App Structure** - https://shopify.dev/docs/apps/structure
- OAuth authentication
- Session management
- Scope handling

✅ **App Extensions** - https://shopify.dev/docs/apps/build/app-extensions
- Theme extension (chat widget)
- App blocks

⚠️ **Not Yet Implemented**:

- **Checkout Extensions** - https://shopify.dev/docs/apps/build/checkout
- **Customer Account Extensions** - https://shopify.dev/docs/apps/build/customer-accounts
- **Flow Automations** - https://shopify.dev/docs/apps/build/flow
- **POS Extensions** - https://shopify.dev/docs/apps/build/pos
- **Web Pixels (Analytics)** - https://shopify.dev/docs/apps/build/marketing-analytics/build-web-pixels
- **Shopify Functions** - https://shopify.dev/docs/apps/build/functions

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [x] Configure `shopify.app.toml`
- [x] Set up OAuth redirect URLs
- [x] Configure all required scopes
- [x] Implement GDPR webhooks
- [x] Set up session storage (Prisma)
- [x] Configure environment variables

### Post-Deployment

- [x] Test OAuth flow
- [x] Verify webhook delivery
- [x] Test widget installation
- [x] Verify storefront widget loads
- [x] Test real-time chat
- [x] Verify billing charges

### Production Checklist

- [x] SSL certificate installed
- [x] Domain configured (shopchat-new.indigenservices.com)
- [x] Environment variables secured
- [x] Database backups configured
- [x] PM2 process manager setup
- [x] Nginx reverse proxy configured
- [ ] App submitted to Shopify App Store (optional)

---

## 🆘 Troubleshooting

### Common Issues

#### 1. OAuth Redirect Error

**Error**: "Redirect URI mismatch"

**Solution**: Ensure redirect URLs in `shopify.app.toml` match your domain:
```toml
[auth]
redirect_urls = [
  "/auth/callback",
  "/auth/shopify/callback"
]
```

#### 2. Webhook Not Received

**Error**: Webhooks not being delivered

**Solution**:
1. Check webhook URL is publicly accessible
2. Verify webhook handler returns 200 status
3. Check Shopify Admin → Settings → Notifications → Webhooks

#### 3. Script Tag Not Loading

**Error**: Widget doesn't appear on storefront

**Solution**:
1. Check script tag is installed: Admin → Online Store → Themes → Actions → Edit code
2. Verify CORS headers on widget files
3. Check browser console for errors

#### 4. Session Expired

**Error**: "Session not found"

**Solution**:
1. Ensure session storage is configured correctly
2. Check database connection
3. Re-authorize app

---

## 📖 Additional Resources

### Official Shopify Documentation
- **Main Docs**: https://shopify.dev/docs/apps
- **API Reference**: https://shopify.dev/api
- **Partners Dashboard**: https://partners.shopify.com
- **Developer Forums**: https://community.shopify.com/c/shopify-apis-and-sdks

### ShopChat AI Resources
- **Codebase Overview**: CODEBASE_OVERVIEW.md
- **Widget Fix Documentation**: WIDGET_AUTO_OPEN_FIX.md
- **Production Documentation**: PRODUCTION_READY.md
- **Server Status**: SERVER_STATUS_REPORT.md

---

**Last Updated**: 2025-10-18  
**Shopify API Version**: 2024-10  
**App Status**: Production - Live  
**Documentation Version**: 1.0
