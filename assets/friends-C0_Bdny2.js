import{P as o}from"./index-BV58mDZp.js";async function d(){const t=document.getElementById("friends-grid");if(t)try{const r=await fetch(`${o.apiBase}/api/orgs`);if(!r.ok)throw new Error(`HTTP ${r.status}`);const{orgs:a}=await r.json();if(!Array.isArray(a)||a.length===0){t.innerHTML='<p class="text-gray-300">No organisations found.</p>';return}const n=a.map(e=>e.data||e.org||e).filter(e=>(e.sid||"").toUpperCase()!=="PFCS");t.classList.add("grid","md:grid-cols-2","gap-6"),t.innerHTML=n.map(e=>{var s;const i=e.recruiting?'<span class="ml-2 px-2 py-1 rounded bg-green-700 text-xs text-white uppercase">Recruiting</span>':"";return`
        <div class="card border-l-4 border-pfc-red animate-fade-in flex flex-col items-center text-center">
          <div class="w-full h-32 bg-cover bg-center mb-4 rounded" style="background-image:url('${e.banner}')"></div>
          <img src="${e.logo}" alt="${e.name} logo" class="w-24 h-24 object-contain mb-2 rounded shadow-md" />
          <h3 class="text-xl font-bold mb-1 bg-gradient-to-r from-pfc-red to-pfc-gold bg-clip-text text-transparent">${e.name}</h3>
          <p class="text-sm text-gray-300 mb-2">${((s=e.headline)==null?void 0:s.plaintext)||""}</p>
          <p class="text-sm text-gray-400 mb-2">Members: ${e.members}${i}</p>
          <a data-link href="/friends/${e.sid}" class="btn mt-2">Learn More</a>
        </div>
      `}).join("")}catch(r){console.error("[friends] Failed to load orgs:",r),t.innerHTML='<p class="text-red-500">Failed to load organisations.</p>'}}async function p(){await d()}export{p as init};
