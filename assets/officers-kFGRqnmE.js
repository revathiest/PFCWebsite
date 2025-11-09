import{P as d}from"./index-BV58mDZp.js";async function f(){const o=document.getElementById("officer-list");if(o)try{const a=await fetch(`${d.apiBase}/api/officers`);if(!a.ok)throw new Error(`HTTP ${a.status}`);const i=await a.json(),n=Array.isArray(i.officers)?i.officers:[],t=["Fleet Admiral","Admiral","Commodore","Captain","Commander"],l=n.filter(e=>t.includes(e.roleName)).sort((e,r)=>t.indexOf(e.roleName)-t.indexOf(r.roleName));if(l.length===0){o.innerHTML='<p class="text-gray-300">No officer data available.</p>';return}o.classList.add("flex","flex-col","gap-6"),o.innerHTML=l.map(e=>{const r=e.roleName,s=e.roleColor||"#fff",c=e.bio&&e.bio.trim()?`<p class="text-gray-300 mt-2">${e.bio}</p>`:'<p class="text-gray-500 italic mt-2">No biography available.</p>';return`
        <div class="card border-l-4 animate-fade-in" style="border-color: ${s};">
          <h3 class="text-2xl font-bold mb-1" style="color: ${s};">${e.displayName}</h3>
          <p class="font-semibold text-sm uppercase tracking-wide mb-2" style="color: ${s};">${r}</p>
          ${c}
        </div>
      `}).join("")}catch(a){console.error("[officers] Failed to load officers:",a),o.innerHTML='<p class="text-red-500">Failed to load officer data.</p>'}}async function p(){await f()}export{p as init};
