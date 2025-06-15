// src/shop.js

import { shopifyGraphQL } from './api/shopify.js';
import { PFC_CONFIG } from './config.js';

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

function getProductByHandleQuery(handle) {
  return `{
    productByHandle(handle: \"${handle}\") {
      title
      handle
      descriptionHtml
      images(first: 10) {
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
    `<button class=\"button\" data-tag=\"__all__\">All</button>`,
    ...tags.map(tag => `<button class=\"button\" data-tag=\"${tag}\">${tag}</button>`)
  ].join('');

  container.innerHTML = `
    <div class=\"shop-header enhanced-header\">
      <div>
        <h1 class=\"shop-title\">PFC Commissary</h1>
        <p class=\"shop-subtitle\">Gear up like a champ. Snacks, swag, and serious essentials.</p>
      </div>
    </div>
    <div class=\"category-filters\">
      ${tagButtons}
    </div>
    <div id=\"product-list\" class=\"product-grid\"></div>
    <div class=\"load-more-wrapper\">
      <button id=\"load-more\">Load More</button>
    </div>
  `;

  if (window.initNav) {
    window.initNav();
  }

  document.querySelectorAll('.button').forEach(button => {
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
    let data;
    try {
      data = await shopifyGraphQL(getAllProductsQuery(nextCursor));
    } catch (err) {
      console.error('[shop] Failed to load more products', err);
      return;
    }
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
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <a href=\"#\" class=\"product-link\" data-handle=\"${product.handle}\">
        <img src=\"${product.images.edges[0]?.node.url}\" alt=\"${product.images.edges[0]?.node.altText || product.title}\" />
        <h3>${product.title}</h3>
      </a>
      <p>$${product.variants.edges[0].node.price.amount}</p>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll('.product-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const handle = link.dataset.handle;
      history.pushState({}, '', `/product/${handle}`);
      dispatchEvent(new PopStateEvent('popstate'));
    });
  });
}

function appendProducts(edges) {
  const grid = document.getElementById('product-list');
  edges.forEach(p => {
    const product = p.node;
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <a href=\"#\" class=\"product-link\" data-handle=\"${product.handle}\">
        <img src=\"${product.images.edges[0]?.node.url}\" alt=\"${product.images.edges[0]?.node.altText || product.title}\" />
        <h3>${product.title}</h3>
      </a>
      <p>$${product.variants.edges[0].node.price.amount}</p>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll('.product-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const handle = link.dataset.handle;
      history.pushState({}, '', `/product/${handle}`);
      dispatchEvent(new PopStateEvent('popstate'));
    });
  });
}

export async function init(path) {

  while (!document.getElementById('view-container')) {
    await new Promise(r => setTimeout(r, 10));
  }

  if (!PFC_CONFIG.shopifyDomain || !PFC_CONFIG.shopifyStorefrontToken) {
    document.getElementById('view-container').innerHTML =
      '<p class="text-red-500 text-center">Shop is not configured.</p>';
    console.error('[shop] Missing Shopify config');
    return;
  }
  if (path && path.startsWith('/product/')) {
    const handle = path.split('/product/')[1];
    let result;
    try {
      result = await shopifyGraphQL(getProductByHandleQuery(handle));
    } catch (err) {
      console.error('[shop] Failed to load product', err);
      document.getElementById('view-container').innerHTML =
        '<p class="text-red-500 text-center">Failed to load product.</p>';
      return;
    }
    const product = result.productByHandle;

    const imageHtml = product.images.edges.map(edge => `
      <img src=\"${edge.node.url}\" alt=\"${edge.node.altText || product.title}\" />
    `).join('');

    const content = `
      <div class=\"shop-header enhanced-header\">
        <div>
          <h1 class=\"shop-title\">PFC Commissary</h1>
          <p class=\"shop-subtitle\">Gear up like a champ. Swag, and serious essentials.</p>
        </div>
      </div>
      <div class=\"product-detail\">
        <div class=\"product-detail-image\">
          ${imageHtml}
        </div>
        <div class=\"product-detail-info\">
          <h2>${product.title}</h2>
          <select id=\"variant-select\" style=\"color: black; background-color: white;\">
            ${product.variants.edges.map(v => `<option value=\"${v.node.id}\" data-handle=\"${product.handle}\">${v.node.title} - $${v.node.price.amount}</option>`).join('')}
          </select>
          <button class=\"button\" id=\"buy-now\">Buy Now</button>
        </div>
      </div>
    `;

    const container = document.getElementById('view-container');
    container.innerHTML = content;

    document.getElementById('buy-now').addEventListener('click', () => {
      const select = document.getElementById('variant-select');
      const variantId = select.value;
      const handle = select.options[select.selectedIndex].dataset.handle;
      const shopUrl = `https://pfc-commissary.myshopify.com/products/${handle}?variant=${variantId}`;
      window.open(shopUrl, '_blank'); // Open in new tab
    });

    if (window.runIncludes) await window.runIncludes();
    if (window.initNav) window.initNav();
    return;
  }

  let data;
  try {
    data = await shopifyGraphQL(getAllProductsQuery());
  } catch (err) {
    console.error('[shop] Failed to load products', err);
    document.getElementById('view-container').innerHTML =
      '<p class="text-red-500 text-center">Failed to load products.</p>';
    return;
  }
  allProducts = data.products.edges;
  nextCursor = data.products.pageInfo.hasNextPage ? data.products.edges.at(-1)?.cursor : null;
  const tags = extractTags(allProducts);
  renderProducts(allProducts, tags);
}

// Setup popstate listener and initialiser
window.shopInit = init;
window.addEventListener('popstate', () => {
  window.shopInit(location.pathname);
});