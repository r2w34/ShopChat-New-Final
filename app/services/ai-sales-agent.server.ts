/**
 * AI Sales Agent Service
 * Handles intelligent product recommendations, upselling, and sales conversations
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../db.server";

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  compareAtPrice?: string;
  images: string[];
  url: string;
  available: boolean;
  variants: Array<{
    id: string;
    title: string;
    price: string;
    available: boolean;
  }>;
}

interface SalesAgentResponse {
  message: string;
  products?: Product[];
  needsAgent?: boolean;
  intent?: string;
  confidence?: number;
  action?: 'recommend' | 'upsell' | 'cross-sell' | 'answer' | 'agent_request';
}

const SALES_AGENT_SYSTEM_PROMPT = `
You are an expert sales assistant and product consultant. Your goal is to help customers find the perfect products and complete their purchases.

**Your Responsibilities:**
1. 🎯 Understand customer needs through thoughtful questions
2. 💡 Recommend relevant products that match their requirements
3. ⭐ Highlight key product benefits and features
4. 🔥 Create urgency with promotions or limited availability
5. 💬 Handle objections professionally and empathetically
6. 🛍️ Upsell premium versions or cross-sell complementary items
7. ✅ Guide customers smoothly toward purchase

**Your Personality:**
- Friendly, helpful, and consultative (not pushy!)
- Product expert who genuinely cares about customer satisfaction
- Uses emojis sparingly for friendliness
- Keeps responses concise (2-4 sentences max)
- Professional yet conversational

**Product Recommendations Format:**
When recommending products, use this structure:
"I think [Product Name] would be perfect for you! It [key benefit]. 

**[Product Name]** - $[Price]
[1-2 sentence description highlighting main benefit]

Would you like to add it to your cart?"

**Upselling Strategy:**
- Suggest premium/upgraded versions: "For just $X more, you get [better features]"
- Bundle complementary items: "Customers often pair this with [product] for [benefit]"
- Highlight value: "This saves you $X compared to buying separately"

**When Customer Wants Human Agent:**
If they say things like "speak to agent", "talk to human", "customer service", respond:
"I'd be happy to connect you with one of our team members! Let me get that set up for you right away. Can I have your name and email so they can reach out?"

**Important Rules:**
- Never make up product information
- Only recommend products from the provided catalog
- If unsure, admit it: "I'm not 100% certain, but let me check..."
- Always be honest about pricing, availability, and shipping
- Respect if customer declines and offer alternatives

**Current Context:**
Store: {STORE_NAME}
Active Promotions: {PROMOTIONS}
`;

export class AISalesAgent {
  private geminiClient: GoogleGenerativeAI;
  private modelName = "gemini-2.0-flash-exp";

  constructor(apiKey: string) {
    this.geminiClient = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generate AI sales agent response
   */
  async generateResponse(
    sessionId: string,
    userMessage: string,
    storeId: string
  ): Promise<SalesAgentResponse> {
    try {
      // Get session context
      const session = await this.getSessionContext(sessionId);
      
      // Check if requesting human agent
      if (this.isRequestingAgent(userMessage)) {
        await this.updateSessionStatus(sessionId, 'needs_agent');
        return {
          message: "I'd be happy to connect you with one of our team members! 👋\n\nLet me get that set up for you right away. Can I have your name and email so they can reach you?",
          needsAgent: true,
          action: 'agent_request'
        };
      }

      // Get relevant products based on message
      const relevantProducts = await this.findRelevantProducts(userMessage, storeId);
      
      // Build context-aware prompt
      const prompt = await this.buildSalesPrompt({
        userMessage,
        chatHistory: session.messages,
        products: relevantProducts,
        storeName: session.store.shopName || 'our store'
      });

      // Get AI response
      const model = this.geminiClient.getGenerativeModel({ model: this.modelName });
      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();

      // Analyze intent and confidence
      const analysis = this.analyzeResponse(userMessage, aiResponse);

      // Save message to database
      await this.saveMessage({
        sessionId,
        message: aiResponse,
        sender: 'AI',
        intent: analysis.intent,
        confidence: analysis.confidence,
        recommendedProducts: relevantProducts.length > 0 ? JSON.stringify(relevantProducts) : null
      });

      return {
        message: aiResponse,
        products: relevantProducts,
        intent: analysis.intent,
        confidence: analysis.confidence,
        action: analysis.action
      };

    } catch (error) {
      console.error('[AI Sales Agent] Error generating response:', error);
      
      // Fallback response
      return {
        message: "I apologize, but I'm having trouble processing that right now. Would you like to speak with a team member instead?",
        needsAgent: true,
        confidence: 0
      };
    }
  }

  /**
   * Check if user is requesting a human agent
   */
  private isRequestingAgent(message: string): boolean {
    const agentKeywords = [
      'speak to human',
      'talk to agent',
      'live agent',
      'customer service',
      'real person',
      'representative',
      'human help',
      'speak to someone',
      'talk to someone',
      'customer support'
    ];

    const lowerMessage = message.toLowerCase();
    return agentKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Find relevant products based on user query
   */
  private async findRelevantProducts(query: string, storeId: string): Promise<Product[]> {
    try {
      // For now, return empty array - will integrate Shopify API later
      // TODO: Implement actual Shopify product search
      return [];
    } catch (error) {
      console.error('[AI Sales Agent] Error finding products:', error);
      return [];
    }
  }

  /**
   * Build the full prompt for AI
   */
  private async buildSalesPrompt(context: {
    userMessage: string;
    chatHistory: any[];
    products: Product[];
    storeName: string;
  }): Promise<string> {
    const formattedHistory = context.chatHistory
      .slice(-10) // Last 10 messages for context
      .map(m => `${m.sender}: ${m.message}`)
      .join('\n');

    const productsInfo = context.products.length > 0
      ? `\n\nRelevant Products:\n${JSON.stringify(context.products, null, 2)}`
      : '\n\n(No specific products to recommend right now)';

    return `
${SALES_AGENT_SYSTEM_PROMPT
  .replace('{STORE_NAME}', context.storeName)
  .replace('{PROMOTIONS}', 'Free shipping on orders over $50')}

---

Chat History:
${formattedHistory || '(No previous messages)'}
${productsInfo}

---

Customer: ${context.userMessage}

Sales Agent (respond naturally, recommend products if relevant):
    `.trim();
  }

  /**
   * Analyze the user message and AI response for intent/confidence
   */
  private analyzeResponse(userMessage: string, aiResponse: string): {
    intent: string;
    confidence: number;
    action: SalesAgentResponse['action'];
  } {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    // Determine intent
    let intent = 'general_inquiry';
    let action: SalesAgentResponse['action'] = 'answer';

    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      intent = 'product_recommendation';
      action = 'recommend';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      intent = 'pricing_inquiry';
    } else if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      intent = 'shipping_inquiry';
    } else if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      intent = 'return_inquiry';
    } else if (lowerResponse.includes('would you like to add') || lowerResponse.includes('add to cart')) {
      action = 'recommend';
    }

    // Calculate confidence (simplified)
    const confidence = aiResponse.length > 20 ? 0.85 : 0.5;

    return { intent, confidence, action };
  }

  /**
   * Get session context with messages and store info
   */
  private async getSessionContext(sessionId: string) {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 10
        },
        store: {
          select: {
            shopName: true,
            shopDomain: true
          }
        }
      }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    return session;
  }

  /**
   * Update session status (e.g., when agent is requested)
   */
  private async updateSessionStatus(sessionId: string, status: string) {
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { status }
    });
  }

  /**
   * Save message to database
   */
  private async saveMessage(data: {
    sessionId: string;
    message: string;
    sender: string;
    intent?: string;
    confidence?: number;
    recommendedProducts?: string | null;
  }) {
    await prisma.chatMessage.create({
      data: {
        sessionId: data.sessionId,
        message: data.message,
        sender: data.sender,
        isAI: data.sender === 'AI',
        intent: data.intent,
        confidence: data.confidence,
        recommendedProducts: data.recommendedProducts
      }
    });
  }
}

// Export singleton instance
let salesAgentInstance: AISalesAgent | null = null;

export function getAISalesAgent(): AISalesAgent {
  if (!salesAgentInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    salesAgentInstance = new AISalesAgent(apiKey);
  }
  return salesAgentInstance;
}
