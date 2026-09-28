/* TABBOOK · 将此脚本放在页面 body 开头加载。
 * 无依赖。默认等待 window.load，最短展示 2.2 秒，8 秒兜底退出。
 * 手动控制：提前设置 window.TABBOOK_MANUAL = true，然后调用 window.tabbookLoader.finish()。
 */
(() => {
  'use strict';
  if (customElements.get('tabbook-intro')) return;
  class TabBookIntro extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const root = this.attachShadow({mode: 'open'});
      root.innerHTML = `
      <style>
        :host{position:fixed;inset:0;z-index:2147483646;display:block;contain:layout style;color:#fff}
        :host([contained]){position:absolute}
        .curtain{position:absolute;inset:0;background:#080808;display:grid;place-items:center;overflow:hidden}
        .mark{width:clamp(210px,34vw,320px);overflow:visible;transform:translateY(0)}
        path,circle{fill:none;stroke:currentColor;stroke-width:6;stroke-linecap:round;stroke-linejoin:round}
        .letter{stroke-dasharray:1;stroke-dashoffset:1}
        .track{position:absolute;bottom:34px;left:50%;width:96px;height:2px;background:#ffffff24;transform:translateX(-50%)}
        .fill{width:100%;height:100%;background:#fff;transform:scaleX(0);transform-origin:left}
        .label{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
      </style>
      <div class="curtain" role="status" aria-label="TabBook，正在载入">
        <svg class="mark" viewBox="0 0 432 116" aria-hidden="true">
          <path class="letter" pathLength="1" d="M16 20 H64 M40 20 V96"/>
          <path class="letter" pathLength="1" d="M120 74 A20 22 0 1 0 80 74 A20 22 0 1 0 120 74 M120 52 V96"/>
          <path class="letter" pathLength="1" d="M140 20 V96 M140 74 A20 22 0 1 1 180 74 A20 22 0 1 1 140 74"/>
          <path class="letter" pathLength="1" d="M204 96 V20 H226 C251 20 251 56 226 56 H204 M226 56 C254 56 254 96 226 96 H204"/>
          <path class="letter" pathLength="1" d="M286 52 A20 22 0 1 1 286 96 A20 22 0 1 1 286 52"/>
          <path class="letter" pathLength="1" d="M344 52 A20 22 0 1 1 344 96 A20 22 0 1 1 344 52"/>
          <path class="letter" pathLength="1" d="M384 20 V96 M416 52 L384 77 M394 69 L416 96"/>
        </svg>
        <div class="track" aria-hidden="true"><div class="fill"></div></div>
        <span class="label">正在打开</span>
      </div>`;
      this.started = performance.now();
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const q = s => root.querySelector(s);
      const animate = (s, frames, duration, delay=0) => q(s).animate(frames, {duration,delay,fill:'forwards',easing:'cubic-bezier(.22,1,.36,1)'});
      if (this.reduced) {
        root.querySelectorAll('.letter').forEach(letter=>letter.style.strokeDashoffset='0');
        q('.fill').style.transform='scaleX(1)';
      } else {
        root.querySelectorAll('.letter').forEach((letter,index)=>{
          letter.animate([{strokeDashoffset:1},{strokeDashoffset:0}],{
            duration:850,delay:120+index*105,fill:'forwards',easing:'cubic-bezier(.4,0,.2,1)'
          });
        });
        animate('.mark', [{transform:'scale(.96)'},{transform:'scale(1)'}],1500,100);
        this.progressFrame=requestAnimationFrame(t=>this.drawProgress(t));
      }
      this.fallback = setTimeout(()=>this.finish(),8000);
      if (!this.hasAttribute('manual')) {
        this.onLoad=()=>this.finish();
        if (document.readyState === 'complete') this.finish();
        else window.addEventListener('load',this.onLoad,{once:true});
      }
    }
    loadingProgress(t) {
      const x=Math.max(0,t)/900;
      return {value:.92*(1-(1+x)*Math.exp(-x)),velocity:.92*x*Math.exp(-x)/900};
    }
    drawProgress(now) {
      if (!this.isConnected) return;
      let value;
      if (this.completion) {
        const c=this.completion;
        const u=Math.min(1,Math.max(0,(now-c.start)/c.duration));
        const tangent=Math.min(c.velocity*c.duration,3*(1-c.value));
        value=(2*u*u*u-3*u*u+1)*c.value+(u*u*u-2*u*u+u)*tangent+(-2*u*u*u+3*u*u);
        if (u===1) {this.shadowRoot.querySelector('.fill').style.transform='scaleX(1)';c.resolve();return;}
      } else value=this.loadingProgress(now-this.started).value;
      this.shadowRoot.querySelector('.fill').style.transform='scaleX('+value+')';
      this.progressFrame=requestAnimationFrame(t=>this.drawProgress(t));
    }
    async finish() {
      if (this.finishing) return;
      this.finishing=true;
      clearTimeout(this.fallback);
      const root=this.shadowRoot;
      if (!this.reduced) {
        const now=performance.now();
        const state=this.loadingProgress(now-this.started);
        await new Promise(resolve=>{this.completion={...state,start:now,duration:Math.max(600,2200-(now-this.started)),resolve};});
        if (!this.isConnected) return;
        root.querySelector('.mark').animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-20px)'}],{duration:360,fill:'forwards',easing:'ease-in'});
        await root.querySelector('.curtain').animate([{transform:'translateY(0)'},{transform:'translateY(-100%)'}],{duration:800,delay:140,fill:'forwards',easing:'cubic-bezier(.76,0,.24,1)'}).finished;
      } else {
        await new Promise(resolve=>this.delay=setTimeout(resolve,150));
      }
      this.dispatchEvent(new CustomEvent('tabbook:complete',{bubbles:true,composed:true}));
      this.remove();
    }
    disconnectedCallback(){cancelAnimationFrame(this.progressFrame);this.completion?.resolve();clearTimeout(this.fallback);clearTimeout(this.delay);window.removeEventListener('load',this.onLoad)}
  }
  customElements.define('tabbook-intro',TabBookIntro);
  if (!window.TABBOOK_NO_AUTO) {
    const mount=()=>{
      const intro=document.createElement('tabbook-intro');
      if (window.TABBOOK_MANUAL) intro.setAttribute('manual','');
      window.tabbookLoader=intro;
      document.body.appendChild(intro);
    };
    if(document.body) mount(); else document.addEventListener('DOMContentLoaded',mount,{once:true});
  }
})();
