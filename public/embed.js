/**
 * AI Chat Widget - Easy Embed Script
 * Add this script to your theme to enable the chat widget
 */

(function() {
  'use strict';
  
  // Configuration
  const config = window.AIChatConfig || {
    apiUrl: 'https://shopchatai.indigenservices.com',
    primaryColor: '#5C6AC4',
    accentColor: '#00848E',
    position: 'bottom-right',
    welcomeMessage: 'Hi! How can I help you today?'
  };

  // Load CSS
  const loadCSS = () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = config.apiUrl + '/chat-widget.css';
    document.head.appendChild(link);
  };

  // Load JS
  const loadJS = () => {
    // Set global config before loading widget
    window.AIChatConfig = config;
    
    const script = document.createElement('script');
    script.src = config.apiUrl + '/widget-loader.js';
    script.async = false; // Load synchronously to ensure config is set
    script.onload = () => {
      console.log('AI Chat Widget loaded successfully');
    };
    script.onerror = (error) => {
      console.error('Failed to load chat widget:', error);
    };
    document.head.appendChild(script);
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadCSS();
      loadJS();
    });
  } else {
    loadCSS();
    loadJS();
  }
})();
