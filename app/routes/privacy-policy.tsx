/**
 * Privacy Policy Page
 * Public-facing privacy policy for GDPR compliance
 */

import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy - ShopChat AI" },
    { name: "description", content: "Privacy Policy for ShopChat AI - AI-powered customer support chatbot for Shopify" },
  ];
};

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: "1.6" }}>
      <h1 style={{ fontSize: "2.5em", marginBottom: "10px" }}>Privacy Policy</h1>
      <p style={{ color: "#666", marginBottom: "40px" }}>
        <strong>Last Updated:</strong> October 18, 2025
      </p>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>1. Introduction</h2>
        <p>
          Welcome to ShopChat AI ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, 
          and safeguard your information when you use our AI-powered customer support chatbot application ("Service") 
          for Shopify stores.
        </p>
        <p>
          We are committed to protecting your privacy and complying with applicable data protection laws, including 
          the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>2. Information We Collect</h2>
        
        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>2.1 Store Information</h3>
        <p>When you install our app, we collect:</p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>Store domain and name</li>
          <li>Store owner email address</li>
          <li>Store timezone and locale settings</li>
          <li>OAuth access tokens (encrypted)</li>
        </ul>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>2.2 Customer Chat Data</h3>
        <p>When customers use the chat widget, we collect:</p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>Customer messages and inquiries</li>
          <li>Customer email addresses (if provided)</li>
          <li>Chat session timestamps</li>
          <li>Device and browser information</li>
        </ul>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>2.3 Product and Order Data</h3>
        <p>To provide our services, we access:</p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>Product information (titles, descriptions, prices)</li>
          <li>Order information (for order tracking features)</li>
          <li>Customer information (for personalization)</li>
        </ul>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>2.4 Usage Analytics</h3>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>Number of chat sessions</li>
          <li>Message volumes</li>
          <li>Response times</li>
          <li>Feature usage statistics</li>
        </ul>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>3. How We Use Your Information</h2>
        <p>We use the collected information for:</p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li><strong>Service Provision:</strong> To operate and maintain the chatbot functionality</li>
          <li><strong>AI Responses:</strong> To generate intelligent responses using Google's Gemini AI</li>
          <li><strong>Order Tracking:</strong> To help customers track their orders</li>
          <li><strong>Product Recommendations:</strong> To suggest relevant products to customers</li>
          <li><strong>Analytics:</strong> To provide usage statistics and insights to store owners</li>
          <li><strong>Improvement:</strong> To improve our service quality and features</li>
          <li><strong>Support:</strong> To provide customer support and troubleshooting</li>
          <li><strong>Compliance:</strong> To comply with legal obligations</li>
        </ul>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>4. Third-Party Services</h2>
        
        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>4.1 Google Gemini AI</h3>
        <p>
          We use Google's Gemini AI to process customer messages and generate intelligent responses. 
          When a customer sends a message through the chat widget, the message content and relevant context 
          (such as product information) are sent to Google's servers for AI processing.
        </p>
        <p>
          <strong>Data Shared:</strong> Customer messages, product information, store context
        </p>
        <p>
          <strong>Purpose:</strong> Natural language processing and response generation
        </p>
        <p>
          <strong>Google's Privacy Policy:</strong> <a href="https://policies.google.com/privacy" style={{ color: "#5C6AC4" }}>https://policies.google.com/privacy</a>
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>4.2 Shopify Platform</h3>
        <p>
          Our app integrates with Shopify's platform to access store data and provide services. 
          All data access is governed by Shopify's API Terms and the permissions granted during app installation.
        </p>
        <p>
          <strong>Shopify Privacy Policy:</strong> <a href="https://www.shopify.com/legal/privacy" style={{ color: "#5C6AC4" }}>https://www.shopify.com/legal/privacy</a>
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>5. Data Storage and Security</h2>
        
        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>5.1 Storage Location</h3>
        <p>
          Your data is stored on secure servers located in the United States. We use industry-standard 
          encryption and security measures to protect your information.
        </p>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>5.2 Security Measures</h3>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>SSL/TLS encryption for data in transit</li>
          <li>Encrypted database storage</li>
          <li>OAuth authentication with secure token storage</li>
          <li>Regular security audits and updates</li>
          <li>Access controls and logging</li>
        </ul>

        <h3 style={{ fontSize: "1.3em", marginTop: "20px", marginBottom: "10px" }}>5.3 Data Retention</h3>
        <p>We retain data for the following periods:</p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li><strong>Chat history:</strong> 90 days from last activity</li>
          <li><strong>Analytics data:</strong> 1 year for reporting purposes</li>
          <li><strong>Store configuration:</strong> Duration of active subscription</li>
          <li><strong>Account data:</strong> Until app uninstallation or deletion request</li>
        </ul>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>6. Your Rights (GDPR)</h2>
        <p>If you are located in the European Economic Area (EEA), you have the following rights:</p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
          <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
          <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
          <li><strong>Right to Restriction:</strong> Request restriction of processing</li>
          <li><strong>Right to Data Portability:</strong> Request transfer of your data</li>
          <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
          <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at: <strong>support@indigenservices.com</strong>
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>7. California Privacy Rights (CCPA)</h2>
        <p>If you are a California resident, you have the right to:</p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>Know what personal information is collected</li>
          <li>Know whether personal information is sold or disclosed</li>
          <li>Access your personal information</li>
          <li>Delete your personal information</li>
          <li>Opt-out of the sale of personal information (we do not sell data)</li>
          <li>Non-discrimination for exercising your rights</li>
        </ul>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>8. Data Sharing and Disclosure</h2>
        <p>We do not sell, rent, or trade your personal information. We may share information in the following circumstances:</p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li><strong>Service Providers:</strong> Google Gemini AI for chat response generation</li>
          <li><strong>Legal Requirements:</strong> When required by law or legal process</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale</li>
          <li><strong>With Consent:</strong> When you provide explicit consent</li>
        </ul>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>9. Cookies and Tracking</h2>
        <p>We use the following types of cookies:</p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li><strong>Essential Cookies:</strong> Required for authentication and app functionality</li>
          <li><strong>Analytics Cookies:</strong> To understand usage patterns and improve service</li>
          <li><strong>Session Cookies:</strong> To maintain chat sessions</li>
        </ul>
        <p>
          We do not use third-party tracking cookies for advertising purposes. 
          You can control cookies through your browser settings.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>10. Children's Privacy</h2>
        <p>
          Our Service is not intended for children under 13 years of age. We do not knowingly collect 
          personal information from children. If you believe we have collected information from a child, 
          please contact us immediately.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>11. International Data Transfers</h2>
        <p>
          If you are accessing our Service from outside the United States, please be aware that your 
          information may be transferred to, stored, and processed in the United States. By using our 
          Service, you consent to this transfer.
        </p>
        <p>
          We ensure appropriate safeguards are in place for international transfers, including 
          Standard Contractual Clauses approved by the European Commission.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>12. Data Deletion and App Uninstall</h2>
        <p>
          When you uninstall the app, we will automatically delete:
        </p>
        <ul style={{ marginLeft: "20px", lineHeight: "1.8" }}>
          <li>All chat sessions and messages</li>
          <li>Customer data</li>
          <li>Store configuration</li>
          <li>Analytics data</li>
        </ul>
        <p>
          Deletion occurs within 30 days of uninstallation. For immediate deletion, please contact us.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>13. Changes to Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of significant changes 
          by posting a notice in the app or sending an email. Your continued use of the Service after 
          changes constitutes acceptance of the updated policy.
        </p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>14. Contact Information</h2>
        <p>
          If you have questions about this Privacy Policy or wish to exercise your rights, contact us:
        </p>
        <div style={{ backgroundColor: "#f7f7f7", padding: "20px", borderRadius: "8px", marginTop: "15px" }}>
          <p><strong>ShopChat AI</strong></p>
          <p>Email: <a href="mailto:support@indigenservices.com" style={{ color: "#5C6AC4" }}>support@indigenservices.com</a></p>
          <p>Website: <a href="https://shopchat-new.indigenservices.com" style={{ color: "#5C6AC4" }}>https://shopchat-new.indigenservices.com</a></p>
        </div>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "1.8em", marginBottom: "15px", marginTop: "30px" }}>15. Complaints and Disputes</h2>
        <p>
          If you have concerns about our data handling practices, you have the right to lodge a complaint 
          with your local data protection authority. For EEA residents, you can find your Data Protection 
          Authority contact information at: <a href="https://edpb.europa.eu/about-edpb/board/members_en" style={{ color: "#5C6AC4" }}>https://edpb.europa.eu/about-edpb/board/members_en</a>
        </p>
      </section>

      <hr style={{ margin: "40px 0", border: "none", borderTop: "1px solid #ddd" }} />

      <p style={{ textAlign: "center", color: "#666", fontSize: "0.9em" }}>
        This Privacy Policy is effective as of October 18, 2025 and was last updated on October 18, 2025.
      </p>

      <p style={{ textAlign: "center", marginTop: "20px" }}>
        <a href="/" style={{ color: "#5C6AC4", textDecoration: "none" }}>← Back to Home</a> | {" "}
        <a href="/terms-of-service" style={{ color: "#5C6AC4", textDecoration: "none" }}>Terms of Service →</a>
      </p>
    </div>
  );
}
