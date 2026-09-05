import{P as c}from"./index-dMMEAMrE.js";async function n(){const t=document.getElementById("officer-list");if(t)try{const e=await fetch(`${c.apiBase}/api/officers`);if(!e.ok)throw new Error(`HTTP ${e.status}`);const s=await e.json(),i=(Array.isArray(s.officers)?s.officers:[]).filter(o=>o.roleName).sort((o,r)=>(r.rolePosition??-1)-(o.rolePosition??-1));if(i.length===0){t.innerHTML='<p class="text-gray-300">No officer data available.</p>';return}t.classList.add("flex","flex-col","gap-6"),t.innerHTML=i.map(o=>{const r=o.roleName,a=o.roleColor||"#fff",l=o.bio&&o.bio.trim()?`<p class="text-gray-300 mt-2">${o.bio}</p>`:'<p class="text-gray-500 italic mt-2">No biography available.</p>';return`
        <div class="card border-l-4 animate-fade-in" style="border-color: ${a};">
          <h3 class="text-2xl font-bold mb-1" style="color: ${a};">${o.displayName}</h3>
          <p class="font-semibold text-sm uppercase tracking-wide mb-2" style="color: ${a};">${r}</p>
          ${l}
        </div>
      `}).join("")}catch(e){console.error("[officers] Failed to load officers:",e),t.innerHTML='<p class="text-red-500">Failed to load officer data.</p>'}}async function p(){await n()}export{p as init};
