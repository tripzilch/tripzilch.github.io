'use strict';

// constants
const PI = Math.PI, TAU = PI * 2, PHI = .5 + .5 * 5 ** .5, PHI1 = PHI - 1;
const rPI = 1 / PI, rTAU = 1 / TAU;

// shortcuts
const sin = Math.sin, cos = Math.cos, min = Math.min, max = Math.max;
const floor = Math.floor, ceil = Math.ceil, round = Math.round;
const hypot = Math.hypot, abs = Math.abs, sqrt = Math.sqrt, exp = Math.exp;
const sign = Math.sign;

// GLSL utility
const mix = (a, b, p) => a * (1 - p) + b * p;
// const clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
const clamp = (x, lo, hi) => x < lo ? lo : x > hi ? hi : x 
const smoothstep = (x, e0, e1) => {
  x = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return x * x * (3 - 2 * x);
}
const frac = x => x - Math.floor(x);

// HTML colour string functions
const hsl = (hue, sat, lit) => `hsl(${hue|0}, ${sat.toFixed(2)}%, ${lit.toFixed(2)}%)`;
const hsla = (hue, sat, lit, a) => `hsla(${hue|0}, ${sat.toFixed(2)}%, ${lit.toFixed(2)}%, ${a.toFixed(3)})`;
const rgb = (r, g, b) => `rgb(${r|0}, ${g|0}, ${b|0})`;
const rgba = (r, g, b, a) => `rgba(${r|0}, ${g|0}, ${b|0}, ${a.toFixed(3)})`;
const rgb326 = s => s.replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3');

// TODO: better description
const rcos = (x) => 0.5 - 0.5 * Math.cos(Math.min(Math.max(x, 0), 1) * TAU);
const rcos1 = (x) => 0.5 - 0.5 * Math.cos(Math.min(Math.max(x, 0), 1) * PI);
const invpow = (x, p) => 1 - (1 - x) ** p;
const tri = x => abs(x - Math.floor(x) - 0.5) * 2;
const qphi = d => { 
  // http://extremelearning.com.au/unreasonable-effectiveness-of-quasirandom-sequences/
  let x = 2; 
  for (let i = 0; i < 32; i++) { 
    x = (1 + x) ** (1 / (d + 1)); 
  }
  const res = [];
  for (let i = -d; i < 0; i++) { 
    res.push(x ** i);
  }
  return res; 
};

// circular array / modular arithmetic (dmod is the useful one, circular distance)
const mod = (a, m) => (a % m + m) % m;
const imod = (a, m) => ((a % m + m) % m)|0;
const amod = (ar, i) => ar[imod(i, ar.length)];
const dmod = (a, b, m) => Math.min(mod(a - b, m), mod(b - a, m));

// random functions
let RNG = Math.random; // todo: PCG random (Java code in comment below)
const rand = (lo=0, hi=1) => lo + (hi - lo) * RNG();
const irand = (hi) => Math.floor(hi * RNG()); // endpoint exclusive
const nrand = (lo=-1, hi=1) => lo + (hi - lo) * .5 * (1 + RNG() - RNG());
const drand = (a=1) => a * (RNG() - RNG());
const chance = (p) => RNG() < p;
const sample = (a) => a[Math.floor(RNG() * a.length)];
const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        let j = Math.floor(RNG() * (i + 1));
        let x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
function rdisc(r) {
  let a = RNG() - 0.5, b = RNG() - 0.5;
  while (a * a + b * b > 0.25) {
    a = RNG() - 0.5; b = RNG() - 0.5;
  }
  return vec2(2 * r * a, 2 * r * b);
}

/* The state array must be initialized to not be all zero */
// TODO: test against ALEA generator
// TODO: test speed, optimize, consider Float32Array.set for elt. shift
const xs_state = Uint32Array.of(0xC9A5, 0x5996, 0x5696, 0x9A33);
function xorshift128() {
  /* Algorithm "xor128" from p. 5 of Marsaglia, "Xorshift RNGs" */
  let s, t = xs_state[3];
  xs_state[3] = xs_state[2];
  xs_state[2] = xs_state[1];
  xs_state[1] = s = xs_state[0];
  t ^= t << 11;
  t ^= t >>> 8;
  xs_state[0] = t ^ s ^ (s >>> 19);
  return xs_state[0] / 0x100000000;
}
// TODO: make seed v2 alternate methods? add burn-in
// TODO+FIXME: all-zero seed is still possible
function xorshift128_seed(seed_str) {
  const FNV_prime = 16777619;
  // seed_str = seed_str.repeat(ceil(16 / seed_str.length));
  xs_state.fill(2166136261);
  // const dv = new DataView(xs_state.buffer);
  for (let i = 0; i < seed_str.length; i++) {
    const j = i & 3;
    xs_state[j] ^= seed_str.charCodeAt(i);
    xs_state[j] *= FNV_prime; 
    // const b = dv.getUint8(i & 15);
    // const c = seed_str.charCodeAt(i);
    // dv.setUint8(i & 15, (b + c) & 0xFF);
  }
}

