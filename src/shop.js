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

function getProductByHandleQuery(handle) {
  return `{
    productByHandle(handle: \"${handle}\") {
      title
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
    `<button class=\"tag-button\" data-tag=\"__all__\">All</button>`,
    ...tags.map(tag => `<button class=\"tag-button\" data-tag=\"${tag}\">${tag}</button>`)
  ].join('');

  container.innerHTML = `
    <div class=\"shop-header\">
      <img src=\"/images/shop-logo.png\" alt=\"PFC Commissary\" class=\"shop-logo\" />
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
  if (path && path.startsWith('/product/')) {
    const handle = path.split('/product/')[1];
    const result = await shopifyGraphQL(getProductByHandleQuery(handle));
    const product = result.productByHandle;

    const imageHtml = product.images.edges.map(edge => `
      <img src=\"${edge.node.url}\" alt=\"${edge.node.altText || product.title}\" />
    `).join('');

    const content = `
      <div class=\"shop-header\">
        <img src=\"/images/shop-logo.png\" alt=\"PFC Commissary\" class=\"shop-logo\" />
      </div>
      <div class=\"product-detail\">
        <div class=\"product-detail-image\">
          ${imageHtml}
        </div>
        <div class=\"product-detail-info\">
          <h2>${product.title}</h2>
          <select id=\"variant-select\" style=\"color: black; background-color: white;\">
            ${product.variants.edges.map(v => `<option value=\"${v.node.id}\">${v.node.title} - $${v.node.price.amount}</option>`).join('')}
          </select>
          <button id=\"buy-now\">Buy Now</button>
        </div>
      </div>
    `;

    const container = document.getElementById('view-container');
    container.innerHTML = content;

    if (window.runIncludes) await window.runIncludes();
    if (window.initNav) window.initNav();
    return;
  }

  const data = await shopifyGraphQL(getAllProductsQuery());
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
