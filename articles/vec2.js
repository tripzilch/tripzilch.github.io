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
  normalize_safe() { let m = 1 / (Math.hypot(this.x, this.y) || 1); this.x *= m; this.y *= m; return this; }
  normalize() { let m = 1 / Math.hypot(this.x, this.y); this.x *= m; this.y *= m; return this; }
  op1(f) { this.x = f(this.x); this.y = f(this.y); return this; }
  op2(v, f) { this.x = f(this.x, v.x); this.y = f(this.y, v.y); return this; }
  op3(v, w, f) { this.x = f(this.x, v.x, w.x); this.y = f(this.y, v.y, w.y); return this; }
  jitter(a) { this.x += a * (RNG() - RNG());  this.y += a * (RNG() - RNG()); return this; }

  // scalar methods
  dist(v) { return Math.hypot(this.x - v.x, this.y - v.y); }
  dist2(v) { return (this.x - v.x) ** 2 + (this.y - v.y) ** 2; }
  hypot() { return Math.hypot(this.x, this.y); }
  dot(v) { return this.x * v.x + this.y * v.y; }
  dot2(x, y) { return this.x * x + this.y * y; }

  // swizzling
  get xy() { return new Vec2(this.x, this.y); } // Vec2.xy is also copy constructor
  get yx() { return new Vec2(this.y, this.x); }
  get xx() { return new Vec2(this.x, this.x); }
  get yy() { return new Vec2(this.y, this.y); }
  set xy(v) { [this.x, this.y] = [v.x, v.y]; }
  set yx(v) { [this.x, this.y] = [v.y, v.x]; }

  // polar getters and setters
  get r() { return Math.hypot(this.x, this.y); }
  get phi() { return Math.atan2(this.y, this.x); }
  set r(r_) { 
    let m = r_ / Math.hypot(this.x, this.y); 
    this.x *= m; this.y *= m; 
  }
  set phi(phi_) { 
    let r = Math.hypot(this.x, this.y);
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
  static urandom(a=1) {
    return new Vec2(a * RNG(), a * RNG());
  }
  static irandom(a=1) {
    return new Vec2(a * (2 * RNG() - 1), a * (2 * RNG() - 1));
  }
  static fromAngle(phi, r) {
    return new Vec2(r * Math.cos(phi), r * Math.sin(phi));
  }
}
const vec2 = (x, y) => new Vec2(x, y);
Vec2.ZERO = vec2(0, 0);
Vec2.ONE = vec2(1, 1);

function fill_shape(ctx, col, path, o=Vec2.ZERO) {
  const x = o.x, y = o.y;
  ctx.beginPath();
  ctx.moveTo(path[0].x + x, path[0].y + y);
  for (let i = 0; i < path.length; i++) {
    ctx.lineTo(path[i].x + x, path[i].y + y);
  }
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
}

function stroke_shape(ctx, col, lw, path, closed=false, o=Vec2.ZERO) {
  const x = o.x, y = o.y;
  ctx.beginPath();
  ctx.moveTo(path[0].x + x, path[0].y + y);
  for (let i = 0; i < path.length; i++) {
    ctx.lineTo(path[i].x + x, path[i].y + y);
  }
  if (closed) ctx.closePath();
  ctx.strokeStyle = col;
  ctx.lineWidth = lw;
  ctx.stroke();
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

function smooth_closed_path(pts, k=1) {
  while (k > 0) {
    let N = pts.length;
    let new_pts = [];
    let pp = pts[N - 1];
    for (let i = 0; i < N; i++) {
      let p = pts[i];
      new_pts.push(vec2(p.x * 0.25 + pp.x * 0.75, p.y * 0.25 + pp.y * 0.75));
      new_pts.push(vec2(p.x * 0.75 + pp.x * 0.25, p.y * 0.75 + pp.y * 0.25));
      pp = p;
    }
    pts = new_pts;
    k--;
  }
  return pts;
}

const NOISEWAV_L = 8, NOISEWAV_M = NOISEWAV_L - 1; // must be power of two
class NoiseWav {
  constructor(r = 0.5) {
    this.wavx = new Float32Array(NOISEWAV_L + 1);
    this.wavy = new Float32Array(NOISEWAV_L + 1);
    let o = 1;
    for (let i = 0; i < NOISEWAV_L; i++) {
      this.wavx[i] = mix(RNG(), 1, r) * o;
      this.wavy[i] = mix(RNG(), 1, r) * o;
      o *= -1;
    }
    this.wavx[NOISEWAV_L] = this.wavx[0]; // guard
    this.wavy[NOISEWAV_L] = this.wavy[0]; // guard 
  }
  y(t) {
    let i = Math.floor(t);
    let f = t - i;
    i &= NOISEWAV_M;
    f *= f * (3.0 - 2.0 * f); // smoothstep
    // f *= f * f * (f * (f * 6 - 15) + 10);// smootherstep
    // f *= f * f * f * (-20 * f * f * f + 70 * f * f - 84 * f + 35); // smootheststep
    return this.wavx[i] * (1 - f) + this.wavx[i + 1] * f;
  }
  x(t_) {
    let t = t_ + .5;
    let i = Math.floor(t);
    let f = t - i;
    i &= NOISEWAV_M;
    f *= f * (3.0 - 2.0 * f); // smoothstep
    // f *= f * f * (f * (f * 6 - 15) + 10);// smootherstep
    // f *= f * f * f * (-20 * f * f * f + 70 * f * f - 84 * f + 35); // smootheststep
    return this.wavy[i] * (1 - f) + this.wavy[i + 1] * f;
  }
  xy(t) { return vec2(this.x(t), this.y(t)); }
  rotate(v, a) { 
    const ca = this.x(a);
    const sa = this.y(a);
    [v.x, v.y] = [ca * v.x - sa * v.y, sa * v.x + ca * v.y];
    return v; 
  }
}
class _SinCos {
  constructor() {}
  x(t) {return Math.cos(t * PI); }
  y(t) {return Math.sin(t * PI); }
  xy(t) { return vec2(this.x(t), this.y(t)); }
  rotate(v, a) { 
    const ca = this.x(a);
    const sa = this.y(a);
    [v.x, v.y] = [ca * v.x - sa * v.y, sa * v.x + ca * v.y];
    return v; 
  }
}

const square_cos = t => clamp(8 * abs(0.5 - frac(t * rTAU)) - 2, -1,1);
const square_sin = t => clamp(8 * abs(0.5 - frac(t * rTAU - 0.25)) - 2, -1,1);
function square_rotate(v, a) { 
    const ca = square_cos(a);
    const sa = square_sin(a);
    [v.x, v.y] = [ca * v.x - sa * v.y, sa * v.x + ca * v.y];
    return v; 
}
const vrect = (phi, r) => vec2(r * square_cos(phi), r * square_sin(phi));
const vcirc = Vec2.fromAngle;

class Hilbert {
  constructor(order) {
    this.order = order;
    this.size = 1 << order;
    this.scale = 1.0 / (this.size - 1);
    this.N = this.size * this.size - 1;
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
