import{P as c}from"./index-CeK9NhiM.js";const d=c.debug,h={ships:"Ships",weapons:"Weapons",armor:"Armor",crafting:"Crafting",mining:"Mining"};function y(r){var t;const e={};for(const a of r)(e[t=a.category]||(e[t]=[])).push(a);return e}function f(r){const e=new Map;for(const t of r)e.has(t.recordRef)||e.set(t.recordRef,{recordName:t.recordName,fields:[]}),e.get(t.recordRef).fields.push(t);return[...e.values()]}function b(r){return r.replace(/_/g," ").replace(/\s+/g," ").trim()}function g(r,e){return r==null?"N/A":`${r}${e?` ${e}`:""}`}const p="grid-cols-[1fr_5.5rem_5.5rem]";function x(r){const e=r.fields.map(t=>`
    <div class="text-gray-400">${t.label}</div>
    <div class="text-right text-gray-200 whitespace-nowrap">${g(t.oldValue,t.unit)}</div>
    <div class="text-right text-gray-200 whitespace-nowrap">${g(t.newValue,t.unit)}</div>
  `).join("");return`
    <tr class="border-t border-gray-800">
      <td class="px-3 py-1.5 font-semibold text-pfc-red align-top border-r border-gray-800">${b(r.recordName)}</td>
      <td class="px-3 py-1.5 align-top">
        <div class="grid ${p} gap-x-3 gap-y-0.5 text-sm">
          ${e}
        </div>
      </td>
    </tr>
  `}function v(r,e,t){if(!Array.isArray(t)||t.length===0)return r&&e?`<p class="text-gray-400 mb-4">${r} &rarr; ${e}</p><p class="text-gray-300">No tracked changes between these versions.</p>`:'<p class="text-gray-300">No changelog data available yet.</p>';const a=y(t),n=Object.keys(a).sort().map(s=>{const l=f(a[s]);return`
      <section class="mb-5">
        <h2 class="text-lg font-bold text-pfc-gold uppercase tracking-wide mb-1.5">
          ${h[s]||s} <span class="text-gray-500 text-sm font-normal normal-case">(${l.length})</span>
        </h2>
        <div class="rounded-lg bg-gray-900/60 overflow-x-auto border border-gray-800">
          <table class="w-full text-sm border-collapse table-fixed">
            <thead>
              <tr class="text-left text-gray-500 uppercase text-xs border-b border-gray-800">
                <th class="w-[30%] px-3 py-1.5 font-semibold border-r border-gray-800">Item</th>
                <th class="px-3 py-1.5 font-semibold">
                  <div class="grid ${p} gap-x-3">
                    <span>Parameter</span>
                    <span class="text-right">Previous</span>
                    <span class="text-right">Current</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              ${l.map(x).join("")}
            </tbody>
          </table>
        </div>
      </section>
    `}).join("");return`<p class="text-gray-400 mb-4 text-center">${r} &rarr; ${e}</p>`+n}async function m(r,e){const t=document.getElementById("changelog-results");try{const a=new URL(`${c.apiBase}/api/sc-changelog`);r&&a.searchParams.set("from",r),e&&a.searchParams.set("to",e);const n=a.toString();d&&console.log("[changelog] Fetching from:",n);const o=await fetch(n);if(!o.ok){const u=await o.text();throw new Error(`HTTP ${o.status} - ${u}`)}const{versionFrom:s,versionTo:l,entries:i}=await o.json();t.classList.add("text-left"),t.innerHTML=v(s,l,i)}catch(a){console.error("[changelog] Failed to load changelog:",a),t.innerHTML='<p class="text-red-500">Failed to load changelog. Please try again later.</p>'}}async function w(){const r=document.getElementById("changelog-picker");try{const e=`${c.apiBase}/api/sc-changelog/known-versions`;d&&console.log("[changelog] Fetching known versions from:",e);const t=await fetch(e);if(!t.ok)throw new Error(`HTTP ${t.status}`);const{versions:a}=await t.json();if(!Array.isArray(a)||a.length<2){r.innerHTML="";return}const n=a.map(o=>`<option value="${o}">${o}</option>`).join("");r.innerHTML=`
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
    `,document.getElementById("changelog-from").value=a[a.length-2],document.getElementById("changelog-to").value=a[a.length-1],document.getElementById("changelog-compare").addEventListener("click",()=>{const o=document.getElementById("changelog-from").value,s=document.getElementById("changelog-to").value;m(o,s)})}catch(e){console.error("[changelog] Failed to load version picker:",e),r.innerHTML=""}}async function E(){const r=document.getElementById("changelog");r.innerHTML=`
    <div id="changelog-picker"></div>
    <div id="changelog-results"></div>
  `;try{await Promise.all([w(),m()])}catch(e){console.error("[changelog] Failed to load site content:",e)}}export{E as init};
