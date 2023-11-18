var o=(e="lang")=>()=>{let t=location?.search?.slice(1).split("&").find(r=>r.startsWith(e))?.split("=")[1];return t?[t]:[]},c=o();export{o as initQueryStringDetector,c as queryStringDetector};
