/**
 * Terms of Service Page
 * Legal terms and conditions for using ShopChat AI
 */

import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Terms of Service - ShopChat AI" },
    { name: "description", content: "Terms of Service for ShopChat AI application" },
  ];
};

export default function TermsOfService() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: "1.6" }}>
      <h1 style={{ fontSize: "2.5em", marginBottom: "10px" }}>Terms of Service</h1>
      <p style={{ color: "#666", marginBottom: "40px" }}>
        <strong>Last Updated:</strong> October 18, 2025
      </p>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>1. Acceptance of Terms</h2>
        <p>
          Welcome to ShopChat AI. By installing, accessing, or using our application ("Service"), you agree to be 
          bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
        </p>
        <p>
          These Terms constitute a legally binding agreement between you ("Merchant," "you," or "your") and 
          ShopChat AI ("we," "us," or "our").
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>2. Service Description</h2>
        <p>
          ShopChat AI is an AI-powered customer support chatbot application for Shopify stores that provides:
        </p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>Automated customer support through an AI chatbot widget</li>
          <li>Natural language processing using Google Gemini AI</li>
          <li>Order tracking functionality</li>
          <li>Product recommendation features</li>
          <li>FAQ management system</li>
          <li>Analytics and reporting dashboard</li>
        </ul>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>3. Eligibility</h2>
        <p>To use our Service, you must:</p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>Have an active Shopify store</li>
          <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
          <li>Have the authority to enter into this agreement on behalf of your business</li>
          <li>Comply with all applicable laws and regulations</li>
          <li>Not be prohibited from using our Service under applicable law</li>
        </ul>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>4. Account and Installation</h2>
        
        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>4.1 Installation</h3>
        <p>
          You install the Service through the Shopify App Store. By installing, you authorize us to access 
          certain data from your Shopify store as described in our Privacy Policy.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>4.2 Account Security</h3>
        <p>
          You are responsible for maintaining the security of your Shopify account. We are not liable for 
          any loss or damage from your failure to maintain account security.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>4.3 Accurate Information</h3>
        <p>
          You agree to provide accurate, current, and complete information during setup and to update such 
          information to maintain its accuracy.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>5. Subscription and Billing</h2>
        
        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>5.1 Pricing Plans</h3>
        <p>We offer the following subscription plans:</p>
        <div style={{ backgroundColor: "#f7f7f7", padding: "20px", borderRadius: "8px", marginTop: "15px" }}>
          <p><strong>Free Plan:</strong> $0/month - 100 messages per month, basic support, 1 FAQ category</p>
          <p><strong>Basic Plan:</strong> $9.99/month - 1,000 messages per month, email support, 5 FAQ categories, basic analytics</p>
          <p><strong>Pro Plan:</strong> $29.99/month - 10,000 messages per month, priority support, unlimited FAQs, advanced analytics, custom branding</p>
          <p><strong>Enterprise Plan:</strong> $99.99/month - Unlimited messages, 24/7 support, unlimited FAQs, full analytics, custom branding, API access</p>
        </div>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>5.2 Billing Through Shopify</h3>
        <p>
          All subscription fees are billed through Shopify's billing system. By subscribing to a paid plan, 
          you authorize Shopify to charge your payment method on file.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>5.3 Recurring Charges</h3>
        <p>
          Subscription fees are billed monthly in advance on the date you subscribe. Your subscription 
          automatically renews unless you cancel before the renewal date.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>5.4 Message Limits</h3>
        <p>
          Each plan includes a specific number of messages per month. If you exceed your plan limit:
        </p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>Free Plan: Service pauses until next billing cycle or you upgrade</li>
          <li>Paid Plans: You'll be prompted to upgrade to a higher plan</li>
        </ul>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>5.5 Plan Changes</h3>
        <p>
          You may upgrade or downgrade your plan at any time through the app dashboard:
        </p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li><strong>Upgrades:</strong> Take effect immediately; you're charged the pro-rated difference</li>
          <li><strong>Downgrades:</strong> Take effect at the next billing cycle</li>
        </ul>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>5.6 No Refunds</h3>
        <p>
          <strong>All fees are non-refundable.</strong> We do not provide refunds or credits for partial months 
          of service, unused messages, or if you cancel mid-billing cycle.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>5.7 Price Changes</h3>
        <p>
          We may change our pricing with 30 days' notice. Price changes will take effect at your next billing cycle. 
          Continued use after a price change constitutes acceptance of the new price.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>5.8 Taxes</h3>
        <p>
          Fees do not include applicable taxes. You are responsible for paying all taxes associated with your subscription.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>6. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>Use the Service for any illegal purpose or in violation of any laws</li>
          <li>Violate or infringe the rights of others, including intellectual property rights</li>
          <li>Transmit viruses, malware, or other harmful code</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
          <li>Use the Service to send spam or unsolicited messages</li>
          <li>Abuse or exploit any vulnerabilities in the Service</li>
          <li>Resell or redistribute the Service without written permission</li>
          <li>Use the Service in a way that could damage our reputation</li>
          <li>Bypass any usage limits or restrictions</li>
        </ul>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>7. Data and Privacy</h2>
        <p>
          Your use of the Service is also governed by our <a href="/privacy-policy" style={{ color: "#5C6AC4" }}>Privacy Policy</a>. 
          By using the Service, you consent to our collection and use of data as described in the Privacy Policy.
        </p>
        <p>
          <strong>Important:</strong> Customer messages are processed by Google Gemini AI to generate responses. 
          See our Privacy Policy for details on data sharing and security.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>8. Intellectual Property</h2>
        
        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>8.1 Our Rights</h3>
        <p>
          The Service, including all content, features, and functionality, is owned by ShopChat AI and is 
          protected by copyright, trademark, and other intellectual property laws.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>8.2 Your License</h3>
        <p>
          We grant you a limited, non-exclusive, non-transferable license to use the Service for your business 
          purposes during your subscription period.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>8.3 Your Content</h3>
        <p>
          You retain ownership of all content you provide through the Service (FAQs, settings, etc.). 
          You grant us a license to use this content to provide the Service.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>9. Service Availability</h2>
        
        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>9.1 Uptime</h3>
        <p>
          We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. The Service may be 
          unavailable due to maintenance, updates, or circumstances beyond our control.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>9.2 Maintenance</h3>
        <p>
          We may perform scheduled maintenance with notice or emergency maintenance without notice. 
          We are not liable for any downtime during maintenance periods.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>9.3 Service Changes</h3>
        <p>
          We reserve the right to modify, suspend, or discontinue any part of the Service at any time 
          with reasonable notice.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>10. Support</h2>
        <p>We provide support as follows:</p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li><strong>Free Plan:</strong> Email support with 48-hour response time</li>
          <li><strong>Basic Plan:</strong> Email support with 24-hour response time</li>
          <li><strong>Pro Plan:</strong> Priority email support with 8-hour response time</li>
          <li><strong>Enterprise Plan:</strong> 24/7 support with 2-hour response time</li>
        </ul>
        <p>Contact support at: <a href="mailto:support@indigenservices.com" style={{ color: "#5C6AC4" }}>support@indigenservices.com</a></p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>11. Termination</h2>
        
        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>11.1 Cancellation by You</h3>
        <p>
          You may cancel your subscription at any time by uninstalling the app from your Shopify store. 
          Cancellation takes effect at the end of your current billing period. No refunds for the current 
          billing cycle.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>11.2 Termination by Us</h3>
        <p>
          We may suspend or terminate your access to the Service immediately if you:
        </p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>Violate these Terms</li>
          <li>Engage in fraudulent activity</li>
          <li>Fail to pay fees</li>
          <li>Abuse the Service</li>
        </ul>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>11.3 Effect of Termination</h3>
        <p>
          Upon termination:
        </p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>Your access to the Service will cease immediately</li>
          <li>Your data will be deleted within 30 days (per GDPR requirements)</li>
          <li>You remain responsible for all fees incurred before termination</li>
          <li>Provisions that should survive termination will remain in effect</li>
        </ul>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>12. Disclaimers and Warranties</h2>
        
        <p style={{ backgroundColor: "#fff3cd", padding: "15px", borderRadius: "8px", border: "1px solid #ffecb5" }}>
          <strong>IMPORTANT:</strong> THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.
        </p>

        <p>TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING:</p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>Warranties of merchantability</li>
          <li>Warranties of fitness for a particular purpose</li>
          <li>Warranties of non-infringement</li>
          <li>Warranties that the Service will be error-free or uninterrupted</li>
          <li>Warranties regarding the accuracy or reliability of AI-generated responses</li>
        </ul>

        <p>
          <strong>AI Disclaimer:</strong> Our Service uses AI technology that may not always produce accurate 
          or appropriate responses. You are responsible for monitoring the quality of customer interactions.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>13. Limitation of Liability</h2>
        
        <p style={{ backgroundColor: "#fff3cd", padding: "15px", borderRadius: "8px", border: "1px solid #ffecb5" }}>
          <strong>IMPORTANT LIMITATION:</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY DAMAGES.
        </p>

        <p>WE ARE NOT LIABLE FOR:</p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>Indirect, incidental, special, consequential, or punitive damages</li>
          <li>Loss of profits, revenue, data, or business opportunities</li>
          <li>Costs of replacement goods or services</li>
          <li>Any damages arising from AI-generated responses</li>
          <li>Any damages arising from Service interruptions</li>
        </ul>

        <p>
          <strong>IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS 
          PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.</strong>
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>14. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless ShopChat AI, its affiliates, and their respective 
          officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses 
          (including attorney fees) arising from:
        </p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>Your use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any rights of another person or entity</li>
          <li>Your content or data</li>
        </ul>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>15. Dispute Resolution</h2>
        
        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>15.1 Governing Law</h3>
        <p>
          These Terms are governed by the laws of the State of Delaware, United States, without regard 
          to conflict of law principles.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>15.2 Informal Resolution</h3>
        <p>
          Before filing a claim, you agree to contact us to attempt to resolve the dispute informally. 
          We'll attempt to resolve disputes in good faith.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>15.3 Arbitration</h3>
        <p>
          If we can't resolve a dispute informally, it will be resolved through binding arbitration in 
          accordance with the American Arbitration Association's rules, except for small claims court matters.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>16. Changes to Terms</h2>
        <p>
          We may modify these Terms at any time. We'll notify you of significant changes by posting a notice 
          in the app or sending an email. Your continued use after changes constitutes acceptance.
        </p>
        <p>
          Material changes take effect 30 days after notification. Non-material changes take effect immediately.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>17. General Provisions</h2>
        
        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>17.1 Entire Agreement</h3>
        <p>
          These Terms, together with our Privacy Policy, constitute the entire agreement between you and us.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>17.2 Severability</h3>
        <p>
          If any provision of these Terms is found invalid, the remaining provisions will remain in effect.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>17.3 Waiver</h3>
        <p>
          Our failure to enforce any right or provision doesn't constitute a waiver of that right or provision.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>17.4 Assignment</h3>
        <p>
          You may not assign or transfer these Terms without our written consent. We may assign these Terms 
          without restriction.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>17.5 Force Majeure</h3>
        <p>
          We're not liable for delays or failures due to circumstances beyond our reasonable control, 
          including natural disasters, war, terrorism, riots, or technical failures.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>18. Contact Information</h2>
        <p>
          For questions about these Terms, contact us:
        </p>
        <div style={{ backgroundColor: "#f7f7f7", padding: "20px", borderRadius: "8px", marginTop: "15px" }}>
          <p><strong>ShopChat AI / Indigen Services</strong></p>
          <p>Email: <a href="mailto:support@indigenservices.com" style={{ color: "#5C6AC4" }}>support@indigenservices.com</a></p>
          <p>Website: <a href="https://shopchatai.indigenservices.com" style={{ color: "#5C6AC4" }}>https://shopchatai.indigenservices.com</a></p>
        </div>
      </section>

      <hr style={{ margin: "40px 0", border: "none", borderTop: "1px solid #ddd" }} />

      <p style={{ textAlign: "center", color: "#666", fontSize: "0.9em" }}>
        These Terms of Service are effective as of October 18, 2025 and were last updated on October 18, 2025.
      </p>

      <p style={{ textAlign: "center", fontSize: "0.9em", marginTop: "15px" }}>
        By using ShopChat AI, you acknowledge that you have read, understood, and agree to be bound by these Terms.
      </p>

      <p style={{ textAlign: "center", marginTop: "20px" }}>
        <a href="/privacy-policy" style={{ color: "#5C6AC4", textDecoration: "none" }}>← Privacy Policy</a> | {" "}
        <a href="/" style={{ color: "#5C6AC4", textDecoration: "none" }}>Back to Home →</a>
      </p>
    </div>
  );
}
