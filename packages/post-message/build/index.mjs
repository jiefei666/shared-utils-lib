var r=class{_events;constructor(){this._events=new Map}off(e,n){let s=this._events.get(e);s&&(n?s.delete(n):Array.from(s).forEach(t=>s.delete(t)))}offAll(){for(let e of this._events.keys())this.off(e)}on(e,n){let s=this._events.get(e);return s||this._events.set(e,s=new Set),s.add(n),this}trigger(e,n){let s=this._events.get(e);if(s)return Promise.all(Array.from(s).map(t=>t(n)))}listen(e){for(let n in e)this.on(n,e[n]);return this}};var g=(...o)=>console.warn("PostMessage Warn:",...o),p=o=>!!(o&&(o!=null&&o.then));var c=class extends r{target;options;exposes;messageListener;constructor(e,n){super(),this.target=e,this.options=n||{},this.exposes=new Set,this.on("onAddExpose",s=>{s.forEach(t=>{this.exposes.has(t)&&g(`The method: ${t} already exists. Please modify the name, otherwise it will be overwritten`),this.exposes.add(t)})}),this.messageListener=s=>{let t=s.data;if(t&&(!this.options.filterSources||Array.isArray(this.options.filterSources)&&this.options.filterSources.length&&t.source&&this.options.filterSources.includes(t.source))){console.log("message",t,this._events,this.exposes);let{type:i,data:a}=t;this.trigger(i,a)}},e.addEventListener("message",this.messageListener,!1)}removeAllListeners(){this.offAll(),this.target.removeEventListener("message",this.messageListener)}send(e,n,s){let t=s||this.target,i={type:e,data:n,source:this.options.name};t.postMessage(i,"*")}expose(e,n){if(toString.call(e)!=="[object Object]"){console.log("expose accept a object");return}let s=Object.keys(e);this.send("onAddExpose",s,n),s.forEach(t=>{this.off(t),this.on(t,async i=>{let a=e[t],h;if(typeof a=="function"){let f=a(i);p(f)?h=await f:h=f}else h=a;this.send(t,h,n)})})}hasExpose(e){return this.exposes.has(e)}invoke(e,n,s){if(this.hasExpose(e))return new Promise(t=>{this.off(e),this.on(e,i=>{t(i)}),this.send(e,n,s)})}};export{r as Emitter,c as PostMessage};
//# sourceMappingURL=index.mjs.map