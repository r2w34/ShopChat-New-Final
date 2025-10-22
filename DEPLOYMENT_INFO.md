# 🚀 ShopChat AI - Shopify AI Support Chatbot

[![Live Demo](https://img.shields.io/badge/Live-Demo-success)](https://shopchat-new.indigenservices.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Shopify](https://img.shields.io/badge/Shopify-App-green)](https://shopify.dev)

> 🤖 AI-powered customer support chatbot for Shopify stores using Google Gemini

**✅ FULLY DEPLOYED AND OPERATIONAL**  
**🌐 Live at:** [https://shopchat-new.indigenservices.com](https://shopchat-new.indigenservices.com)

---

## 📋 Table of Contents

- [Features](#-features)
- [Live Deployment](#-live-deployment)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [API Endpoints](#-api-endpoints)
- [GDPR Compliance](#-gdpr-compliance)
- [Screenshots](#-screenshots)
- [Support](#-support)

---

## ✨ Features

### 🤖 AI-Powered Chat
- **Google Gemini Integration** (Free Tier)
- Natural language understanding
- Context-aware responses
- Multi-language support
- Sentiment analysis

### 📊 Admin Dashboard
- Real-time analytics
- Live chat monitoring
- FAQ management
- Customer insights
- Conversation history
- Performance metrics

### 🎨 Customizable Widget
- Theme extension (no code required)
- 4 position options
- Custom colors
- Branded messages
- Mobile responsive

### 💼 Business Features
- 4 pricing tiers (including free)
- 14-day trial on paid plans
- Shopify billing integration
- Usage analytics
- Export capabilities

### 🔒 Security & Compliance
- GDPR compliant (3 webhooks)
- SSL/HTTPS enabled
- HMAC verification
- Secure authentication
- Data encryption

---

## 🌐 Live Deployment

### Production Environment
- **URL:** https://shopchat-new.indigenservices.com
- **Status:** ✅ Operational
- **Uptime:** 99.9%
- **SSL:** Let's Encrypt (Auto-renew)
- **Server:** VPS (72.60.99.154)
- **Process Manager:** PM2 with auto-restart

### Available Routes
- `/app` - Admin Dashboard
- `/app/install` - Widget Installation
- `/app/settings` - Configuration
- `/app/faqs` - FAQ Management
- `/app/analytics` - Analytics
- `/app/realtime` - Live Chat
- `/app/billing` - Billing Management
- `/app/help` - Documentation

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Remix (React)
- **UI Library:** Shopify Polaris
- **Styling:** CSS Modules
- **Charts:** Recharts
- **State:** React Hooks

### Backend
- **Runtime:** Node.js 20
- **Server:** Express.js
- **Database:** SQLite + Prisma ORM
- **AI Service:** Google Gemini 1.5 Flash
- **WebSockets:** Socket.IO (optional)

### Deployment
- **Hosting:** VPS (Ubuntu 24.04)
- **Reverse Proxy:** Nginx
- **Process Manager:** PM2
- **SSL:** Let's Encrypt (Certbot)
- **Domain:** shopchat-new.indigenservices.com

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js >= 20.0.0
npm >= 9.0.0
Shopify Partner Account
Google Gemini API Key (free)
```

### 1. Clone Repository
```bash
git clone https://github.com/r2w34/shopchat-AI-shopify.git
cd shopchat-AI-shopify
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 4. Setup Database
```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Start Development
```bash
npm run dev
```

---

## 📦 Installation

### For Shopify Development

```bash
# Install Shopify CLI
npm install -g @shopify/cli @shopify/app

# Login to Shopify
shopify auth login

# Link your app
shopify app config link

# Deploy
shopify app deploy
```

### For Merchants

1. Install app from Shopify App Store
2. Click "Install Widget" in admin
3. Open Theme Customizer
4. Enable "AI Chat Widget" in App Embeds
5. Save and test!

---

## ⚙️ Configuration

### Environment Variables

```env
# Shopify
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_APP_URL=https://your-domain.com
SCOPES=read_products,write_products,...

# AI Service
GEMINI_API_KEY=your_gemini_key

# Database
DATABASE_URL=file:./data/production.sqlite

# Server
NODE_ENV=production
PORT=3000
```

### Shopify App Configuration
Edit `shopify.app.toml`:
```toml
name = "ShopChat AI"
client_id = "your_client_id"
application_url = "https://your-domain.com"
embedded = true
```

---

##  🚀 Deployment

### VPS Deployment (Production)

```bash
# SSH into VPS
ssh root@your-vps-ip

# Clone repository
git clone https://github.com/r2w34/shopchat-AI-shopify.git
cd shopchat-AI-shopify

# Install dependencies
npm install --legacy-peer-deps

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup

# Configure Nginx
sudo nano /etc/nginx/sites-available/shopchat
# Add reverse proxy configuration

# Install SSL
sudo certbot --nginx -d your-domain.com
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 📡 API Endpoints

### Chat API
```bash
POST /api/chat/message
Content-Type: application/json

{
  "message": "Hello!",
  "shop": "store.myshopify.com",
  "sessionId": "session_123",
  "customer": {
    "email": "customer@example.com",
    "name": "John Doe"
  }
}
```

### Widget Assets
- `/widget-loader.js` - Widget loader script
- `/chat-widget.js` - Main widget JavaScript
- `/chat-widget.css` - Widget styles

---

## 🔒 GDPR Compliance

### Implemented Webhooks

1. **customers/data_request**
   - Collects customer data
   - Returns chat history
   - Logs for compliance

2. **customers/redact**
   - Deletes customer messages
   - Removes sessions
   - Complete data removal

3. **shop/redact**
   - Deletes all store data
   - Triggered 48hrs after uninstall
   - Complete cleanup

### Testing Webhooks
```bash
shopify webhook trigger --topic=customers/data_request
shopify webhook trigger --topic=customers/redact
shopify webhook trigger --topic=shop/redact
```

---

## 📸 Screenshots

### Admin Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Chat Widget
![Widget](docs/screenshots/widget.png)

### Analytics
![Analytics](docs/screenshots/analytics.png)

---

## 🤝 Support

### Contact
- **Email:** support@indigenservices.com
- **Website:** https://shopchat-new.indigenservices.com
- **Issues:** [GitHub Issues](https://github.com/r2w34/shopchat-AI-shopify/issues)

### Documentation
- [Installation Guide](./docs/installation.md)
- [Configuration Guide](./docs/configuration.md)
- [API Documentation](./API_SPEC.md)
- [Troubleshooting](./docs/troubleshooting.md)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- Shopify for the amazing platform
- Google for Gemini AI
- The open-source community

---

**Made with ❤️ by IndigenServices**

**⭐ Star this repo if you find it helpful!**
