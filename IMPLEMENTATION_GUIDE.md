# 🚀 AI Sales Agent & Live Chat - Implementation Guide

## ✅ Progress Summary

### Completed
- ✅ **Database Schema** - Enhanced ChatSession and ChatMessage models
- ✅ **AI Sales Agent Service** - Full sales logic with Gemini integration
- ✅ **Live Chat Dashboard** - Complete admin UI with real-time features
- ✅ **Task Tracking** - All tasks organized and tracked

### In Progress
- 🔄 Shopify Product Integration
- 🔄 Socket.IO Server Setup
- 🔄 Widget Enhancements

---

## 📦 Required Dependencies & SDKs

### Already Installed (From Current App)
```json
{
  "@shopify/shopify-app-remix": "^latest",
  "@shopify/polaris": "^latest",
  "@prisma/client": "^6.17.1",
  "@google/generative-ai": "^latest",
  "socket.io": "^4.7.2",
  "socket.io-client": "^4.7.2"
}
```

### Official Shopify SDKs (Already in Use)
- `@shopify/shopify-app-remix` - Main app framework ✅
- `@shopify/admin-api-client` - For GraphQL queries (bundled) ✅
- `@shopify/polaris` - UI components ✅

### Socket.IO for Real-time
- `socket.io` - Server ✅ Already installed
- `socket.io-client` - Client ✅ Already installed

---

## 🗄️ Step 1: Apply Database Migration

Upload and apply the new schema:

```bash
# 1. Upload new schema
scp schema.prisma root@72.60.99.154:/var/www/shopchat-new/prisma/

# 2. SSH to server
ssh root@72.60.99.154

# 3. Navigate to app
cd /var/www/shopchat-new

# 4. Stop app
pm2 stop shopchat-new

# 5. Push schema changes
npx prisma db push

# 6. Generate Prisma client
npx prisma generate

# 7. Restart app
pm2 restart shopchat-new
```

---

## 🛠️ Step 2: Create Shopify Product Service

**File:** `app/services/shopify-products.server.ts`

```typescript
/**
 * Shopify Product Service
 * Fetches and caches product data
 */

import { prisma } from "../db.server";

interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  variants: Array<{
    id: string;
    title: string;
    price: string;
    compareAtPrice?: string;
    available: boolean;
  }>;
  images: Array<{
    url: string;
    altText?: string;
  }>;
  availableForSale: boolean;
}

export async function fetchStoreProducts(admin: any): Promise<ShopifyProduct[]> {
  try {
    const query = `
      query {
        products(first: 100) {
          edges {
            node {
              id
              title
              description
              handle
              availableForSale
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    availableForSale
                  }
                }
              }
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await admin.graphql(query);
    const data = await response.json();

    const products = data.data.products.edges.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      description: edge.node.description || '',
      handle: edge.node.handle,
      variants: edge.node.variants.edges.map((v: any) => ({
        id: v.node.id,
        title: v.node.title,
        price: v.node.price,
        compareAtPrice: v.node.compareAtPrice,
        available: v.node.availableForSale
      })),
      images: edge.node.images.edges.map((i: any) => ({
        url: i.node.url,
        altText: i.node.altText
      })),
      availableForSale: edge.node.availableForSale
    }));

    return products;
  } catch (error) {
    console.error('[Shopify Products] Error fetching products:', error);
    return [];
  }
}

export function searchProducts(products: ShopifyProduct[], query: string): ShopifyProduct[] {
  const lowerQuery = query.toLowerCase();
  
  return products.filter(product => 
    product.title.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery)
  ).slice(0, 5);
}
```

---

## 🔌 Step 3: Update Socket.IO in server.mjs

Add these event handlers to `server.mjs`:

```javascript
// Add after existing Socket.IO setup

// Admin room for notifications
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Admin joins special room
  socket.on('join-admin-room', ({ storeId }) => {
    socket.join(`admin-${storeId}`);
    console.log(`Admin joined room: admin-${storeId}`);
  });

  // Join specific chat
  socket.on('join-chat', ({ sessionId, userType }) => {
    socket.join(`chat-${sessionId}`);
    console.log(`${userType} joined chat-${sessionId}`);
    
    if (userType === 'agent') {
      // Notify customer that agent is viewing
      io.to(`chat-${sessionId}`).emit('agent-viewing');
    }
  });

  // Send message
  socket.on('send-message', async ({ sessionId, message, sender, agentName }) => {
    try {
      // Save to database
      const savedMessage = await prisma.chatMessage.create({
        data: {
          sessionId,
          message,
          sender,
          isAI: sender === 'AI',
          agentName: sender === 'AGENT' ? agentName : null
        }
      });

      // Broadcast to all in this chat
      io.to(`chat-${sessionId}`).emit('new-message', savedMessage);

      // Update session
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() }
      });

    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Request agent
  socket.on('request-agent', async ({ sessionId }) => {
    try {
      // Update session status
      const session = await prisma.chatSession.update({
        where: { id: sessionId },
        data: { status: 'needs_agent' },
        include: {
          store: true
        }
      });

      // Notify all admins for this store
      io.to(`admin-${session.storeId}`).emit('agent-requested', {
        sessionId,
        customerName: session.customerName,
        customerEmail: session.customerEmail
      });

    } catch (error) {
      console.error('Error requesting agent:', error);
    }
  });

  // Agent takes over
  socket.on('takeover-chat', async ({ sessionId, agentId, agentName }) => {
    try {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          status: 'agent_takeover',
          assignedAgentId: agentId,
          assignedAgentName: agentName,
          takenOverAt: new Date(),
          aiHandled: false
        }
      });

      // Notify everyone in chat
      io.to(`chat-${sessionId}`).emit('agent-takeover', { agentName });

      // Send system message
      const systemMessage = await prisma.chatMessage.create({
        data: {
          sessionId,
          message: `${agentName} has joined the chat`,
          sender: 'SYSTEM'
        }
      });

      io.to(`chat-${sessionId}`).emit('new-message', systemMessage);

    } catch (error) {
      console.error('Error taking over chat:', error);
    }
  });

  // Typing indicator
  socket.on('typing', ({ sessionId, userType }) => {
    socket.to(`chat-${sessionId}`).emit('typing', { userType });
  });

  // Mark message as read
  socket.on('mark-read-by-agent', async ({ sessionId, messageId }) => {
    try {
      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { readByAgent: true }
      });
    } catch (error) {
      console.error('Error marking message read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
```

---

## 🎨 Step 4: Create Widget Enhancements

**File:** `public/chat-widget-enhanced.js`

```javascript
// Add to existing chat widget

// Add "Request Agent" button
function renderChatHeader() {
  return `
    <div class="chat-header">
      <div class="header-left">
        <h3>💬 Chat with us</h3>
        <span class="status-indicator" id="agent-status">AI Assistant</span>
      </div>
      <div class="header-actions">
        <button id="request-agent-btn" class="agent-request-btn" title="Speak to a live agent">
          👤 Agent
        </button>
        <button id="minimize-btn">_</button>
        <button id="close-btn">×</button>
      </div>
    </div>
  `;
}

// Handle agent request
document.addEventListener('DOMContentLoaded', () => {
  const requestAgentBtn = document.getElementById('request-agent-btn');
  
  if (requestAgentBtn) {
    requestAgentBtn.addEventListener('click', () => {
      socket.emit('request-agent', { sessionId });
      addSystemMessage('🔔 Requesting a live agent...');
      requestAgentBtn.disabled = true;
      requestAgentBtn.textContent = '⏳ Waiting...';
    });
  }
});

// Listen for agent joining
socket.on('agent-takeover', ({ agentName }) => {
  document.getElementById('agent-status').textContent = `🟢 ${agentName}`;
  document.querySelector('.chat-header').classList.add('agent-active');
  addSystemMessage(`👋 ${agentName} is now assisting you.`);
  playSound('agent-joined.mp3');
});

// Product card rendering
function renderProductCard(product) {
  return `
    <div class="product-card">
      <img src="${product.image}" alt="${product.title}" class="product-image">
      <div class="product-info">
        <h4 class="product-title">${product.title}</h4>
        <p class="product-price">$${product.price}</p>
        <p class="product-description">${product.description}</p>
        <div class="product-actions">
          <button class="add-to-cart-btn" onclick="addToCart('${product.variantId}')">
            🛒 Add to Cart
          </button>
          <a href="${product.url}" target="_blank" class="view-product-link">
            View Details →
          </a>
        </div>
      </div>
    </div>
  `;
}

// Add to cart function
async function addToCart(variantId) {
  try {
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: variantId,
        quantity: 1
      })
    });

    if (response.ok) {
      showNotification('✅ Added to cart!');
      // Update session
      socket.emit('product-added-to-cart', { sessionId, variantId });
    } else {
      showNotification('❌ Failed to add to cart');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    showNotification('❌ Error adding to cart');
  }
}

// CSS for agent active state
const style = document.createElement('style');
style.textContent = `
  .chat-header.agent-active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  .status-indicator {
    font-size: 12px;
    color: #888;
    font-weight: normal;
  }
  .agent-request-btn {
    background: #5C6AC4;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 12px;
  }
  .agent-request-btn:hover {
    background: #4A5AA8;
  }
  .agent-request-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  .product-card {
    border: 1px solid #e1e3e5;
    border-radius: 8px;
    padding: 12px;
    margin: 8px 0;
    background: white;
  }
  .product-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 6px;
    margin-bottom: 8px;
  }
  .product-title {
    font-size: 14px;
    font-weight: 600;
    margin: 4px 0;
  }
  .product-price {
    font-size: 16px;
    font-weight: bold;
    color: #5C6AC4;
    margin: 4px 0;
  }
  .product-description {
    font-size: 12px;
    color: #666;
    margin: 4px 0;
  }
  .add-to-cart-btn {
    background: #5C6AC4;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    width: 100%;
    margin-top: 8px;
  }
  .add-to-cart-btn:hover {
    background: #4A5AA8;
  }
  .view-product-link {
    display: block;
    text-align: center;
    margin-top: 6px;
    color: #5C6AC4;
    text-decoration: none;
    font-size: 12px;
  }
`;
document.head.appendChild(style);
```

---

## 📋 Step 5: Create API Routes

**File:** `app/routes/api.chat.messages.tsx`

```typescript
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    return json({ error: 'Session ID required' }, { status: 400 });
  }

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { sentAt: 'asc' }
  });

  return json({ messages });
};
```

---

## 🎯 Next Steps to Complete

### Immediate (Can do now):
1. ✅ Upload new schema.prisma
2. ✅ Run migration
3. ✅ Upload AI sales agent service
4. ✅ Upload live chat dashboard route
5. ✅ Update server.mjs with Socket.IO events
6. ✅ Create API routes
7. ✅ Update chat widget

### Testing Phase:
1. Test database migration
2. Test live chat dashboard loads
3. Test Socket.IO connections
4. Test agent takeover flow
5. Test product recommendations

### Future Enhancements:
1. Add Shopify product caching
2. Implement semantic product search
3. Add chat analytics
4. Export chat transcripts
5. Mobile responsive improvements

---

## 🚀 Deployment Command

```bash
# Full deployment
./deploy-live-chat.sh
```

Would you like me to:
1. **Deploy these files to the server now**
2. **Test the live chat dashboard**
3. **Create the remaining API routes**

Let me know and I'll continue building!
