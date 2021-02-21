const container = document.getElementById('container');
const view = document.getElementById('view');
const info = document.getElementById('info');
const PROJ_NAME = /([^\/]+)\/$/.exec(location.pathname)[1];
const debug = location.hash === '#debug';
info.hidden = !debug;
document.title = PROJ_NAME;

function log(s) {
  info.innerHTML += s + '\n';
  console.log(s);
}

RNG = xorshift128;
view.width = 1080; view.height = 1080;
const W = view.width, H = view.height;
const centre = vec2(W * .5, H * .5), scale = .4 * W;
const ctx = view.getContext('2d');
xorshift128_seed(Date.now() + '');
const _burn = [...$G.loop(235, i => RNG())];

class Epi5x {
  constructor() {
    // M=Math;T=2*M.PI;s=M.sin;c=M.cos;G=M.random;
    this.f = 1 + 4 * RNG()|0;
    this.g = this.f + 1 + RNG() * (5 - this.f)|0;
    const h = this.f + this.g;
    this.y = h % 3 ? (h & 1 ? h : 2) : 3;
    const rsym = ()=>this.y*(1+RNG()*(3-(this.y/3|0))|0);
    this.h0 = rsym(); this.h1 = rsym(); this.h2 = rsym();
    this.h3 = rsym(); this.h4 = rsym();
    const rapok = ()=> RNG() < .6 ? RNG() * 2.0 / (this.y + 3) : 0;
    this.k0 = rapok(); this.k1 = rapok();
    this.k2 = rapok(); this.k3 = rapok();
    for (let rvar of 'p0,p1,p2,p3,p4,p5,wr6,wr7,wr8,ws,wp,a'.split(',')) {
      this[rvar] = RNG();
    }
    let vmax = 0;
    const N = 1999, N1 = 1 / N;
    for (let i = 0; i < 1999; i++) {
      vmax = max(vmax, this.ff(i * N1 + N1).sub(this.ff(i * N1)).hypot());
    }
    vmax *= N;
    this.wf = floor(10 * vmax);    
    console.log(vmax, this.wf);
  }
  ff(t) {
    const rA = cLUT.R(this.f, cLUT.O(this.h0, this.p0, this.p1, this.k0, t), cLUT.O(this.y, this.p2, 1 - this.a * .4, this.k1, t), t);
    const rB = cLUT.R(-this.g, cLUT.O(this.h1, this.p3, this.p4, this.k2, t), cLUT.O(this.y, this.p5, .3 + this.a * .4, this.k3, t), t);
    return rA.add(rB);
  }
  fn(t) {
    const w = (.4 + .6 * this.ws) * .1 * cLUT.O(this.h2, cLUT.O(this.h3, this.wr6, this.wr7, this.wr8, t), .5, .5, t) ** (2 + 4 * this.wp);
    return this.ff(t).add(cLUT.R(this.wf, 0, w, t));
  }
}

const len2 = (x, y) => (x * x + y * y) ** 0.5;
function q2mat([X,Y,Z,W]) {
  return new Mat3(1-2*Y*Y-2*Z*Z, 2*X*Y-2*Z*W, 2*X*Z+2*W*Y, 
                  2*X*Y+2*W*Z, 1-2*X*X-2*Z*Z, 2*Y*Z-2*W*X,
                  2*X*Z-2*W*Y, 2*Y*Z+2*W*X, 1-2*X*X-2*Y*Y);
}
function ortho_score(vv) {
  const N = vv.length;
  let sum = 0;
  for (let i = 0; i < N - 1; i++) {
    for (let j = i + 1; j < N; j++) {
      sum += vv[i].dot(vv[j]) ** 2;
    }
  }
  return sum;
}
function good_unitv(N, tries=25) {
  let best = Infinity, res;
  for (let i = 0; i < tries; i++) {
    const test = [...$G.loop(rp.length, () => Vec3.unit_rand())];
    const score = ortho_score(test);
    if (score < best) {
      res = test;
      best = score;
    }
  }
  return res;
}

const rp = 'p0,p1,p2,p3,p4,p5,wr6,wr7,wr8'.split(',');
let epi, ru, rv;
function init() {
  epi = new Epi5x();
  // ru = [...$G.loop(rp.length, () => Vec3.unit_rand())];
  // rv = [...$G.loop(rp.length, () => Vec3.unit_rand())];
  ru = good_unitv(rp.length);
  rv = good_unitv(rp.length);
}
init();

view.addEventListener('click', e => {
  e.stopPropagation();
  init();
});
document.addEventListener('click', () => {
  // full screen
  const e = container;
  if (e.requestFullscreen) {
    e.requestFullscreen();
  } else if (e.webkitRequestFullscreen) {
    e.webkitRequestFullscreen();
  }
}); 

document.body.addEventListener('keyup', ev => {
  if (ev.code === 'Escape') {
    running = false;
    console.log('STOPPED');
  }
});

let draw_count;
function draw_path(ctx, path, closed=false) {
  draw_count = 0;
  ctx.beginPath();
  const {value: p0, done} = path.next();
  if (done) return;
  draw_count++;
  ctx.moveTo(p0.x, p0.y);
  for (let p of path) {
    draw_count++;
    ctx.lineTo(p.x, p.y);
  }
  if (closed) ctx.closePath();
}

const N = 7999, N1 = 1 / N;
let framecount = 0;
const start_time = Date.now();
let running = true;
function draw() {
  if (!running) return;
  if ((framecount & 63) === 0) {
    const elapsed = Date.now() - start_time;
    info.innerHTML = `${(1000 * framecount / elapsed).toFixed(1)}fps | pts = ${draw_count} / ${N}`;
  }
  // ctx.fillStyle = '#fc0';//getComputedStyle(document.body).backgroundColor;
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = '#f90';
  ctx.lineJoin = 'bevel';
  ctx.lineWidth = 6;
  ctx.beginPath();
  const q = sensor?.quaternion;
  if (q) {
    let mat = q2mat(q);
    for (let k = 0; k < rp.length; k++) {
      // const tv = mat.rmul(vec3(0,0,-1))
      const v = mat.rmul(rv[k]);
      const val = .5 + .5 * ru[k].dot(v);
      epi[rp[k]] = mix(epi[rp[k]], val, .5);
      // epi[rp[k]] = mix(epi[rp[k]], smoothstep(val, 0, 1), .5);
      if (debug) {
        ctx.strokeRect(540, 20 * k, 540 * epi[rp[k]], 5);
      }
    }
  }
  let path = $G.loop1(N, t => epi.fn(t).scale_trans(scale * .6, centre));
  path = simplify_RW(path, 1.);
  draw_path(ctx, path, true);
  // for (let i = 0; i < N; i++) {
  //   const t = i * N1;
  //   const p = epi.fn(t);
  //   p.scale_trans(scale * 0.6, centre);
  //   if (i === 0) {
  //     ctx.moveTo(p.x, p.y);
  //   } else {
  //     ctx.lineTo(p.x, p.y);
  //   }
  // }
  ctx.stroke();
  framecount++;
  window.requestAnimationFrame(draw);
}

let sensor = null;
try {
    sensor = new RelativeOrientationSensor({
      referenceFrame:'device', 
      frequency:60
    });
    sensor.addEventListener('error', event => {
        // Handle runtime errors.
        if (event.error.name === 'NotAllowedError') {
            log('Request permission');
            // Branch to code for requesting permission.
        } else if (event.error.name === 'NotReadableError' ) {
            log('Cannot connect to the sensor.');
            // sensor = null;
        }
    });
    sensor.start();
} catch (error) {
    // Handle construction errors.
    if (error.name === 'SecurityError') {
        // See the note above about feature policy.
        log('Sensor construction was blocked by a feature policy.');
    } else if (error.name === 'ReferenceError') {
        log('Sensor is not supported by the User Agent.');
    } else {
        log('err:' + error);
    }
}

    draw();
