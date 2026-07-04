import{P as d}from"./index-BBZvgmmJ.js";const h=d.debug,u={ships:"Ships",weapons:"Weapons",armor:"Armor",crafting:"Crafting",mining:"Mining"};function y(e){var r;const t={};for(const a of e)(t[r=a.category]||(t[r]=[])).push(a);return t}function b(e){const t=new Map;for(const r of e)t.has(r.recordRef)||t.set(r.recordRef,{recordName:r.recordName,fields:[]}),t.get(r.recordRef).fields.push(r);return[...t.values()]}function m(e){return e.replace(/_/g," ").replace(/\s+/g," ").trim()}function l(e,t){return e==null?"N/A":`${e}${t?` ${t}`:""}`}const g="grid-cols-[1fr_5.5rem_5.5rem]";function x(e){const t=e.fields.map(r=>`
    <div class="text-gray-400">${r.label}</div>
    <div class="text-right text-gray-200 whitespace-nowrap">${l(r.oldValue,r.unit)}</div>
    <div class="text-right text-gray-200 whitespace-nowrap">${l(r.newValue,r.unit)}</div>
  `).join("");return`
    <tr class="border-t border-gray-800">
      <td class="px-3 py-1.5 font-semibold text-pfc-red align-top border-r border-gray-800">${m(e.recordName)}</td>
      <td class="px-3 py-1.5 align-top">
        <div class="grid ${g} gap-x-3 gap-y-0.5 text-sm">
          ${t}
        </div>
      </td>
    </tr>
  `}async function w(){const e=document.getElementById("changelog");try{const t=`${d.apiBase}/api/sc-changelog`;h&&console.log("[changelog] Fetching from:",t);const r=await fetch(t);if(!r.ok){const o=await r.text();throw new Error(`HTTP ${r.status} - ${o}`)}const{versionFrom:a,versionTo:n,entries:s}=await r.json();if(!Array.isArray(s)||s.length===0){e.innerHTML='<p class="text-gray-300">No changelog data available yet.</p>';return}e.classList.add("text-left");const c=y(s),p=Object.keys(c).sort().map(o=>{const i=b(c[o]);return`
        <section class="mb-5">
          <h2 class="text-lg font-bold text-pfc-gold uppercase tracking-wide mb-1.5">
            ${u[o]||o} <span class="text-gray-500 text-sm font-normal normal-case">(${i.length})</span>
          </h2>
          <div class="rounded-lg bg-gray-900/60 overflow-x-auto border border-gray-800">
            <table class="w-full text-sm border-collapse table-fixed">
              <thead>
                <tr class="text-left text-gray-500 uppercase text-xs border-b border-gray-800">
                  <th class="w-[30%] px-3 py-1.5 font-semibold border-r border-gray-800">Item</th>
                  <th class="px-3 py-1.5 font-semibold">
                    <div class="grid ${g} gap-x-3">
                      <span>Parameter</span>
                      <span class="text-right">Previous</span>
                      <span class="text-right">Current</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                ${i.map(x).join("")}
              </tbody>
            </table>
          </div>
        </section>
      `}).join(""),f=a&&n?`<p class="text-gray-400 mb-4 text-center">${a} &rarr; ${n}</p>`:"";e.innerHTML=f+p}catch(t){console.error("[changelog] Failed to load changelog:",t),e.innerHTML='<p class="text-red-500">Failed to load changelog. Please try again later.</p>'}}async function C(){try{await w()}catch(e){console.error("[changelog] Failed to load site content:",e)}}export{C as init};
