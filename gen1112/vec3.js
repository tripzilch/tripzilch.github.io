class Vec3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  // vector update methods
  // todo: make v={x,y,z}
  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
  vmul(v) { this.x *= v.x; this.y *= v.y; this.z *= v.z; return this; }
  mul(a) { this.x *= a; this.y *= a; this.z *= a; return this; }
  madd(v, a) { this.x += v.x * a; this.y += v.y * a; this.z += v.z * a; return this; }
  scale_trans(a, v) { this.x = this.x * a + v.x; this.y = this.y * a + v.y; this.z = this.z * a + v.z; return this; }
  mix(v, p) { 
    // this.x += (v.x - this.x) * p; 
    // this.y += (v.y - this.y) * p; 
    this.x = (1 - p) * this.x + p * v.x; 
    this.y = (1 - p) * this.y + p * v.y; 
    this.z = (1 - p) * this.z + p * v.z; 
    return this; 
  }
  neg() { this.x *= -1; this.y *= -1; this.z *= -1; return this; }
  // rot90() { [this.x, this.y] = [-this.y, this.x]; return this; }
  // rot270() { [this.x, this.y] = [this.y, -this.x]; return this; }
  static rotX(a) {  // todo: use cLUT?
    const ca = Math.cos(a * TAU);
    const sa = Math.sin(a * TAU);
    return v => new Vec3(v.x, ca * v.y - sa * v.z, sa * v.y + ca * v.z);
  }  
  static rotY(a) { 
    const ca = Math.cos(a * TAU);
    const sa = Math.sin(a * TAU);
    return v => new Vec3(ca * v.x - sa * v.z, v.y, sa * v.x + ca * v.z);
  }  
  static rotZ(a) { 
    const ca = Math.cos(a * TAU);
    const sa = Math.sin(a * TAU);
    return v => new Vec3(ca * v.x - sa * v.y, sa * v.x + ca * v.y, v.z);
  }  
  // test if (x**2 + y**2)**-2 is faster
  normalize_safe() { const m = 1 / ((this.x ** 2 + this.y ** 2 + this.z ** 2) ** 0.5 || 1); this.x *= m; this.y *= m; this.z *= m; return this; }
  normalize() { const m = (this.x ** 2 + this.y ** 2 + this.z ** 2) ** -0.5; this.x *= m; this.y *= m; this.z *= m; return this; }
  op1(f) { this.x = f(this.x); this.y = f(this.y); this.z = f(this.z); return this; }
  op2(v, f) { this.x = f(this.x, v.x); this.y = f(this.y, v.y); this.z = f(this.z, v.z); return this; }
  op3(v, w, f) { this.x = f(this.x, v.x, w.x); this.y = f(this.y, v.y, w.y); this.z = f(this.z, v.z, w.z); return this; }
  jitter(a) { this.x += a * (RNG() - RNG()); this.y += a * (RNG() - RNG()); this.z += a * (RNG() - RNG()); return this; }

  // scalar methods
  // dist(v) { return Math.hypot(this.x - v.x, this.y - v.y); }
  dist(v) { return ((this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2) ** 0.5; }
  dist2(v) { return (this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2; }
  hypot() { return (this.x ** 2 + this.y ** 2 + this.z ** 2) ** 0.5; }
  hypot2() { return this.x ** 2 + this.y ** 2 + this.z ** 2; }
  dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
  dot3(x, y, z) { return this.x * x + this.y * y + this.z * z; }

  cross({x, y, z}) { return new Vec3(
    this.y * z - this.z * y, 
    this.z * x - this.x * z, 
    this.x * y - this.y * x); }

  get c() { return new Vec3(this.x, this.y, this.z); } // clone

  // iterator
  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
    yield this.z;
  }
  // toString with nice unicode math brackets
  toString() { return `⟨${this.x}, ${this.y}, ${this.z}⟩`; }
  toFixed(precision) { 
    return `⟨${this.x.toFixed(precision)}, ${this.y.toFixed(precision)}, ${this.z.toFixed(precision)}⟩`;
  }
  
  // static initializers
  static unit_rand() {
    const z = 2 * RNG() - 1, xy = (1 - z * z) ** .5;
    const {x:c, y:s} = cLUT.xy(RNG());
    return new Vec3(xy * c, xy * s, z);
  }
  static urand(a=1) {
    return new Vec3(a * RNG(), a * RNG(), a * RNG());
  }
  static drand(a=1) {
    return new Vec3(a * (RNG() - RNG()), a * (RNG() - RNG()), a * (RNG() - RNG()));
  }
  static irand(a=1) {
    return new Vec3(a * (2 * RNG() - 1), a * (2 * RNG() - 1), a * (2 * RNG() - 1));
  }
}

const vec3 = (x, y, z) => new Vec3(x, y, z);
Vec3.ZERO = vec2(0, 0, 0);
Vec3.ONE = vec2(1, 1, 1);

// function mat3inv(ADG, BEH, CFI) {
//   const det = ADG.x * (BEH.y*CFI.z - BEH.z*CFI.y) - BEH.x * (ADG.y*CFI.z - CFI.y*ADG.z) + CFI.x * (ADG.y*BEH.z - ADG.z*BEH.y);
//   const d1 = 1 / det;
//   return [(BEH.y*CFI.z-CFI.y*BEH.z) * d1, (CFI.x*BEH.z-BEH.x*CFI.z) * d1, (BEH.x*CFI.y-CFI.x*BEH.y) * d1,
//   (CFI.y*ADG.z-ADG.y*CFI.z) * d1, (ADG.x*CFI.z-CFI.x*ADG.z) * d1, (CFI.x*ADG.y-ADG.x*CFI.y) * d1,
//   (ADG.y*BEH.z-BEH.y*ADG.z) * d1, (BEH.x*ADG.z-ADG.x*BEH.z) * d1, (ADG.x*BEH.y-BEH.x*ADG.y) * d1];
  
// }

class Mat3 {
  constructor(a, b, c, d, e, f, g, h, i) {
    Object.assign(this, {a, b, c, d, e, f, g, h, i});
  }
  mul({a, b, c, d, e, f, g, h, i}) {
    return new Mat3(
      this.a * a + this.b * d + this.c * g,
      this.a * b + this.b * e + this.c * h,
      this.a * c + this.b * f + this.c * i,

      this.d * a + this.e * d + this.f * g,
      this.d * b + this.e * e + this.f * h,
      this.d * c + this.e * f + this.f * i,

      this.g * a + this.h * d + this.i * g,
      this.g * b + this.h * e + this.i * h,
      this.g * c + this.h * f + this.i * i);
  }
  vmul({x, y, z}) {
    return new Vec3(
      x * this.a + y * this.b + z * this.c,
      x * this.d + y * this.e + z * this.f,
      x * this.g + y * this.h + z * this.i);
  }
  rmul({x, y, z}) {
    return new Vec3(
      x * this.a + y * this.d + z * this.g,
      x * this.b + y * this.e + z * this.h,
      x * this.c + y * this.f + z * this.i);
  }
  inv() {
    const {a, b, c, d, e, f, g, h, i} = this;
    const det = a * (e * i - h * f) - b * (d * i - f * g) + c * (d * h - g * e);
    const d1 = 1 / det;
    return new Mat3(
          (e * i - f * h) * d1, (c * h - b * i) * d1, (b * f - c * e) * d1,
          (f * g - d * i) * d1, (a * i - c * g) * d1, (c * d - a * f) * d1,
          (d * h - e * g) * d1, (b * g - a * h) * d1, (a * e - b * d) * d1);
  }
  // a b c
  // d e f
  // g h i
  transpose() {
    return new Mat3(this.a, this.d, this.g, this.b, this.e, this.h, this.c, this.f, this.i);
  }
  static rotX(a) {
    const {x:ca, y:sa} = cLUT.xy(a);
    return new Mat3(1, 0, 0, 0, ca, -sa, 0, sa, ca);
  }
  static rotY(a) {
    const {x:ca, y:sa} = cLUT.xy(a);
    return new Mat3(ca, 0, sa, 0, 1, 0, -sa, 0, ca);
  }
  static rotZ(a) {
    const {x:ca, y:sa} = cLUT.xy(a);
    return new Mat3(ca, -sa, 0, sa, ca, 0, 0, 0, 1);
  }
  *[Symbol.iterator]() {
    yield this.a;
    yield this.b;
    yield this.c;
    yield this.d;
    yield this.e;
    yield this.f;
    yield this.g;
    yield this.h;
    yield this.i;
  }  
}
Mat3.id = new Mat3(1, 0, 0, 0, 1, 0, 0, 0, 1);

// function mat3inv({x:a, y:d, z:g}, {x:b, y:e, z:h}, {x:c, y:f, z:i}) {
//   const {x:a, y:d, z:g} = ADG;
//   const {x:b, y:e, z:h} = BEH;
//   const {x:c, y:f, z:i} = CFI;
//   const det = a * (e * i - h * f) - b * (d * i - f * g) + c * (d * h - g * e);
//   const d1 = 1 / det;
//   return [(e * i - f * h) * d1, (c * h - b * i) * d1, (b * f - c * e) * d1,
//           (f * g - d * i) * d1, (a * i - c * g) * d1, (c * d - a * f) * d1,
//           (d * h - e * g) * d1, (b * g - a * h) * d1, (a * e - b * d) * d1];
// }


/*
abc
def
ghi

ei-fh, ch-bi, bf-ce
fg-di, ai-cg, cd-af
dh-eg, bg-ah, ae-bd
* (1/det)

det = a * (ei - hf) - b * (di - fg) + c * (dh - ge)

*/

/*
const N3D
class Noise3D {
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
    const ni = (xi, yi, zi) => {
      xi &= mask; yi &= mask; zi &= mask;
      return perm[perm[perm[xi] ^ yi] ^ zi];
    }
    // ...
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
*/
