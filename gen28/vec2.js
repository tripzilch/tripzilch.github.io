class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  // vector update methods
  add(v) { this.x += v.x; this.y += v.y; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; return this; }
  vmul(v) { this.x *= v.x; this.y *= v.y; return this; }
  mul(a) { this.x *= a; this.y *= a; return this; }
  madd(v, a) { this.x += v.x * a; this.y += v.y * a; return this; }
  scale_trans(a, v) { this.x = this.x * a + v.x; this.y = this.y * a + v.y; return this; }
  mix(v, p) { 
    // this.x += (v.x - this.x) * p; 
    // this.y += (v.y - this.y) * p; 
    this.x = (1 - p) * this.x + p * v.x; 
    this.y = (1 - p) * this.y + p * v.y; 
    return this; 
  }
  rot90() { [this.x, this.y] = [-this.y, this.x]; return this; }
  rot180() { this.x *= -1; this.y *= -1; return this; }
  rot270() { [this.x, this.y] = [this.y, -this.x]; return this; }
  rotate(a) { 
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    [this.x, this.y] = [ca * this.x - sa * this.y, sa * this.x + ca * this.y];
    return this; 
  }  
  // test if (x**2 + y**2)**-2 is faster
  normalize_safe() { let m = 1 / ((this.x ** 2 + this.y ** 2) ** 0.5 || 1); this.x *= m; this.y *= m; return this; }
  normalize() { let m = (this.x ** 2 + this.y ** 2) ** -0.5; this.x *= m; this.y *= m; return this; }
  op1(f) { this.x = f(this.x); this.y = f(this.y); return this; }
  op2(v, f) { this.x = f(this.x, v.x); this.y = f(this.y, v.y); return this; }
  op3(v, w, f) { this.x = f(this.x, v.x, w.x); this.y = f(this.y, v.y, w.y); return this; }
  jitter(a) { this.x += a * (RNG() - RNG());  this.y += a * (RNG() - RNG()); return this; }

  // scalar methods
  // dist(v) { return Math.hypot(this.x - v.x, this.y - v.y); }
  dist(v) { return ((this.x - v.x) ** 2 + (this.y - v.y) ** 2) ** 0.5; }
  dist2(v) { return (this.x - v.x) ** 2 + (this.y - v.y) ** 2; }
  // hypot() { return Math.hypot(this.x, this.y); }
  hypot() { return (this.x ** 2 + this.y ** 2) ** 0.5; }
  hypot2() { return this.x ** 2 + this.y ** 2; }
  dot(v) { return this.x * v.x + this.y * v.y; }
  dot2(x, y) { return this.x * x + this.y * y; }
  cross(v) { return this.x * v.y - this.y * v.x; }

  // swizzling
  get xy() { return new Vec2(this.x, this.y); } // Vec2.xy is also copy constructor
  get yx() { return new Vec2(this.y, this.x); }
  get xx() { return new Vec2(this.x, this.x); }
  get yy() { return new Vec2(this.y, this.y); }
  set xy(v) { [this.x, this.y] = [v.x, v.y]; }
  set yx(v) { [this.x, this.y] = [v.y, v.x]; }

  // polar getters and setters
  get r() { return (this.x ** 2 + this.y ** 2) ** 0.5; }
  get phi() { return Math.atan2(this.y, this.x); }
  set r(r_) { 
    let m = r_ * (this.x ** 2 + this.y ** 2) ** -0.5; 
    this.x *= m; this.y *= m; 
  }
  set phi(phi_) { 
    let r = (this.x ** 2 + this.y ** 2) ** 0.5;
    this.x = r * Math.cos(phi_);
    this.y = r * Math.sin(phi_);
  }

  // iterator
  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
  }
  // toString with nice unicode math brackets
  toString() {
    return `⟨${this.x}, ${this.y}⟩`;
  }
  
  // static initializers
  static urand(a=1) {
    return new Vec2(a * RNG(), a * RNG());
  }
  static drand(a=1) {
    return new Vec2(a * (RNG() - RNG()), a * (RNG() - RNG()));
  }
  static irand(a=1) {
    return new Vec2(a * (2 * RNG() - 1), a * (2 * RNG() - 1));
  }
  static fromAngle(phi, r) {
    return new Vec2(r * Math.cos(phi), r * Math.sin(phi));
  }
  static basis(x, y, bx, by) {
    return by.xy.mul(y).madd(bx, x);
  }
  static rotator(a) {
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    return v => new Vec2(ca * v.x - sa * v.y, sa * v.x + ca * v.y);
  }
}
const vec2 = (x, y) => new Vec2(x, y);
Vec2.ZERO = vec2(0, 0);
Vec2.ONE = vec2(1, 1);

class Line {
  constructor(p0, p1) {
    this.p0 = p0.xy; this.p1 = p1.xy;
    this.d = p1.xy.sub(p0);
    this.z = p1.x * p0.y - p1.y * p0.x;
    this.length = this.d.hypot();
    this.length1 = 1 / this.length;
  }
  dist(p) {
    return (this.d.y * p.x - this.d.x * p.y + this.z) * this.length1;
  }
  intersects(other) {
    const quot = this.d.cross(other.d);
    if (quot === 0) return false; // parallel
    const num = other.p0.xy.sub(this.p0).cross(this.d);
    const t = num / quot;
    return t >=0 && t <= 1 ? t : false;
  }
}

function thick_brush(pp, ww) {
  // draw a stroke/brush along points pp with thickness ww

  let s1 = [], s2 = [];
  let prev, [cur, next] = [pp[0], pp[1]];
  for (let i = 2; i < pp.length; i++) {
    [prev, cur, next] = [cur, next, pp[i]];
    let n = next.xy.sub(prev).normalize().rot90();
    let w = ww[i];
    s1.push(cur.xy.madd(n, w));
    s2.push(cur.xy.madd(n, -w));
  }

  // combine
  s2.reverse();
  return s1.concat(s2);
}

class Noise2D {
  constructor(Nexp, scale=1) {
    this.Nexp = Nexp;
    this.N = 1 << Nexp;
    this.N2 = this.N * this.N;
    this.mask = this.N - 1;
    this.valx = new Float32Array(this.N2);
    this.valy = new Float32Array(this.N2);
    for (let i = 0; i < this.N2; i++) {
      this.valx[i] = RNG() - RNG();
      this.valy[i] = RNG() - RNG();
    }
    this.scale = scale;
    this.xo = RNG(); this.yo = RNG();
  }
  f(v) {
    const vx = v.x * this.scale + this.xo, vy = v.y * this.scale + this.yo;
    let vxi = Math.floor(vx), vyi = Math.floor(vy);
    let vxf = vx - vxi, vyf = vy - vyi;
    vxf *= vxf * (3.0 - 2.0 * vxf);
    vyf *= vyf * (3.0 - 2.0 * vyf);
    const vxf1 = 1 - vxf, 
          vyf1 = 1 - vyf;
    const vxi1 = (vxi + 1) & this.mask;
    const vyi1 = ((vyi + 1) & this.mask) << this.Nexp;
    vxi &= this.mask; 
    vyi &= this.mask;
    vyi <<= this.Nexp;
    const i0 = vxi + vyi, i1 = vxi1 + vyi, i2 = vxi + vyi1, i3 = vxi1 + vyi1;
    const f0 = vxf * vyf, f1 = vxf1 * vyf, f2 = vxf * vyf1, f3 = vxf1 * vyf1;
    return vec2(
           this.valx[i0] * f3
         + this.valx[i1] * f2
         + this.valx[i2] * f1
         + this.valx[i3] * f0,
           this.valy[i0] * f3
         + this.valy[i1] * f2
         + this.valy[i2] * f1
         + this.valy[i3] * f0);
  }
}

class NoiseWav {
  constructor(size_exp, r=0.5) {
    // r is stability, inverse randomness, r=1 means no randomnesst
    this.NOISEWAV_L = 1 << size_exp;
    this.NOISEWAV_L1 = 1 / this.NOISEWAV_L;
    this.NOISEWAV_M = this.NOISEWAV_L - 1;
    this.wavx = new Float32Array(this.NOISEWAV_L + 1);
    this.wavy = new Float32Array(this.NOISEWAV_L + 1);
    let o = 1;
    for (let i = 0; i < this.NOISEWAV_L; i++) {
      this.wavx[i] = mix(RNG(), 1, r) * o; // use drand for full random??
      this.wavy[i] = mix(RNG(), 1, r) * o; 
      o *= -1;
    }
    this.wavx[this.NOISEWAV_L] = this.wavx[0]; // guard
    this.wavy[this.NOISEWAV_L] = this.wavy[0]; // guard 
  }
    // f *= f * f * (f * (f * 6 - 15) + 10);// smootherstep
    // f *= f * f * f * (-20 * f * f * f + 70 * f * f - 84 * f + 35); // smootheststep
  y(t) {
    let i = Math.floor(t);
    let f = t - i;
    i &= this.NOISEWAV_M;
    f *= f * (3.0 - 2.0 * f); // smoothstep
    return this.wavy[i] * (1 - f) + this.wavy[i + 1] * f;
  }
  x(t_) {
    let t = t_ + .5;
    let i = Math.floor(t);
    let f = t - i;
    i &= this.NOISEWAV_M;
    f *= f * (3.0 - 2.0 * f); // smoothstep
    return this.wavx[i] * (1 - f) + this.wavx[i + 1] * f;
  }
  xy(t) { return vec2(this.x(t), this.y(t)); }
  rotate({x, y}, a) { 
    const ca = this.x(a);
    const sa = this.y(a);
    return new Vec2(ca * x - sa * y, sa * x + ca * y); 
  }
  O(f, p, v, d, s) { return v + d * this.x((s * f + p) * this.NOISEWAV_L); }
  R(f, p, a, s) { return this.xy((s * f + p) * this.NOISEWAV_L).mul(a); }
}

class Noise1D {
  constructor(size_exp) {
    // r is stability, inverse randomness, r=1 means no randomnesst
    this.L = 1 << size_exp;
    this.L1 = 1 / this.L;
    this.M = this.L - 1;
    this.wavx = new Float32Array(this.L + 1);
    this.wavy = new Float32Array(this.L + 1);
    this.wavz = new Float32Array(this.L + 1);
    for (let i = 0; i < this.L; i++) {
      this.wavx[i] = RNG() - RNG();
      this.wavy[i] = RNG() - RNG(); 
      this.wavz[i] = RNG() - RNG(); 
    }
    this.wavx[this.L] = this.wavx[0]; // guard
    this.wavy[this.L] = this.wavy[0]; // guard 
    this.wavz[this.L] = this.wavz[0]; // guard 
  }
  z(t) {
    let i = Math.floor(t);
    let f = t - i;
    i &= this.M;
    f *= f * (3.0 - 2.0 * f); // smoothstep
    return this.wavz[i] * (1 - f) + this.wavz[i + 1] * f;
  }
  y(t) {
    let i = Math.floor(t);
    let f = t - i;
    i &= this.M;
    f *= f * (3.0 - 2.0 * f); // smoothstep
    return this.wavy[i] * (1 - f) + this.wavy[i + 1] * f;
  }
  x(t_) {
    let t = t_ + .5;
    let i = Math.floor(t);
    let f = t - i;
    i &= this.M;
    f *= f * (3.0 - 2.0 * f); // smoothstep
    return this.wavx[i] * (1 - f) + this.wavx[i + 1] * f;
  }
  xy(t, a=1) { return vec2(a * this.x(t), a * this.y(t)); }
  xyz(t, a=1) { 
    // let i = Math.floor(t);
    // let f = t - i;
    // i &= this.M;
    // f *= f * (3.0 - 2.0 * f) * a; // smoothstep
    // return vec3(this.wavx[i] * (1 - f) + this.wavx[i + 1] * f,
    //     this.wavy[i] * (1 - f) + this.wavy[i + 1] * f,
    //     this.wavz[i] * (1 - f) + this.wavz[i + 1] * f);
    //   ;
    return vec3(a * this.x(t), a * this.y(t-.166667), a * this.z(t+.166667)); 
  }
}

class CircleLUT {
  constructor(exp=10) {
    this.size = 1 << exp;
    this.mask = this.size - 1;
    this.ctab = new Float32Array(this.size + 1);
    this.stab = new Float32Array(this.size + 1);
    for (let i = 0; i < this.size + 1; i++) {
      const a = (i / this.size) * TAU;
      // this.stab[(i + q) & this.mask] = this.ctab[i] = Math.cos(a);  
      this.ctab[i] = Math.cos(a);  
      this.stab[i] = Math.sin(a);  
    }
  }
  y(t) {
    t *= this.size;
    let i = Math.floor(t);
    const f = t - i;
    i &= this.mask;
    return this.stab[i] * (1 - f) + this.stab[i + 1] * f;
  }
  x(t) {
    t *= this.size;
    let i = Math.floor(t);
    const f = t - i;
    i &= this.mask;
    return this.ctab[i] * (1 - f) + this.ctab[i + 1] * f;
  }
  xy(t) { 
    t *= this.size;
    let i = Math.floor(t);
    const f = t - i, f1 = 1 - f;
    i &= this.mask;
    return new Vec2(this.ctab[i] * f1 + this.ctab[i + 1] * f, this.stab[i] * f1 + this.stab[i + 1] * f);
  }
  O(f, p, v, d, s) { return v + d * this.y(s * f + p); }
  R(f, p, a, s) { 
    const t = this.size * (s * f + p);
    let i = Math.floor(t);
    const f0 = (t - i) * a, f1 = a - f0;
    i &= this.mask;
    return new Vec2(this.ctab[i] * f1 + this.ctab[i + 1] * f0, this.stab[i] * f1 + this.stab[i + 1] * f0);
  }
  rotate({x, y}, a) {
    a *= this.size;
    let i = Math.floor(a);
    const f = a - i, f1 = 1 - f;
    i &= this.mask;
    const ca = this.ctab[i] * f1 + this.ctab[i + 1] * f;
    const sa = this.stab[i] * f1 + this.stab[i + 1] * f;
    return new Vec2(ca * x - sa * y, sa * x + ca * y); 
  }
}
const cLUT = new CircleLUT();    

const square_cos = t => clamp(8 * abs(0.5 - frac(t * rTAU)) - 2, -1,1);
const square_sin = t => clamp(8 * abs(0.5 - frac(t * rTAU - 0.25)) - 2, -1,1);
const sqrt32 = .75 ** .5, triL = -2 * sqrt32 / 3, triR = 4 * sqrt32 / 3;
const tri_cos = t => mix(triL, triR, max(0, 1 - abs(3 * frac(t * rTAU) - 2)));
const tri_sin = t => abs(frac(t * rTAU) * 3 - 1) + max(-1, -frac(t * rTAU) * 3);

function square_rotate(v, a) { 
    const ca = square_cos(a);
    const sa = square_sin(a);
    [v.x, v.y] = [ca * v.x - sa * v.y, sa * v.x + ca * v.y];
    return v; 
}
const vrect = (phi, r) => vec2(r * square_cos(phi), r * square_sin(phi));
const vtri = (phi, r) => vec2(r * tri_cos(phi), r * tri_sin(phi));
const vcirc = Vec2.fromAngle;

class Hilbert {
  constructor(order) {
    this.order = order;
    this.size = 1 << order;
    this.scale = 1.0 / (this.size - 1);
    this.N = this.size * this.size - 1;
    this.N1 = 1 / this.N;
  }

  _hilbert(i) {
    const v = vec2(0, 0);
    for (let s = 1; s < this.size; s *= 2) {
      let rx = 1 & (i >> 1);
      let ry = 1 & (i ^ rx);
      if (ry == 0) {
        if (rx == 1) {
          v.x = s - 1 - v.x;
          v.y = s - 1 - v.y;
        }
        [v.x, v.y] = [v.y, v.x];
      }
      v.x += s * rx;
      v.y += s * ry;
      i >>= 2;
    }
    return v.mul(this.scale);
  }

  f(t) {
    t *= this.N;
    let ti = Math.floor(t);
    let tf = t - ti;
    return this._hilbert(ti).mix(this._hilbert(ti + 1), tf);
  }
}
