import{P as d}from"./index-CJK2gzTJ.js";async function m(){const t=document.getElementById("officer-list");if(t)try{const e=await fetch(`${d.apiBase}/api/officers`);if(!e.ok)throw new Error(`HTTP ${e.status}`);const l=await e.json(),c=Array.isArray(l.officers)?l.officers:[],s=["Fleet Admiral","Admiral","Commodore","Captain","Commander"],n=c.filter(o=>{const r=o.roleName;return s.includes(r)}).sort((o,r)=>{const i=o.roleName,a=r.roleName;return s.indexOf(i)-s.indexOf(a)});if(n.length===0){t.innerHTML='<p class="text-gray-300">No officer data available.</p>';return}t.innerHTML=n.map(o=>{const r=o.roleName||{},i=typeof r=="string"?r:r.roleName,a=o.roleColor||r.roleColor||"#fff",f=o.bio&&o.bio.trim()?`<p class="text-gray-300 mt-2">${o.bio}</p>`:'<p class="text-gray-500 italic mt-2">No biography available.</p>';return`
        <div class="card">
          <h3 style="color: ${a};">${o.displayName}</h3>
          <p class="font-semibold" style="color: ${a};">${i??""}</p>
          ${f}
        </div>
      `}).join("")}catch(e){console.error("[officers] Failed to load officers:",e),t.innerHTML='<p class="text-red-500">Failed to load officer data.</p>'}}async function y(){await m()}export{y as init};
