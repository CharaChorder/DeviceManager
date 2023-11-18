var s=(e,t)=>{let r=e?.split(";").map(o=>o.trim()).find(o=>o.startsWith(t))?.split("=")[1];return r?[r]:[]};var m=(e,t="lang")=>()=>s(e?.cookies,t);export{m as initRequestCookiesDetector};
