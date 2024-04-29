import{t as s}from"./Action.7fea7c9d.js";const n=(o,r)=>{let e,t;const i=s(o,{interactive:!0,trigger:"click",onShow(p){t=p.popper.querySelector(".tippy-content"),t.classList.add("active"),e??=new r({target:t})},onHidden(){e?.$destroy(),t?.classList.remove("active"),e=void 0}});return{destroy(){i.destroy()}}};export{n as p};
//# sourceMappingURL=popup.1e88f5bf.js.map
