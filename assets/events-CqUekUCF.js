import{P as r}from"./index-BBZvgmmJ.js";const c=r.debug;function d(e,n){const o={weekday:"short",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit",timeZoneName:"short"},a=new Date(e).toLocaleString(void 0,o),t=n&&new Date(n).getFullYear()>1970?new Date(n).toLocaleString(void 0,o):"";return t?`${a} - ${t}`:`${a}`}function l(e){return e.split(`
`).map(n=>`<p class="mb-2">${n.trim()}</p>`).join("")}async function m(){const e=document.getElementById("events");try{const n=`${r.apiBase}/api/events`;c&&console.log("[events] Fetching from:",n);const o=await fetch(n);if(!o.ok){const t=await o.text();throw new Error(`HTTP ${o.status} - ${t}`)}const{events:a}=await o.json();if(!Array.isArray(a)||a.length===0){e.innerHTML='<p class="text-gray-300">No upcoming events found.</p>';return}e.classList.add("flex","flex-col","gap-6"),e.innerHTML=a.map(t=>{const s=d(t.start_time,t.end_time),i=l(t.description||"");return`
        <div class="card w-full mb-6 border-l-4 border-pfc-red animate-fade-in">
          <div class="text-pfc-gold font-semibold text-sm mb-2 uppercase tracking-wide">
            ${new Date(t.start_time).toLocaleDateString(void 0,{weekday:"long",month:"short",day:"numeric"})}
          </div>
          <h3 class="text-2xl font-bold mb-2 bg-gradient-to-r from-pfc-red to-pfc-gold bg-clip-text text-transparent">
            ${t.name}
          </h3>
          <div class="text-sm text-gray-400 mb-4">
            <time>${s}</time> 
            <span class="ml-2 px-2 py-1 rounded bg-gray-800 text-xs uppercase">${t.status||"Scheduled"}</span>
          </div>
          <div class="text-gray-300 mb-4">${i}</div>
          <p class="text-sm text-gray-500">
            <strong>Location:</strong> ${t.location||"TBD"}<br>
            <strong>Coordinator:</strong> ${t.event_coordinator||"TBD"}
          </p>
        </div>
      `}).join("")}catch(n){console.error("[events] Failed to load events:",n),e.innerHTML='<p class="text-red-500">Failed to load events. Please try again later.</p>'}}async function g(){try{await m()}catch(e){console.error("[events] Failed to load site content:",e)}}export{g as init};
