/**
 * Enhanced Chat Widget
 * Includes agent request, product display, and cart integration
 */

(function() {
  'use strict';

  // Configuration
  const WIDGET_CONFIG = {
    apiUrl: window.SHOPCHAT_CONFIG?.apiUrl || 'https://shopchat-new.indigenservices.com',
    shopDomain: window.location.hostname,
    primaryColor: '#5C6AC4',
    position: 'bottom-right'
  };

  let socket = null;
  let sessionId = null;
  let isAgentActive = false;

  // Initialize Socket.IO
  function initSocket() {
    socket = io(WIDGET_CONFIG.apiUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[ShopChat] Connected to server');
      if (sessionId) {
        socket.emit('join-chat', { sessionId, userType: 'customer' });
      }
    });

    socket.on('new-message', (message) => {
      displayMessage(message);
    });

    socket.on('agent-takeover', ({ agentName }) => {
      isAgentActive = true;
      updateAgentStatus(agentName);
      addSystemMessage(`👋 ${agentName} is now assisting you.`);
      playSound('agent-joined');
    });

    socket.on('agent-viewing', () => {
      updateAgentStatus('Agent is viewing...');
    });

    socket.on('typing', ({ userType }) => {
      showTypingIndicator(userType);
    });

    socket.on('disconnect', () => {
      console.log('[ShopChat] Disconnected from server');
    });
  }

  // Create widget HTML
  function createWidget() {
    const widgetHTML = `
      <div id="shopchat-widget" class="shopchat-closed">
        <!-- Chat Button -->
        <button id="shopchat-toggle" class="shopchat-button" aria-label="Open chat">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>
          </svg>
          <span class="shopchat-unread-badge" style="display:none;">0</span>
        </button>

        <!-- Chat Window -->
        <div id="shopchat-window" class="shopchat-window" style="display:none;">
          <!-- Header -->
          <div class="shopchat-header">
            <div class="shopchat-header-left">
              <h3>💬 Chat with us</h3>
              <span class="shopchat-agent-status" id="agent-status">AI Assistant</span>
            </div>
            <div class="shopchat-header-actions">
              <button id="request-agent-btn" class="shopchat-agent-btn" title="Speak to a live agent">
                👤 Agent
              </button>
              <button id="minimize-chat" class="shopchat-minimize">_</button>
              <button id="close-chat" class="shopchat-close">×</button>
            </div>
          </div>

          <!-- Messages -->
          <div id="shopchat-messages" class="shopchat-messages"></div>

          <!-- Typing Indicator -->
          <div id="typing-indicator" class="shopchat-typing" style="display:none;">
            <span></span><span></span><span></span>
          </div>

          <!-- Input -->
          <div class="shopchat-input-container">
            <input
              type="text"
              id="shopchat-input"
              class="shopchat-input"
              placeholder="Type your message..."
              autocomplete="off"
            />
            <button id="shopchat-send" class="shopchat-send-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10L18 2L10 18L8 12L2 10Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    addStyles();
    attachEventListeners();
  }

  // Add CSS styles
  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .shopchat-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${WIDGET_CONFIG.primaryColor};
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        transition: transform 0.2s;
      }
      .shopchat-button:hover {
        transform: scale(1.1);
      }
      .shopchat-unread-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #ff4444;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 11px;
        font-weight: bold;
      }
      .shopchat-window {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 380px;
        height: 600px;
        max-height: calc(100vh - 120px);
        background: white;
        border-radius: 12px;
        box-shadow: 0 5px 25px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        z-index: 999998;
        overflow: hidden;
      }
      .shopchat-header {
        background: linear-gradient(135deg, ${WIDGET_CONFIG.primaryColor} 0%, #4A5AA8 100%);
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .shopchat-header.agent-active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      .shopchat-header-left h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      .shopchat-agent-status {
        font-size: 11px;
        opacity: 0.9;
        display: block;
        margin-top: 2px;
      }
      .shopchat-header-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .shopchat-agent-btn {
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.2s;
      }
      .shopchat-agent-btn:hover {
        background: rgba(255,255,255,0.3);
      }
      .shopchat-agent-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .shopchat-minimize, .shopchat-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }
      .shopchat-minimize:hover, .shopchat-close:hover {
        background: rgba(255,255,255,0.2);
      }
      .shopchat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background: #f9f9f9;
      }
      .shopchat-message {
        margin-bottom: 12px;
        display: flex;
        animation: fadeIn 0.3s;
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .shopchat-message.customer {
        justify-content: flex-end;
      }
      .shopchat-message-content {
        max-width: 70%;
        padding: 10px 14px;
        border-radius: 12px;
        word-wrap: break-word;
      }
      .shopchat-message.customer .shopchat-message-content {
        background: ${WIDGET_CONFIG.primaryColor};
        color: white;
        border-bottom-right-radius: 4px;
      }
      .shopchat-message.ai .shopchat-message-content,
      .shopchat-message.agent .shopchat-message-content {
        background: white;
        color: #333;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        border-bottom-left-radius: 4px;
      }
      .shopchat-message.system .shopchat-message-content {
        background: #FFF4E5;
        color: #875F00;
        font-size: 13px;
        text-align: center;
        max-width: 90%;
        margin: 0 auto;
      }
      .shopchat-product-card {
        background: white;
        border: 1px solid #e1e3e5;
        border-radius: 8px;
        padding: 12px;
        margin: 8px 0;
        max-width: 85%;
      }
      .shopchat-product-image {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 6px;
        margin-bottom: 8px;
      }
      .shopchat-product-title {
        font-size: 14px;
        font-weight: 600;
        margin: 4px 0;
      }
      .shopchat-product-price {
        font-size: 16px;
        font-weight: bold;
        color: ${WIDGET_CONFIG.primaryColor};
        margin: 4px 0;
      }
      .shopchat-product-desc {
        font-size: 12px;
        color: #666;
        margin: 4px 0;
      }
      .shopchat-add-to-cart {
        width: 100%;
        background: ${WIDGET_CONFIG.primaryColor};
        color: white;
        border: none;
        padding: 10px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        margin-top: 8px;
      }
      .shopchat-add-to-cart:hover {
        opacity: 0.9;
      }
      .shopchat-typing {
        padding: 8px 16px;
        background: #f9f9f9;
      }
      .shopchat-typing span {
        display: inline-block;
        width: 8px;
        height: 8px;
        background: #888;
        border-radius: 50%;
        margin: 0 2px;
        animation: typing 1.4s infinite;
      }
      .shopchat-typing span:nth-child(2) { animation-delay: 0.2s; }
      .shopchat-typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-8px); }
      }
      .shopchat-input-container {
        padding: 16px;
        background: white;
        border-top: 1px solid #e1e3e5;
        display: flex;
        gap: 8px;
      }
      .shopchat-input {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 14px;
        outline: none;
      }
      .shopchat-input:focus {
        border-color: ${WIDGET_CONFIG.primaryColor};
      }
      .shopchat-send-btn {
        background: ${WIDGET_CONFIG.primaryColor};
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .shopchat-send-btn:hover {
        opacity: 0.9;
      }
      @media (max-width: 768px) {
        .shopchat-window {
          width: 100%;
          height: 100%;
          max-height: 100vh;
          bottom: 0;
          right: 0;
          border-radius: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Attach event listeners
  function attachEventListeners() {
    document.getElementById('shopchat-toggle').addEventListener('click', toggleWidget);
    document.getElementById('close-chat').addEventListener('click', closeWidget);
    document.getElementById('minimize-chat').addEventListener('click', closeWidget);
    document.getElementById('shopchat-send').addEventListener('click', sendMessage);
    document.getElementById('shopchat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
    document.getElementById('request-agent-btn').addEventListener('click', requestAgent);
  }

  // Toggle widget
  function toggleWidget() {
    const window = document.getElementById('shopchat-window');
    const isVisible = window.style.display !== 'none';
    
    if (isVisible) {
      window.style.display = 'none';
    } else {
      window.style.display = 'flex';
      if (!sessionId) {
        initializeChat();
      }
    }
  }

  // Close widget
  function closeWidget() {
    document.getElementById('shopchat-window').style.display = 'none';
  }

  // Initialize chat session
  async function initializeChat() {
    try {
      const response = await fetch(`${WIDGET_CONFIG.apiUrl}/api/chat/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopDomain: WIDGET_CONFIG.shopDomain })
      });

      const data = await response.json();
      sessionId = data.sessionId;
      
      if (socket) {
        socket.emit('join-chat', { sessionId, userType: 'customer' });
      }

      addSystemMessage('Hi! How can I help you today? 👋');
    } catch (error) {
      console.error('[ShopChat] Error initializing:', error);
    }
  }

  // Send message
  async function sendMessage() {
    const input = document.getElementById('shopchat-input');
    const message = input.value.trim();
    
    if (!message) return;

    displayMessage({
      sender: 'CUSTOMER',
      message,
      sentAt: new Date()
    });

    input.value = '';

    if (socket && sessionId) {
      socket.emit('send-message', {
        sessionId,
        message,
        sender: 'CUSTOMER'
      });
    }
  }

  // Request live agent
  function requestAgent() {
    const btn = document.getElementById('request-agent-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Waiting...';

    if (socket && sessionId) {
      socket.emit('request-agent', { sessionId });
      addSystemMessage('🔔 Requesting a live agent...');
    }
  }

  // Display message
  function displayMessage(msg) {
    const messagesDiv = document.getElementById('shopchat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `shopchat-message ${msg.sender.toLowerCase()}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'shopchat-message-content';
    contentDiv.textContent = msg.message;

    messageDiv.appendChild(contentDiv);
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Add system message
  function addSystemMessage(text) {
    displayMessage({
      sender: 'SYSTEM',
      message: text,
      sentAt: new Date()
    });
  }

  // Update agent status
  function updateAgentStatus(text) {
    document.getElementById('agent-status').textContent = text;
    document.querySelector('.shopchat-header').classList.add('agent-active');
  }

  // Show typing indicator
  function showTypingIndicator(userType) {
    const indicator = document.getElementById('typing-indicator');
    indicator.style.display = 'block';
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 3000);
  }

  // Play sound
  function playSound(sound) {
    const audio = new Audio(`${WIDGET_CONFIG.apiUrl}/sounds/${sound}.mp3`);
    audio.play().catch(() => {});
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createWidget();
      initSocket();
    });
  } else {
    createWidget();
    initSocket();
  }

})();
