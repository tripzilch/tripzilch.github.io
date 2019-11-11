let canvas, ctx;
let W, H, W2, H2, diag, diag2, aspect, WH, WH2;
let keys = {};

let bgcol = "#000";
let fgcol = "#fff";

let mesh;
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  ctx = canvas.elt.getContext("2d");
  calc_canvas_size();
  // frameRate(30); // maybe not?
  strokeCap(ROUND);
  strokeJoin(ROUND);
  window.addEventListener("keydown", ev => { keys[ev.code] = true; });
  window.addEventListener("keyup", ev => { keys[ev.code] = false; });
  mesh = new LineMesh();
}

class LineMesh {
  constructor(col="#fff", angle=radians(45), amp=10) {
    this.col = col;
    this.lineWidth = 2.0;
    this.angle = angle;
    this.amp = amp;
    this.t_step = 15.0;
    this.s_step = 20.0;
  }

  get angle() { return this.angle_; }
  set angle(val) {
    const eps = 0.0001;
    // trickery to shift angle by a tiny amount if sin or cos would be close to 0
    val = wrap(val, TAU);
    if ((val + eps) % HALF_PI < 2 * eps) val += 2 * eps;
    val %= PI;
    this.angle_ = val;
    this.sin = sin(val);
    this.cos = cos(val);
    this.isin = 1 / this.sin;
    this.icos = 1 / this.cos;
  }
  
  draw(time) {
    const x_min = -W2 - 2 * this.amp, x_max = -x_min;
    const y_min = -H2 - 2 * this.amp, y_max = -y_min;
    const scale = 0.004;
    ctx.beginPath();
    for (let s = -diag; s < diag; s += this.s_step) { // todo: make sure s hits 0 (centered)
      // origin of line
      const x0 = this.sin * s;
      const y0 = -this.cos * s;
      // intersect line w bounding box (todo: exploit x_min/max symmetry)
      let t0x = (x_min - x0) * this.icos;
      let t1x = (x_max - x0) * this.icos;
      let t0y = (y_min - y0) * this.isin;
      let t1y = (y_max - y0) * this.isin;
      if (t0x > t1x) { [t0x, t1x] = [t1x, t0x]; }
      if (t0y > t1y) { [t0y, t1y] = [t1y, t0y]; }
      if (t1x >= t0y && t1y >= t0x) {
        // yes intersect
        const t0 = max(t0x, t0y), t1 = min(t1x, t1y);
        // draw line
        let first = true;
        for (let t = t0; t < t1; t += this.t_step) {
          // line
          let x = x0 + this.cos * t;
          let y = y0 + this.sin * t;
          // perturb
          const p0 = 2.0 + scale * (3.6 * s + -1.1 * t) + -1.3 * time;
          const p1 = 1.4 + scale * (2.3 * s +  0.8 * t) +  1.0 * time;
          const q0 = 3.2 + scale * (3.8 * s + -1.2 * t) +  1.7 * time;
          const q1 = 1.1 + scale * (1.9 * s +  0.6 * t) + -1.0 * time;
          const d = this.amp * sin(p0 + 1.3 * sin(p1)) + this.amp * sin(q0 + 1.4 * sin(q1));
          x += this.sin * d;
          y -= this.cos * d;
          // add point to path
          if (first) {
            ctx.moveTo(x + W2, y + H2);
            first = false;
          } else {
            ctx.lineTo(x + W2, y + H2);
          }
        }
      } else {
        // no intersect
        // no line
      }
    }
    ctx.strokeStyle = this.col;
    ctx.lineWidth = this.lineWidth;
    ctx.stroke();
  }

}

let last_now = Date.now() * 0.001;
function draw() {
  const now = Date.now() * 0.001;
  const dt = now - last_now;
  last_now = now;

  background(bgcol);
  mesh.draw(now * 0.25);

  if ((frameCount & 31) == 0) {
    info.innerHTML = `${frameRate().toFixed(1)} fps`;
  }
  let amount = dt;
  if (keys.ArrowLeft) mesh.angle -= amount;
  if (keys.ArrowRight) mesh.angle += amount;
}

let stopped = false, show_info = false;
function keyPressed() {
  if (key == 's') {
    stopped = !stopped;
    if (stopped) { noLoop(); } else { loop(); }
  }
  if (key == 'f') {
    let fs = fullscreen();
    fullscreen(!fs);
  }
  if (key == 'h') {
    show_info = !show_info;
    info.style.display = show_info ? "block" : "none";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calc_canvas_size();
}

function calc_canvas_size() {
  W = width; H = height; W2 = W / 2; H2 = H / 2;
  diag = Math.hypot(W, H); diag2 = diag / 2; aspect = W / H;
  WH = vec2(W, H); WH2 = vec2(W2, H2);
}