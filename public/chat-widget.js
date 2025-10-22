/**
 * AI Chat Widget - Main JavaScript
 * Handles UI interactions, real-time messaging, and API communication
 */

(function() {
  'use strict';

  // Configuration - use the config provided by embed or fall back to current origin
  const config = window.AIChatConfig || {};
  const API_BASE = config.apiUrl || window.location.origin;
  const SOCKET_URL = API_BASE;

  class AIChatWidget {
    constructor() {
      this.widget = document.getElementById('ai-chat-widget');
      if (!this.widget) return;

      this.button = document.getElementById('ai-chat-button');
      this.window = document.getElementById('ai-chat-window');
      this.messages = document.getElementById('ai-chat-messages');
      this.input = document.getElementById('ai-chat-input');
      this.form = document.getElementById('ai-chat-form');
      this.badge = document.getElementById('ai-chat-badge');
      this.typingIndicator = document.querySelector('.ai-chat-typing-indicator');

      this.sessionId = null;
      this.socket = null;
      this.isOpen = false;
      this.unreadCount = 0;
      this.userInfo = null;

      this.config = {
        position: this.widget.dataset.position || 'bottom-right',
        primaryColor: this.widget.dataset.primaryColor || '#5C6AC4',
        accentColor: this.widget.dataset.accentColor || '#00848E',
        welcomeMessage: this.widget.dataset.welcomeMessage || 'Hi! How can I help you today?',
        showProductRecs: this.widget.dataset.showProductRecs === 'true',
        showOrderTracking: this.widget.dataset.showOrderTracking === 'true',
        enableSound: this.widget.dataset.enableSound === 'true',
        shop: this.widget.dataset.shop,
        customerEmail: this.widget.dataset.customerEmail || null,
        customerName: this.widget.dataset.customerName || null,
      };

      this.init();
    }

    async init() {
      // Apply theme colors
      document.documentElement.style.setProperty('--ai-primary-color', this.config.primaryColor);
      document.documentElement.style.setProperty('--ai-accent-color', this.config.accentColor);

      // Event listeners
      this.button.addEventListener('click', () => this.toggle());
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
      
      document.querySelector('.ai-chat-minimize')?.addEventListener('click', () => this.close());
      
      // Quick actions
      document.querySelectorAll('.ai-chat-quick-action').forEach(btn => {
        btn.addEventListener('click', (e) => this.handleQuickAction(e));
      });

      // Check if user info exists
      const savedUserInfo = localStorage.getItem('ai_chat_user_info');
      if (savedUserInfo) {
        this.userInfo = JSON.parse(savedUserInfo);
        this.config.customerEmail = this.userInfo.email;
        this.config.customerName = this.userInfo.name;
      }

      // Check if chat was open before refresh
      const wasOpen = localStorage.getItem('ai_chat_is_open');
      if (wasOpen === 'true') {
        this.open();
      }

      // Load session from localStorage
      const savedSessionId = localStorage.getItem('ai_chat_session');
      if (savedSessionId) {
        this.sessionId = savedSessionId;
      }

      // Create session and connect if user info exists
      if (this.userInfo) {
        await this.createSession();
        this.connectSocket();
        // Load from localStorage if exists
        this.loadSession();
      }
    }

    async createSession() {
      try {
        const response = await fetch(`${API_BASE}/api/chat/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shop: this.config.shop,
            customerEmail: this.config.customerEmail,
            customerName: this.config.customerName,
            channel: 'widget',
            language: navigator.language.split('-')[0] || 'en',
            metadata: {
              userAgent: navigator.userAgent,
              referrer: document.referrer,
              url: window.location.href,
            },
          }),
        });

        const data = await response.json();
        if (data.success) {
          this.sessionId = data.data.sessionId;
          localStorage.setItem('ai_chat_session', this.sessionId);

          // Show welcome message
          this.addMessage('bot', data.data.welcomeMessage, {
            timestamp: new Date().toISOString(),
          });
          
          // Show quick suggestions
          this.showQuickSuggestions();
        }
      } catch (error) {
        console.error('Failed to create session:', error);
        this.addMessage('bot', this.config.welcomeMessage);
        this.showQuickSuggestions();
      }
    }

    connectSocket() {
      if (!window.io) {
        console.warn('Socket.IO not loaded, falling back to polling');
        return;
      }

      try {
        this.socket = io(SOCKET_URL, {
          query: { sessionId: this.sessionId },
          transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
          // Socket connected - development logging only
          if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
            console.log('Socket connected');
          }
        });

        this.socket.on('message', (data) => {
          this.handleIncomingMessage(data);
        });

        this.socket.on('typing', (isTyping) => {
          this.showTyping(isTyping);
        });

        this.socket.on('recommendations', (products) => {
          this.showRecommendations(products);
        });

        this.socket.on('disconnect', () => {
          // Socket disconnected - development logging only
          if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
            console.log('Socket disconnected');
          }
        });
      } catch (error) {
        console.error('Socket connection failed:', error);
      }
    }

    toggle() {
      this.isOpen ? this.close() : this.open();
    }

    open() {
      this.window.style.display = 'flex';
      this.button.setAttribute('aria-expanded', 'true');
      this.isOpen = true;
      this.unreadCount = 0;
      this.updateBadge();
      
      // Save open state
      localStorage.setItem('ai_chat_is_open', 'true');
      
      // Show lead form if user info doesn't exist
      if (!this.userInfo) {
        this.showLeadForm();
      } else {
        this.input.focus();
        this.scrollToBottom();
      }
    }

    close() {
      this.window.style.display = 'none';
      this.button.setAttribute('aria-expanded', 'false');
      this.isOpen = false;
      
      // Save closed state
      localStorage.setItem('ai_chat_is_open', 'false');
    }

    async handleSubmit(e) {
      e.preventDefault();
      
      const message = this.input.value.trim();
      if (!message) return;

      // Add user message to UI
      this.addMessage('user', message);
      this.input.value = '';

      // Show typing indicator
      this.showTyping(true);

      // Send via socket if available, otherwise use HTTP
      if (this.socket && this.socket.connected) {
        this.socket.emit('message', {
          shop: this.config.shop,
          sessionId: this.sessionId,
          message: message,
        });
      } else {
        await this.sendMessageHTTP(message);
      }
    }

    async sendMessageHTTP(message) {
      try {
        const response = await fetch(`${API_BASE}/api/chat/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            shop: this.config.shop,
            sessionId: this.sessionId,
            message: message,
            customerEmail: this.config.customerEmail,
          }),
        });

        const data = await response.json();
        
        this.showTyping(false);

        if (data.success) {
          this.addMessage('bot', data.data.response, {
            intent: data.data.intent,
            confidence: data.data.confidence,
          });

          // Handle recommendations
          if (data.data.recommendations && data.data.recommendations.length > 0) {
            this.showRecommendations(data.data.recommendations);
          }

          // Handle order info
          if (data.data.orderInfo) {
            this.showOrderTracking(data.data.orderInfo);
          }
        } else {
          this.addMessage('bot', 'Sorry, I encountered an error. Please try again.');
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        this.showTyping(false);
        this.addMessage('bot', 'Connection error. Please check your internet and try again.');
      }
    }

    handleIncomingMessage(data) {
      this.showTyping(false);
      this.addMessage('bot', data.message, data.metadata);

      if (!this.isOpen) {
        this.unreadCount++;
        this.updateBadge();
        this.playNotificationSound();
      }
    }

    addMessage(sender, text, metadata = {}) {
      const messageEl = document.createElement('div');
      messageEl.className = `ai-chat-message ${sender}`;

      const avatar = document.createElement('div');
      avatar.className = 'ai-chat-message-avatar';
      avatar.textContent = sender === 'bot' ? '🤖' : '👤';

      const content = document.createElement('div');
      content.className = 'ai-chat-message-content';

      const bubble = document.createElement('div');
      bubble.className = 'ai-chat-message-bubble';
      bubble.textContent = text;

      const time = document.createElement('div');
      time.className = 'ai-chat-message-time';
      time.textContent = this.formatTime(metadata.timestamp || new Date().toISOString());

      content.appendChild(bubble);
      content.appendChild(time);
      messageEl.appendChild(avatar);
      messageEl.appendChild(content);

      this.messages.appendChild(messageEl);
      this.scrollToBottom();

      // Save to localStorage
      this.saveMessage({ sender, text, metadata, timestamp: new Date().toISOString() });
    }

    showQuickSuggestions() {
      // Remove any existing suggestions first
      const existing = document.querySelector('.ai-chat-suggestions');
      if (existing) existing.remove();

      const suggestions = [
        { icon: '🛍️', text: 'Show me products', query: 'Can you show me your products?' },
        { icon: '📦', text: 'Track my order', query: 'I want to track my order' },
        { icon: '❓', text: 'I have a question', query: 'I have a question about your products' },
        { icon: '💬', text: 'Speak to someone', query: 'I need to speak to a human agent' }
      ];

      const container = document.createElement('div');
      container.className = 'ai-chat-suggestions';
      container.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 12px 16px;
        margin: 0 12px;
        background: #f9fafb;
        border-radius: 8px;
        margin-bottom: 12px;
      `;

      suggestions.forEach(suggestion => {
        const btn = document.createElement('button');
        btn.className = 'ai-chat-suggestion-btn';
        btn.innerHTML = `${suggestion.icon} ${suggestion.text}`;
        btn.style.cssText = `
          flex: 1 1 calc(50% - 4px);
          min-width: 140px;
          padding: 10px 14px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #374151;
        `;
        
        btn.onmouseover = () => {
          btn.style.background = this.config.primaryColor;
          btn.style.color = 'white';
          btn.style.borderColor = this.config.primaryColor;
          btn.style.transform = 'translateY(-2px)';
          btn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        };
        
        btn.onmouseout = () => {
          btn.style.background = 'white';
          btn.style.color = '#374151';
          btn.style.borderColor = '#e5e7eb';
          btn.style.transform = 'translateY(0)';
          btn.style.boxShadow = 'none';
        };
        
        btn.onclick = () => {
          this.handleQuickReply(suggestion.query);
          container.remove(); // Remove suggestions after selection
        };

        container.appendChild(btn);
      });

      this.messages.appendChild(container);
      this.scrollToBottom();
    }

    handleQuickReply(query) {
      // Fill input and submit
      this.input.value = query;
      this.handleSubmit(new Event('submit'));
    }

    showLeadForm() {
      // Clear messages area and show lead form
      this.messages.innerHTML = '';
      
      const formContainer = document.createElement('div');
      formContainer.className = 'ai-chat-lead-form';
      formContainer.style.cssText = `
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: 100%;
      `;

      const header = document.createElement('div');
      header.innerHTML = `
        <div style="text-align: center; margin-bottom: 16px;">
          <h3 style="margin: 0 0 8px; font-size: 20px; color: #1f2937;">👋 Welcome!</h3>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Let's get started. Please tell us about yourself.</p>
        </div>
      `;

      const form = document.createElement('form');
      form.id = 'ai-chat-lead-capture-form';
      form.style.cssText = 'display: flex; flex-direction: column; gap: 14px; flex: 1;';
      
      // Name field
      const nameGroup = this.createFormField('Name *', 'text', 'name', 'Enter your full name', true);
      
      // Email field  
      const emailGroup = this.createFormField('Email *', 'email', 'email', 'your.email@example.com', true);
      
      // Phone field
      const phoneGroup = this.createFormField('Phone *', 'tel', 'phone', '+1 (555) 123-4567', true);

      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.textContent = 'Start Chat';
      submitBtn.style.cssText = `
        padding: 14px 24px;
        background: ${this.config.primaryColor};
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        margin-top: auto;
      `;

      submitBtn.onmouseover = () => {
        submitBtn.style.transform = 'translateY(-2px)';
        submitBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      };
      submitBtn.onmouseout = () => {
        submitBtn.style.transform = 'translateY(0)';
        submitBtn.style.boxShadow = 'none';
      };

      form.appendChild(nameGroup);
      form.appendChild(emailGroup);
      form.appendChild(phoneGroup);
      form.appendChild(submitBtn);

      form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const phone = formData.get('phone');

        if (!name || !email || !phone) {
          alert('Please fill in all required fields');
          return;
        }

        // Save user info
        this.userInfo = { name, email, phone };
        this.config.customerEmail = email;
        this.config.customerName = name;
        localStorage.setItem('ai_chat_user_info', JSON.stringify(this.userInfo));

        // Remove form
        formContainer.remove();

        // Create session and start chat
        await this.createSession();
        this.connectSocket();
        this.input.focus();
      };

      formContainer.appendChild(header);
      formContainer.appendChild(form);
      this.messages.appendChild(formContainer);
    }

    createFormField(label, type, name, placeholder, required) {
      const group = document.createElement('div');
      group.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';
      
      const labelEl = document.createElement('label');
      labelEl.textContent = label;
      labelEl.style.cssText = 'font-size: 13px; font-weight: 600; color: #374151;';
      
      const input = document.createElement('input');
      input.type = type;
      input.name = name;
      input.placeholder = placeholder;
      input.required = required;
      input.style.cssText = `
        padding: 12px 14px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        transition: all 0.2s;
      `;
      
      input.onfocus = () => {
        input.style.borderColor = this.config.primaryColor;
        input.style.boxShadow = `0 0 0 3px ${this.config.primaryColor}20`;
      };
      input.onblur = () => {
        input.style.borderColor = '#d1d5db';
        input.style.boxShadow = 'none';
      };
      
      group.appendChild(labelEl);
      group.appendChild(input);
      return group;
    }

    showTyping(isTyping) {
      if (this.typingIndicator) {
        this.typingIndicator.style.display = isTyping ? 'flex' : 'none';
        if (isTyping) this.scrollToBottom();
      }
    }

    showRecommendations(products) {
      if (!this.config.showProductRecs || !products || products.length === 0) return;

      const container = document.getElementById('ai-chat-recommendations');
      const list = document.getElementById('ai-chat-recommendations-list');
      
      list.innerHTML = '';
      
      products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'ai-chat-product-card';
        card.onclick = () => window.location.href = `/products/${product.handle}`;
        
        card.innerHTML = `
          <img src="${product.image || '/images/placeholder.png'}" alt="${product.title}" />
          <h5>${product.title}</h5>
          <p>$${parseFloat(product.price).toFixed(2)}</p>
        `;
        
        list.appendChild(card);
      });

      container.style.display = 'block';
      this.scrollToBottom();
    }

    showOrderTracking(orderInfo) {
      if (!this.config.showOrderTracking) return;

      const container = document.getElementById('ai-chat-order-tracking');
      const details = document.getElementById('ai-chat-order-details');
      
      details.innerHTML = `
        <div class="ai-chat-order-status">
          <span class="ai-chat-order-status-badge">${orderInfo.status}</span>
          <span>${orderInfo.orderNumber}</span>
        </div>
        <p>${orderInfo.statusMessage}</p>
      `;

      container.style.display = 'block';
      this.scrollToBottom();
    }

    handleQuickAction(e) {
      const action = e.target.dataset.action;
      
      switch(action) {
        case 'track-order':
          this.input.value = 'I want to track my order';
          this.form.dispatchEvent(new Event('submit'));
          break;
        case 'browse-products':
          this.showRecommendationsRequest();
          break;
        case 'get-help':
          this.input.value = 'I need help';
          this.form.dispatchEvent(new Event('submit'));
          break;
      }
    }

    async showRecommendationsRequest() {
      this.input.value = 'Show me some product recommendations';
      this.form.dispatchEvent(new Event('submit'));
    }

    scrollToBottom() {
      setTimeout(() => {
        this.messages.scrollTop = this.messages.scrollHeight;
      }, 100);
    }

    updateBadge() {
      if (this.unreadCount > 0) {
        this.badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
        this.badge.style.display = 'block';
      } else {
        this.badge.style.display = 'none';
      }
    }

    playNotificationSound() {
      if (!this.config.enableSound) return;
      
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwF');
      audio.play().catch(() => {});
    }

    formatTime(timestamp) {
      const date = new Date(timestamp);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
      return `${formattedHours}:${formattedMinutes} ${ampm}`;
    }

    saveMessage(message) {
      try {
        const messages = JSON.parse(localStorage.getItem('ai_chat_messages') || '[]');
        messages.push(message);
        // Keep only last 50 messages
        if (messages.length > 50) messages.shift();
        localStorage.setItem('ai_chat_messages', JSON.stringify(messages));
      } catch (e) {
        console.error('Failed to save message:', e);
      }
    }

    loadSession() {
      try {
        const messages = JSON.parse(localStorage.getItem('ai_chat_messages') || '[]');
        const recentMessages = messages.slice(-10); // Load last 10 messages
        
        recentMessages.forEach(msg => {
          if (msg.sender && msg.text) {
            const messageEl = document.createElement('div');
            messageEl.className = `ai-chat-message ${msg.sender}`;
            
            const avatar = document.createElement('div');
            avatar.className = 'ai-chat-message-avatar';
            avatar.textContent = msg.sender === 'bot' ? '🤖' : '👤';
            
            const content = document.createElement('div');
            content.className = 'ai-chat-message-content';
            
            const bubble = document.createElement('div');
            bubble.className = 'ai-chat-message-bubble';
            bubble.textContent = msg.text;
            
            const time = document.createElement('div');
            time.className = 'ai-chat-message-time';
            time.textContent = this.formatTime(msg.timestamp);
            
            content.appendChild(bubble);
            content.appendChild(time);
            messageEl.appendChild(avatar);
            messageEl.appendChild(content);
            
            this.messages.appendChild(messageEl);
          }
        });

        if (recentMessages.length > 0) {
          this.scrollToBottom();
        }
      } catch (e) {
        console.error('Failed to load session:', e);
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AIChatWidget());
  } else {
    new AIChatWidget();
  }

})();
