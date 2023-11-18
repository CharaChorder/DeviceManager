import{o as me,t as we}from "../chunks/scheduler.f5cfe514.js";import{S as Fe,a as He,I as C,g as Te,f as $e,b as ye,c as le,s as Q,i as ve,d as F,e as B,P as De,h as Je}from "../chunks/singletons.de2fb98c.js";import{R as Ce,H as ee}from "../chunks/control.f5b05b5f.js";function We(n, s){return n==="/"||s==="ignore"?n:s==="never"?n.endsWith("/")?n.slice(0,-1):n:s==="always"&&!n.endsWith("/")?n+"/":n}function Ye(n){return n.split("%25").map(decodeURI).join("%25")}function Xe(n){for(const s in n)n[s]=decodeURIComponent(n[s]);return n}const Ze=["href","pathname","search","searchParams","toString","toJSON"];function Qe(n, s){const u=new URL(n);for(const o of Ze)Object.defineProperty(u,o,{get(){return s(),n[o]},enumerable:!0,configurable:!0});return et(u),u}function et(n){Object.defineProperty(n,"hash",{get(){throw new Error("Cannot access event.url.hash. Consider using `$page.url.hash` inside a component instead")}})}const tt="/__data.json";function nt(n){return n.replace(/\/$/,"")+tt}function at(...n){let s=5381;for(const u of n)if(typeof u=="string"){let o=u.length;for(; o;)s=s*33^u.charCodeAt(--o)}else if(ArrayBuffer.isView(u)){const o=new Uint8Array(u.buffer,u.byteOffset,u.byteLength);let d=o.length;for(; d;)s=s*33^o[--d]}else throw new TypeError("value must be a string or TypedArray");return(s>>>0).toString(36)}const fe=window.fetch;window.fetch=(n, s)=>((n instanceof Request?n.method:s?.method||"GET")!=="GET"&&te.delete(ke(n)),fe(n,s));const te=new Map;function rt(n, s){const u=ke(n,s),o=document.querySelector(u);if(o?.textContent){const{body:d,...c}=JSON.parse(o.textContent),E=o.getAttribute("data-ttl");return E&&te.set(u,{body:d,init:c,ttl:1e3*Number(E)}),Promise.resolve(new Response(d,c))}return fe(n,s)}function ot(n, s, u){if(te.size>0){const o=ke(n,u),d=te.get(o);if(d){if(performance.now()<d.ttl&&["default","force-cache","only-if-cached",void 0].includes(u?.cache))return new Response(d.body,d.init);te.delete(o)}}return fe(s,u)}function ke(n, s){let o=`script[data-sveltekit-fetched][data-url=${JSON.stringify(n instanceof Request?n.url:n)}]`;if(s?.headers||s?.body){const d=[];s.headers&&d.push([...new Headers(s.headers)].join(",")),s.body&&(typeof s.body=="string"||ArrayBuffer.isView(s.body))&&d.push(s.body),o+=`[data-hash="${at(...d)}"]`}return o}const st=/^(\[)?(\.\.\.)?(\w+)(?:=(\w+))?(\])?$/;function it(n){const s=[];return{pattern:n==="/"?/^\/$/:new RegExp(`^${lt(n).map(o=>{const d=/^\[\.\.\.(\w+)(?:=(\w+))?\]$/.exec(o);if(d)return s.push({name:d[1],matcher:d[2],optional:!1,rest:!0,chained:!0}),"(?:/(.*))?";const c=/^\[\[(\w+)(?:=(\w+))?\]\]$/.exec(o);if(c)return s.push({name:c[1],matcher:c[2],optional:!0,rest:!1,chained:!0}),"(?:/([^/]+))?";if(!o)return;const E=o.split(/\[(.+?)\](?!\])/);return"/"+E.map((w, p)=>{if(p%2){if(w.startsWith("x+"))return be(String.fromCharCode(parseInt(w.slice(2),16)));if(w.startsWith("u+"))return be(String.fromCharCode(...w.slice(2).split("-").map(D=>parseInt(D,16))));const _=st.exec(w);if(!_)throw new Error(`Invalid param: ${w}. Params and matcher names can only have underscores and alphanumeric characters.`);const[,j,I,b,P]=_;return s.push({name:b,matcher:P,optional:!!j,rest:!!I,chained:I?p===1&&E[0]==="":!1}),I?"(.*?)":j?"([^/]*)?":"([^/]+?)"}return be(w)}).join("")}).join("")}/?$`),params:s}}function ct(n){return!/^\([^)]+\)$/.test(n)}function lt(n){return n.slice(1).split("/").filter(ct)}function ft(n, s, u){const o={},d=n.slice(1);let c=0;for(let E=0; E<s.length; E+=1){const i=s[E];let w=d[E-c];if(i.chained&&i.rest&&c&&(w=d.slice(E-c,E+1).filter(p=>p).join("/"),c=0),w===void 0){i.rest&&(o[i.name]="");continue}if(!i.matcher||u[i.matcher](w)){o[i.name]=w;const p=s[E+1],_=d[E+1];p&&!p.rest&&p.optional&&_&&i.chained&&(c=0);continue}if(i.optional&&i.chained){c++;continue}return}if(!c)return o}function be(n){return n.normalize().replace(/[[\]]/g,"\\$&").replace(/%/g,"%25").replace(/\//g,"%2[Ff]").replace(/\?/g,"%3[Ff]").replace(/#/g,"%23").replace(/[.*+?^${}()|\\]/g,"\\$&")}function ut({nodes:n,server_loads:s,dictionary:u,matchers:o}){const d=new Set(s);return Object.entries(u).map(([i,[w,p,_]])=>{const{pattern:j,params:I}=it(i),b={id:i,exec: P=>{const D=j.exec(P);if(D)return ft(D,I,o)},errors:[1,..._||[]].map(P=>n[P]),layouts:[0,...p||[]].map(E),leaf:c(w)};return b.errors.length=b.layouts.length=Math.max(b.errors.length,b.layouts.length),b});function c(i){const w=i<0;return w&&(i=~i),[w,n[i]]}function E(i){return i===void 0?i:[d.has(i),n[i]]}}function Be(n){try{return JSON.parse(sessionStorage[n])}catch{}}function Me(n, s){const u=JSON.stringify(s);try{sessionStorage[n]=u}catch{}}const dt=-1,pt=-2,ht=-3,gt=-4,_t=-5,mt=-6;function wt(n, s){if(typeof n=="number")return d(n,!0);if(!Array.isArray(n)||n.length===0)throw new Error("Invalid input");const u=n,o=Array(u.length);function d(c, E=!1){if(c===dt)return;if(c===ht)return NaN;if(c===gt)return 1/0;if(c===_t)return-1/0;if(c===mt)return-0;if(E)throw new Error("Invalid input");if(c in o)return o[c];const i=u[c];if(!i||typeof i!="object")o[c]=i;else if(Array.isArray(i))if(typeof i[0]=="string"){const w=i[0],p=s?.[w];if(p)return o[c]=p(d(i[1]));switch(w){case"Date":o[c]=new Date(i[1]);break;case"Set":const _=new Set;o[c]=_;for(let b=1; b<i.length; b+=1)_.add(d(i[b]));break;case"Map":const j=new Map;o[c]=j;for(let b=1; b<i.length; b+=2)j.set(d(i[b]),d(i[b+1]));break;case"RegExp":o[c]=new RegExp(i[1],i[2]);break;case"Object":o[c]=Object(i[1]);break;case"BigInt":o[c]=BigInt(i[1]);break;case"null":const I=Object.create(null);o[c]=I;for(let b=1; b<i.length; b+=2)I[i[b]]=d(i[b+1]);break;default:throw new Error(`Unknown type ${w}`)}}else{const w=new Array(i.length);o[c]=w;for(let p=0; p<i.length; p+=1){const _=i[p];_!==pt&&(w[p]=d(_))}}else{const w={};o[c]=w;for(const p in i){const _=i[p];w[p]=d(_)}}return o[c]}return d(0)}function yt(n){return n.filter(s=>s!=null)}const Ge=new Set(["load","prerender","csr","ssr","trailingSlash","config"]);[...Ge];const vt=new Set([...Ge]);[...vt];async function bt(n){for(const s in n)if(typeof n[s]?.then=="function")return Object.fromEntries(await Promise.all(Object.entries(n).map(async([u,o])=>[u,await o])));return n}const Et="x-sveltekit-invalidated",St="x-sveltekit-trailing-slash",G=Be(Fe)??{},Z=Be(He)??{};function Ee(n){G[n]=Q()}function kt(n, s){const u=ut(n),o=n.nodes[0],d=n.nodes[1];o(),d();const c=document.documentElement,E=[],i=[];let w=null;const p={before_navigate:[],on_navigate:[],after_navigate:[]};let _={branch:[],error:null,url:null},j=!1,I=!1,b=!0,P=!1,D=!1,V=!1,H=!1,K,O=history.state?.[C];O||(O=Date.now(),history.replaceState({...history.state,[C]:O},"",location.href));const ue=G[O];ue&&(history.scrollRestoration="manual",scrollTo(ue.x,ue.y));let q,ne,J;async function Re(){if(J=J||Promise.resolve(),await J,!J)return;J=null;const e=new URL(location.href),t=Y(e,!0);w=null;const r=ne={},a=t&&await he(t);if(r===ne&&a){if(a.type==="redirect")return ae(new URL(a.location,e).href,{},[e.pathname],r);a.props.page!==void 0&&(q=a.props.page),K.$set(a.props)}}function Ae(e){i.some(t=>t?.snapshot)&&(Z[e]=i.map(t=>t?.snapshot?.capture()))}function Ie(e){Z[e]?.forEach((t, r)=>{i[r]?.snapshot?.restore(t)})}function Le(){Ee(O),Me(Fe,G),Ae(O),Me(He,Z)}async function ae(e, {noScroll:t=!1,replaceState:r=!1,keepFocus:a=!1,state:l={},invalidateAll:f=!1}, m, y){return typeof e=="string"&&(e=new URL(e,Te(document))),ie({url:e,scroll:t?Q():null,keepfocus:a,redirect_chain:m,details:{state:l,replaceState:r},nav_token:y,accepted:()=>{f&&(H=!0)},blocked:()=>{},type:"goto"})}async function Pe(e){return w={id:e.id,promise:he(e).then(t=>(t.type==="loaded"&&t.state.error&&(w=null),t))},w.promise}async function re(...e){const r=u.filter(a=>e.some(l=>a.exec(l))).map(a=>Promise.all([...a.layouts,a.leaf].map(l=>l?.[1]())));await Promise.all(r)}function Oe(e){_=e.state;const t=document.querySelector("style[data-sveltekit]");t&&t.remove(),q=e.props.page,K=new n.root({target:s,props:{...e.props,stores:F,components:i},hydrate:!0}),Ie(O);const r={from:null,to:{params:_.params,route:{id:_.route?.id??null},url:new URL(location.href)},willUnload:!1,type:"enter",complete:Promise.resolve()};p.after_navigate.forEach(a=>a(r)),I=!0}async function W({url:e,params:t,branch:r,status:a,error:l,route:f,form:m}){let y="never";for(const g of r)g?.slash!==void 0&&(y=g.slash);e.pathname=We(e.pathname,y),e.search=e.search;const S={type:"loaded",state:{url:e,params:t,branch:r,error:l,route:f},props:{constructors:yt(r).map(g=>g.node.component)}};m!==void 0&&(S.props.form=m);let v={},A=!q,h=0;for(let g=0; g<Math.max(r.length,_.branch.length); g+=1){const U=r[g],M=_.branch[g];U?.data!==M?.data&&(A=!0),U&&(v={...v,...U.data},A&&(S.props[`data_${h}`]=v),h+=1)}return(!_.url||e.href!==_.url.href||_.error!==l||m!==void 0&&m!==q.form||A)&&(S.props.page={error:l,params:t,route:{id:f?.id??null},status:a,url:new URL(e),form:m??null,data:A?v:q.data}),S}async function de({loader:e,parent:t,url:r,params:a,route:l,server_data_node:f}){let m=null;const y={dependencies:new Set,params:new Set,parent:!1,route:!1,url:!1},S=await e();if(S.universal?.load){let v=function(...h){for(const k of h){const{href:g}=new URL(k,r);y.dependencies.add(g)}};const A={route:new Proxy(l,{get:(h, k)=>(y.route=!0,h[k])}),params:new Proxy(a,{get:(h, k)=>(y.params.add(k),h[k])}),data:f?.data??null,url:Qe(r,()=>{y.url=!0}),async fetch(h, k){let g;h instanceof Request?(g=h.url,k={body:h.method==="GET"||h.method==="HEAD"?void 0:await h.blob(),cache:h.cache,credentials:h.credentials,headers:h.headers,integrity:h.integrity,keepalive:h.keepalive,method:h.method,mode:h.mode,redirect:h.redirect,referrer:h.referrer,referrerPolicy:h.referrerPolicy,signal:h.signal,...k}):g=h;const U=new URL(g,r);return v(U.href),U.origin===r.origin&&(g=U.href.slice(r.origin.length)),I?ot(g,U.href,k):rt(g,k)},setHeaders:()=>{},depends:v,parent(){return y.parent=!0,t()}};m=await S.universal.load.call(null,A)??null,m=m?await bt(m):null}return{node:S,loader:e,server:f,universal:S.universal?.load?{type:"data",data:m,uses:y}:null,data:m??f?.data??null,slash:S.universal?.trailingSlash??f?.slash}}function Ue(e, t, r, a, l){if(H)return!0;if(!a)return!1;if(a.parent&&e||a.route&&t||a.url&&r)return!0;for(const f of a.params)if(l[f]!==_.params[f])return!0;for(const f of a.dependencies)if(E.some(m=>m(new URL(f))))return!0;return!1}function pe(e, t){return e?.type==="data"?e:e?.type==="skip"?t??null:null}async function he({id:e,invalidating:t,url:r,params:a,route:l}){if(w?.id===e)return w.promise;const{errors:f,layouts:m,leaf:y}=l,S=[...m,y];f.forEach(R=>R?.().catch(()=>{})),S.forEach(R=>R?.[1]().catch(()=>{}));let v=null;const A=_.url?e!==_.url.pathname+_.url.search:!1,h=_.route?l.id!==_.route.id:!1;let k=!1;const g=S.map((R, N)=>{const $=_.branch[N],T=!!R?.[0]&&($?.loader!==R[1]||Ue(k,h,A,$.server?.uses,a));return T&&(k=!0),T});if(g.some(Boolean)){try{v=await Ve(r,g)}catch(R){return oe({status:R instanceof ee?R.status:500,error:await X(R,{url:r,params:a,route:{id:l.id}}),url:r,route:l})}if(v.type==="redirect")return v}const U=v?.nodes;let M=!1;const L=S.map(async(R, N)=>{if(!R)return;const $=_.branch[N],T=U?.[N];if((!T||T.type==="skip")&&R[1]===$?.loader&&!Ue(M,h,A,$.universal?.uses,a))return $;if(M=!0,T?.type==="error")throw T;return de({loader:R[1],url:r,params:a,route:l,parent:async()=>{const ge={};for(let _e=0; _e<N; _e+=1)Object.assign(ge,(await L[_e])?.data);return ge},server_data_node:pe(T===void 0&&R[0]?{type:"skip"}:T??null,R[0]?$?.server:void 0)})});for(const R of L)R.catch(()=>{});const x=[];for(let R=0; R<S.length; R+=1)if(S[R])try{x.push(await L[R])}catch(N){if(N instanceof Ce)return{type:"redirect",location:N.location};let $=500,T;if(U?.includes(N))$=N.status??$,T=N.error;else if(N instanceof ee)$=N.status,T=N.body;else{if(await F.updated.check())return await z(r);T=await X(N,{params:a,url:r,route:{id:l.id}})}const ce=await xe(R,x,f);return ce?await W({url:r,params:a,branch:x.slice(0,ce.idx).concat(ce.node),status:$,error:T,route:l}):await Ne(r,{id:l.id},T,$)}else x.push(void 0);return await W({url:r,params:a,branch:x,status:200,error:null,route:l,form:t?void 0:null})}async function xe(e, t, r){for(; e--;)if(r[e]){let a=e;for(; !t[a];)a-=1;try{return{idx:a+1,node:{node:await r[e](),loader:r[e],data:{},server:null,universal:null}}}catch{continue}}}async function oe({status:e,error:t,url:r,route:a}){const l={};let f=null;if(n.server_loads[0]===0)try{const v=await Ve(r,[!0]);if(v.type!=="data"||v.nodes[0]&&v.nodes[0].type!=="data")throw 0;f=v.nodes[0]??null}catch{(r.origin!==location.origin||r.pathname!==location.pathname||j)&&await z(r)}const y=await de({loader:o,url:r,params:l,route:a,parent:()=>Promise.resolve({}),server_data_node:pe(f)}),S={node:await d(),loader:d,universal:null,server:null,data:null};return await W({url:r,params:l,branch:[y,S],status:e,error:t,route:null})}function Y(e, t){if(ve(e,B))return;const r=se(e);for(const a of u){const l=a.exec(r);if(l)return{id:e.pathname+e.search,invalidating:t,route:a,params:Xe(l),url:e}}}function se(e){return Ye(e.pathname.slice(B.length)||"/")}function je({url:e,type:t,intent:r,delta:a}){let l=!1;const f=qe(_,r,e,t);a!==void 0&&(f.navigation.delta=a);const m={...f.navigation,cancel:()=>{l=!0,f.reject(new Error("navigation was cancelled"))}};return D||p.before_navigate.forEach(y=>y(m)),l?null:f}async function ie({url:e,scroll:t,keepfocus:r,redirect_chain:a,details:l,type:f,delta:m,nav_token:y={},accepted:S,blocked:v}){const A=Y(e,!1),h=je({url:e,type:f,delta:m,intent:A});if(!h){v();return}const k=O;S(),D=!0,I&&F.navigating.set(h.navigation),ne=y;let g=A&&await he(A);if(!g){if(ve(e,B))return await z(e);g=await Ne(e,{id:null},await X(new Error(`Not found: ${e.pathname}`),{url:e,params:{},route:{id:null}}),404)}if(e=A?.url||e,ne!==y)return h.reject(new Error("navigation was aborted")),!1;if(g.type==="redirect")if(a.length>10||a.includes(e.pathname))g=await oe({status:500,error:await X(new Error("Redirect loop"),{url:e,params:{},route:{id:null}}),url:e,route:{id:null}});else return ae(new URL(g.location,e).href,{},[...a,e.pathname],y),!1;else g.props.page?.status>=400&&await F.updated.check()&&await z(e);if(E.length=0,H=!1,P=!0,Ee(k),Ae(k),g.props.page?.url&&g.props.page.url.pathname!==e.pathname&&(e.pathname=g.props.page?.url.pathname),l){const L=l.replaceState?0:1;if(l.state[C]=O+=L,history[l.replaceState?"replaceState":"pushState"](l.state,"",e),!l.replaceState){let x=O+1;for(; Z[x]||G[x];)delete Z[x],delete G[x],x+=1}}if(w=null,I){_=g.state,g.props.page&&(g.props.page.url=e);const L=(await Promise.all(p.on_navigate.map(x=>x(h.navigation)))).filter(x=>typeof x=="function");if(L.length>0){let x=function(){p.after_navigate=p.after_navigate.filter(R=>!L.includes(R))};L.push(x),p.after_navigate.push(...L)}K.$set(g.props)}else Oe(g);const{activeElement:U}=document;if(await we(),b){const L=e.hash&&document.getElementById(decodeURIComponent(e.hash.slice(1)));t?scrollTo(t.x,t.y):L?L.scrollIntoView():scrollTo(0,0)}const M=document.activeElement!==U&&document.activeElement!==document.body;!r&&!M&&Se(),b=!0,g.props.page&&(q=g.props.page),D=!1,f==="popstate"&&Ie(O),h.fulfil(void 0),p.after_navigate.forEach(L=>L(h.navigation)),F.navigating.set(null),P=!1}async function Ne(e, t, r, a){return e.origin===location.origin&&e.pathname===location.pathname&&!j?await oe({status:a,error:r,url:e,route:t}):await z(e)}function z(e){return location.href=e.href,new Promise(()=>{})}function ze(){let e;c.addEventListener("mousemove", f=>{const m=f.target;clearTimeout(e),e=setTimeout(()=>{a(m,2)},20)});function t(f){a(f.composedPath()[0],1)}c.addEventListener("mousedown",t),c.addEventListener("touchstart",t,{passive:!0});const r=new IntersectionObserver(f=>{for(const m of f)m.isIntersecting&&(re(se(new URL(m.target.href))),r.unobserve(m.target))},{threshold:0});function a(f, m){const y=$e(f,c);if(!y)return;const{url:S,external:v,download:A}=ye(y,B);if(v||A)return;const h=le(y);if(!h.reload)if(m<=h.preload_data){const k=Y(S,!1);k&&Pe(k)}else m<=h.preload_code&&re(se(S))}function l(){r.disconnect();for(const f of c.querySelectorAll("a")){const{url:m,external:y,download:S}=ye(f,B);if(y||S)continue;const v=le(f);v.reload||(v.preload_code===De.viewport&&r.observe(f),v.preload_code===De.eager&&re(se(m)))}}p.after_navigate.push(l),l()}function X(e, t){return e instanceof ee?e.body:n.hooks.handleError({error:e,event:t})??{message:t.route.id!=null?"Internal Error":"Not Found"}}return{after_navigate: e=>{me(()=>(p.after_navigate.push(e),()=>{const t=p.after_navigate.indexOf(e);p.after_navigate.splice(t,1)}))},before_navigate: e=>{me(()=>(p.before_navigate.push(e),()=>{const t=p.before_navigate.indexOf(e);p.before_navigate.splice(t,1)}))},on_navigate: e=>{me(()=>(p.on_navigate.push(e),()=>{const t=p.on_navigate.indexOf(e);p.on_navigate.splice(t,1)}))},disable_scroll_handling:()=>{(P||!I)&&(b=!1)},goto:(e, t={})=>ae(e,t,[]),invalidate: e=>{if(typeof e=="function")E.push(e);else{const{href:t}=new URL(e,location.href);E.push(r=>r.href===t)}return Re()},invalidate_all:()=>(H=!0,Re()),preload_data:async e=>{const t=new URL(e,Te(document)),r=Y(t,!1);if(!r)throw new Error(`Attempted to preload a URL that does not belong to this app: ${t}`);await Pe(r)},preload_code:re,apply_action:async e=>{if(e.type==="error"){const t=new URL(location.href),{branch:r,route:a}=_;if(!a)return;const l=await xe(_.branch.length,r,a.errors);if(l){const f=await W({url:t,params:_.params,branch:r.slice(0,l.idx).concat(l.node),status:e.status??500,error:e.error,route:a});_=f.state,K.$set(f.props),we().then(Se)}}else e.type==="redirect"?ae(e.location,{invalidateAll:!0},[]):(K.$set({form:null,page:{...q,form:e.data,status:e.status}}),await we(),K.$set({form:e.data}),e.type==="success"&&Se())},_start_router:()=>{history.scrollRestoration="manual",addEventListener("beforeunload", t=>{let r=!1;if(Le(),!D){const a=qe(_,void 0,null,"leave"),l={...a.navigation,cancel:()=>{r=!0,a.reject(new Error("navigation was cancelled"))}};p.before_navigate.forEach(f=>f(l))}r?(t.preventDefault(),t.returnValue=""):history.scrollRestoration="auto"}),addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&Le()}),navigator.connection?.saveData||ze(),c.addEventListener("click", t=>{if(t.button||t.which!==1||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey||t.defaultPrevented)return;const r=$e(t.composedPath()[0],c);if(!r)return;const{url:a,external:l,target:f,download:m}=ye(r,B);if(!a)return;if(f==="_parent"||f==="_top"){if(window.parent!==window)return}else if(f&&f!=="_self")return;const y=le(r);if(!(r instanceof SVGAElement)&&a.protocol!==location.protocol&&!(a.protocol==="https:"||a.protocol==="http:")||m)return;if(l||y.reload){je({url:a,type:"link"})?D=!0:t.preventDefault();return}const[v,A]=a.href.split("#");if(A!==void 0&&v===location.href.split("#")[0]){if(_.url.hash===a.hash){t.preventDefault(),r.ownerDocument.getElementById(A)?.scrollIntoView();return}if(V=!0,Ee(O),e(a),!y.replace_state)return;V=!1,t.preventDefault()}ie({url:a,scroll:y.noscroll?Q():null,keepfocus:y.keep_focus??!1,redirect_chain:[],details:{state:{},replaceState:y.replace_state??a.href===location.href},accepted:()=>t.preventDefault(),blocked:()=>t.preventDefault(),type:"link"})}),c.addEventListener("submit", t=>{if(t.defaultPrevented)return;const r=HTMLFormElement.prototype.cloneNode.call(t.target),a=t.submitter;if((a?.formMethod||r.method)!=="get")return;const f=new URL(a?.hasAttribute("formaction")&&a?.formAction||r.action);if(ve(f,B))return;const m=t.target,{keep_focus:y,noscroll:S,reload:v,replace_state:A}=le(m);if(v)return;t.preventDefault(),t.stopPropagation();const h=new FormData(m),k=a?.getAttribute("name");k&&h.append(k,a?.getAttribute("value")??""),f.search=new URLSearchParams(h).toString(),ie({url:f,scroll:S?Q():null,keepfocus:y??!1,redirect_chain:[],details:{state:{},replaceState:A??f.href===location.href},nav_token:{},accepted:()=>{},blocked:()=>{},type:"form"})}),addEventListener("popstate",async t=>{if(t.state?.[C]){if(t.state[C]===O)return;const r=G[t.state[C]];if(_.url.href.split("#")[0]===location.href.split("#")[0]){G[O]=Q(),O=t.state[C],scrollTo(r.x,r.y);return}const a=t.state[C]-O;await ie({url:new URL(location.href),scroll:r,keepfocus:!1,redirect_chain:[],details:null,accepted:()=>{O=t.state[C]},blocked:()=>{history.go(-a)},type:"popstate",delta:a})}else if(!V){const r=new URL(location.href);e(r)}}),addEventListener("hashchange",()=>{V&&(V=!1,history.replaceState({...history.state,[C]:++O},"",location.href))});for(const t of document.querySelectorAll("link"))t.rel==="icon"&&(t.href=t.href);addEventListener("pageshow", t=>{t.persisted&&F.navigating.set(null)});function e(t){_.url=t,F.page.set({...q,url:t}),F.page.notify()}},_hydrate:async({status:e=200,error:t,node_ids:r,params:a,route:l,data:f,form:m})=>{j=!0;const y=new URL(location.href);({params:a={},route:l={id:null}}=Y(y,!1)||{});let S;try{const v=r.map(async(k, g)=>{const U=f[g];return U?.uses&&(U.uses=Ke(U.uses)),de({loader:n.nodes[k],url:y,params:a,route:l,parent:async()=>{const M={};for(let L=0; L<g; L+=1)Object.assign(M,(await v[L]).data);return M},server_data_node:pe(U)})}),A=await Promise.all(v),h=u.find(({id:k})=>k===l.id);if(h){const k=h.layouts;for(let g=0; g<k.length; g++)k[g]||A.splice(g,0,void 0)}S=await W({url:y,params:a,branch:A,status:e,error:t,form:m,route:h??null})}catch(v){if(v instanceof Ce){await z(new URL(v.location,location.href));return}S=await oe({status:v instanceof ee?v.status:500,error:await X(v,{url:y,params:a,route:l}),url:y,route:l})}Oe(S)}}}async function Ve(n, s){const u=new URL(n);u.pathname=nt(n.pathname),n.pathname.endsWith("/")&&u.searchParams.append(St,"1"),u.searchParams.append(Et,s.map(d=>d?"1":"0").join(""));const o=await fe(u.href);if(!o.ok)throw new ee(o.status,await o.json());return new Promise(async d=>{const c=new Map,E=o.body.getReader(),i=new TextDecoder;function w(_){return wt(_,{Promise: j=>new Promise((I, b)=>{c.set(j,{fulfil:I,reject:b})})})}let p="";for(;;){const{done:_,value:j}=await E.read();if(_&&!p)break;for(p+=!j&&p?`
`:i.decode(j);;){const I=p.indexOf(`
`);if(I===-1)break;const b=JSON.parse(p.slice(0,I));if(p=p.slice(I+1),b.type==="redirect")return d(b);if(b.type==="data")b.nodes?.forEach(P=>{P?.type==="data"&&(P.uses=Ke(P.uses),P.data=w(P.data))}),d(b);else if(b.type==="chunk"){const{id:P,data:D,error:V}=b,H=c.get(P);c.delete(P),V?H.reject(w(V)):H.fulfil(w(D))}}}})}function Ke(n){return{dependencies:new Set(n?.dependencies??[]),params:new Set(n?.params??[]),parent:!!n?.parent,route:!!n?.route,url:!!n?.url}}function Se(){const n=document.querySelector("[autofocus]");if(n)n.focus();else{const s=document.body,u=s.getAttribute("tabindex");s.tabIndex=-1,s.focus({preventScroll:!0,focusVisible:!1}),u!==null?s.setAttribute("tabindex",u):s.removeAttribute("tabindex");const o=getSelection();if(o&&o.type!=="None"){const d=[];for(let c=0;c<o.rangeCount;c+=1)d.push(o.getRangeAt(c));setTimeout(()=>{if(o.rangeCount===d.length){for(let c=0;c<o.rangeCount;c+=1){const E=d[c],i=o.getRangeAt(c);if(E.commonAncestorContainer!==i.commonAncestorContainer||E.startContainer!==i.startContainer||E.endContainer!==i.endContainer||E.startOffset!==i.startOffset||E.endOffset!==i.endOffset)return}o.removeAllRanges()}})}}}function qe(n,s,u,o){let d,c;const E=new Promise((w,p)=>{d=w,c=p});return E.catch(()=>{}),{navigation:{from:{params:n.params,route:{id:n.route?.id??null},url:n.url},to:u&&{params:s?.params??null,route:{id:s?.route?.id??null},url:u},willUnload:!s,type:o,complete:E},fulfil:d,reject:c}}async function Lt(n,s,u){const o=kt(n,s);Je({client:o}),u?await o._hydrate(u):o.goto(location.href,{replaceState:!0}),o._start_router()}export{Lt as start};
