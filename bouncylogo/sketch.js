const render = false;
let W, H, W2, H2, diag, diag2, aspect, WH, WH2;

const c0 = '#03e', c1 = '#0fd', c2 = '#999';
const shape = [];
const r0 = 64, r1 = 27;
const CN = 128;

let canvas, ctx;
let view_mode = 0;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  ctx = canvas.elt.getContext("2d");
  canvas_init();
  frameRate(30);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  for (let i = 0; i <= CN; i++) {
    let a = map(i, 0, CN, TAU * -1/6, TAU * 4/6);
    let p = Vec2.fromAngle(a, r0);
    shape.push(p);
  }
  for (let i = 0; i <= CN; i++) {
    let a = map(i, 0, CN, TAU * 4/6, TAU * -1/6);
    let p = Vec2.fromAngle(a, r1);
    shape.push(p);
  }
  stroke(c0);
  fill(c1);
  strokeWeight(6.0);
}

function draw_shape(gfx, x, y) {
  gfx.beginShape();
  for (let p of shape) gfx.vertex(x + p.x, y + p.y);
  gfx.endShape(CLOSE);
}

let sx, sy;
let vx = 9, vy = 12;
let dx = 1, dy = 1;
function draw() {
  // image(buf, 0, 0);
  fill(c2);
  draw_shape(this, sx, sy);
  sx += vx * dx;
  sy += vy * dy;
  if (sx < 0 || sx >= W) { 
    sx -= vx * dx;
    dx *= -1; 
    vx = rand(9, 15); 
    vy = rand(9, 15); 
  }
  if (sy < 0 || sy >= H) { 
    sy -= vy * dy;
    dy *= -1; 
    vx = rand(9, 15); 
    vy = rand(9, 15); 
  }
  fill(c1);
  draw_shape(this, sx, sy);  
}

let stopped = false, show_info = false;
function keyPressed() {
  if (key == ' ') {
    stopped = !stopped;
    if (stopped) { noLoop(); } else { loop(); }
  }
  if (key == 'f') {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  canvas_init();
}

function canvas_init() {
  W = width; H = height; W2 = W / 2; H2 = H / 2;
  diag = Math.hypot(W, H); diag2 = diag / 2; aspect = W / H;
  WH = vec2(W, H); WH2 = vec2(W2, H2);
  background(c2);
  sx = W2; sy = H2;
}