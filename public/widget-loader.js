/**
 * AI Chat Widget - Standalone Loader
 * Creates and initializes the chat widget automatically
 */
(function() {
  'use strict';

  // Prevent multiple loads
  if (window.AIChatWidgetLoaded) return;
  window.AIChatWidgetLoaded = true;

  console.log('AI Chat Widget: Loading...');

  // Get configuration from window or use defaults
  const defaultShop = window.Shopify ? window.Shopify.shop : '';
  const globalConfig = window.AIChatConfig || {};
  
  // Merge configuration with defaults
  const config = {
    apiUrl: globalConfig.apiUrl || 'https://shopchatai.indigenservices.com',
    shop: globalConfig.shop || defaultShop,
    primaryColor: globalConfig.primaryColor || '#5C6AC4',
    accentColor: globalConfig.accentColor || '#00848E',
    position: globalConfig.position || 'bottom-right',
    welcomeMessage: globalConfig.welcomeMessage || 'Hi! How can I help you today?',
    customer: globalConfig.customer || null
  };
  
  console.log('Widget Config:', config);

  // Get customer info if available
  if (window.ShopifyAnalytics && window.ShopifyAnalytics.meta) {
    const meta = window.ShopifyAnalytics.meta;
    if (meta.page && meta.page.customerId) {
      config.customer = {
        id: meta.page.customerId
      };
    }
  }

  // Create widget HTML
  function createWidget() {
    const widgetHTML = `
      <div id="ai-chat-widget" class="ai-chat-widget" style="position: fixed; ${config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'} ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'} z-index: 999999;">
        <button id="ai-chat-button" class="ai-chat-button" style="width: 60px; height: 60px; border-radius: 50%; background: ${config.primaryColor}; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; transition: all 0.3s;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        </button>
        <div id="ai-chat-window" class="ai-chat-window" style="display: none; position: fixed; ${config.position.includes('bottom') ? 'bottom: 90px;' : 'top: 90px;'} ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'} width: 380px; max-width: calc(100vw - 40px); height: 600px; max-height: calc(100vh - 120px); background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); z-index: 999999; flex-direction: column;">
          <div class="ai-chat-header" style="background: ${config.primaryColor}; color: white; padding: 20px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Chat Support</h3>
              <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9;">We're here to help!</p>
            </div>
            <button id="ai-chat-close" style="background: transparent; border: none; color: white; cursor: pointer; font-size: 24px; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px; transition: background 0.2s;">×</button>
          </div>
          <div id="ai-chat-messages" class="ai-chat-messages" style="flex: 1; overflow-y: auto; padding: 20px; background: #f9fafb;">
            <div class="ai-message" style="margin-bottom: 16px; display: flex; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: ${config.primaryColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                </svg>
              </div>
              <div style="flex: 1; background: white; padding: 12px 16px; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">${config.welcomeMessage}</p>
              </div>
            </div>
          </div>
          <div class="ai-chat-input-container" style="padding: 16px; background: white; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px;">
            <div id="ai-chat-typing" style="display: none; padding: 8px 0; color: #6b7280; font-size: 13px;">AI is typing...</div>
            <form id="ai-chat-form" style="display: flex; gap: 8px;">
              <input 
                type="text" 
                id="ai-chat-input" 
                placeholder="Type your message..." 
                style="flex: 1; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
              />
              <button type="submit" style="background: ${config.accentColor}; color: white; border: none; border-radius: 8px; padding: 12px 20px; cursor: pointer; font-weight: 500; transition: background 0.2s;">
                Send
              </button>
            </form>
            <p style="margin: 8px 0 0; text-align: center; font-size: 11px; color: #9ca3af;">Powered by AI</p>
          </div>
        </div>
      </div>
    `;

    // Insert widget into page
    const container = document.createElement('div');
    container.innerHTML = widgetHTML;
    document.body.appendChild(container.firstElementChild);

    console.log('AI Chat Widget: HTML created');

    // Initialize interactions
    initializeWidget();
  }

  // Initialize widget interactions
  function initializeWidget() {
    const button = document.getElementById('ai-chat-button');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('ai-chat-close');
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-chat-input');
    const messages = document.getElementById('ai-chat-messages');
    const typing = document.getElementById('ai-chat-typing');

    if (!button || !chatWindow) {
      console.error('AI Chat Widget: Required elements not found');
      return;
    }

    console.log('AI Chat Widget: Initializing interactions');

    // Toggle chat window
    button.addEventListener('click', () => {
      const isVisible = chatWindow.style.display !== 'none';
      chatWindow.style.display = isVisible ? 'none' : 'flex';
      console.log('AI Chat Widget: Window toggled', !isVisible ? 'open' : 'closed');
    });

    closeBtn.addEventListener('click', () => {
      chatWindow.style.display = 'none';
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = input.value.trim();
      if (!message) return;

      console.log('AI Chat Widget: Sending message:', message);

      // Add user message
      addMessage(message, 'user');
      input.value = '';

      // Show typing indicator
      typing.style.display = 'block';

      // Send to API
      try {
        console.log('Sending message to:', config.apiUrl + '/api/chat/message');
        console.log('Payload:', { message, shop: config.shop });
        
        const response = await fetch(config.apiUrl + '/api/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: message,
            shop: config.shop,
            customer: config.customer || {}
          })
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        typing.style.display = 'none';

        if (data.reply) {
          addMessage(data.reply, 'ai');
        } else if (data.error) {
          addMessage(data.error, 'ai');
        } else {
          addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        }
      } catch (error) {
        console.error('AI Chat Widget: API error:', error);
        typing.style.display = 'none';
        addMessage('Connection error. Please try again.', 'ai');
      }
    });

    // Add message to chat
    function addMessage(text, type) {
      const messageHTML = type === 'user' ? `
        <div class="user-message" style="margin-bottom: 16px; display: flex; justify-content: flex-end;">
          <div style="max-width: 70%; background: ${config.accentColor}; color: white; padding: 12px 16px; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <p style="margin: 0; font-size: 14px; line-height: 1.5;">${escapeHtml(text)}</p>
          </div>
        </div>
      ` : `
        <div class="ai-message" style="margin-bottom: 16px; display: flex; gap: 10px;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background: ${config.primaryColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
          </div>
          <div style="flex: 1; max-width: 70%; background: white; padding: 12px 16px; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">${escapeHtml(text)}</p>
          </div>
        </div>
      `;

      messages.insertAdjacentHTML('beforeend', messageHTML);
      messages.scrollTop = messages.scrollHeight;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    console.log('AI Chat Widget: Ready!');
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }

})();
