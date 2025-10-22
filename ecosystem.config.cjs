module.exports = {
  apps: [{
    name: 'shopify-ai-chatbot',
    script: './server.mjs',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: '3000',
      HOST: 'https://shopchatai.indigenservices.com',
      SHOPIFY_APP_URL: 'https://shopchatai.indigenservices.com',
      SHOPIFY_API_KEY: '04c93bf898928e67c50132955f9ed710',
      SHOPIFY_API_SECRET: 'e2421d256d502fe789b479051ff43e81',
      SCOPES: 'read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_content,write_content,read_themes,write_themes,read_script_tags,write_script_tags',
      DATABASE_URL: 'file:./data/production.sqlite',
      GEMINI_API_KEY: 'AIzaSyBTHw5sDgNSA8qGU7lmqm5nsTNOamLwSuo'
    }
  }]
};
