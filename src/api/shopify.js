// src/api/shopify.js

import { PFC_CONFIG } from '../config.js';

// Shopify store domain, e.g. "example.myshopify.com"
const SHOPIFY_DOMAIN = PFC_CONFIG.shopifyDomain;
// Storefront access token generated from the Shopify admin
const STOREFRONT_TOKEN = PFC_CONFIG.shopifyStorefrontToken;

// Warn immediately if required config is missing
if (!SHOPIFY_DOMAIN || !STOREFRONT_TOKEN) {
  console.error('[shopify] Missing Shopify configuration.');
}

/**
 * Execute a GraphQL query against the Shopify Storefront API.
 * @param {string} query - GraphQL query string
 * @param {Object} variables - optional variables for the query
 * @returns {Promise<Object>} resolved data from the API
 */
export async function shopifyGraphQL(query, variables = {}) {
  if (!SHOPIFY_DOMAIN || !STOREFRONT_TOKEN) {
    throw new Error('Shopify configuration not provided');
  }
  const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2023-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (json.errors) console.error('Shopify API Errors:', json.errors);
  return json.data;
}

export const GET_PRODUCTS_QUERY = `
  query {
    products(first: 10) {
      edges {
        node {
          id
          title
          handle
          description
          images(first: 1) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                price {
                  amount
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_QUERY = `
  query getProduct($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
            }
          }
        }
      }
    }
  }
`;

/**
 * Generate a mutation to create a checkout for a given variant ID.
 * @param {string} variantId - Shopify variant identifier
 * @returns {string} GraphQL mutation string
 */
export function getCreateCheckoutMutation(variantId) {
  return `
    mutation {
      checkoutCreate(input: {
        lineItems: [{ variantId: "${variantId}", quantity: 1 }]
      }) {
        checkout {
          webUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
}

