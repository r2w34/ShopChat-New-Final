/**
 * Email Service
 * Handles sending emails for GDPR data requests and other notifications
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string;
  }>;
}

class EmailService {
  private transporter: Transporter | null = null;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@indigenservices.com';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Check if email configuration exists
      const emailConfig = {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      };

      // Only initialize if credentials are provided
      if (emailConfig.auth.user && emailConfig.auth.pass) {
        this.transporter = nodemailer.createTransporter(emailConfig);
        console.log('[Email Service] Transporter initialized');
      } else {
        console.warn('[Email Service] Email credentials not configured. Emails will be logged only.');
      }
    } catch (error) {
      console.error('[Email Service] Failed to initialize transporter:', error);
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        // Log email content if transporter not configured
        console.log('[Email Service] Email would be sent (no transporter configured):', {
          from: this.fromEmail,
          to: options.to,
          subject: options.subject,
          preview: options.text?.substring(0, 100) || options.html?.substring(0, 100),
        });
        return true; // Return true for compliance logging
      }

      const mailOptions = {
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('[Email Service] Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('[Email Service] Error sending email:', error);
      return false;
    }
  }

  /**
   * Send GDPR customer data request email
   */
  async sendCustomerDataEmail(customerEmail: string, customerData: any): Promise<boolean> {
    const subject = 'Your Personal Data Request - ShopChat AI';
    
    const text = `
Dear Customer,

As requested, here is a copy of your personal data stored in our system:

Customer Email: ${customerData.email}
Total Chat Sessions: ${customerData.totalSessions}
Total Messages: ${customerData.totalMessages}

Chat Sessions:
${customerData.sessions.map((session: any, index: number) => `
Session ${index + 1} (Created: ${new Date(session.createdAt).toLocaleString()}):
${session.messages.map((msg: any) => `  - ${msg.role}: ${msg.message}`).join('\n')}
`).join('\n')}

If you have any questions about this data, please contact us at support@indigenservices.com.

Sincerely,
The ShopChat AI Team
`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #5C6AC4; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .session { background: white; margin: 15px 0; padding: 15px; border-left: 4px solid #5C6AC4; }
    .message { padding: 8px; margin: 5px 0; }
    .customer { background: #e3f2fd; }
    .ai { background: #f3e5f5; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Personal Data Request</h1>
      <p>ShopChat AI</p>
    </div>
    <div class="content">
      <p>Dear Customer,</p>
      <p>As requested, here is a copy of your personal data stored in our system:</p>
      
      <div class="session">
        <h3>Summary</h3>
        <p><strong>Email:</strong> ${customerData.email}</p>
        <p><strong>Total Chat Sessions:</strong> ${customerData.totalSessions}</p>
        <p><strong>Total Messages:</strong> ${customerData.totalMessages}</p>
      </div>

      <h3>Chat History:</h3>
      ${customerData.sessions.map((session: any, index: number) => `
        <div class="session">
          <h4>Session ${index + 1}</h4>
          <p><small>Created: ${new Date(session.createdAt).toLocaleString()}</small></p>
          ${session.messages.map((msg: any) => `
            <div class="message ${msg.role === 'CUSTOMER' ? 'customer' : 'ai'}">
              <strong>${msg.role}:</strong> ${msg.message}
            </div>
          `).join('')}
        </div>
      `).join('')}

      <p>If you have any questions about this data, please contact us at <a href="mailto:support@indigenservices.com">support@indigenservices.com</a>.</p>
    </div>
    <div class="footer">
      <p>This email was sent in response to your GDPR data request.</p>
      <p>&copy; ${new Date().getFullYear()} ShopChat AI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

    return await this.sendEmail({
      to: customerEmail,
      subject,
      text,
      html,
    });
  }

  /**
   * Verify email configuration
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.warn('[Email Service] No transporter configured');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('[Email Service] Connection verified successfully');
      return true;
    } catch (error) {
      console.error('[Email Service] Connection verification failed:', error);
      return false;
    }
  }
}

// Export singleton instance
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

export default getEmailService();
