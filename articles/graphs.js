// PRNG
PRNG=(seed,S=Uint32Array.of(9,7,5,3),R=(a=1)=>a*(a=S[3],S[3]=S[2],S[2]=S[1],a^=a<<11,S[0]^=a^a>>>8^(S[1]=S[0])>>>19,S[0]/2**32))=>([...seed+'WArp-zoNE'].map(c=>R(S[3]^=c.charCodeAt()*S[0])),R);
PRNG_seed='randomseed'+Date.now();
R=PRNG(PRNG_seed);
RA=a=>a[R(a.length)|0]; //random item from array
RS=(a=1)=>R()<.5?-a:a; // random sign
T=a=>R(a)-R(a); // triangle noise
C=(a=.5)=>R()<a?1:0; // coin
P=a=>R(R(a)); // random random
I=a=>R(a)|0; // integer range

// Math defs
({sin,cos,min,max,abs,floor,round,PI,exp,expm1,sign,sqrt,log,log10,log2,log1p}=Math);
TAU=PI*2;PHI=.5+.5*5**.5;
F=(N,f)=>[...Array(N)].map((_,i)=>f(i)); // for loop / map / list function
qphi=d=>(s=2,F(32,i=>{s=(1+s)**(1/(d+1))}),F(d,i=>s**(i-d))); // quasirandom constant generator
FR=fract=x=>x-floor(x); // fractional part of x / sawtooth wave
B=abs,G=max,U=min;
TR=x=>abs(x-floor(x/4)*4-2)-1; // triangle wave
mix=(a,b,p)=>a+(b-a)*p;
mod=(x,m)=>(x%=m,x<0?x+m:x);
cl=(x,a,b)=>x<a?a:x>b?b:x; // clamp
SM=(a,b,x)=>(x-=a,x/=b-a)<0?0:x>1?1:x*x*(3-2*x); // smoothstep
sB=(x,p)=>(x*x+p)**.5; // smooth abs
shuf=a=>(a.map((j,i)=>[a[i],a[j]]=[a[j=i+R(a.length-i)|0],a[i]]),a); // Fisher Yates shuffle

// main or something
idx=0;
document.querySelectorAll('p.live code').forEach(e=>{
  let cfg=e.parentNode.graphs_cfg={ // defaults
    xlim:[-4,4],
    ylim:[-1,1],
    flim:[-1,1],
    ts:1,
    bgcol:'#000',
    fgcol:'#fff',
    tickcol:'#444',
    aspect:1/4,
    grid_res:72,
    yticks:[-1,0,1],
    xticks:[0],
    running:1,
    idx:idx++,
  }
  let [cfg1,fn]=Function('return '+e.innerText)();
  Object.assign(cfg, cfg1);
  cfg.fn=fn;

  let P=e.parentNode;
  let V=cfg.V=document.createElement('canvas');
  let FN=cfg.FN=document.createElement('input');
  FN.type='text';
  let fnstr=FN.value=fn.toString();
  FN.onchange=e=>fn=Function('return '+(fnstr=FN.value))();

  e.remove();
  P.append(V,FN);
  let C=V.getContext`2d`;
  let w=cfg.w=V.width=V.scrollWidth*devicePixelRatio |0;
  let h=cfg.h=V.height=V.scrollWidth*devicePixelRatio*cfg.aspect |0;

  let out_of_view=_=>{
    let b=V.getBoundingClientRect();
    return b.bottom<0 || b.top>innerHeight || document.visibilityState=='hidden';
  }

  let draw_1D = _=>{
    if (!cfg.running || out_of_view()) return;
    C.fillStyle = cfg.bgcol;
    C.fillRect(0,0,w,h);
    let t = cfg.ts * performance.now() / 1000;
    let [x0,xa] = cfg.xlim; xa-=x0;
    let [y0,ya] = cfg.ylim; ya-=y0;
    let lw = C.lineWidth = 3 * devicePixelRatio;
    let ys = (h-lw*2)/ya;
    C.fillStyle = cfg.tickcol;
    cfg.xticks.map(x=>C.fillRect((x-x0)*w/xa,0,lw/2,h));
    cfg.yticks.map(y=>C.fillRect(0,(y-y0)*ys+lw,w,lw/2));
    C.strokeStyle = cfg.fgcol;
    C.beginPath();
    for(let i=-lw;i<w+lw;i++) {
      let x = x0 + xa * i / w;
      let y = fn(x,t);
      C.lineTo(i, (y-y0)*ys+lw);
    }            
    C.stroke();
  }

  let draw_2D = _=>{
    if (!cfg.running || out_of_view()) return;
    C.fillStyle = cfg.bgcol;
    C.fillRect(0,0,w,h);

    let t = cfg.ts * performance.now() / 1000;
    let [x0,xa] = cfg.xlim; xa-=x0;
    let [y0,ya] = cfg.ylim; ya-=y0;
    let [f0,fa] = cfg.flim; fa-=f0;

    C.fillStyle = cfg.fgcol;
    let N=cfg.grid_res, M=N*cfg.aspect|0;
    for (let j=0; j<M; j++) {
      for (let i=0; i<N; i++) {
        let fi=(i+.5)/N, fj=(j+.5)/M;
        let x=x0+xa*fi, y=y0+ya*fj;
        let f=(fn(x,y,t)-f0)/fa;
        let rx=w*fi,ry=h*fj;
        f*=.49*w/N;
        C.fillRect(rx-f,ry-f,f*2,f*2);
      }
    }
  }

  // let draw=_=>0;
  // if (draw_1D;

  let k=_=>{
    if(fnstr.startsWith('(x,t)=>'))draw_1D();
    if(fnstr.startsWith('(x,y,t)=>'))draw_2D();
    requestAnimationFrame(k);
  }
  k();

  // onkeyup=({key:k})=>{
  //   if(k==' ')running^=1;
  // };
  V.onclick=_=>cfg.running^=1;
});
