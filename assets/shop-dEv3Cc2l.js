import{P as h}from"./index-DgYdFkUY.js";const w=h.shopifyDomain,$=h.shopifyStorefrontToken;async function u(n,a={}){const e=await(await fetch(`https://${w}/api/2023-04/graphql.json`,{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Storefront-Access-Token":$},body:JSON.stringify({query:n,variables:a})})).json();return e.errors&&console.error("Shopify API Errors:",e.errors),e.data}let c=null,l=null,i=[];function m(n=null){return`{
    products(first: 10${n?`, after: "${n}"`:""}) {
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
  }`}function E(n){return`{
    productByHandle(handle: "${n}") {
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
  }`}function I(n){const a=new Set;return n.forEach(d=>d.node.tags.forEach(e=>a.add(e))),Array.from(a)}function T(n,a){const d=document.getElementById("view-container"),e=['<button class="button" data-tag="__all__">All</button>',...a.map(t=>`<button class="button" data-tag="${t}">${t}</button>`)].join("");d.innerHTML=`
    <div class="shop-header enhanced-header">
      <div>
        <h1 class="shop-title">PFC Commissary</h1>
        <p class="shop-subtitle">Gear up like a champ. Snacks, swag, and serious essentials.</p>
      </div>
    </div>
    <div class="category-filters">
      ${e}
    </div>
    <div id="product-list" class="product-grid"></div>
    <div class="load-more-wrapper">
      <button id="load-more">Load More</button>
    </div>
  `,window.initNav&&window.initNav(),document.querySelectorAll(".button").forEach(t=>{t.addEventListener("click",()=>{c=t.dataset.tag;const s=c==="__all__"?i:i.filter(o=>o.node.tags.includes(c));p(s)})}),document.getElementById("load-more").addEventListener("click",async()=>{var s;if(!l)return;let t;try{t=await u(m(l))}catch(o){console.error("[shop] Failed to load more products",o);return}l=t.products.pageInfo.hasNextPage?(s=t.products.edges.at(-1))==null?void 0:s.cursor:null,i.push(...t.products.edges),c&&c!=="__all__"&&i.filter(o=>o.node.tags.includes(c)),b(t.products.edges)}),p(n)}function p(n){const a=document.getElementById("product-list");a.innerHTML="",n.forEach(d=>{var s,o;const e=d.node,t=document.createElement("div");t.className="product-card",t.innerHTML=`
      <a href="#" class="product-link" data-handle="${e.handle}">
        <img src="${(s=e.images.edges[0])==null?void 0:s.node.url}" alt="${((o=e.images.edges[0])==null?void 0:o.node.altText)||e.title}" />
        <h3>${e.title}</h3>
      </a>
      <p>$${e.variants.edges[0].node.price.amount}</p>
    `,a.appendChild(t)}),document.querySelectorAll(".product-link").forEach(d=>{d.addEventListener("click",e=>{e.preventDefault();const t=d.dataset.handle;history.pushState({},"",`/product/${t}`),dispatchEvent(new PopStateEvent("popstate"))})})}function b(n){const a=document.getElementById("product-list");n.forEach(d=>{var s,o;const e=d.node,t=document.createElement("div");t.className="product-card",t.innerHTML=`
      <a href="#" class="product-link" data-handle="${e.handle}">
        <img src="${(s=e.images.edges[0])==null?void 0:s.node.url}" alt="${((o=e.images.edges[0])==null?void 0:o.node.altText)||e.title}" />
        <h3>${e.title}</h3>
      </a>
      <p>$${e.variants.edges[0].node.price.amount}</p>
    `,a.appendChild(t)}),document.querySelectorAll(".product-link").forEach(d=>{d.addEventListener("click",e=>{e.preventDefault();const t=d.dataset.handle;history.pushState({},"",`/product/${t}`),dispatchEvent(new PopStateEvent("popstate"))})})}async function P(n){var e;for(;!document.getElementById("view-container");)await new Promise(t=>setTimeout(t,10));if(n&&n.startsWith("/product/")){const t=n.split("/product/")[1];let s;try{s=await u(E(t))}catch(r){console.error("[shop] Failed to load product",r),document.getElementById("view-container").innerHTML='<p class="text-red-500 text-center">Failed to load product.</p>';return}const o=s.productByHandle,g=`
      <div class="shop-header enhanced-header">
        <div>
          <h1 class="shop-title">PFC Commissary</h1>
          <p class="shop-subtitle">Gear up like a champ. Swag, and serious essentials.</p>
        </div>
      </div>
      <div class="product-detail">
        <div class="product-detail-image">
          ${o.images.edges.map(r=>`
      <img src="${r.node.url}" alt="${r.node.altText||o.title}" />
    `).join("")}
        </div>
        <div class="product-detail-info">
          <h2>${o.title}</h2>
          <select id="variant-select" style="color: black; background-color: white;">
            ${o.variants.edges.map(r=>`<option value="${r.node.id}" data-handle="${o.handle}">${r.node.title} - $${r.node.price.amount}</option>`).join("")}
          </select>
          <button class="button" id="buy-now">Buy Now</button>
        </div>
      </div>
    `,f=document.getElementById("view-container");f.innerHTML=g,document.getElementById("buy-now").addEventListener("click",()=>{const r=document.getElementById("variant-select"),v=r.value,y=`https://pfc-commissary.myshopify.com/products/${r.options[r.selectedIndex].dataset.handle}?variant=${v}`;window.open(y,"_blank")}),window.runIncludes&&await window.runIncludes(),window.initNav&&window.initNav();return}let a;try{a=await u(m())}catch(t){console.error("[shop] Failed to load products",t),document.getElementById("view-container").innerHTML='<p class="text-red-500 text-center">Failed to load products.</p>';return}i=a.products.edges,l=a.products.pageInfo.hasNextPage?(e=a.products.edges.at(-1))==null?void 0:e.cursor:null;const d=I(i);T(i,d)}window.shopInit=P;window.addEventListener("popstate",()=>{window.shopInit(location.pathname)});export{P as init};
