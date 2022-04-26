'use strict';

const PI = Math.PI, TAU = PI * 2, PHI = .5 + .5 * 5 ** .5, PHI1 = PHI - 1;
const rPI = 1 / PI, rTAU = 1 / TAU;
const mix = (a, b, p) => a * (1 - p) + b * p;
const clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
const smoothstep = (x, e0, e1) => {
  x = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return x * x * (3 - 2 * x);
}
const frac = x => x - Math.floor(x);

const hsl = (hue, sat, lit) => `hsl(${hue|0}, ${sat.toFixed(2)}%, ${lit.toFixed(2)}%)`;
const hsla = (hue, sat, lit, a) => `hsla(${hue|0}, ${sat.toFixed(2)}%, ${lit.toFixed(2)}%, ${a.toFixed(3)})`;
const rgb = (r, g, b) => `rgb(${r|0}, ${g|0}, ${b|0})`;
const rgba = (r, g, b, a) => `rgba(${r|0}, ${g|0}, ${b|0}, ${a.toFixed(3)})`;

const rcos = (x) => 0.5 - 0.5 * Math.cos(Math.min(Math.max(x, 0), 1) * TAU);
const rcos1 = (x) => 0.5 - 0.5 * Math.cos(Math.min(Math.max(x, 0), 1) * PI);

// circular array / modular arithmetic
const mod = (a, m) => (a % m + m) % m;
const imod = (a, m) => ((a % m + m) % m)|0;
const amod = (a, i) => a[iwrap(i, a.length)];
const dmod = (a, b, m) => Math.min(wrap(a - b, m), wrap(b - a, m));

// random functions
const RNG = Math.random; // todo: PCG random (Java code in comment below)
const rand = (lo=0, hi=1) => lo + (hi - lo) * RNG();
const irand = (hi) => Math.floor(hi * RNG()); // endpoint exclusive
const nrand = (lo=-1, hi=1) => lo + (hi - lo) * .5 * (1 + RNG() - RNG());
const drand = (a=1) => a * (RNG() - RNG());
const erand = (lo, hi) => lo * ((hi / lo) ** RNG());
const sample = (a) => a[Math.floor(RNG() * a.length)];
const chance = (p) => RNG() < p;
const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        let j = Math.floor(RNG() * (i + 1));
        let x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
const sin = Math.sin, cos = Math.cos, min = Math.min, max = Math.max;
const floor = Math.floor, ceil = Math.ceil, round = Math.round;
const hypot = Math.hypot, abs = Math.abs, sqrt = Math.sqrt;

const Ease = { // TODO: map clamp
  linear: t => t,
  out: t => t * t,
  out_fast: t => t * t * t,
  in_overshoot: t => 2 * t * t * (1 - 0.04 * (9 * t - 5) ** 2),
  mid_slow: (t, a=0.5) => mix(t, t + sin(t * TAU) * rTAU, a),
  in: t => 1 - (1 - t) ** 2,
  in_fast: t => 1 - (1 - t) ** 3,
}

/* The state array must be initialized to not be all zero */
// TODO: test against ALEA generator
const xs_state = Uint32Array.of(0xC9A5, 0x5996, 0x5696, 0x9A33);
function xorshift128() {
  /* Algorithm "xor128" from p. 5 of Marsaglia, "Xorshift RNGs" */
  let s, t = xs_state[3];
  xs_state[3] = xs_state[2];
  xs_state[2] = xs_state[1];
  xs_state[1] = s = xs_state[0];
  t ^= t << 11;
  t ^= t >> 8;
  xs_state[0] = t ^ s ^ (s >> 19);
  return xs_state[0] / 0x80000000;
}

/*

// * PCG Random Number Generation for Java / Processing.
// *
// * For additional information about the PCG random number generation scheme,
// * including its license and other licensing options, visit
// *
// *       http://www.pcg-random.org

class PCG32Random {
    long state, inc;
    PCG32Random() {
        state = 0x853c49e6748fea9bL;
        inc = 0xda3e39cb94b95bdbL;
    }
    PCG32Random(long seed, long seq) {
        state = 0;
        inc = (seq << 1) | 1;
        next();
        state += seed;
        next();
    }

    int next() {
        long oldstate = state;
        state = oldstate * 6364136223846793005L + inc;
        int xorshifted = (int) (((oldstate >>> 18) ^ oldstate) >>> 27);
        int rot = (int) (oldstate >>> 59);
        return (int) ((xorshifted >>> rot) | (xorshifted << ((-rot) & 31)));
    }

    double nextDouble() {
        long r = (next() & 0xFFFFFFFFL);
        r = r << 21;
        r ^= (next() & 0xFFFFFFFFL);
        //r ^= (next() & 0xFFFFFFFFL);
        //r ^= (next() & 0xFFFFFFFFL);
        //return r / (double) 0x100000000L;
        // r ^= next() & 0xFFFFFFFFL;
        // r = r << 32;
        // r ^= next() & 0xFFFFFFFFL;
        // r ^= next() & 0xFFFFFFFFL;
        // r ^= next() & 0xFFFFFFFFL;
        return (r & 0x1fffffffffffffL) / ((double) (1L << 53));
    }

    boolean chance(double P) { return nextDouble() < P; }
}
*/
