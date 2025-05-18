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

({min,max,PI,sin,cos,abs:B}=Math);TAU=PI*2;
F=(N,f)=>[...Array(N)].map((_,i)=>f(i));
gcd=(a,b)=>b?a>b?gcd(b,a%b):gcd(a,b%a):a;
A=([x,y,z],[a,b,c],t)=>[x+a*t,y+b*t,z+c*t];
N=([x,y,z],m=1e-99+(x*x+y*y+z*z)**.5)=>[x/m,y/m,z/m];
rot=(x,y,c,s)=>[c*x+s*y,c*y-s*x];
SM=(a,b,x)=>(x-=a,x/=b-a)<0?0:x>1?1:x*x*(3-2*x);
mix=([x,y,z=0,w=0],[r,g,b=0,a=0],t,s=1-t)=>[x*s+r*t,y*s+g*t,z*s+b*t,w*s+a*t];
linearRGB=col=>col.map(c=>c**(1/2.2));

gepi=()=>{
  let x=[],f,g,y,ii=0,a0v,s0,s1,s2,s3,wa0,f0,f1,f2,f3;
  for(;ii<9999&&(!x[0]);f=1+R(9)|0,g=1+R(f)|0,h=f+g,x=[2,3,4,5,6,7,8,9,10].filter(d=>h%d<1&&gcd(f,gcd(g,d))==1),ii++);y=RA(x);
  if(ii>=9999)throw 'ARAARARARR';
  // let x=[],f,g,y;
  // for(;!x[0]||f%2+g%2<1||f%3+g%3<1;f=2+R(7)|0,g=1+R(f-1)|0,h=f+g,x=[2,3,4,5,6,7].filter(d=>h%d<1));
  // y=RA(x);
  let J=n=>RS(1+R(n)|0)*y;
  return {
    p0:[f0=J(3+R(3)),R(),R(),s0=RS(.1+R(.2+R(.5)))/y],
    p1:[f1=J(3+R(3)),R(),R(),s1=RS(.1+R(.2+R(.5)))/y],
    a0:[f2=J(3+R(3)),R(),a0v=.3+R(.4),s2=RS(.1+R(.2+R(.4)))],
    a1:[f3=J(3+R(3)),R(),1-a0v,s3=RS(.1+R(.2+R(.4)))],
    wap0:[J(3+R(2)),R(),R(),R(R())],
    wap1:[J(3+R(2)),R(),R(),R(R())],
    wap2:[J(3+R(2)),R(),R(),R(R())],
    wap3:[J(3+R(2)),R(),R(),R(R())],
    wwf:J(3+R(2)),wwg:J(3+R(2)),
    wp:R(),wq:R(),
    wa0:wa0=.07+.1*R(.3+R(.7)),
    wf:((4+B(s0*f0)+B(s1*f1)+B(s2*f2)+B(s3*f3))*30|0)*h,
    WN:RA([3,4,999]),
    f,g,y,h,
    mr:.95/(1+B(s2)+B(s3)),
    sens:{
      str:0,
      p:F(99,_=>N([T()-T(),T()-T(),T()-T()])),
      j:F(99,_=>.4*RS(1+R(3))),
      f:F(99,_=>.002*RS(1+R(4))),
    }
  }
}
ep=gepi();

K=`#version 300 es
precision highp float;
`+`~S smoothstep~W vec3~V vec2~X vec4~F float~B abs~U min~G max~L length~N normalize~G max~U min
`.replace(/~/g,`
#define `);
const vc = `uniform V res;
uniform int NV;
uniform X p0,a0,p1,a1,wap0,wap1,wap2,wap3;
uniform F f,g,wwf,wwg,wf,wp,wq,wa0,WN,mr;
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
  F wa=OS(wwf,w0*w1,0,1,t);
  F wb=OS(wwg,w2*w3,0,1,t);
  F ww=pow(G(0,wa*wb),3);
  V p0=RO(f,OS(p0,t),OS(a0,t),t);
  V p1=RO(-g,OS(p1,t),OS(a1,t),t);
  V p=p0+p1+RWN(wf,wp,wa0*ww,t,f*t+wq);

  V aspect = res.yx * mr / max(res.x, res.y);
  pos = p * aspect;
  size = 2*pow(G(0,-wa*wb),3);
  gl_Position = vec4(pos, 0, 1);
  gl_PointSize = 4 + 9*size;
}`;

const fc = `
in V pos;
in F size;
out vec4 outColor;

void main() {
  F d = length(gl_PointCoord*2-1);
  outColor=X(W(0),S(1,size*.4,d));   // 1-d/f
}`;
  // x = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
//
// dbg.style.display='none';
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
froz=0;
alpha=0;beta=0;gamma=0;
acs=cos(alpha),asn=sin(alpha),bcs=cos(beta),bsn=sin(beta),gcs=cos(gamma),gsn=sin(gamma);
sux=TAU/360; // sux converts from deg to rad
eori=e => ({alpha,beta,gamma}=e,alpha*=sux,beta*=sux,gamma*=sux,acs=cos(alpha),asn=sin(alpha),bcs=cos(beta),bsn=sin(beta),gcs=cos(gamma),gsn=sin(gamma),froz=1);
uax=0;
pal=[
  [1,.3,.01,1], // orange
  [1,.7,.01,1], // yellow
  [.6,1,.01,1], // lime
  [.2,1,.6,1], // ocean
  [.1,.5,1,1], // sky
  [.6,.2,1,1], // berry
  [1,.15,.6,1], // gum
];
NPAL=pal.length;
bgcol1=bgcol0=3;//R(NPAL)|0;
needperm=!!(window.DeviceMotionEvent && window.DeviceMotionEvent.requestPermission);
// dbg.value+=`needperm:${needperm}\n`;
motionctl=false;
pepixt=epixt=-1;

c.onclick=e=>{
  e.preventDefault();
  // dbg.value+='click\n';
  if(!motionctl && needperm) {
    // dbg.value+='requesting permission\n';
    DeviceMotionEvent.requestPermission();
    // dbg.value+='adding deviceorientation event\n';
    window.addEventListener("deviceorientation", eori);
    motionctl=true;
  }
}
if(!needperm){
    // dbg.value+='adding deviceorientation event without permission request\n';
    window.addEventListener("deviceorientation", eori);
    motionctl=true;  
}
c.onpointerdown=e=>{epixt=-1;bgcol0=bgcol1;bgcol1=(bgcol1+RS(2+R(4)|0)+NPAL)%NPAL;};

let frame_count = 0;
let prev_time = performance.now();
let fps = 30;
xf=([x,y,z])=>(
  [x,y]=rot(x,y,acs,asn),
  [y,z]=rot(y,z,bcs,bsn),
  [z,x]=rot(z,x,gcs,gsn),[x,y,z]
)
let fqv=F(99,_=>0),fqx=F(99,_=>0),prev_t=-1;
let fqpq=F(99,_=>[0,0,0]);
// let fqz=(t,i)=>ep.sens.j[i]*xf(ep.sens.p[i])[0]+t*ep.sens.f[i];
let fqz=(dt,t,i)=>{
  let q=xf(ep.sens.p[i]);
  let f=max(0,ep.sens.str*2-1)*(.4**(dt*9));
  fqx[i]=fqx[i]*f+q[0]*(1-f);
  return ep.sens.j[i]*fqx[i] + ep.sens.f[i]*t;
}
let fqi=0;

function render(time) {
  let t=time*.001;
  if (prev_t<0) prev_t=t;
  let dt=t-prev_t;
  prev_t=t;
  epixt+=dt*15;
  // let reset=1;
  if(pepixt<=0&&epixt>0) {ep=gepi()}
  let fade=SM(-1,1,epixt);
  let smul=B(fade*2-1);
  let NPTS = opts.N * smul | 0;
  ep.sens.str=smul;
  pepixt=epixt;
  gl.viewport(0, 0, c.width, c.height);
  gl.clearColor(...linearRGB(mix(pal[bgcol0],pal[bgcol1],fade)));
  gl.uniform2fv(loc.res, [res.x, res.y]);
  gl.uniform1i(loc.NV, NPTS);
  fqi=0;
  [...Object.entries(ep)].map(([k,v])=>{
// p0[1],p0[2],p1[0],p1[2],a0[1],a1[1],wap0[1],wap1[1],wp,wq
    if(v[0]){
      v=[...v];
      if(['p0','p1','a0','a1','wap0','wap1'].includes(k)){
        v[1] += fqz(dt,t,fqi++);
      }
      if(k=='p0'||k=='p1'){ v[2] += fqz(dt,t,fqi++)/3; }
      gl.uniform4fv(loc[k],v);
    } else {
      if(k=='wp'||k=='wq'){ v += fqz(dt,t,fqi++); }
      if(k=='mr') v*=smul;
      gl.uniform1f(loc[k],v);
    }
  });
  // console.log(fqi);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, NPTS);

//   gl.uniform1f(loc.time, time * .001 + 0.1);
// gl.enable(gl.BLEND);
// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//   gl.drawArrays(gl.POINTS, 0, N);

  frame_count++;
  fps = fps * 0.9 + (dt>0?(1/dt)*0.1:0);
  document.title=fps.toFixed(1)+'fps';
  //info.innerHTML = fps.toFixed(1)+'fps';
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

