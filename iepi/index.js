console.table(opts={
  N:2e5,
  fps:1,
  seed:'seed'+Date.now(),
  ...Object.fromEntries(new URL(location).searchParams)
});
S=Uint32Array.of(9,7,5,3);
R=(a=1)=>a*(a=S[3],S[3]=S[2],S[2]=S[1],a^=a<<11,S[0]^=a^a>>>8^(S[1]=S[0])>>>19,S[0]/2**32);
[...opts.seed+"HYPERDERP"].map(c=>R(S[3]^=c.charCodeAt()*S[0]));
RS=(a=1)=>R()<.5?a:-a;
RA=a=>a[R(a.length)|0];
T=a=>R(a)-R(a);

({min,max,PI,sin,cos}=Math);TAU=PI*2;
F=(N,f)=>[...Array(N)].map((_,i)=>f(i));

gepi=()=>{
  let x=[],f,g,y;
  for(;!x[0]||f%2+g%2<1||f%3+g%3<1;f=2+R(7)|0,g=1+R(f-1)|0,h=f+g,x=[2,3,4,5,6,7].filter(d=>h%d<1));
  y=RA(x);
  let J=n=>RS(1+R(n)|0)*y;
  return {
    p0:[J(4),R(),R(),R(.3+R(.3))/y],
    p1:[J(4),R(),R(),R(.3+R(.3))/y],
    a0:[J(4),R(),a0v=.3+R(.4),R(.2+R(.4))],
    a1:[J(4),R(),1-a0v,R(.2+R(.4))],
    wap0:[J(3+R(2)),R(),R(),R(R())],
    wap1:[J(3+R(2)),R(),R(),R(R())],
    wap2:[J(3+R(2)),R(),R(),R(R())],
    wap3:[J(3+R(2)),R(),R(),R(R())],
    wp:R(),wq:R(),
    wa0:.03+.05*R(.3+R(.7)),
    wwf:J(3+R(2)),wwg:J(3+R(2)),
    wf:350*y,
    WN:RA([3,4,999]),
    f,g,
  }
}
ep=gepi();

  // let p0f=J(4),p0p=R(),p0v=R(),p0a=R(.3+R(.3))/y;
  // let p1f=J(4),p1p=R(),p1v=R(),p1a=R(.3+R(.3))/y;
  // let a0f=J(4),a0p=R(),a0v=.3+R(.4),a0a=R(.1+R(.4));
  // let a1f=J(4),a1p=R(),a1v=1-a0v,a1a=R(.1+R(.4));
  // let wp=R(),wq=R(),wa0=.1+.15*R(.3+R(.7)),waf=J(3),wag0=J(3),wap0=R(),wav0=R(),wad0=R(R()),wag1=J(3),wap1=R(),wav1=R(),wad1=R(R());
  // // wad1=.2;
  // let epi0=t=>{
  //   let p0=OS(p0f, p0p, p0v, p0a, t);
  //   let p1=OS(p1f, p1p, p1v, p1a, t);
  //   let a0=OS(a0f, a0p, a0v, a0a, t);
  //   let a1=OS(a1f, a1p, a1v, a1a, t);
  //   let q0=RO(f,p0,a0,t);
  //   let q1=RO(-g,p1,a1,t);
  //   return A(q0,q1);
  // }
  // `
  // `
  // let epiw=t=>OS(waf,OS(wag0,wap0,wav0,wad0,t)+OS(wag1,wap1,wav1,wad1,t),.5,.5,t)**3;
  // let slo=9e9,shi=0,tw=0,NS=1e4,dt=1/NS,mr=0,spd=G(...F1(NS,(t,a=epi0(t),b=epi0(t+dt),w=epiw(t+dt/2),s=L(A(a,b,-1))/dt)=>(tw+=w,w>.5&&(slo=U(slo,s),shi=G(shi,s)),mr=G(mr,L(a),L(b)),w*s)))*wa0*NS;spd/=tw;
  // spd=(slo+shi)*wa0;
  // mr=1/mr;
  // let splof=60+R(20),wf=(spd*splof/y|0)*y;
  // console.log(`spd = ${spd}, wf = ${wf}, mr=${mr}`);
  // console.table({f,g,h,y,add:f+g,sub:f-g,slo,shi,spd});
  // let epi=t=>{
  //   t*=tm;
  //   let wa=epiw(t);
  //   let w=RW(wf-y/tm,wp,wa0*wa,t,f*t+wq);
  //   return M(A(epi0(t),w),[],mr);
  // }
  // return epi;
K=`#version 300 es
precision highp float;
`+`~S smoothstep~W vec3~V vec2~X vec4~F float~B abs~U min~G max~L length~N normalize~G max~U min
`.replace(/~/g,`
#define `);
const vc = `uniform V res;
uniform int NV;
uniform X p0,a0,p1,a1,wap0,wap1,wap2,wap3;
uniform F f,g,wwf,wwg,wf,wp,wq,wa0,WN;
out V pos;
out F size;

#define TAU ${TAU}

mat2 rot1(float a) {
    a*=TAU;
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
}

V RO(F f, F p, F a, F t){
  t=(t*f+p)*TAU;
  return a*V(sin(t),cos(t));
}
V RWN(F f, F p, F a, F t, F q){
  t=(t*f+p)*WN;
  F i=floor(t);
  t-=i;i/=WN;
  return mix(RO(1,q,a,i),RO(1,q,a,i+1/WN),t);
}
F OS(F f, F p, F v, F d, F t) {
  // oscillator with frequency f, phase p, mid value v
  // distance d at time t
  return v + d * sin((f * t + p) * TAU);
}
F OS(X o, F t) { return OS(o.x,o.y,o.z,o.w,t); }

void main() {
  float t = float(gl_VertexID) / float(NV);  // goes from 0 to 1

  F w0=OS(wap0,t),w1=OS(wap1,t),w2=OS(wap2,t),w3=OS(wap3,t);
  F wa=OS(wwf,w0+w1,0,1,t);
  F wb=OS(wwg,w2+w3,0,1,t);
  F ww=pow(G(0,wa*wb),3);
  V p0=RO(f,OS(p0,t),OS(a0,t),t);
  V p1=RO(-g,OS(p1,t),OS(a1,t),t);
  V p=p0+p1+RWN(wf,wp,wa0*ww,t,f*t+wq);

  V aspect = res.yx * .5 / max(res.x, res.y);
  pos = p * aspect;
  size = 2*pow(G(0,-wa*wb),3);
  gl_Position = vec4(pos, 0, 1);
  gl_PointSize = 3 + 9*size;
}`;

const fc = `
in V pos;
in F size;
out vec4 outColor;

void main() {
  F d = length(gl_PointCoord*2-1);
  outColor=X(W(0),S(1,size*.5,d));   // 1-d/f
}`;
  // x = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
//
const gl = c.getContext('webgl2',{alpha:false});
const loc = {};
er='<pre>'
const Shader = (typ, src)=>{
  const s=gl.createShader(typ);
  gl.shaderSource(s,K+src.replace(/([^a-zA-Z_0-9.])([0-9]+)(?![.0-9u])/g,'$1$2.').replace(/([0-9.]e-[0-9]+)\./gi,'$1'));
  gl.compileShader(s);
  (/*console.log(c),*/m=gl.getShaderInfoLog(s))&&(er+=src.split`\n`.map((v,i)=>++i+': '+v).join`\n`+'\n'+m);
  return s;
}

let program = gl.createProgram();
const vs = Shader(gl.VERTEX_SHADER, vc);
const fs = Shader(gl.FRAGMENT_SHADER, fc);
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  // something went wrong with the link
  console.log("Link failed:\n", gl.getProgramInfoLog(program));
  console.log("VS LOG:\n", gl.getShaderInfoLog(vs));
  console.log("FS LOG:\n", gl.getShaderInfoLog(fs));
  document.body.innerHTML=er;console.log(er);
  throw ("Program failed to link (see console for error log).");
}

const uniforms = ['res','NV',...Object.keys(ep)];
for (let uni of uniforms) {
  loc[uni] = gl.getUniformLocation(program, uni);
}

gl.useProgram(program);
gl.clearColor(1,.7,.2,1);
gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
// gl.enable(gl.SAMPLE_COVERAGE);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const res = {};
function resize() { 
  let w = window.innerWidth, h = window.innerHeight;
  res.x = c.width = w * devicePixelRatio|0; 
  res.y = c.height = h * devicePixelRatio|0;
  c.style.width = w+'px';
  c.style.height = h+'px';
}
resize();
window.addEventListener('resize', resize);
alpha=0;beta=0;gamma=0;
acs=cos(alpha),asn=sin(alpha),bcs=cos(beta),bsn=sin(beta),gcs=cos(gamma),gsn=sin(gamma);
rad=TAU/360;
window.addEventListener("deviceorientation", e => ({alpha,beta,gamma}=e,alpha*=rad,beta*=rad,gamma*=rad,acs=cos(alpha),asn=sin(alpha),bcs=cos(beta),bsn=sin(beta),gcs=cos(gamma),gsn=sin(gamma)));
let frame_count = 0;
let prev_time = performance.now();
let fps = 30;
N=([x,y,z],m=1e-99+(x*x+y*y+z*z)**.5)=>[x/m,y/m,z/m];
rot=(x,y,c,s)=>[c*x+s*y,c*y-s*x];
let fqp=F(99,_=>N([T()-T(),T()-T(),T()-T()]));
let fqj=F(99,_=>.5*RS(1+R()));
let fqf=F(99,_=>.003*RS(1+R(2)));
xf=([x,y,z])=>(
  [x,y]=rot(x,y,acs,asn),
  [y,z]=rot(y,z,bcs,bsn),
  [x,z]=rot(x,z,gcs,gsn),[x,y,z]
)
let fqz=(t,i)=>fqj[i]*xf(fqp[i])[0]+t*fqf[i],fqi=0;
function render(time) {
  let t=time*.001;
  gl.viewport(0, 0, c.width, c.height);
  gl.uniform2fv(loc.res, [res.x, res.y]);
  gl.uniform1i(loc.NV, opts.N);
  fqi=0;
  [...Object.entries(ep)].map(([k,v])=>{
// p0[1],p0[2],p1[0],p1[2],a0[1],a1[1],wap0[1],wap1[1],wp,wq
    if(v[0]){
      v=[...v];
      if(['p0','p1','a0','a1','wap0','wap1'].includes(k)){
        v[1] += fqz(t,fqi++);
      }
      if(k=='p0'||k=='p1'){ v[2] += fqz(t,fqi++)/3; }
      gl.uniform4fv(loc[k],v);
    } else {
      if(k=='wp'||k=='wq'){ v += fqz(t,fqi++); }
      gl.uniform1f(loc[k],v);
    }
  });
  console.log(fqi);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, opts.N);

//   gl.uniform1f(loc.time, time * .001 + 0.1);
// gl.enable(gl.BLEND);
// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//   gl.drawArrays(gl.POINTS, 0, N);

  frame_count++;
  let dt = time - prev_time;
  fps = fps * 0.9 + (1000/dt)*0.1;
  document.title=fps.toFixed(1)+'fps';
  //info.innerHTML = fps.toFixed(1)+'fps';
  prev_time = time;
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

