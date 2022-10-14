(code=({copyright:piterpasma,max,floor:K,abs,sin,cos,min}=Math)=>{
  // INDUSTRIAL DEVOLUTION (c) 2022 by Piter Pasma
  //
  // inverted version
  //
  // featuring some comments and white space
  
  // get options from URL
  O={lw:.4,d:.8,h:420,bg:1}; // default options
  (new(U=URLSearchParams)(location.search)).forEach((v,k)=>O[k]=v);
  fxhash = O.fxhash || fxhash;

  // init PRNG
  S=Uint32Array.from([n=9,t=7,5,3]);
  R=(a=1)=>a*(t=S[3],S[3]=S[2],S[2]=S[1],S[1]=n=S[0],t^=t<<11,S[0]^=(t^t>>>8)^(n>>>19),S[0]/2**32);
  [...fxhash+'SOURCERY'].map(c=>R(S[3]^=c.charCodeAt()*23205));

  // maaaaaath
  T=a=>R(a)-R(a); // triangle noise
  F=(N,f)=>[...Array(N)].map(_=>f()); // loop function

  L=(x,y)=>(x*x+y*y)**.5; // vec2 length (adapted from: Elements, Euclid 300 BC)
  A=([x,y,z],[a,b,c],t=1)=>[x+a*t,y+b*t,z+c*t]; // vec3 add
  m=0;N=([x,y,z])=>[x/(m=1e-99+(x*x+y*y+z*z)**.5),y/m,z/m]; // vec3 normalize + save length in m
  X=([x,y,z],[a,b,c])=>[y*c-z*b,z*a-x*c,x*b-y*a]; // vec3 cross product
  D=([x,y,z=0],[a,b,c=0])=>x*a+y*b+z*c; // vec2/vec3 dot product

  W=(a,b,r)=>-a<r&&-b<r?L(r+a,r+b)-r:a>b?a:b; // "round max"
  k=(a,b)=>a>0&&b>0?L(a,b):a>b?a:b; // 2D edge distance function

  // init canvas
  M=O.h; // height in mm
  Y2=(Y=.707)/2; // aspect ratio
  H=1e5; // viewbox height
  V=({body:B}=document).createElement`canvas`;
  B.appendChild(V);
  C=V.getContext`2d`;
  cw=V.width=Y*(ch=V.height=innerHeight);
  C.strokeStyle='#008';

  // init 3D stuff
  lp=[T(80),90,-150]; // light pos
  Z=1.1+T(.3); // zoom / FOV
  cp=[R(60)-30,10+R(20),-100*Z]; // camera pos

  fw=N(A([0,35,0],cp,-1)); // camera forward axis
  rt=N(X(fw,[0,-1,0])); // camera right axis
  up=X(rt,fw); // camera up axis

  [sx,sy]=(([a,d,g],[b,e,h],[c,f,i])=>(t=a*(e*i-h*f)-b*(d*i-f*g)+c*(d*h-g*e),[[(e*i-f*h)/t,(c*h-b*i)/t,(b*f-c*e)/t],[(f*g-d*i)/t,(a*i-c*g)/t,(c*d-a*f)/t]]))(rt,up,fw); // inverse camera matrix

  fw=fw.map(v=>v*Z); // pre multiply fwd vector

  G=(x,y,t)=>A(cp,N(A(A(fw,rt,Y*x),up,y)),t); // 2D+depth to 3D function

  // generate block/pipe positions 
  [px,py,pz]=G(T(.5),T(.5),120+T(96)); // initial pipe positions
  sl=R()**.5; // slantiness
  e=[[T(.5),a=1/6],[T(.5),-a],[-a,T(.5)],[a,T(.5)]]; // block corner positions (2D)
  d=120+R(48); // block corner dist
  f=F(4,_=>(
    [x,y,z]=G(...e.splice(R(e.length)|0,1)[0],d), // 3D block corner pos
    R()<.2?px=x:0, // chance to replace pipe x/y/z
    R()<.2?py=y:0,
    R()<.2?pz=z:0,
    Function(`[x,y,z]`,`[x,y]=[x*${c=cos(a=T(sl))}+y*${s=sin(a)},y*${c}-x*${s}];return k(${T()<0?`x+${-x+1}`:`${x+1}-x`},k(${T()<0?`y+${-y+1}`:`${y+1}-y`},${d-=17+R(5),z}-z))-1`) // dist function for block
  )); 

  // very very minimal sinus noise
  [na,nb]=F(2,_=>N(F(3,T)));nb=N(X(na,nb));nc=N(X(na,nb)); // noise axes
  [pa,pb,pc]=F(3,R); // random phases
  g=x=>(x=abs(x-K(x)-.5)*2)*x*(6-4*x)-1; // fast fake sinus

  [cx,cy]=G(R()-.5,R()-.5,50); // cylinder-hole pos
  w=2+T(1); // pipe width
  c0=20+T(9); // cylinder-hole radius
  c1=4+T(2); // cylinder-hole width
  rp=T()<0; // horizontal or vertical rings
  rr=.4+R(R()); // ring radius
  P=(p,[x,y,z]=p,d=min(f[0](p),f[1](p),f[2](p),f[3](p),y)-3,v=g(D(p,na)*.05+pa)*.5+.5,u=v,[a,b]=rp?[x-px,y]:[y-py,x])=>(v*=g(D(p,nb)*.06+v*.1+pb),v*=g((D(p,nc)*.7+v-u)*.1+pc),min(W(d+3.4-abs(v+.5),c1-abs(L(x-cx,y-cy)-c0),1),L(d,x-px)-w,L(d,y-py)-w,L(d,z-pz)-w,L(L(d,a)-w*2,b-K(b*.25)*4-2)-rr)); // distance function for everything

  u=([x,y])=>{ // raytrace function, evaluate point (x,y) on screen
    if(abs(x)<Y2-.015&&abs(y)<.5-.015){ // page margins
      d=IX(cp,rd=N(A(A(fw,rt,x),up,y)),240); // trace a ray
      if(d<240){ // did we hit anything
        n=nl(p=A(cp,rd,d)); // calc normal
        for(a=0,b=.31*(IX(A(p,n,.02),lv=N(A(lp,p,-1)),ld=240<m?240:m,.02)>=ld||.6),i=1;i<6;i++,b*=.7)
          a+=max(0,b*P(A(p,n,i/2))); // shadow ray + AO loop
        d=max(0,1-max(0,D(n,lv))*a)*min(1,2.4-d*.01); // diffuse light + depth fog
        d=DR/(d+1e-3); // transform grey value 1..0 into clear radius
        return [
          N([D(sx,hd=N(X(n,hv))),D(sy,hd),0]), // surface hatch direction
          d<.3&&!Qh(QT,x-d,y-d,d*2,(u,v)=>(x-u)**2+(y-v)**2<d*d) // clear test
          ]
      }
    }
    return [] // fail
  };

  IX=(o,d,z,t=0,h=9)=>{for(;t<z&&h>.005;t+=h=.7*P(A(o,d,t)));return t}; // ray intersect
  nl=([x,y,z],e=1e-6,l=P([x+e,y,z]),s=P([x,y,z+e]),n=P([x,y+=e,z]),o=P([x+e,y,z+e]))=>N([l-s-n+o,o-l-s+n,o-l+s-n]); // normal

  // very very tiny QuadTree (spatial data structure to speed up 2D point queries)
  Qa=(q,v,{x,y,w,p}=q)=>p[7]?(w/=2,q.r?0:q.r=[Q(x+w,y+w,w),Q(x+w,y,w),Q(x,y+w,w),Q(x,y,w)],Qa(q.r[(v[0]<x+w)*2+(v[1]<y+w)],v)):p.push(v);
  Qh=({x,y,w,p,r},X,Y,W,f)=>X<x+w&&X+W>x&&Y<y+w&&Y+W>y&&(p.some(([a,b])=>a>=X&&a<X+W&&b>=Y&&b<Y+W&&f(a,b))||r&&r.some(s=>Qh(s,X,Y,W,f)));
  Q=(x,y,w)=>({x,y,w,p:[]});

  DR=O.d*(LW=O.lw/M); // dot radius

  v=[`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${H*Y|0} ${H}" width="${M*Y}mm" height="${M}mm">\n<!-`+`- `+Date(),new U(O),,`fxhash='${fxhash}';(code=${code})()\n-`+`->`,O.bg?`<rect x="${-H}" y="${-H}" width="${H*3}" height="${H*3}" fill="#ffffff"/>`:``]; // init SVG
  
  function* E() {
    // flow field tracing rendering SVG creating function
    v.push([`<g fill="none" stroke="#000000" stroke-width="${(LW*H).toFixed(4)}" stroke-linecap="round">`]);
    hv=N(A(A(rt,fw,1/Z),up,R(.3+R(3)))); // hatch direction
    QT=Q(-1,-1,2); // init empty QuadTree
    for(I=0;I<1e3;I++){ // I = fail counter
      [f0,h]=u(q0=[R(Y)-Y2,R()-.5]); // evaluate random point
      if(h){ // if OK then trace bidirectionally
        qq=[q0]; // init trace with first point
        ss=[]; // these six characters could have been saved
        [m=T()<0?DR:-DR,-m].map(s=>{ // randomly start in one or the other direction
          qq.reverse(); // flip trace so we are adding on the right side
          q=q0; // current pos
          pd=fq=f0; // current+start direction
          for(h=1;h&&D(pd,fq)>.5&&D(f0,fq)>-.7;qq.push(q)) // trace as long as: 1) clear, 2) not too sharp corners, 3) maximum turn wrt starting direction (to prevent infinite spiral)
            [fq,h]=u(q=A(q,pd=fq,s)); // take a step and evaluate
        });
        if(qq[9]){
          // accept only if trace has more than 10 pts
          C.beginPath(I=0); // begin path and also reset fail counter
          n=v.push(`<path d="M ${qq.map(([x,y])=>(Qa(QT,[x,y]),x+=Y2,y+=.5,C.lineTo(x*ch,y*ch),[x*H|0,y*H|0])).join` `}"/>`); // draw trace to canvas and also add it to the SVG and add points to QuadTree
          C.stroke(); // stroke path
          if(n%63<1)yield // periodically return control to timeout function, so the browser doesn't hang
        }
      }
    }
    v.push`</g></svg>`; // finish SVG
    // show SVG 
    B.append(im=new Image);
    im.src=`data:image/svg+xml,`+encodeURIComponent(v.join`\n`);
    V.style.display='none' // and hide canvas
  }

  J=_=>E.next().done||setTimeout(J); // timeout loop function loops until E iterator is done
  J(E=E()) // start the render generator function
})() // start the program