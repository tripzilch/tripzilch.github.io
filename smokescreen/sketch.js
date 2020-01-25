let canvas, ctx;
let W, H, W2, H2, diag, diag2, aspect, WH, WH2;
let keys = {}, modKeys = 0;

let bgcol = "#000";
let tunnel0 = new Tunnel();
let tunnel0_on = true;
let tunnel1 = new Tunnel();
let tunnel1_on = false;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  ctx = canvas.elt.getContext("2d");
  calc_canvas_size();
  // frameRate(30); // maybe not?
  strokeCap(ROUND);
  strokeJoin(ROUND);
  const bonkey = b => (ev => { keys[ev.code] = b; modKeys = ev.shiftKey + 2 * ev.ctrlKey + 4 * ev.altKey + 8 * ev.metaKey; });
  window.addEventListener("keydown", bonkey(true));
  window.addEventListener("keyup", bonkey(false));
}

let last_now = Date.now() * 0.001;
let cur_tunnel = tunnel0;
function draw() {
  const now = Date.now() * 0.001;
  const dt = now - last_now;
  last_now = now;

  background(bgcol);
  if (tunnel0_on) tunnel0.draw(dt);
  if (tunnel1_on) tunnel1.draw(dt);

  if ((frameCount & 7) == 0) {
    stats.innerHTML = `${frameRate().toFixed(1)} fps`;
  }
  let amount = dt;
  let tunnel = cur_tunnel;
  const adjust = (k, dn, up, lo, hi, travel=3) => { tunnel[k] = clamp(tunnel[k] + ((up?1:0) - (dn?1:0)) * dt * (hi - lo) / travel, lo, hi); }
  if (modKeys == 0) {
    adjust('size', keys.ArrowDown, keys.ArrowUp, 0, 1);
    adjust('lineWidth', keys.ArrowLeft, keys.ArrowRight, 0.5, 96);
    adjust('hue', keys.KeyZ, keys.KeyX, -360, 720, 18); tunnel.hue = (tunnel.hue + 720) % 360;
    adjust('sat', keys.KeyA, keys.KeyS, 0, 100);
    adjust('lit', keys.KeyQ, keys.KeyW, 0, 100);
  }
  if (modKeys == 1) { // shift
    adjust('r_phase', keys.ArrowUp, keys.ArrowDown, -TAU * 2, TAU * 2, 6);
    adjust('hue_phase', keys.KeyX, keys.KeyZ, -TAU * 2, TAU * 2, 6);
  }
  if (modKeys == 2) { // ctrl
    adjust('r_a', keys.ArrowDown, keys.ArrowUp, 0.0, 0.5);
    adjust('hue_a', keys.KeyZ, keys.KeyX, 0, 60);
  }
  if (modKeys == 3) { // ctrl+shift
    adjust('r_s', keys.ArrowUp, keys.ArrowDown, -TAU * 2, TAU * 2, 6);
    adjust('hue_s', keys.KeyX, keys.KeyZ, -TAU * 2, TAU * 2, 6);
  }
}

let stopped = false, show_info = false;
function keyPressed() {
  if (key == ' ') {
    stopped = !stopped;
    if (stopped) { noLoop(); } else { 
      last_now = Date.now() * 0.001;
      loop(); 
    }
  }
  if (key == 'f') {
    let fs = fullscreen();
    fullscreen(!fs);
  }
  if (key == 'h') {
    show_info = !show_info;
    info.style.display = show_info ? "block" : "none";
  }
  if (modKeys == 4) { // alt = adjust frequency
    if (key == 'z') cur_tunnel.hue_f = clamp(cur_tunnel.hue_f - 1, 1, 36);
    if (key == 'x') cur_tunnel.hue_f = clamp(cur_tunnel.hue_f + 1, 1, 36);
    if (keyCode == DOWN_ARROW) cur_tunnel.r_f = clamp(cur_tunnel.r_f - 1, 1, 12);
    if (keyCode == UP_ARROW) cur_tunnel.r_f = clamp(cur_tunnel.r_f + 1, 1, 12);
  }
  if (key == '1') { tunnel0_on = (cur_tunnel !== tunnel0); cur_tunnel = tunnel0_on ? tunnel0 : tunnel1; }
  if (key == '2') { tunnel1_on = (cur_tunnel !== tunnel1); cur_tunnel = tunnel1_on ? tunnel1 : tunnel0; }
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