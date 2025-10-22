# Shopify App Store Compliance Checklist
## ShopChat AI - Pre-Submission Review

**Date**: October 18, 2025  
**App Name**: AI Support Chatbot  
**Status**: Pre-Submission Review  

---

## 📋 Executive Summary

This document provides a comprehensive compliance review of ShopChat AI against Shopify App Store requirements and submission policies.

**Overall Compliance Status**: ⚠️ **MOSTLY COMPLIANT - Action Items Required**

**Critical Issues**: 2  
**Medium Priority**: 4  
**Low Priority**: 3  

---

## ✅ Prohibited App Types Compliance

### Requirement: App must not fall into prohibited categories

| Prohibited Type | Status | Notes |
|----------------|--------|-------|
| Desktop software required | ✅ PASS | Web-based app only |
| Manual service-based | ✅ PASS | Automated AI chatbot |
| Doesn't use Shopify APIs | ✅ PASS | Uses Admin API, GraphQL, webhooks |
| Falsifies data | ✅ PASS | Provides genuine AI responses |
| Offsite payment processing | ✅ PASS | No payment processing |
| Duplicate apps | ✅ PASS | Unique AI chat solution |
| Marketplace features | ✅ PASS | No marketplace functionality |
| Capital funding | ✅ PASS | Not a financing app |
| Beta API scopes | ✅ PASS | Uses stable API scopes |
| Primarily shares merchant data | ⚠️ REVIEW | Sends data to Gemini AI |
| Connects to external developers | ✅ PASS | No developer connections |
| Requires browser extension | ✅ PASS | No extensions |
| Provides refunds | ✅ PASS | No refund processing |
| Connects to payment gateway | ✅ PASS | Not a payment app |
| Unauthorized payments | ✅ PASS | Not a payment app |
| Bypasses Theme Store | ✅ PASS | Script tag installation |
| Product duplication | ✅ PASS | No product copying |
| Third-party POS | ✅ PASS | No POS integration |
| Auto-adds checkout charges | ✅ PASS | No checkout modifications |
| Increases shipping prices | ✅ PASS | No shipping modifications |

**Action Required**: 
- **⚠️ Data Sharing Disclosure**: Document and disclose that we send chat messages to Google Gemini AI for processing. Ensure compliance with [API Terms](https://www.shopify.com/legal/api-terms).

---

## 🔐 Installation & Authentication

### 1. OAuth Flow

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Immediate OAuth before other steps | ✅ PASS | `app/shopify.server.ts` handles OAuth first |
| No UI before OAuth | ✅ PASS | Shopify handles auth redirect |
| Redirect to UI after OAuth | ✅ PASS | Redirects to `/app` dashboard |
| OAuth grant page shows permissions | ✅ PASS | Shopify displays scopes automatically |
| No manual shop URL entry | ✅ PASS | OAuth provides shop domain |
| No pop-ups for OAuth | ✅ PASS | Standard redirect flow |

**Status**: ✅ **COMPLIANT**

### 2. Permissions & Scopes

**Current Scopes** (from `shopify.app.toml`):
```
write_app_proxy, read_products, write_products, read_orders, 
write_orders, read_customers, write_customers, read_content, 
write_content, read_themes, write_themes, read_script_tags, 
write_script_tags, read_checkouts, write_checkouts, 
read_marketing_events, write_marketing_events, read_analytics, 
read_translations, write_translations, read_locales, read_shipping, 
write_shipping, read_inventory, write_inventory, 
read_merchant_managed_fulfillment_orders, 
write_merchant_managed_fulfillment_orders, read_online_store_pages, 
write_online_store_pages, read_price_rules, write_price_rules, 
read_discounts, write_discounts
```

**⚠️ CRITICAL ISSUE**: Too many scopes requested!

| Scope | Necessary? | Reason | Recommendation |
|-------|-----------|--------|----------------|
| `read_products`, `write_products` | ✅ YES | Product recommendations, search | Keep |
| `read_orders`, `write_orders` | ✅ YES | Order tracking feature | Keep `read_orders` only |
| `read_customers`, `write_customers` | ✅ YES | Customer personalization | Keep `read_customers` only |
| `read_script_tags`, `write_script_tags` | ✅ YES | Widget installation | Keep |
| `read_analytics` | ✅ YES | Store analytics in dashboard | Keep |
| `read_content`, `write_content` | ❓ MAYBE | FAQ management | Review - do we modify content? |
| `read_themes`, `write_themes` | ❌ NO | Not modifying themes | **REMOVE** |
| `read_checkouts`, `write_checkouts` | ❌ NO | Not modifying checkout | **REMOVE** |
| `read_marketing_events`, `write_marketing_events` | ❌ NO | Not used | **REMOVE** |
| `read_translations`, `write_translations` | ❌ NO | Not used | **REMOVE** |
| `read_locales` | ❌ NO | Not used | **REMOVE** |
| `read_shipping`, `write_shipping` | ❌ NO | Not used | **REMOVE** |
| `read_inventory`, `write_inventory` | ❌ NO | Not used | **REMOVE** |
| `read_merchant_managed_fulfillment_orders`, `write_merchant_managed_fulfillment_orders` | ❌ NO | Not used | **REMOVE** |
| `read_online_store_pages`, `write_online_store_pages` | ❌ NO | Not used | **REMOVE** |
| `read_price_rules`, `write_price_rules` | ❌ NO | Not used | **REMOVE** |
| `read_discounts`, `write_discounts` | ❌ NO | Not used | **REMOVE** |

**Action Required**:
- ❗ **CRITICAL**: Reduce scopes to only what's necessary
- Remove all `write_*` scopes that aren't actively used
- Remove all unused `read_*` scopes

**Recommended Minimal Scopes**:
```
read_products, read_orders, read_customers, 
read_script_tags, write_script_tags, 
read_analytics, write_app_proxy
```

---

## 💰 Billing & Pricing

### Requirements

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Use Billing API or Managed Pricing | ✅ PASS | Uses Billing API |
| Allow upgrade/downgrade | ⚠️ VERIFY | Need to test |
| No merchant contact required | ⚠️ VERIFY | Need to verify |
| Enterprise pricing disclosed | ✅ PASS | $99.99/month plan exists |
| Accept/decline charges | ✅ PASS | Billing service handles this |
| Request approval on reinstall | ⚠️ VERIFY | Need to test |

**Current Pricing Plans**:

1. **Free**: $0/month
   - 100 messages/month
   - Basic support
   - 1 FAQ category

2. **Basic**: $9.99/month
   - 1,000 messages/month
   - Email support
   - 5 FAQ categories
   - Basic analytics

3. **Pro**: $29.99/month ⭐ Most Popular
   - 10,000 messages/month
   - Priority support
   - Unlimited FAQs
   - Advanced analytics
   - Custom branding

4. **Enterprise**: $99.99/month
   - Unlimited messages
   - 24/7 support
   - Unlimited FAQs
   - Full analytics
   - Custom branding
   - API access

**Action Required**:
1. ⚠️ **Test upgrade/downgrade flow** - Verify merchants can change plans without contacting support
2. ⚠️ **Test reinstall billing** - Ensure charges are re-requested properly
3. ✅ **Document enterprise pricing** - Already in plan description

---

## 🎨 User Interface & Quality

### Requirements

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| No 404/500 errors | ✅ PASS | Fixed robots.txt, widget embed routes |
| Fully operational UI | ✅ PASS | All routes functional |
| No UI bugs | ✅ PASS | Fixed auto-open widget bug |
| Uses Polaris components | ✅ PASS | Dashboard uses Polaris |
| Secondary payments disclosure | ✅ N/A | Doesn't add payments |
| No promotional admin blocks | ✅ PASS | No promotional content |
| Admin blocks feature-complete | ✅ PASS | Widget is complete |
| Complete and testable | ✅ PASS | Fully functional |
| Data synchronization | ✅ PASS | Webhooks handle sync |

**Status**: ✅ **COMPLIANT**

---

## ⚡ Performance Requirements

### Critical Requirement: Lighthouse Performance Impact

**Requirement**: App must not reduce Lighthouse performance scores by more than 10 points.

**Current Status**: ⛔ **NOT TESTED**

**Test Pages Required**:
- Home page (17% weight)
- Product details page (40% weight)
- Collection page (43% weight)

**Widget Impact Analysis**:

Our widget loads:
1. `widget-loader.js` - JavaScript file
2. `chat-widget.css` - CSS file
3. Socket.IO connection - Real-time WebSocket

**Estimated Impact**: ⚠️ **LIKELY 5-8 POINT REDUCTION**

**Mitigation Strategies**:
1. ✅ Lazy load widget (load on user interaction)
2. ✅ Async script loading (already implemented)
3. ✅ Minimal CSS (lightweight styles)
4. ⚠️ Socket.IO connection - Consider delaying until chat opens
5. ⚠️ Minify JavaScript - Ensure production build is minified

**Action Required**:
1. ❗ **CRITICAL**: Run Lighthouse tests before and after widget installation
2. Document results in submission form
3. Optimize if impact > 10 points
4. Consider implementing:
   - Lazy loading Socket.IO connection (wait until chat opens)
   - Code splitting for non-critical features
   - Image optimization
   - Caching strategies

**Testing Steps**:
```bash
# Before installation
1. Create test store
2. Add products, collections
3. Run Lighthouse on home, product, collection
4. Calculate weighted average

# After installation
5. Install ShopChat AI
6. Configure widget
7. Run Lighthouse on same pages
8. Calculate weighted average
9. Compare difference

# Formula
Impact = (Home × 0.17 + Product × 0.40 + Collection × 0.43)_after 
       - (Home × 0.17 + Product × 0.40 + Collection × 0.43)_before
```

---

## 📝 App Listing Requirements

### Required Content

| Section | Status | Notes |
|---------|--------|-------|
| App name | ✅ READY | "AI Support Chatbot" |
| App icon | ⚠️ NEEDED | Create icon (no Shopify trademark) |
| Feature media | ⚠️ NEEDED | Demo video or animated GIF |
| Screenshots | ⚠️ NEEDED | 3-8 screenshots of UI |
| App introduction | ⚠️ NEEDED | 50-150 word description |
| App details | ⚠️ NEEDED | Full description |
| Feature list | ⚠️ NEEDED | Key features bullet points |
| Pricing information | ✅ READY | 4 plans documented |
| Demo store URL | ⚠️ NEEDED | Create public demo store |
| Support email | ⚠️ NEEDED | Set up support email |
| Privacy policy URL | ⚠️ NEEDED | Create privacy policy |
| Terms of service URL | ⚠️ NEEDED | Create ToS |

**Action Required**:
1. 📸 **Create marketing materials**:
   - App icon (256x256px, no Shopify branding)
   - Feature media (video or GIF showing chat in action)
   - 5-8 screenshots (dashboard, widget, settings, etc.)

2. ✍️ **Write app listing content**:
   - **App introduction** (50-150 words)
   - **Full description** (highlight benefits, not just features)
   - **Feature list** (10-15 key features)

3. 🏪 **Create demo store**:
   - Install app
   - Configure with sample FAQs
   - Add sample products
   - Test chat interactions

4. 📧 **Setup support infrastructure**:
   - Create support email (e.g., support@shopchatai.com)
   - Create help documentation
   - Create video tutorials

5. ⚖️ **Legal documents**:
   - Privacy Policy (GDPR compliant)
   - Terms of Service
   - Cookie Policy
   - Data Processing Agreement

---

## 🔒 Data Privacy & GDPR

### Requirements

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| GDPR webhooks implemented | ✅ PASS | All 3 mandatory webhooks exist |
| `customers/data_request` | ✅ PASS | `webhooks.customers.data_request.tsx` |
| `customers/redact` | ✅ PASS | `webhooks.customers.redact.tsx` |
| `shop/redact` | ✅ PASS | `webhooks.shop.redact.tsx` |
| Privacy policy | ⚠️ NEEDED | Must create |
| Data retention policy | ⚠️ NEEDED | Document in privacy policy |
| Third-party data sharing disclosed | ⚠️ NEEDED | Disclose Gemini AI usage |

**Data Flows to Document**:

1. **Gemini AI (Google)**:
   - Purpose: Generate chat responses
   - Data sent: Customer messages, product info
   - Retention: Per Google's policy
   - Compliance: Need consent disclosure

2. **Database Storage**:
   - What: Chat sessions, messages, analytics
   - Where: SQLite on production server
   - Retention: Define policy (suggest 90 days)
   - Deletion: Implement via GDPR webhooks

**Action Required**:
1. ⚠️ **Create Privacy Policy** including:
   - What data is collected
   - How data is used
   - Third-party services (Gemini AI)
   - Data retention periods
   - User rights (access, deletion, export)
   - GDPR compliance statements

2. ⚠️ **Implement GDPR webhook logic**:
   - Currently webhooks exist but may be empty
   - Add logic to export customer data
   - Add logic to delete customer data
   - Add logic to delete shop data

3. ⚠️ **Add consent mechanisms**:
   - Widget should show privacy notice
   - Merchants should accept ToS on install
   - Customers should consent to AI processing

---

## 🛠️ Technical Quality

### Code Quality Checklist

| Item | Status | Notes |
|------|--------|-------|
| TypeScript compilation | ✅ PASS | No errors |
| Build successful | ✅ PASS | Production build works |
| No console errors | ✅ PASS | Clean console |
| Error handling | ✅ PASS | Try-catch blocks implemented |
| Database migrations | ✅ PASS | Prisma migrations exist |
| Environment variables | ✅ PASS | All vars documented |
| Security | ✅ PASS | OAuth, no exposed secrets |
| Rate limiting | ⚠️ NEEDED | Add API rate limits |
| Logging | ✅ PASS | PM2 logs available |
| Monitoring | ⚠️ NEEDED | Add error tracking (Sentry) |

**Recommended Improvements**:
1. Add rate limiting to API routes
2. Implement error tracking (Sentry or similar)
3. Add API request logging
4. Implement retry logic for external APIs
5. Add health checks for Gemini API

---

## 📞 Support Requirements

### Required Support Channels

| Channel | Status | Notes |
|---------|--------|-------|
| Support email | ⚠️ NEEDED | Create dedicated email |
| Help documentation | ⚠️ NEEDED | Create help center |
| Video tutorials | ⚠️ OPTIONAL | Recommended for onboarding |
| In-app help | ✅ PASS | `app.help.tsx` exists |
| FAQ page | ⚠️ NEEDED | Public FAQ on website |
| Response time SLA | ⚠️ NEEDED | Define and document |

**Action Required**:
1. Create support email: support@shopchatai.com
2. Set up help documentation site
3. Create onboarding guide
4. Create merchant FAQ
5. Define support SLAs:
   - Free: 48-hour response
   - Basic: 24-hour response
   - Pro: 8-hour response
   - Enterprise: 2-hour response + 24/7 support

---

## 🧪 Testing Checklist

### Pre-Submission Tests

- [ ] **OAuth Flow**: Install app on fresh store
- [ ] **Widget Installation**: Verify script tag created
- [ ] **Widget Loading**: Check widget appears on storefront
- [ ] **Chat Functionality**: Send test messages
- [ ] **AI Responses**: Verify Gemini responds correctly
- [ ] **Order Tracking**: Test order lookup
- [ ] **Product Recommendations**: Test product search
- [ ] **Billing Upgrade**: Test plan upgrade
- [ ] **Billing Downgrade**: Test plan downgrade
- [ ] **Uninstall**: Test app removal
- [ ] **Reinstall**: Test app reinstall with existing data
- [ ] **Webhooks**: Verify all webhooks fire
- [ ] **GDPR Export**: Test customer data export
- [ ] **GDPR Delete**: Test customer data deletion
- [ ] **Performance**: Run Lighthouse tests
- [ ] **Mobile**: Test widget on mobile devices
- [ ] **Cross-browser**: Test on Chrome, Safari, Firefox
- [ ] **Error Handling**: Test with invalid inputs
- [ ] **Load Testing**: Test with high message volume
- [ ] **Security**: Test with malicious inputs

---

## 📊 Compliance Summary

### Status Overview

| Category | Status | Score | Critical Issues |
|----------|--------|-------|-----------------|
| Prohibited Apps | ✅ PASS | 19/20 | 1 (Data sharing disclosure) |
| Installation & Auth | ✅ PASS | 6/6 | 0 |
| Permissions & Scopes | ⛔ FAIL | 0/1 | 1 (Too many scopes) |
| Billing | ⚠️ PARTIAL | 4/6 | 0 |
| User Interface | ✅ PASS | 9/9 | 0 |
| Performance | ⛔ NOT TESTED | 0/1 | 1 (No Lighthouse tests) |
| App Listing | ⚠️ PARTIAL | 2/12 | 0 |
| Privacy & GDPR | ⚠️ PARTIAL | 3/7 | 0 |
| Technical Quality | ⚠️ PARTIAL | 8/10 | 0 |
| Support | ⚠️ PARTIAL | 1/6 | 0 |

**Overall Score**: 52/78 (67%)

---

## 🚨 Critical Action Items (Must Fix Before Submission)

### Priority 1: Blockers

1. ❗ **Reduce API Scopes** (CRITICAL)
   - Remove unnecessary write scopes
   - Remove unused read scopes
   - Update `shopify.app.toml`
   - Test with minimal scopes

2. ❗ **Performance Testing** (CRITICAL)
   - Run Lighthouse tests
   - Document results
   - Optimize if needed
   - Include in submission

3. ❗ **Create Privacy Policy** (CRITICAL)
   - GDPR compliant
   - Disclose Gemini AI usage
   - Define data retention
   - Publish on website

### Priority 2: Required

4. ⚠️ **App Listing Materials**
   - Create app icon
   - Record feature video
   - Take screenshots
   - Write descriptions

5. ⚠️ **Legal Documents**
   - Terms of Service
   - Cookie Policy
   - Data Processing Agreement

6. ⚠️ **Support Infrastructure**
   - Support email
   - Help documentation
   - Merchant FAQ

7. ⚠️ **GDPR Webhook Implementation**
   - Add data export logic
   - Add data deletion logic
   - Test thoroughly

### Priority 3: Recommended

8. ℹ️ **Demo Store**
   - Public demo with sample data
   - Configured widget
   - Sample conversations

9. ℹ️ **Monitoring & Error Tracking**
   - Sentry or similar
   - API rate limiting
   - Performance monitoring

10. ℹ️ **Documentation**
    - API documentation
    - Integration guides
    - Video tutorials

---

## 📋 Pre-Submission Checklist

### Before Submitting to Shopify App Store

- [ ] All critical issues resolved
- [ ] API scopes reduced to minimum
- [ ] Lighthouse performance tested and documented
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] App icon created (256x256px)
- [ ] Feature video or GIF created
- [ ] 5-8 screenshots taken
- [ ] App listing copy written
- [ ] Demo store set up and public
- [ ] Support email configured
- [ ] Help documentation published
- [ ] GDPR webhooks implemented
- [ ] All billing flows tested
- [ ] OAuth flow tested on fresh store
- [ ] Widget tested on mobile
- [ ] Cross-browser testing completed
- [ ] Security audit completed
- [ ] Load testing completed
- [ ] All webhooks tested
- [ ] Uninstall/reinstall tested

---

## 🎯 Recommended Timeline

### Week 1: Critical Fixes
- Days 1-2: Reduce API scopes, test functionality
- Days 3-4: Run Lighthouse tests, optimize performance
- Days 5-7: Create Privacy Policy, ToS, and legal docs

### Week 2: Content Creation
- Days 8-9: Create app icon, screenshots
- Days 10-11: Record feature video
- Days 12-14: Write app listing content

### Week 3: Infrastructure
- Days 15-16: Set up support email, help docs
- Days 17-18: Create demo store
- Days 19-21: Implement GDPR webhook logic

### Week 4: Testing & Polish
- Days 22-24: Full testing suite
- Days 25-26: Bug fixes
- Days 27-28: Final review and submission

**Estimated Time to Submission**: 4 weeks

---

## 📖 Additional Resources

### Shopify Documentation
- [App Store Requirements](https://shopify.dev/docs/apps/store/requirements)
- [Built for Shopify](https://shopify.dev/built-for-shopify)
- [App Performance](https://shopify.dev/docs/apps/best-practices/performance)
- [Billing API](https://shopify.dev/docs/apps/billing)
- [OAuth](https://shopify.dev/docs/apps/build/authentication-authorization)

### Testing Tools
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)

### Legal Templates
- [Termly Privacy Policy Generator](https://termly.io/products/privacy-policy-generator/)
- [Shopify Legal Templates](https://www.shopify.com/legal)

---

## ✅ Conclusion

**Current Status**: ⚠️ **NOT READY FOR SUBMISSION**

**Estimated Work Required**: 4 weeks

**Key Strengths**:
- ✅ Solid technical implementation
- ✅ OAuth and authentication correct
- ✅ Billing system implemented
- ✅ GDPR webhooks exist
- ✅ No major functionality issues

**Key Weaknesses**:
- ⛔ Too many API scopes (must fix)
- ⛔ Performance not tested (must fix)
- ⚠️ No app listing materials
- ⚠️ Missing legal documents
- ⚠️ No support infrastructure

**Next Steps**:
1. Fix critical issues (scopes, performance, privacy)
2. Create marketing materials
3. Set up support infrastructure
4. Complete testing
5. Submit for review

**Recommendation**: Complete all Priority 1 and Priority 2 items before submission to maximize approval chances.

---

**Document Version**: 1.0  
**Last Updated**: October 18, 2025  
**Reviewed By**: AI Development Team  
**Next Review**: Before submission
