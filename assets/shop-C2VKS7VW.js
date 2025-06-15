async function u(n,o={}){const t=await(await fetch("https://undefined/api/2023-04/graphql.json",{method:"POST",headers:{"Content-Type":"application/json","X-Shopify-Storefront-Access-Token":void 0},body:JSON.stringify({query:n,variables:o})})).json();return t.errors&&console.error("Shopify API Errors:",t.errors),t.data}let c=null,l=null,r=[];function h(n=null){return`{
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
  }`}function w(n){return`{
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
  }`}function y(n){const o=new Set;return n.forEach(a=>a.node.tags.forEach(t=>o.add(t))),Array.from(o)}function $(n,o){const a=document.getElementById("view-container"),t=['<button class="button" data-tag="__all__">All</button>',...o.map(e=>`<button class="button" data-tag="${e}">${e}</button>`)].join("");a.innerHTML=`
    <div class="shop-header enhanced-header">
      <div>
        <h1 class="shop-title">PFC Commissary</h1>
        <p class="shop-subtitle">Gear up like a champ. Snacks, swag, and serious essentials.</p>
      </div>
    </div>
    <div class="category-filters">
      ${t}
    </div>
    <div id="product-list" class="product-grid"></div>
    <div class="load-more-wrapper">
      <button id="load-more">Load More</button>
    </div>
  `,window.initNav&&window.initNav(),document.querySelectorAll(".button").forEach(e=>{e.addEventListener("click",()=>{c=e.dataset.tag;const s=c==="__all__"?r:r.filter(d=>d.node.tags.includes(c));p(s)})}),document.getElementById("load-more").addEventListener("click",async()=>{var s;if(!l)return;const e=await u(h(l));l=e.products.pageInfo.hasNextPage?(s=e.products.edges.at(-1))==null?void 0:s.cursor:null,r.push(...e.products.edges),c&&c!=="__all__"&&r.filter(d=>d.node.tags.includes(c)),E(e.products.edges)}),p(n)}function p(n){const o=document.getElementById("product-list");o.innerHTML="",n.forEach(a=>{var s,d;const t=a.node,e=document.createElement("div");e.className="product-card",e.innerHTML=`
      <a href="#" class="product-link" data-handle="${t.handle}">
        <img src="${(s=t.images.edges[0])==null?void 0:s.node.url}" alt="${((d=t.images.edges[0])==null?void 0:d.node.altText)||t.title}" />
        <h3>${t.title}</h3>
      </a>
      <p>$${t.variants.edges[0].node.price.amount}</p>
    `,o.appendChild(e)}),document.querySelectorAll(".product-link").forEach(a=>{a.addEventListener("click",t=>{t.preventDefault();const e=a.dataset.handle;history.pushState({},"",`/product/${e}`),dispatchEvent(new PopStateEvent("popstate"))})})}function E(n){const o=document.getElementById("product-list");n.forEach(a=>{var s,d;const t=a.node,e=document.createElement("div");e.className="product-card",e.innerHTML=`
      <a href="#" class="product-link" data-handle="${t.handle}">
        <img src="${(s=t.images.edges[0])==null?void 0:s.node.url}" alt="${((d=t.images.edges[0])==null?void 0:d.node.altText)||t.title}" />
        <h3>${t.title}</h3>
      </a>
      <p>$${t.variants.edges[0].node.price.amount}</p>
    `,o.appendChild(e)}),document.querySelectorAll(".product-link").forEach(a=>{a.addEventListener("click",t=>{t.preventDefault();const e=a.dataset.handle;history.pushState({},"",`/product/${e}`),dispatchEvent(new PopStateEvent("popstate"))})})}async function I(n){var t;for(;!document.getElementById("view-container");)await new Promise(e=>setTimeout(e,10));if(n&&n.startsWith("/product/")){const e=n.split("/product/")[1],d=(await u(w(e))).productByHandle,m=`
      <div class="shop-header enhanced-header">
        <div>
          <h1 class="shop-title">PFC Commissary</h1>
          <p class="shop-subtitle">Gear up like a champ. Swag, and serious essentials.</p>
        </div>
      </div>
      <div class="product-detail">
        <div class="product-detail-image">
          ${d.images.edges.map(i=>`
      <img src="${i.node.url}" alt="${i.node.altText||d.title}" />
    `).join("")}
        </div>
        <div class="product-detail-info">
          <h2>${d.title}</h2>
          <select id="variant-select" style="color: black; background-color: white;">
            ${d.variants.edges.map(i=>`<option value="${i.node.id}" data-handle="${d.handle}">${i.node.title} - $${i.node.price.amount}</option>`).join("")}
          </select>
          <button class="button" id="buy-now">Buy Now</button>
        </div>
      </div>
    `,g=document.getElementById("view-container");g.innerHTML=m,document.getElementById("buy-now").addEventListener("click",()=>{const i=document.getElementById("variant-select"),f=i.value,v=`https://pfc-commissary.myshopify.com/products/${i.options[i.selectedIndex].dataset.handle}?variant=${f}`;window.open(v,"_blank")}),window.runIncludes&&await window.runIncludes(),window.initNav&&window.initNav();return}const o=await u(h());r=o.products.edges,l=o.products.pageInfo.hasNextPage?(t=o.products.edges.at(-1))==null?void 0:t.cursor:null;const a=y(r);$(r,a)}window.shopInit=I;window.addEventListener("popstate",()=>{window.shopInit(location.pathname)});export{I as init};
