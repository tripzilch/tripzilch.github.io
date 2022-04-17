const default_opts = {
  fps: 1,
  N: 200000
};
function hash_opts(defaults={}) {
  const ifnum = s => {
    const x = Number(s);
    return isNaN(x) ? decodeURIComponent(s) : x;
  }
  const h = location.hash.substring(1);
  const res = Object.assign({}, defaults);
  for (const key_value of h.split('&')) {
    let [k, v] = key_value.split('=');
    if (v === undefined) { v = true; } 
    else if (v.includes(',')) { v = v.split(',').map(ifnum); } 
    else { v = ifnum(v); }
    res[k] = v;
  }
  return res;
}
const opts = hash_opts(default_opts);
info.hidden=!opts.fps;

S=Uint32Array.from([9,7,n=t=5,3]);
R=(a=1)=>a*(t=S[3],S[3]=S[2],S[2]=S[1],S[1]=n=S[0],t^=t<<11,S[0]^=(t^t>>>8)^(n>>>19),S[0]/2**32);
[...Date.now()+'Kallisti'].map(c=>R(S[3]^=c.charCodeAt()*23205));
({min,max,PI}=Math);TAU=PI*2;
L=(N,f)=>[...Array(N)].map((_,i)=>f(i));
L(9,R);

x=[];for(;x.length<1||f%2+g%2<1||f%3+g%3<1;f=2+R(6)|0,g=1+R(f-1)|0,h=f+g,x=[2,3,5,7].filter(d=>h%d<1));y=x[R(x.length)|0];

//!= && f%3
// 2 1
// 3 1 2
// 4 1 2 3
// 5 1 2 3 4
// 6 1 2 3 4 5
// 7 1 2 3 4 5 6
//f=4;g=2;y=2;
console.table({freq0:f,freq1:g,symmetry:`${x} (${y})`});
I=n=>(1+R(n)|0)*y*(R()<.5?1:-1);
G=(a=.5)=>.1+R(a/y);rs=x=>R()<.5?-x:x;
TF=(s=1)=>`${R()}+${rs(s)}*(${R()+.5}*t`+(R()<.3?`+${rs(R()+1)}*pow(O(${R(.4)}, ${R()}, .5, .5, t), 16.)`:``)+`)`
st=0;
K=`#version 300 es
precision highp float;
`+`,S smoothstep,W vec3,V vec2,X vec4,F float
`.replace(/,/g,`
#define `);
const vc = `uniform V res;
uniform int NV;
uniform float time;
out V pos;
out F size;

float rnd(float p) {
  V p2 = fract(V(5.6474, 5.5092) * p);
  p2 += dot(p2.yx, p2.xy + V(21.0522, 14.1077));
  return fract(p2.x * p2.y * 95.6998);
}
#define TAU ${TAU}

V R(float f, float p, float a, float t) {
  // rotating V with frequency f, phase p, amplitude a
  // at time t
  t = (f * t + p) * TAU;
  return V(cos(t), sin(t)) * a;
}

V P(F f,F p,F a,F s){
  const F N=${3+R(2)|0};
  F tf=f*s*N,ti=floor(tf);tf-=ti;ti/=N;
  return mix(R(1,p,a,ti),R(1,p,a,ti+(1/N)),tf);
}

float O(float f, float p, float v, float d, float t) {
  // oscillator with frequency f, phase p, mid value v
  // distance d at time t
  return v + d * sin((f * t + p) * TAU);
}

V pss(float u, float t) {
  float ps0 = O(${I(6)+y}, ${TF(.5)}, .5-t, .2, u); 
  float ps = O(${I(6)+y}, ps0, .5, .5, u); 
  float pb = O(${I(6)+y}, O(${I(6)+y}, ${TF(.5)}, ${TF(.5)}, .2, u), .5, .5, u); 
  V s = V(ps,1-ps), b=V(pb,1-pb);
  s*=s*s*s;b*=b*b*b;
  return .5*s+.5*b;
}

void main() {
  float u = float(gl_VertexID) / float(NV);  // goes from 0 to 1
  // float t = (time+rnd(u*2.71+2.3+fract(time))/30.) * .1;
  float t = time * .1;
  const float y = ${y};
  V ps;
  
  // F uf=u*1600,ui=floor(uf),fi=step(.53,pss(u,t));
  // uf-=ui;
  // u=mix(u,ui/1600,fi);  
  // ps=pss(u,t);F ps0=ps;
  // ps*=ps*ps;
  // V w=(R(1,0,.15*rnd(ui*.77+3)+.02,uf)+(V(rnd(ui*.34),rnd(ui*.56-1))-.5))*ps*fi/5;

  // ps=pss(u,t);
  // ps.x*=ps.x;ps*=ps;
  // V w = R(${150*(y+h)}, 0., .05*ps.x  , u);

  ps=pss(u,t);
  ps.x*=ps.x*ps.x;
  V w = ${R()<.4?'R':'P'}(${180*(y+h)}, ${R()}+u, .06*ps.x   , u);

  const X am = normalize(X(${L(4,_=>R())}));
  float p0 = O(${I(5)}, ${TF()}, ${z=TF(.2)}, am.x * ${G(.5)}, u);
  float p1 = O(${I(5)}, ${TF()}, -${R()+.5}*(${z}), am.y * ${G(.5)}, u);
  float a0 = O(${I(5)}, ${TF()}, .4, am.z * ${G(.5)}, u);
  float a1 = O(${I(5)}, ${TF()}, .4, am.w * ${G(.5)}, u);;

  V p = R(${f}, p0, a0, u) + R(${-g}, p1, a1, u) + w;
  //const float N = 600.;
  //float uf = u * N; 
  //float ui = floor(uf);uf-=ui;ui/=N;
  //V n = R(1., 0., sqrt(rnd(2.*ui+2.1)), rnd(ui)) + R(1., 0., .2, uf);

  V aspect = res.yx * (.66+${y*.02}) / max(res.x, res.y);
  pos = p * aspect;
  size = 3 + 8*S(0.2, 1, ps.y);
  gl_Position = vec4(pos, 0, 1);
  gl_PointSize = size;
}`;

const fc = `
in V pos;
in F size;
out vec4 outColor;

void main() {
  F d = length(gl_PointCoord*2-1);
  outColor=X(W(0),clamp((1-d)*size/2,0,1));   // 1-d/f
}`;
  // x = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
//
const gl = c.getContext('webgl2',{alpha:false});
const loc = {};
const Shader = (typ, src)=>{
  const s=gl.createShader(typ);
  gl.shaderSource(s,K+src.replace(/([^a-zA-Z_0-9.])([0-9]+)(?![.0-9u])/g,'$1$2.').replace(/([0-9.]e-[0-9]+)\./gi,'$1'));
  gl.compileShader(s);
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
  throw ("Program failed to link (see console for error log).");
}

const uniforms = 'res NV time'.split(' ');
for (let uni of uniforms) {
  loc[uni] = gl.getUniformLocation(program, uni);
}

gl.useProgram(program);
gl.clearColor(1,1,1,1);

const N = opts.N;

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

let frame_count = 0;
let prev_time = performance.now();
let fps = 30;
function render(time) {
  gl.viewport(0, 0, c.width, c.height);
  gl.uniform2fv(loc.res, [res.x, res.y]);
  gl.uniform1i(loc.NV, N);
  gl.uniform1f(loc.time, time * .001);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
// gl.enable(gl.SAMPLE_COVERAGE);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.drawArrays(gl.POINTS, 0, N);

//   gl.uniform1f(loc.time, time * .001 + 0.1);
// gl.enable(gl.BLEND);
// gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
//   gl.drawArrays(gl.POINTS, 0, N);

  frame_count++;
  let dt = time - prev_time;
  fps = fps * 0.9 + (1000/dt)*0.1;
  info.innerHTML = fps.toFixed(1)+'fps';
  prev_time = time;
  requestAnimationFrame(render);
}
requestAnimationFrame(render);