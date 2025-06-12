// src/shop.js

import { shopifyGraphQL, GET_PRODUCTS_QUERY, GET_PRODUCT_QUERY, CREATE_CHECKOUT_MUTATION } from './api/shopify';

export async function init() {
  const viewContainer = document.getElementById('view-container');
  const path = window.location.pathname;

  if (path.startsWith('/product/')) {
    const handle = path.split('/product/')[1];
    const data = await shopifyGraphQL(GET_PRODUCT_QUERY, { handle });
    const product = data.productByHandle;

    let variantId = product.variants.edges[0]?.node.id;

    viewContainer.innerHTML = `
      <h2>${product.title}</h2>
      <div class="product-gallery">
        ${product.images.edges.map(img => `<img src="${img.node.url}" alt="${img.node.altText || product.title}" />`).join('')}
      </div>
      <p>${product.description}</p>
      <select id="variant-select">
        ${product.variants.edges.map(v => `<option value="${v.node.id}">${v.node.title} - $${v.node.price.amount}</option>`).join('')}
      </select>
      <button id="buy-now">Buy Now</button>
    `;

    document.getElementById('variant-select').addEventListener('change', e => {
      variantId = e.target.value;
    });

    document.getElementById('buy-now').addEventListener('click', async () => {
      const checkout = await shopifyGraphQL(CREATE_CHECKOUT_MUTATION, {
        lineItems: [{ variantId, quantity: 1 }]
      });
      window.location.href = checkout.checkoutCreate.checkout.webUrl;
    });

  } else {
    const data = await shopifyGraphQL(GET_PRODUCTS_QUERY);
    const products = data.products.edges.map(edge => edge.node);

    viewContainer.innerHTML = `
      <h2>Shop</h2>
      <div class="product-grid">
        ${products.map(p => `
          <div class="product-card">
            <a href="/product/${p.handle}" data-link>
              <img src="${p.images.edges[0]?.node.url}" alt="${p.images.edges[0]?.node.altText || p.title}" />
              <h3>${p.title}</h3>
            </a>
            <p>$${p.variants.edges[0].node.price.amount}</p>
          </div>
        `).join('')}
      </div>
    `;
  }
}
