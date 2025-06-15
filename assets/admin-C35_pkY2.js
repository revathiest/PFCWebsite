import{g as t}from"./index-CJK2gzTJ.js";function o(){const n=document.getElementById("admin-info");if(!n)return;const e=t();if(!e){n.innerHTML='<p class="text-gray-400">Unable to load user info.</p>';return}n.innerHTML=`
    <p class="mb-4">Welcome, <strong>${e.displayName}</strong>!</p>
    <p>Use the links below to manage the site.</p>
  `}async function r(){try{o()}catch(n){console.error("[admin] Failed to initialise admin console",n)}}export{r as init};
