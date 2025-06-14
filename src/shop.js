// src/shop.js

import { shopifyGraphQL, CREATE_CHECKOUT_MUTATION } from './api/shopify.js';

let currentTag = null;
let nextCursor = null;
let allProducts = [];

function getAllProductsQuery(cursor = null) {
  return `{
    products(first: 10${cursor ? `, after: \"${cursor}\"` : ''}) {
      edges {
        cursor
        node {
          id
          title
          handle
          tags
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
      pageInfo {
        hasNextPage
      }
    }
  }`;
}

function extractTags(products) {
  const tagSet = new Set();
  products.forEach(p => p.node.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet);
}

function renderProducts(edges, tags) {
  const container = document.getElementById('view-container');
  const tagButtons = [
    `<button class="tag-button" data-tag="__all__">All</button>`,
    ...tags.map(tag => `<button class="tag-button" data-tag="${tag}">${tag}</button>`)
  ].join('');

  container.innerHTML = `
    <div class="shop-header">
      <img src="/images/shop-logo.png" alt="PFC Commissary" class="shop-logo" />
    </div>
    <div class="category-filters">
      ${tagButtons}
    </div>
    <div id="product-list" class="product-grid"></div>
    <div class="load-more-wrapper">
      <button id="load-more">Load More</button>
    </div>
  `;

  document.querySelectorAll('.tag-button').forEach(button => {
    button.addEventListener('click', () => {
      currentTag = button.dataset.tag;
      const filtered = currentTag === '__all__'
        ? allProducts
        : allProducts.filter(p => p.node.tags.includes(currentTag));
      updateProductGrid(filtered);
    });
  });

  document.getElementById('load-more').addEventListener('click', async () => {
    if (!nextCursor) return;
    const data = await shopifyGraphQL(getAllProductsQuery(nextCursor));
    nextCursor = data.products.pageInfo.hasNextPage ? data.products.edges.at(-1)?.cursor : null;
    allProducts.push(...data.products.edges);
    const displayList = currentTag && currentTag !== '__all__'
      ? allProducts.filter(p => p.node.tags.includes(currentTag))
      : allProducts;
    appendProducts(data.products.edges);
  });

  updateProductGrid(edges);
}

function updateProductGrid(edges) {
  const grid = document.getElementById('product-list');
  grid.innerHTML = '';
  edges.forEach(p => {
    const product = p.node;
    grid.innerHTML += `
      <div class="product-card">
        <a href="/product/${product.handle}" data-link>
          <img src="${product.images.edges[0]?.node.url}" alt="${product.images.edges[0]?.node.altText || product.title}" />
          <h3>${product.title}</h3>
        </a>
        <p>$${product.variants.edges[0].node.price.amount}</p>
      </div>
    `;
  });
}

function appendProducts(edges) {
  const grid = document.getElementById('product-list');
  edges.forEach(p => {
    const product = p.node;
    grid.innerHTML += `
      <div class="product-card">
        <a href="/product/${product.handle}" data-link>
          <img src="${product.images.edges[0]?.node.url}" alt="${product.images.edges[0]?.node.altText || product.title}" />
          <h3>${product.title}</h3>
        </a>
        <p>$${product.variants.edges[0].node.price.amount}</p>
      </div>
    `;
  });
}

export async function init() {
  const data = await shopifyGraphQL(getAllProductsQuery());
  allProducts = data.products.edges;
  nextCursor = data.products.pageInfo.hasNextPage ? data.products.edges.at(-1)?.cursor : null;
  const tags = extractTags(allProducts);
  renderProducts(allProducts, tags);
}
