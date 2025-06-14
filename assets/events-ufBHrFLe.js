import{P as s}from"./index-DZoLW-p4.js";function i(n,t){const o={weekday:"short",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit",timeZoneName:"short"},e=new Date(n).toLocaleString(void 0,o),a=t&&new Date(t).getFullYear()>1970?new Date(t).toLocaleString(void 0,o):"";return a?`${e} – ${a}`:`${e}`}function c(n){return n.split(`
`).map(t=>`<p class="mb-2">${t.trim()}</p>`).join("")}async function d(){const n=document.getElementById("events");try{const t=await fetch(`${s.apiBase}/api/events`);if(!t.ok)throw new Error(`HTTP ${t.status}`);const{events:o}=await t.json();if(!Array.isArray(o)||o.length===0){n.innerHTML='<p class="text-gray-300">No upcoming events found.</p>';return}n.innerHTML=o.map(e=>{const a=i(e.start_time,e.end_time),r=c(e.description||"");return`
        <div class="card text-left">
          <h3>${e.name}</h3>
          <div class="meta">
            <time>${a}</time>
            <span class="badge">${e.status||"Scheduled"}</span>
          </div>
          ${r}
          <p class="text-sm text-gray-500"><strong>Location:</strong> ${e.location||"TBD"}<br>
          <strong>Coordinator:</strong> ${e.event_coordinator||"TBD"}</p>
        </div>
      `}).join("")}catch(t){console.error("[ERROR] Failed to load events:",t),n.innerHTML='<p class="text-red-500">Failed to load events. Please try again later.</p>'}}async function m(){try{await d()}catch(n){console.error("[ERROR] Failed to load site content:",n)}}export{m as init};
