import{n as x,X as q,f as V,Y as H,r as E,p as P,D as O,Z as J,G as D,_ as L,b as K,P as Q,$ as T,a0 as W,a1 as tt,O as U,a2 as et,a3 as nt,a4 as it,a5 as st,a6 as rt}from"./scheduler.CXEVs2ap.js";const X=typeof window<"u";let I=X?()=>window.performance.now():()=>Date.now(),N=X?t=>requestAnimationFrame(t):x;const k=new Set;function Y(t){k.forEach(e=>{e.c(t)||(k.delete(e),e.f())}),k.size!==0&&N(Y)}function B(t){let e;return k.size===0&&N(Y),{promise:new Promise(n=>{k.add(e={c:t,f:n})}),abort(){k.delete(e)}}}const M=new Map;let R=0;function at(t){let e=5381,n=t.length;for(;n--;)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}function ot(t,e){const n={stylesheet:H(e),rules:{}};return M.set(t,n),n}function z(t,e,n,r,u,a,l,i=0){const c=16.666/r;let s=`{
`;for(let $=0;$<=1;$+=c){const g=e+(n-e)*a($);s+=$*100+`%{${l(g,1-g)}}
`}const _=s+`100% {${l(n,1-n)}}
}`,f=`__svelte_${at(_)}_${i}`,m=q(t),{stylesheet:h,rules:o}=M.get(m)||ot(m,t);o[f]||(o[f]=!0,h.insertRule(`@keyframes ${f} ${_}`,h.cssRules.length));const d=t.style.animation||"";return t.style.animation=`${d?`${d}, `:""}${f} ${r}ms linear ${u}ms 1 both`,R+=1,f}function A(t,e){const n=(t.style.animation||"").split(", "),r=n.filter(e?a=>a.indexOf(e)<0:a=>a.indexOf("__svelte")===-1),u=n.length-r.length;u&&(t.style.animation=r.join(", "),R-=u,R||ft())}function ft(){N(()=>{R||(M.forEach(t=>{const{ownerNode:e}=t.stylesheet;e&&V(e)}),M.clear())})}let S;function F(){return S||(S=Promise.resolve(),S.then(()=>{S=null})),S}function w(t,e,n){t.dispatchEvent(J(`${e?"intro":"outro"}${n}`))}const C=new Set;let p;function ht(){p={r:0,c:[],p}}function mt(){p.r||E(p.c),p=p.p}function ut(t,e){t&&t.i&&(C.delete(t),t.i(e))}function gt(t,e,n,r){if(t&&t.o){if(C.has(t))return;C.add(t),p.c.push(()=>{C.delete(t),r&&(n&&t.d(1),r())}),t.o(e)}else r&&r()}const G={duration:0};function pt(t,e,n){const r={direction:"in"};let u=e(t,n,r),a=!1,l,i,c=0;function s(){l&&A(t,l)}function _(){const{delay:m=0,duration:h=300,easing:o=D,tick:d=x,css:$}=u||G;$&&(l=z(t,0,1,h,m,o,$,c++)),d(0,1);const g=I()+m,y=g+h;i&&i.abort(),a=!0,O(()=>w(t,!0,"start")),i=B(v=>{if(a){if(v>=y)return d(1,0),w(t,!0,"end"),s(),a=!1;if(v>=g){const b=o((v-g)/h);d(b,1-b)}}return a})}let f=!1;return{start(){f||(f=!0,A(t),P(u)?(u=u(r),F().then(_)):_())},invalidate(){f=!1},end(){a&&(s(),a=!1)}}}function yt(t,e,n){const r={direction:"out"};let u=e(t,n,r),a=!0,l;const i=p;i.r+=1;let c;function s(){const{delay:_=0,duration:f=300,easing:m=D,tick:h=x,css:o}=u||G;o&&(l=z(t,1,0,f,_,m,o));const d=I()+_,$=d+f;O(()=>w(t,!1,"start")),"inert"in t&&(c=t.inert,t.inert=!0),B(g=>{if(a){if(g>=$)return h(0,1),w(t,!1,"end"),--i.r||E(i.c),!1;if(g>=d){const y=m((g-d)/f);h(1-y,y)}}return a})}return P(u)?F().then(()=>{u=u(r),s()}):s(),{end(_){_&&"inert"in t&&(t.inert=c),_&&u.tick&&u.tick(1,0),a&&(l&&A(t,l),a=!1)}}}function vt(t,e,n,r){let a=e(t,n,{direction:"both"}),l=r?0:1,i=null,c=null,s=null,_;function f(){s&&A(t,s)}function m(o,d){const $=o.b-l;return d*=Math.abs($),{a:l,b:o.b,d:$,duration:d,start:o.start,end:o.start+d,group:o.group}}function h(o){const{delay:d=0,duration:$=300,easing:g=D,tick:y=x,css:v}=a||G,b={start:I()+d,b:o};o||(b.group=p,p.r+=1),"inert"in t&&(o?_!==void 0&&(t.inert=_):(_=t.inert,t.inert=!0)),i||c?c=b:(v&&(f(),s=z(t,l,o,$,d,g,v)),o&&y(0,1),i=m(b,$),O(()=>w(t,o,"start")),B(j=>{if(c&&j>c.start&&(i=m(c,$),c=null,w(t,i.b,"start"),v&&(f(),s=z(t,l,i.b,i.duration,0,g,a.css))),i){if(j>=i.end)y(l=i.b,1-l),w(t,i.b,"end"),c||(i.b?f():--i.group.r||E(i.group.c)),i=null;else if(j>=i.start){const Z=j-i.start;l=i.a+i.d*g(Z/i.duration),y(l,1-l)}}return!!(i||c)}))}return{run(o){P(a)?F().then(()=>{a=a({direction:o?"in":"out"}),h(o)}):h(o)},end(){f(),i=c=null}}}function wt(t){t&&t.c()}function xt(t,e){t&&t.l(e)}function lt(t,e,n){const{fragment:r,after_update:u}=t.$$;r&&r.m(e,n),O(()=>{const a=t.$$.on_mount.map(et).filter(P);t.$$.on_destroy?t.$$.on_destroy.push(...a):E(a),t.$$.on_mount=[]}),u.forEach(O)}function ct(t,e){const n=t.$$;n.fragment!==null&&(W(n.after_update),E(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function _t(t,e){t.$$.dirty[0]===-1&&(nt.push(t),it(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function bt(t,e,n,r,u,a,l=null,i=[-1]){const c=tt;U(t);const s=t.$$={fragment:null,ctx:[],props:a,update:x,not_equal:u,bound:L(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(e.context||(c?c.$$.context:[])),callbacks:L(),dirty:i,skip_bound:!1,root:e.target||c.$$.root};l&&l(s.root);let _=!1;if(s.ctx=n?n(t,e.props||{},(f,m,...h)=>{const o=h.length?h[0]:m;return s.ctx&&u(s.ctx[f],s.ctx[f]=o)&&(!s.skip_bound&&s.bound[f]&&s.bound[f](o),_&&_t(t,f)),m}):[],s.update(),_=!0,E(s.before_update),s.fragment=r?r(s.ctx):!1,e.target){if(e.hydrate){st();const f=K(e.target);s.fragment&&s.fragment.l(f),f.forEach(V)}else s.fragment&&s.fragment.c();e.intro&&ut(t.$$.fragment),lt(t,e.target,e.anchor),rt(),Q()}U(c)}class kt{$$=void 0;$$set=void 0;$destroy(){ct(this,1),this.$destroy=x}$on(e,n){if(!P(n))return x;const r=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return r.push(n),()=>{const u=r.indexOf(n);u!==-1&&r.splice(u,1)}}$set(e){this.$$set&&!T(e)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}const dt="4";typeof window<"u"&&(window.__svelte||(window.__svelte={v:new Set})).v.add(dt);export{kt as S,ut as a,pt as b,mt as c,yt as d,wt as e,xt as f,ht as g,ct as h,bt as i,vt as j,lt as m,gt as t};
//# sourceMappingURL=index.CTdcniaS.js.map
