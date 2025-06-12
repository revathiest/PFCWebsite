import{P as s}from"./index-DLcSgwuu.js";import{s as r}from"./utils-CFjXnQ4s.js";async function n(){const o=document.getElementById("accolade-list");try{const a=await fetch(`${s.apiBase}/api/accolades`);if(!a.ok)throw new Error(`HTTP ${a.status}`);const{accolades:e}=await a.json();o.innerHTML=e.map(t=>`
        <a href="accolade?slug=${r(t.name)}" data-link class="block bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 class="text-2xl font-bold text-pfc-red mb-2">${t.emoji||""} ${t.name}</h2>
          <p class="text-gray-300 text-sm">${t.description||"No description available."}</p>
        </a>    
      `).join("")}catch(a){console.error("[ERROR] Failed to load accolades:",a),o.innerHTML='<p class="text-red-500">Failed to load accolades.</p>'}}async function d(){try{await n()}catch(o){console.error("[ERROR] Failed to load site content:",o)}}export{d as init};
