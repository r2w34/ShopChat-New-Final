/**
 * Shopify Product Fetching Service
 * Uses Shopify Admin GraphQL API to fetch and cache products
 * Docs: https://shopify.dev/docs/api/admin-graphql
 */

import type { AdminApiContext } from "@shopify/shopify-app-remix/server";

interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  descriptionHtml: string;
  handle: string;
  vendor: string;
  productType: string;
  tags: string[];
  priceRange: {
    minVariantPrice: string;
    maxVariantPrice: string;
  };
  variants: Array<{
    id: string;
    title: string;
    price: string;
    compareAtPrice?: string;
    available: boolean;
    sku: string;
  }>;
  images: Array<{
    url: string;
    altText?: string;
  }>;
  availableForSale: boolean;
  onlineStoreUrl?: string;
}

/**
 * Fetch all products from Shopify store
 * https://shopify.dev/docs/api/admin-graphql/latest/queries/products
 */
export async function fetchStoreProducts(
  admin: AdminApiContext
): Promise<ShopifyProduct[]> {
  try {
    const query = `
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              description
              descriptionHtml
              handle
              vendor
              productType
              tags
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    availableForSale
                    sku
                  }
                }
              }
              images(first: 5) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              availableForSale
              onlineStoreUrl
            }
          }
        }
      }
    `;

    const response = await admin.graphql(query, {
      variables: { first: 100 }
    });

    const data = await response.json();

    if (!data?.data?.products?.edges) {
      console.error('[Shopify Products] Invalid response:', data);
      return [];
    }

    const products: ShopifyProduct[] = data.data.products.edges.map((edge: any) => {
      const node = edge.node;
      return {
        id: node.id,
        title: node.title,
        description: node.description || '',
        descriptionHtml: node.descriptionHtml || '',
        handle: node.handle,
        vendor: node.vendor || '',
        productType: node.productType || '',
        tags: node.tags || [],
        priceRange: {
          minVariantPrice: node.priceRange.minVariantPrice.amount,
          maxVariantPrice: node.priceRange.maxVariantPrice.amount
        },
        variants: node.variants.edges.map((v: any) => ({
          id: v.node.id,
          title: v.node.title,
          price: v.node.price,
          compareAtPrice: v.node.compareAtPrice || null,
          available: v.node.availableForSale,
          sku: v.node.sku || ''
        })),
        images: node.images.edges.map((i: any) => ({
          url: i.node.url,
          altText: i.node.altText || ''
        })),
        availableForSale: node.availableForSale,
        onlineStoreUrl: node.onlineStoreUrl || null
      };
    });

    console.log(`[Shopify Products] Fetched ${products.length} products`);
    return products;

  } catch (error) {
    console.error('[Shopify Products] Error fetching products:', error);
    return [];
  }
}

/**
 * Search products by keywords
 */
export function searchProducts(
  products: ShopifyProduct[],
  query: string,
  maxResults: number = 5
): ShopifyProduct[] {
  const lowerQuery = query.toLowerCase();
  const keywords = lowerQuery.split(' ').filter(w => w.length > 2);

  // Score each product based on relevance
  const scored = products.map(product => {
    let score = 0;

    // Exact title match (highest priority)
    if (product.title.toLowerCase() === lowerQuery) {
      score += 100;
    }

    // Title contains query
    if (product.title.toLowerCase().includes(lowerQuery)) {
      score += 50;
    }

    // Title contains keywords
    keywords.forEach(keyword => {
      if (product.title.toLowerCase().includes(keyword)) {
        score += 20;
      }
      if (product.description.toLowerCase().includes(keyword)) {
        score += 10;
      }
      if (product.productType.toLowerCase().includes(keyword)) {
        score += 15;
      }
      if (product.tags.some(tag => tag.toLowerCase().includes(keyword))) {
        score += 10;
      }
    });

    // Boost available products
    if (product.availableForSale) {
      score += 5;
    }

    return { product, score };
  });

  // Sort by score and return top results
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.product);
}

/**
 * Get product by ID
 */
export async function getProductById(
  admin: AdminApiContext,
  productId: string
): Promise<ShopifyProduct | null> {
  try {
    const query = `
      query getProduct($id: ID!) {
        product(id: $id) {
          id
          title
          description
          descriptionHtml
          handle
          vendor
          productType
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price
                compareAtPrice
                availableForSale
                sku
              }
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          availableForSale
          onlineStoreUrl
        }
      }
    `;

    const response = await admin.graphql(query, {
      variables: { id: productId }
    });

    const data = await response.json();
    
    if (!data?.data?.product) {
      return null;
    }

    const node = data.data.product;
    return {
      id: node.id,
      title: node.title,
      description: node.description || '',
      descriptionHtml: node.descriptionHtml || '',
      handle: node.handle,
      vendor: node.vendor || '',
      productType: node.productType || '',
      tags: node.tags || [],
      priceRange: {
        minVariantPrice: node.priceRange.minVariantPrice.amount,
        maxVariantPrice: node.priceRange.maxVariantPrice.amount
      },
      variants: node.variants.edges.map((v: any) => ({
        id: v.node.id,
        title: v.node.title,
        price: v.node.price,
        compareAtPrice: v.node.compareAtPrice || null,
        available: v.node.availableForSale,
        sku: v.node.sku || ''
      })),
      images: node.images.edges.map((i: any) => ({
        url: i.node.url,
        altText: i.node.altText || ''
      })),
      availableForSale: node.availableForSale,
      onlineStoreUrl: node.onlineStoreUrl || null
    };

  } catch (error) {
    console.error('[Shopify Products] Error fetching product:', error);
    return null;
  }
}

/**
 * Format product for AI context
 */
export function formatProductForAI(product: ShopifyProduct): string {
  const price = product.priceRange.minVariantPrice;
  const comparePrice = product.variants[0]?.compareAtPrice;
  
  let priceInfo = `$${price}`;
  if (comparePrice && parseFloat(comparePrice) > parseFloat(price)) {
    const savings = (parseFloat(comparePrice) - parseFloat(price)).toFixed(2);
    priceInfo = `$${price} (was $${comparePrice}, save $${savings})`;
  }

  return `
**${product.title}**
Price: ${priceInfo}
Type: ${product.productType}
${product.description.substring(0, 150)}${product.description.length > 150 ? '...' : ''}
Available: ${product.availableForSale ? 'Yes' : 'No'}
URL: ${product.onlineStoreUrl || 'N/A'}
  `.trim();
}

/**
 * Format product for widget display
 */
export function formatProductForWidget(product: ShopifyProduct, storeUrl: string) {
  const mainImage = product.images[0]?.url || '/placeholder-product.png';
  const price = product.priceRange.minVariantPrice;
  const comparePrice = product.variants[0]?.compareAtPrice;
  const variantId = product.variants[0]?.id || '';

  return {
    id: product.id,
    title: product.title,
    description: product.description.substring(0, 100),
    price: price,
    compareAtPrice: comparePrice,
    image: mainImage,
    url: `${storeUrl}/products/${product.handle}`,
    variantId: variantId,
    available: product.availableForSale
  };
}
