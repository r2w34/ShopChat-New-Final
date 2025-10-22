import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface ChatContext {
  shop: string;
  customer?: {
    name?: string;
    email?: string;
  };
  products?: any[];
  faqs?: any[];
}

export async function generateAIResponse(
  message: string,
  context: ChatContext
): Promise<string> {
  try {
    // Get Gemini 2.5 Flash model (fast, efficient)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build context for the AI
    let systemContext = `You are an AI shopping assistant for ${context.shop}. 
You help customers with product questions, order tracking, and general support.
Be friendly, helpful, and concise in your responses.`;

    // Add FAQs to context if available
    if (context.faqs && context.faqs.length > 0) {
      systemContext += `\n\nFrequently Asked Questions:\n`;
      context.faqs.forEach((faq, index) => {
        systemContext += `\nQ: ${faq.question}\nA: ${faq.answer}\n`;
      });
      systemContext += `\nUse these FAQs to answer relevant questions.`;
    }

    // Add customer context if available
    if (context.customer?.name) {
      systemContext += `\n\nCustomer name: ${context.customer.name}`;
    }

    // Create the full prompt
    const fullPrompt = `${systemContext}\n\nCustomer: ${message}\n\nAssistant:`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Gemini AI error:", error);
    
    // Fallback response
    return "I apologize, but I'm having trouble processing your request right now. Please try again or contact our support team for immediate assistance.";
  }
}

// Function to generate product recommendations
export async function generateProductRecommendations(
  userMessage: string,
  products: any[]
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const productsContext = products.map((p, i) => 
      `${i + 1}. ${p.title} - ${p.description?.substring(0, 100) || 'No description'}`
    ).join('\n');

    const prompt = `Based on this customer message: "${userMessage}"

Available products:
${productsContext}

Recommend 2-3 relevant products from the list above. Be specific and helpful.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("Product recommendation error:", error);
    return "I can help you find products. Could you tell me more about what you're looking for?";
  }
}

// Function to analyze customer sentiment
export async function analyzeSentiment(message: string): Promise<'positive' | 'neutral' | 'negative'> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Analyze the sentiment of this customer message and respond with only one word: "positive", "neutral", or "negative"

Message: "${message}"

Sentiment:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const sentiment = response.text().toLowerCase().trim();

    if (sentiment.includes('positive')) return 'positive';
    if (sentiment.includes('negative')) return 'negative';
    return 'neutral';
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return 'neutral';
  }
}

export default {
  generateAIResponse,
  generateProductRecommendations,
  analyzeSentiment,
};
