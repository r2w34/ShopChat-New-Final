# 🤖 ShopChat AI - Shopify Support Chatbot

[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://shopchatai.indigenservices.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> AI-powered customer support chatbot for Shopify stores with Google Gemini integration

**✅ LIVE & OPERATIONAL:** [https://shopchatai.indigenservices.com](https://shopchatai.indigenservices.com)

---

## ✨ Key Features

- 🤖 **Google Gemini AI** - Free tier, natural language understanding
- 📊 **Admin Dashboard** - Analytics, live chat monitoring, FAQ management
- 🎨 **Theme Extension** - No-code installation, customizable widget
- 💼 **4 Pricing Tiers** - Free plan + 14-day trials
- 🔒 **GDPR Compliant** - Full data protection and privacy webhooks
- ⚡ **Fast & Responsive** - Lighthouse optimized, mobile-ready

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Shopify Partner Account
- Google Gemini API Key (free at [ai.google.dev](https://ai.google.dev))

### Installation

```bash
# Clone repository
git clone https://github.com/r2w34/shopchat-AI-shopify.git
cd shopchat-AI-shopify

# Install dependencies
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
npx prisma generate
npx prisma migrate dev

# Start development
npm run dev
```

---

## 📦 Deployment

### Deploy to Shopify

```bash
# Install Shopify CLI
npm install -g @shopify/cli @shopify/app

# Login and link app
shopify auth login
shopify app config link

# Deploy
shopify app deploy
```

### For Merchants
1. Install from Shopify App Store
2. Click "Install Widget" in admin panel
3. Open Theme Customizer
4. Enable "AI Chat Widget" in App Embeds section
5. Save and test!

**Full deployment guide:** See [DEPLOYMENT_INFO.md](./DEPLOYMENT_INFO.md)

---

## 🛠 Tech Stack

- **Frontend:** Remix, React, Shopify Polaris
- **Backend:** Node.js, Express, Prisma
- **Database:** SQLite
- **AI:** Google Gemini 1.5 Flash
- **Deployment:** VPS, Nginx, PM2, Let's Encrypt SSL

---

## 📡 API Endpoints

### Chat API
```bash
POST /api/chat/message
Content-Type: application/json

{
  "message": "Hello!",
  "shop": "store.myshopify.com",
  "sessionId": "optional_session_id"
}
```

### Widget Assets
- `/widget-loader.js` - Widget loader
- `/chat-widget.js` - Main widget
- `/chat-widget.css` - Styles

---

## 🔒 GDPR Compliance

Three mandatory webhooks implemented:

1. **customers/data_request** - Collect customer data
2. **customers/redact** - Delete customer data
3. **shop/redact** - Delete all store data

Test webhooks:
```bash
shopify webhook trigger --topic=customers/data_request
shopify webhook trigger --topic=customers/redact
shopify webhook trigger --topic=shop/redact
```

---

## 📂 Project Structure

```
shopchat-AI-shopify/
├── app/
│   ├── routes/              # Remix routes
│   │   ├── app.*.tsx        # Admin pages
│   │   ├── api.*.tsx        # API endpoints
│   │   └── webhooks.*.tsx   # Webhook handlers
│   ├── services/            # Business logic
│   └── utils/               # Helper functions
├── extensions/
│   └── chat-widget/         # Theme extension
├── prisma/                  # Database schema
├── public/                  # Static assets
├── ecosystem.config.cjs     # PM2 configuration
├── server.mjs               # Production server
└── shopify.app.toml         # Shopify app config
```

---

## ⚙️ Configuration

### Environment Variables

```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_APP_URL=https://your-domain.com
GEMINI_API_KEY=your_gemini_key
DATABASE_URL=file:./data/production.sqlite
NODE_ENV=production
PORT=3000
```

### Shopify Configuration

Edit `shopify.app.toml`:
```toml
name = "ShopChat AI"
application_url = "https://your-domain.com"
embedded = true

[webhooks]
api_version = "2024-10"
```

---

## 🌐 Live Production

**Production URL:** https://shopchatai.indigenservices.com

**Status:** ✅ Operational
- **SSL:** Let's Encrypt (auto-renew)
- **Server:** VPS (Ubuntu 24.04)
- **Process Manager:** PM2 with auto-restart
- **Uptime:** 99.9%

**Available Routes:**
- `/app` - Dashboard
- `/app/install` - Widget Installation
- `/app/settings` - Configuration
- `/app/faqs` - FAQ Management
- `/app/analytics` - Analytics
- `/app/realtime` - Live Chat
- `/app/billing` - Billing
- `/app/help` - Help

---

## 🤝 Support

- **Email:** support@indigenservices.com
- **Website:** https://shopchatai.indigenservices.com
- **Issues:** [GitHub Issues](https://github.com/r2w34/shopchat-AI-shopify/issues)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- Shopify for the amazing platform
- Google for Gemini AI
- Open-source community

---

**Made with ❤️ by IndigenServices**

⭐ **Star this repo if you find it helpful!**

📖 **Full Documentation:** [DEPLOYMENT_INFO.md](./DEPLOYMENT_INFO.md)
