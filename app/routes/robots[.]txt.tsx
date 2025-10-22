/**
 * Robots.txt Route
 * Serves robots.txt for search engine crawlers
 */

export function loader() {
  const robotsTxt = `# Robots.txt for ShopChat AI
User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin
Disallow: /api/
Disallow: /auth/

# Allow widget files
Allow: /widget-loader.js
Allow: /chat-widget.js
Allow: /chat-widget.css
Allow: /embed.js

# Sitemap
Sitemap: https://shopchatai.indigenservices.com/sitemap.xml
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  });
}
