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

function draw_shape(pp, o=Vec2.ZERO) {
  beginShape(); 
  for (let p of pp) { vertex(p.x + o.x, p.y + o.y); }
  endShape();
}

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

function smooth_closed_path(pp) {
  let sp = [pp[0].xy.mix(pp[pp.length - 1], .5)];
  for (let i = 1; i < pp.length; i++) {
    sp.push(pp[i].xy.mix(pp[i - 1], .5));
  }
  return sp;
}