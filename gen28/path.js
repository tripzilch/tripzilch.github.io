function* hatch_circle(v, r, a, d, p=null) {
  let y0 = -r + d * (p || RNG());
  for (let y = y0; y <= r; y += d1) {
    const bx = Vec2.fromAngle(a * TAU, 1.0), by = bx.xy.rot90();
    const x = (r * r - y * y) ** 0.5;
    yield (v.xy.madd(by, y).madd(bx, -x));
    yield (v.xy.madd(by, y).madd(bx, x));
    yield (null);
  }
}

function* hatch_poly(pp, phi, d, d_jitter=0.25, offset='random') {
  if (offset === 'random') offset = RNG();
  pp = [...pp];
  if (pp.length < 3) return;
  const L = pp.length;
  pp = [...rotate_path(pp, -phi)];
  let [xmin, xmax] = pp.reduce(([lo, hi], p) => [min(lo, p.x), max(hi, p.x)], [Infinity, -Infinity]);
  const x0 = xmin + offset * d;
  const xs = [];
  for (let x = x0; x < xmax; x += d) {
    xs.push(x + drand(d * d_jitter));
  }
  const N = xs.length;

  // const upper = Array(N).fill(Infinity);
  // const lower = Array(N).fill(-Infinity);
  const hedge = [...$G.loop(N, () => [])];
  for (let i = 0; i < L; i++) {
    let p0 = pp[i], p1 = pp[(i + 1) % L];
    if (p1.x < p0.x) { let tmp = p0; p0 = p1; p1 = tmp; }
    const dp = p1.xy.sub(p0);
    const dpx1 = 1 / dp.x;
    // const j0 = ceil((p0.x - x0) / d);
    // const j1 = floor((p1.x - x0) / d);
    for (let j = 0; j < N; j++) {
      const x = xs[j];
      if (x < p0.x || x >= p1.x) continue;
      const t = (x - p0.x) * dpx1;
      hedge[j].push(mix(p0.y, p1.y, t))
    }
  }
  let flip = false;
  for (let j = 0; j < N; j++) {
    const x = xs[j];
    const h = hedge[j];
    h.sort((a, b) => a - b);
    if (flip) h.reverse();
    // console.log(`====== ${j}: x = ${x.toFixed(2)}`);
    // console.log(h);
    for (let k = 0; k < h.length - 1; k += 2) {
      const y0 = h[k], y1 = h[k + 1];
      // console.log(`${y0.toFixed(2)} -- ${y1.toFixed(2)}`);
      if (y0 === y1) continue;
      yield vec2(x, y0).rotate(phi);
      yield vec2(x, y1).rotate(phi);
      yield null;      
    }
    flip = !flip;
  }
}

function* rect(x, y, w, h) {
  yield vec2(x, y);
  yield vec2(x + w, y);
  yield vec2(x + w, y + h);
  yield vec2(x, y + h);
}
  
function* rotate_path(path, a, origin) {
  if (origin) {
    for (let p of path) 
      yield (p === null ? null : p.xy.sub(origin).rotate(a).add(origin));
  } else {
    for (let p of path) 
      yield (p === null ? null : p.xy.rotate(a));
  }
}

function estimate_extent(path) {
  let xmin, ymin, xmax, ymax;
  xmin = ymin = Infinity; xmax = ymax = -Infinity;
  for (let p of path) {
    if (p.x < xmin) xmin = p.x;
    if (p.y < ymin) ymin = p.y;
    if (p.x > xmax) xmax = p.x;
    if (p.y > ymax) ymax = p.y;
  }
  const dx = xmax - xmin, dy = ymax - ymin;
  const mx = 0.5 * (xmin + xmax), my = 0.5 * (ymin + ymax);
  const scale = 1 / max(xmax - xmin, ymax - ymin);
  const off = vec2(-mx * scale, -my * scale);
  return {
    extent: vec2(dx, dy), 
    centre: vec2(mx, my),
    scale: scale,
    offset: off
  }
}

function norm_path(path, scale) {
  if (!(path instanceof Array)) path = [...path];
  let pext = estimate_extent(path);
  for (let p of path) {
    p.scale_trans(pext.scale * scale, pext.offset);
  }
  return path;
}

class Scribble {
  constructor(size_exp, r=0.5) {
    this.N0 = new NoiseWav(size_exp, r);
    this.N1 = new NoiseWav(size_exp, r);
    this.L = this.N0.NOISEWAV_L;
  }
  f(t, size=1) {
    let s = t * this.L;
    return this.N1.rotate(this.N0.xy(s), s * PHI1).mul(size);
  }
}

// (not very good)
// function* smooth_path(path) {
//   let [p0, p1, p2] = path.head(3);
//   if (p0 === undefined) return;
//   yield p0.xy;
//   if (p1 === undefined) return;
//   if (p2 === undefined) { yield p1.xy; return; }
//   yield p1.xy.madd(p0, 0.5).madd(p2, 0.5).mul(0.5);
//   for (let p of path) {
//     p0 = p1; p1 = p2; p2 = p;
//     yield p1.xy.madd(p0, 0.5).madd(p2, 0.5).mul(0.5);
//   }
//   yield p2.xy;
// }
function* segments(path) {
  function* segment(first) {
    yield first;
    let {value: p, done} = path.next();
    while (!done && p !== null) {
      yield p;
      ({value: p, done} = path.next());      
    }
  }
  while (true) {
    let {value: p, done} = path.next();
    while (p === null && !done) {
      ({value: p, done} = path.next());
    }
    if (done) return;
    yield segment(p);
  }
}
function map_segments(fn) {
  return function* (path, ...args) {
    for (const seg of segments(path)) {
      yield* fn(seg, ...args);
      yield null;
    }
  }
}

function* simplify_min_dist(path, min_dist) {
  let {value: p, done} = path.next();
  if (done) return;
  yield p.xy;
  let prev_p = p, d1 = 0, p1 = p;
  for (p of path) {
    let d = prev_p.dist(p);
    while (d > min_dist) {
      const q = p1.xy.mix(p, (min_dist - d1) / (d - d1));
      yield q;
      prev_p = q;
      d -= min_dist;
    }
    d1 = d;
    p1 = p;
  }
  yield p.xy;
}

function* filter_dist(path, tol) {
  let {value: p, done} = path.next();
  if (done) return;
  yield p;
  const tol2 = tol * tol;
  let key = p;
  for (p of path) {
    const d2 = key.dist2(p);
    if (d2 >= tol) {
      yield p;
      key = p;
    }
  }
  if (key !== p) yield p;
}

function* subdiv_lines(path, min_dist) {
  let {value: p, done} = path.next();
  if (done) return;
  yield p.xy;
  const min_dist2 = min_dist ** 2, rmin_dist = 1 / min_dist;
  let prev_p = p;
  for (p of path) {
    let d2 = prev_p.dist2(p);
    if (d2 <= min_dist2) {
      yield p.xy;
    } else {
      const d = d2 ** 0.5;
      const N = Math.ceil(d * rmin_dist), N1 = 1 / N;
      for (let i = 1; i <= N; i++) {
        yield prev_p.xy.mix(p, i * N1);        
      }
    }
    prev_p = p;
  }
  yield p.xy;  
}

function* simplify_RW(path, tol=1.0) {
  // Reumann-Witkam simplification
  let {value: p0} = path.next();
  if (p0 === undefined) return;
  yield p0.xy;
  let {value: p} = path.next();
  if (p === undefined) return;
  let prev_p = p, ray = new Line(p0, p);
  for (p of path) {
    const d = abs(ray.dist(p));
    const dp = p.xy.sub(prev_p);
    if (d > tol || ray.d.dot(dp) < 0) { // second check for lines 
                                        // turning back on themselves,
                                        // unsure if this affects
                                        // regular simplification?
      yield prev_p.xy;
      ray = new Line(prev_p, p);
    }
    prev_p = p;
  }
  yield p;
}

function* doubleback(path, rdir=false) {
  path = [...path];
  if (rdir && RNG() < .5) path.reverse();
  yield* path;
  path.pop();
  path.reverse();
  yield* path;
}

function* clip_path(path, mask_fn, tol=1.0) {
  let {value: prev_p} = path.next();
  if (prev_p === undefined) return;
  let prev_on = mask_fn(prev_p);
  if (prev_on) yield prev_p;
  for (const p of path) {
    const on = mask_fn(p);
    if (on === prev_on) {
      if (on) yield p;
    } else {
      const len = prev_p.dist(p);
      let left = 0, right = 1;
      while ((right - left) * len > tol) {
        const mid = 0.5 * (left + right);
        const mid_on = mask_fn(prev_p.xy.mix(p, mid));
        if (mid_on !== on) {
          left = mid;
        } else {
          right = mid;
        }
      }
      yield prev_p.xy.mix(p, 0.5 * (left + right));
      yield (on ? p : null);
    }
    prev_on = on; prev_p = p;
  }
}

function pnpoly(shape, p) {
  const N = shape.length;
  let i, j, c;
  for (i = 0, j = N - 1; i < N; j = i++) {
    if ( ((shape[i].y > p.y) != (shape[j].y > p.y)) && 
         (p.x < (shape[j].x - shape[i].x) * (p.y - shape[i].y) / (shape[j].y - shape[i].y) + shape[i].x) )
       c = !c;
  }
  return c;
}

function clip_poly(shape, clip) {
  const eps = 1E-15;
  const link = (v, i, a) => {
    v.next = a[(i + 1) % a.length];
  }
  shape.forEach(link);
  clip.forEach(link);
  for (let v of shape) v.in = pnpoly(clip, v);
  let intersections = [];
  for (let sv of shape) {
    const r = sv.next.xy.sub(sv);
    // intersect
    for (let sc of clip) {
      const s = sc.next.xy.sub(sc);
      const quot = r.cross(s);
      if (abs(quot) < eps) continue; // parallel
      const num0 = q0.xy.sub(p0).cross(s);
      const num1 = q0.xy.sub(p0).cross(r);
      const rquot = 1 / quot;
      const t = num0 * rquot, u = num1 * rquot;
      if (t >=0 && t <= xt && u >= 0 && u <= 1) {
        xp = p0.xy.mix(p1, t);
        xi = i; xt = t;
      }        

    }
  }
/*

    * List the vertices of the clipping-region polygon A and those of the subject polygon B.
    * Label the listed vertices of subject polygon B as either inside or outside of clipping region A.
    * Find all the polygon intersections and insert them into both lists, linking the lists at the intersections.
    * Generate a list of "inbound" intersections – the intersections where the vector from the intersection to the subsequent vertex of subject polygon B begins inside the clipping region.
    * Follow each intersection clockwise around the linked lists until the start position is found.

If there are no intersections then one of three conditions must be true:

    * A is inside B – return A for clipping, B for merging.
    * B is inside A – return B for clipping, A for merging.
    * A and B do not overlap – return None for clipping or A & B for merging.

*/
}