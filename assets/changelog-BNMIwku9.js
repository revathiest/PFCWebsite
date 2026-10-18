import{P as d}from"./index-mw1R8J-Z.js";const u=d.debug,x={ships:"Ships",weapons:"Weapons",armor:"Armor",crafting:"Crafting",mining:"Mining"};function v(t){var r;const a={};for(const e of t)(a[r=e.category]||(a[r]=[])).push(e);return a}function $(t){const a=new Map;for(const r of t)a.has(r.recordRef)||a.set(r.recordRef,{recordName:r.recordName,recordDisplayName:r.recordDisplayName,fields:[]}),a.get(r.recordRef).fields.push(r);return[...a.values()]}function y(t){return t.replace(/_/g," ").replace(/\s+/g," ").trim()}function i(t){return t.recordDisplayName||y(t.recordName)}function h(t,a){return t==null?"N/A":`${t}${a?` ${a}`:""}`}const m="grid-cols-[1fr_5.5rem_5.5rem]";function w(t,a){const r=t.fields.map(e=>`
    <div class="text-gray-400">${e.label}</div>
    <div class="text-right text-gray-200 whitespace-nowrap">${h(e.oldValue,e.unit)}</div>
    <div class="text-right text-gray-200 whitespace-nowrap">${h(e.newValue,e.unit)}</div>
  `).join("");return`
    <tr class="border-t border-gray-800">
      <td class="px-3 py-1.5 font-semibold text-pfc-red align-top border-r border-gray-800">
        ${i(t)}
        ${a?`<div class="text-xs font-normal text-gray-500">${y(t.recordName)}</div>`:""}
      </td>
      <td class="px-3 py-1.5 align-top">
        <div class="grid ${m} gap-x-3 gap-y-0.5 text-sm">
          ${r}
        </div>
      </td>
    </tr>
  `}function E(t){const a=new Map;for(const e of t){const o=i(e);a.set(o,(a.get(o)||0)+1)}const r=new Set([...a].filter(([,e])=>e>1).map(([e])=>e));return`
    <div class="rounded-lg bg-gray-900/60 overflow-x-auto border border-gray-800">
      <table class="w-full text-sm border-collapse table-fixed">
        <thead>
          <tr class="text-left text-gray-500 uppercase text-xs border-b border-gray-800">
            <th class="w-[30%] px-3 py-1.5 font-semibold border-r border-gray-800">Item</th>
            <th class="px-3 py-1.5 font-semibold">
              <div class="grid ${m} gap-x-3">
                <span>Parameter</span>
                <span class="text-right">Previous</span>
                <span class="text-right">Current</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          ${t.map(e=>w(e,r.has(i(e)))).join("")}
        </tbody>
      </table>
    </div>
  `}function L(t,a,r){if(!Array.isArray(r)||r.length===0)return t&&a?`<p class="text-gray-400 mb-4">${t} &rarr; ${a}</p><p class="text-gray-300">No tracked changes between these versions.</p>`:'<p class="text-gray-300">No changelog data available yet.</p>';const e=v(r),o=Object.keys(e).sort().map(n=>({category:n,label:x[n]||n,records:$(e[n])})),s=o.map(n=>`<option value="${n.category}">${n.label} (${n.records.length})</option>`).join(""),l=o.map((n,g)=>`
    <button type="button" data-changelog-tab="${n.category}" class="changelog-tab-btn px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${g===0?"border-pfc-gold text-pfc-gold":"border-transparent text-gray-400 hover:text-gray-200"}">
      ${n.label} <span class="text-gray-500 font-normal">(${n.records.length})</span>
    </button>
  `).join(""),c=o.map((n,g)=>`
    <div data-changelog-panel="${n.category}" class="changelog-tab-panel${g===0?"":" hidden"}">
      ${E(n.records)}
    </div>
  `).join("");return`
    ${`<p class="text-gray-400 mb-4 text-center">${t} &rarr; ${a}</p>`}
    <div class="sm:hidden mb-4">
      <select id="changelog-tab-select" class="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-200">
        ${s}
      </select>
    </div>
    <div class="hidden sm:flex flex-wrap gap-1 border-b border-gray-800 mb-5" role="tablist">
      ${l}
    </div>
    <div>${c}</div>
  `}function b(t,a){t.querySelectorAll("[data-changelog-panel]").forEach(e=>{e.classList.toggle("hidden",e.dataset.changelogPanel!==a)}),t.querySelectorAll(".changelog-tab-btn").forEach(e=>{const o=e.dataset.changelogTab===a;e.classList.toggle("border-pfc-gold",o),e.classList.toggle("text-pfc-gold",o),e.classList.toggle("border-transparent",!o),e.classList.toggle("text-gray-400",!o)});const r=t.querySelector("#changelog-tab-select");r&&(r.value=a)}function T(t){t.querySelectorAll(".changelog-tab-btn").forEach(r=>{r.addEventListener("click",()=>b(t,r.dataset.changelogTab))});const a=t.querySelector("#changelog-tab-select");a&&a.addEventListener("change",()=>b(t,a.value))}async function f(t,a){const r=document.getElementById("changelog-results");try{const e=new URL(`${d.apiBase}/api/sc-changelog`);t&&e.searchParams.set("from",t),a&&e.searchParams.set("to",a);const o=e.toString();u&&console.log("[changelog] Fetching from:",o);const s=await fetch(o);if(!s.ok){const n=await s.text();throw new Error(`HTTP ${s.status} - ${n}`)}const{versionFrom:l,versionTo:c,entries:p}=await s.json();r.classList.add("text-left"),r.innerHTML=L(l,c,p),T(r)}catch(e){console.error("[changelog] Failed to load changelog:",e),r.innerHTML='<p class="text-red-500">Failed to load changelog. Please try again later.</p>'}}async function B(){const t=document.getElementById("changelog-picker");try{const a=`${d.apiBase}/api/sc-changelog/known-versions`;u&&console.log("[changelog] Fetching known versions from:",a);const r=await fetch(a);if(!r.ok)throw new Error(`HTTP ${r.status}`);const{versions:e}=await r.json();if(!Array.isArray(e)||e.length<2){t.innerHTML="";return}const o=e.map(s=>`<option value="${s}">${s}</option>`).join("");t.innerHTML=`
      <div class="flex flex-wrap items-end justify-center gap-3 mb-6 text-sm">
        <label class="flex flex-col items-start text-gray-400">
          From
          <select id="changelog-from" class="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200">${o}</select>
        </label>
        <label class="flex flex-col items-start text-gray-400">
          To
          <select id="changelog-to" class="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200">${o}</select>
        </label>
        <button id="changelog-compare" type="button" class="btn">Compare</button>
      </div>
    `,document.getElementById("changelog-from").value=e[e.length-2],document.getElementById("changelog-to").value=e[e.length-1],document.getElementById("changelog-compare").addEventListener("click",()=>{const s=document.getElementById("changelog-from").value,l=document.getElementById("changelog-to").value;f(s,l)})}catch(a){console.error("[changelog] Failed to load version picker:",a),t.innerHTML=""}}async function k(){const t=document.getElementById("changelog");t.innerHTML=`
    <div id="changelog-picker"></div>
    <div id="changelog-results"></div>
  `;try{await Promise.all([B(),f()])}catch(a){console.error("[changelog] Failed to load site content:",a)}}export{k as init};
