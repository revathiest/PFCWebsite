import{P as r}from"./index-CbaTefUj.js";import{s}from"./utils-CFjXnQ4s.js";async function n(){const o=document.getElementById("accolade-list");try{const a=await fetch(`${r.apiBase}/api/accolades`);if(!a.ok)throw new Error(`HTTP ${a.status}`);const{accolades:e}=await a.json();o.innerHTML=e.map(t=>`
        <a href="accolade?slug=${s(t.name)}" data-link
           class="card border-l-4 border-pfc-red p-6 rounded-xl shadow-md hover:shadow-lg transition animate-fade-in block">
          <h2 class="text-xl font-bold mb-2 bg-gradient-to-r from-pfc-red to-pfc-gold bg-clip-text text-transparent">
            ${t.emoji||""} ${t.name}
          </h2>
          <p class="text-gray-300 text-sm">${t.description||"No description available."}</p>
        </a>    
      `).join("")}catch(a){console.error("[ERROR] Failed to load accolades:",a),o.innerHTML='<p class="text-red-500">Failed to load accolades.</p>'}}async function d(){try{await n()}catch(o){console.error("[ERROR] Failed to load site content:",o)}}export{d as init};
