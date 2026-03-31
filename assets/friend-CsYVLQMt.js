import{P as x}from"./index-CViRLrw2.js";function $(){return window.location.pathname.split("/")[2]||""}function h(s,r,a){return a?`
    <details class="details-block mb-4">
      <summary class="details-summary cursor-pointer text-pfc-gold font-semibold underline">${r}</summary>
      <div class="details-content text-gray-300 mt-2">
        ${a}
      </div>
    </details>
  `:""}async function w(){var a,l,d,g,p,m,b,f;const s=$(),r=document.getElementById("friend-detail");if(r){if(!s){r.innerHTML='<p class="text-red-500">Invalid organisation id.</p>';return}try{const n=localStorage.getItem("jwt"),v=n?{Authorization:`Bearer ${n}`}:{},i=await fetch(`${x.apiBase}/api/orgs/${s}`,{headers:v});if(!i.ok)throw new Error(`HTTP ${i.status}`);const u=await i.json(),y=u.org||u,e=y.data||y;r.innerHTML=`
      <div class="card border-l-4 border-pfc-red animate-fade-in overflow-hidden">
        <div class="h-48 bg-cover bg-center rounded-t" style="background-image: url('${e.banner}');"></div>
        <div class="px-6 py-4 text-center">
          <img src="${e.logo}" alt="${e.name} logo" class="w-24 h-24 mx-auto mb-4 rounded shadow-lg bg-black p-2" />
          <h2 class="text-3xl font-bold mb-2 bg-gradient-to-r from-pfc-red to-pfc-gold bg-clip-text text-transparent">${e.name}</h2>
          <div class="flex flex-wrap justify-center gap-2 text-sm mb-4">
            ${e.archetype?`<span class="badge bg-gray-800 border border-pfc-gold">${e.archetype}</span>`:""}
            ${e.commitment?`<span class="badge bg-gray-800 border border-pfc-gold">${e.commitment}</span>`:""}
            ${e.roleplay?'<span class="badge bg-gray-800 border border-pfc-gold">Roleplay</span>':""}
            <span class="badge bg-gray-800 border border-pfc-gold">${e.lang||"English"}</span>
            ${e.recruiting?'<span class="badge bg-green-700 text-white border border-green-800">Recruiting</span>':'<span class="badge bg-gray-800 text-gray-400 border border-gray-700">Not Recruiting</span>'}
          </div>
          <p class="text-gray-300 mb-4">${((a=e.headline)==null?void 0:a.plaintext)||""}</p>
          <div class="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-6">
            ${(d=(l=e.focus)==null?void 0:l.primary)!=null&&d.image?`<div class="flex items-center gap-2">
              <img src="${e.focus.primary.image}" class="h-6 w-6" alt="Primary Focus" />
              <span>${e.focus.primary.name||""}</span>
            </div>`:""}
            ${(p=(g=e.focus)==null?void 0:g.secondary)!=null&&p.image?`<div class="flex items-center gap-2">
              <img src="${e.focus.secondary.image}" class="h-6 w-6" alt="Secondary Focus" />
              <span>${e.focus.secondary.name||""}</span>
            </div>`:""}
            <div class="flex items-center gap-2">
              <strong>Members:</strong> ${e.members||0}
            </div>
          </div>
          ${(m=e.manifesto)!=null&&m.html?`
            <div class="mb-6 text-left">
              <h3 class="text-xl text-pfc-gold font-semibold mb-2">Manifesto</h3>
              <div class="text-gray-300">${e.manifesto.html}</div>
            </div>
          `:""}
          ${h("charter","Charter",(b=e.charter)==null?void 0:b.html)}
          ${h("history","History",(f=e.history)==null?void 0:f.html)}
          <div class="mt-6">
            ${e.url?`<a href="${e.url}" class="btn" target="_blank" rel="noopener">RSI Org Page</a>`:""}
          </div>
        </div>
      </div>
    `,r.querySelectorAll(".details-block").forEach(c=>{const o=c.querySelector(".details-summary");o&&(o.addEventListener("click",t=>{t.preventDefault(),c.open=!c.open}),o.addEventListener("keypress",t=>{(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),o.click())}))})}catch(n){console.error("[friend] Failed to load org:",n),r.innerHTML='<p class="text-red-500">Failed to load organisation.</p>'}}}async function E(){await w()}export{E as init};
