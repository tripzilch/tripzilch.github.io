const view = document.getElementById('view');
const info = document.getElementById('info'); info.hidden = false;
const PROJ_NAME = /([^\/]+)\/$/.exec(location.pathname)[1];
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
    const rapok = ()=>RNG()<.6?RNG()*1.6/(this.y+2):0;
    this.k0 = rapok(); this.k1 = rapok();
    this.k2 = rapok(); this.k3 = rapok();
    for (let rvar of 'p0,p1,p2,p3,p4,p5,wr6,wr7,wr8,ws,wp,a'.split(',')) {
      this[rvar] = RNG();
    }
  }
  wob(t) {
    const w = (.3 + 1. * this.ws) * .1 * cLUT.O(this.h2, cLUT.O(this.h3, this.wr6, this.wr7, this.wr8, t), .5, .5, t) ** (2 + 4 * this.wp);
    return cLUT.R((this.f + this.g) * 144, 0, w, t);
  }
  fn(t){
    const rA = cLUT.R(this.f, cLUT.O(this.h0, this.p0, this.p1, this.k0, t), cLUT.O(this.y, this.p2, 1 - this.a * .4, this.k1, t), t);
    const rB = cLUT.R(-this.g, cLUT.O(this.h1, this.p3, this.p4, this.k2, t), cLUT.O(this.y, this.p5, .3 + this.a * .4, this.k3, t), t);
    return rA.add(rB).add(this.wob(t));
  }
}

function q2mat([X,Y,Z,W]) {
  return new Mat3(1-2*Y*Y-2*Z*Z, 2*X*Y-2*Z*W, 2*X*Z+2*W*Y, 
                  2*X*Y+2*W*Z, 1-2*X*X-2*Z*Z, 2*Y*Z-2*W*X,
                  2*X*Z-2*W*Y, 2*Y*Z+2*W*X, 1-2*X*X-2*Y*Y);
}

const rp = 'p0,p1,p2,p3,p4,p5,wr6,wr7,wr8'.split(',');
let epi, ru;
function init() {
  epi = new Epi5x(); 
  ru = [...$G.loop(rp.length, () => Vec3.unit_rand())];
}
init();
document.addEventListener('click', init); 

const N = 14999, N1 = 1 / N;
function draw() {
  ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#ffc';
  ctx.lineJoin = 'bevel';
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  const q = sensor?.quaternion;
  if (q) {
    let mat = q2mat(q);
    for (let k = 0; k < rp.length; k++) {
      epi[rp[k]] = mat.rmul(ru[k]).x;
      // ctx.strokeRect(540, 20 * k, 540 * q[k], 5);
    }
  }
  for (let i = 0; i < N; i++) {
    const t = i * N1;
    const p = epi.fn(t);
    p.scale_trans(scale * 0.6, centre);
    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }
  ctx.closePath();
  ctx.stroke();
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
