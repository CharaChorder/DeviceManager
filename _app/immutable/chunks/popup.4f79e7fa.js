import{t as s}from"./os-layout.1aaea2c5.js";const n=(o,r)=>{let e,t;const i=s(o,{interactive:!0,trigger:"click",onShow(p){t=p.popper.querySelector(".tippy-content"),t.classList.add("active"),e??=new r({target:t})},onHidden(){e?.$destroy(),t?.classList.remove("active"),e=void 0}});return{destroy(){i.destroy()}}};export{n as p};
//# sourceMappingURL=popup.4f79e7fa.js.map
