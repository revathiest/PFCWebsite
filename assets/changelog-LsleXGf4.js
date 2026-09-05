import{P as i}from"./index-dMMEAMrE.js";const b=i.debug,f={ships:"Ships",weapons:"Weapons",armor:"Armor",crafting:"Crafting",mining:"Mining"};function m(e){var a;const t={};for(const r of e)(t[a=r.category]||(t[a]=[])).push(r);return t}function x(e){const t=new Map;for(const a of e)t.has(a.recordRef)||t.set(a.recordRef,{recordName:a.recordName,recordDisplayName:a.recordDisplayName,fields:[]}),t.get(a.recordRef).fields.push(a);return[...t.values()]}function v(e){return e.replace(/_/g," ").replace(/\s+/g," ").trim()}function $(e){return e.recordDisplayName||v(e.recordName)}function p(e,t){return e==null?"N/A":`${e}${t?` ${t}`:""}`}const u="grid-cols-[1fr_5.5rem_5.5rem]";function w(e){const t=e.fields.map(a=>`
    <div class="text-gray-400">${a.label}</div>
    <div class="text-right text-gray-200 whitespace-nowrap">${p(a.oldValue,a.unit)}</div>
    <div class="text-right text-gray-200 whitespace-nowrap">${p(a.newValue,a.unit)}</div>
  `).join("");return`
    <tr class="border-t border-gray-800">
      <td class="px-3 py-1.5 font-semibold text-pfc-red align-top border-r border-gray-800">${$(e)}</td>
      <td class="px-3 py-1.5 align-top">
        <div class="grid ${u} gap-x-3 gap-y-0.5 text-sm">
          ${t}
        </div>
      </td>
    </tr>
  `}function E(e){return`
    <div class="rounded-lg bg-gray-900/60 overflow-x-auto border border-gray-800">
      <table class="w-full text-sm border-collapse table-fixed">
        <thead>
          <tr class="text-left text-gray-500 uppercase text-xs border-b border-gray-800">
            <th class="w-[30%] px-3 py-1.5 font-semibold border-r border-gray-800">Item</th>
            <th class="px-3 py-1.5 font-semibold">
              <div class="grid ${u} gap-x-3">
                <span>Parameter</span>
                <span class="text-right">Previous</span>
                <span class="text-right">Current</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          ${e.map(w).join("")}
        </tbody>
      </table>
    </div>
  `}function L(e,t,a){if(!Array.isArray(a)||a.length===0)return e&&t?`<p class="text-gray-400 mb-4">${e} &rarr; ${t}</p><p class="text-gray-300">No tracked changes between these versions.</p>`:'<p class="text-gray-300">No changelog data available yet.</p>';const r=m(a),n=Object.keys(r).sort().map(o=>({category:o,label:f[o]||o,records:x(r[o])})),s=n.map(o=>`<option value="${o.category}">${o.label} (${o.records.length})</option>`).join(""),l=n.map((o,g)=>`
    <button type="button" data-changelog-tab="${o.category}" class="changelog-tab-btn px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${g===0?"border-pfc-gold text-pfc-gold":"border-transparent text-gray-400 hover:text-gray-200"}">
      ${o.label} <span class="text-gray-500 font-normal">(${o.records.length})</span>
    </button>
  `).join(""),c=n.map((o,g)=>`
    <div data-changelog-panel="${o.category}" class="changelog-tab-panel${g===0?"":" hidden"}">
      ${E(o.records)}
    </div>
  `).join("");return`
    ${`<p class="text-gray-400 mb-4 text-center">${e} &rarr; ${t}</p>`}
    <div class="sm:hidden mb-4">
      <select id="changelog-tab-select" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200">
        ${s}
      </select>
    </div>
    <div class="hidden sm:flex flex-wrap gap-1 border-b border-gray-800 mb-5" role="tablist">
      ${l}
    </div>
    <div>${c}</div>
  `}function h(e,t){e.querySelectorAll("[data-changelog-panel]").forEach(r=>{r.classList.toggle("hidden",r.dataset.changelogPanel!==t)}),e.querySelectorAll(".changelog-tab-btn").forEach(r=>{const n=r.dataset.changelogTab===t;r.classList.toggle("border-pfc-gold",n),r.classList.toggle("text-pfc-gold",n),r.classList.toggle("border-transparent",!n),r.classList.toggle("text-gray-400",!n)});const a=e.querySelector("#changelog-tab-select");a&&(a.value=t)}function T(e){e.querySelectorAll(".changelog-tab-btn").forEach(a=>{a.addEventListener("click",()=>h(e,a.dataset.changelogTab))});const t=e.querySelector("#changelog-tab-select");t&&t.addEventListener("change",()=>h(e,t.value))}async function y(e,t){const a=document.getElementById("changelog-results");try{const r=new URL(`${i.apiBase}/api/sc-changelog`);e&&r.searchParams.set("from",e),t&&r.searchParams.set("to",t);const n=r.toString();b&&console.log("[changelog] Fetching from:",n);const s=await fetch(n);if(!s.ok){const o=await s.text();throw new Error(`HTTP ${s.status} - ${o}`)}const{versionFrom:l,versionTo:c,entries:d}=await s.json();a.classList.add("text-left"),a.innerHTML=L(l,c,d),T(a)}catch(r){console.error("[changelog] Failed to load changelog:",r),a.innerHTML='<p class="text-red-500">Failed to load changelog. Please try again later.</p>'}}async function B(){const e=document.getElementById("changelog-picker");try{const t=`${i.apiBase}/api/sc-changelog/known-versions`;b&&console.log("[changelog] Fetching known versions from:",t);const a=await fetch(t);if(!a.ok)throw new Error(`HTTP ${a.status}`);const{versions:r}=await a.json();if(!Array.isArray(r)||r.length<2){e.innerHTML="";return}const n=r.map(s=>`<option value="${s}">${s}</option>`).join("");e.innerHTML=`
      <div class="flex flex-wrap items-end justify-center gap-3 mb-6 text-sm">
        <label class="flex flex-col items-start text-gray-400">
          From
          <select id="changelog-from" class="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200">${n}</select>
        </label>
        <label class="flex flex-col items-start text-gray-400">
          To
          <select id="changelog-to" class="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200">${n}</select>
        </label>
        <button id="changelog-compare" type="button" class="btn">Compare</button>
      </div>
    `,document.getElementById("changelog-from").value=r[r.length-2],document.getElementById("changelog-to").value=r[r.length-1],document.getElementById("changelog-compare").addEventListener("click",()=>{const s=document.getElementById("changelog-from").value,l=document.getElementById("changelog-to").value;y(s,l)})}catch(t){console.error("[changelog] Failed to load version picker:",t),e.innerHTML=""}}async function C(){const e=document.getElementById("changelog");e.innerHTML=`
    <div id="changelog-picker"></div>
    <div id="changelog-results"></div>
  `;try{await Promise.all([B(),y()])}catch(t){console.error("[changelog] Failed to load site content:",t)}}export{C as init};
