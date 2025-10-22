/**
 * Widget Embed API - Shop-specific Widget Configuration
 * This endpoint provides shop-specific widget configuration and embed code
 * 
 * Usage: GET /api/widget/embed/:shopId
 * Example: /api/widget/embed/shop_671cd17c9e734e00242d7a03
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "../db.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { shopId } = params;
  
  if (!shopId) {
    return json({ 
      error: "Shop ID is required",
      usage: "GET /api/widget/embed/:shopId"
    }, { status: 400 });
  }

  try {
    // Try to find store by ID or shop domain
    let store = null;
    
    // Check if it's a database ID
    if (shopId.startsWith('shop_') || shopId.startsWith('c')) {
      store = await prisma.store.findFirst({
        where: { id: shopId },
        select: {
          id: true,
          shopDomain: true,
          shopName: true,
          isActive: true,
          chatSettings: {
            select: {
              enabled: true,
              widgetPosition: true,
              primaryColor: true,
              accentColor: true,
              welcomeMessage: true,
            }
          }
        }
      });
    }
    
    // If not found, try as shop domain
    if (!store) {
      store = await prisma.store.findFirst({
        where: { shopDomain: shopId },
        select: {
          id: true,
          shopDomain: true,
          shopName: true,
          isActive: true,
          chatSettings: {
            select: {
              enabled: true,
              widgetPosition: true,
              primaryColor: true,
              accentColor: true,
              welcomeMessage: true,
            }
          }
        }
      });
    }

    // If store not found, return generic embed code
    if (!store) {
      const appUrl = process.env.SHOPIFY_APP_URL || process.env.HOST || 'https://shopchat-new.indigenservices.com';
      
      return json({
        success: false,
        message: "Store not found. You can still use the generic widget embed code.",
        shopId,
        embedCode: {
          script: `<script src="${appUrl}/widget-loader.js"></script>`,
          withConfig: `<script>
  window.AIChatConfig = {
    shop: 'your-store.myshopify.com',
    primaryColor: '#5C6AC4',
    accentColor: '#00848E',
    position: 'bottom-right',
    welcomeMessage: 'Hi! How can I help you today?'
  };
</script>
<script src="${appUrl}/widget-loader.js"></script>`,
        },
        widgetUrl: `${appUrl}/widget-loader.js`,
        documentation: `${appUrl}/app/install`
      }, { status: 404 });
    }

    // Store found - return shop-specific configuration
    const settings = store.chatSettings || {};
    const appUrl = process.env.SHOPIFY_APP_URL || process.env.HOST || 'https://shopchat-new.indigenservices.com';
    
    const config = {
      shop: store.shopDomain,
      shopName: store.shopName,
      primaryColor: settings.primaryColor || '#5C6AC4',
      accentColor: settings.accentColor || '#00848E',
      position: settings.widgetPosition || 'bottom-right',
      welcomeMessage: settings.welcomeMessage || 'Hi! How can I help you today?',
      enabled: store.isActive && (settings.enabled !== false),
    };

    return json({
      success: true,
      store: {
        id: store.id,
        shop: store.shopDomain,
        shopName: store.shopName,
        isActive: store.isActive,
      },
      config,
      embedCode: {
        simple: `<script src="${appUrl}/widget-loader.js"></script>`,
        configured: `<script>
  window.AIChatConfig = ${JSON.stringify(config, null, 2)};
</script>
<script src="${appUrl}/widget-loader.js"></script>`,
      },
      widgetUrl: `${appUrl}/widget-loader.js`,
      cssUrl: `${appUrl}/chat-widget.css`,
      documentation: `${appUrl}/app/install`,
    });

  } catch (error) {
    console.error("Error fetching widget embed config:", error);
    return json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

/**
 * Example Responses:
 * 
 * Success (Store Found):
 * {
 *   "success": true,
 *   "store": {
 *     "id": "shop_671cd17c9e734e00242d7a03",
 *     "shop": "store.myshopify.com",
 *     "isActive": true
 *   },
 *   "config": {
 *     "shop": "store.myshopify.com",
 *     "primaryColor": "#5C6AC4",
 *     "accentColor": "#00848E",
 *     "position": "bottom-right",
 *     "welcomeMessage": "Hi! How can I help you today?",
 *     "enabled": true
 *   },
 *   "embedCode": {
 *     "simple": "<script src='...'></script>",
 *     "configured": "<script>...</script>"
 *   },
 *   "widgetUrl": "https://...",
 *   "documentation": "https://..."
 * }
 * 
 * Not Found:
 * {
 *   "success": false,
 *   "message": "Store not found...",
 *   "shopId": "shop_xxx",
 *   "embedCode": { ... },
 *   "documentation": "https://..."
 * }
 */
