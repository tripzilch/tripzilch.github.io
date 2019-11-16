let canvas, ctx;
let W, H, W2, H2, diag, diag2, aspect, WH, WH2;
let keys = {};

let bgcol = "#000";
let fgcol = "#fff";

let cur_mesh, meshA, meshB, meshA_on = true, meshB_on = false;
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  ctx = canvas.elt.getContext("2d");
  calc_canvas_size();
  // frameRate(30); // maybe not?
  strokeCap(ROUND);
  strokeJoin(ROUND);
  window.addEventListener("keydown", ev => { keys[ev.code] = true; });
  window.addEventListener("keyup", ev => { keys[ev.code] = false; });
  meshA = new LineMesh();
  meshB = new LineMesh();
  cur_mesh = meshA;
}

let last_now = Date.now() * 0.001;
function draw() {
  const now = Date.now() * 0.001;
  const dt = now - last_now;
  last_now = now;

  background(bgcol);
  if (meshA_on) meshA.draw(dt);
  if (meshB_on) meshB.draw(dt);

  if ((frameCount & 7) == 0) {
    stats.innerHTML = `${frameRate().toFixed(1)} fps`;
  }
  let amount = dt;
  let mesh = cur_mesh;
  if (keys.ArrowLeft) mesh.angle -= 0.5 * amount;
  if (keys.ArrowRight) mesh.angle += 0.5 * amount;
  if (keys.ArrowDown) mesh.s_step = clamp(mesh.s_step - 5 * amount, 1, 80);
  if (keys.ArrowUp) mesh.s_step = clamp(mesh.s_step + 5 * amount, 1, 80);
  if (keys.KeyZ) mesh.lineWidth = clamp(mesh.lineWidth - 1.5 * amount, 0.25, 12);
  if (keys.KeyX) mesh.lineWidth = clamp(mesh.lineWidth + 1.5 * amount, 0.25, 12);
  if (keys.KeyA) mesh.amp = clamp(mesh.amp - 3.0 * amount, 0.0, 80);
  if (keys.KeyS) mesh.amp = clamp(mesh.amp + 3.0 * amount, 0.0, 80);
  if (keys.KeyQ) mesh.scale = clamp(mesh.scale - 0.0005 * amount, 0.0005, 0.032);
  if (keys.KeyW) mesh.scale = clamp(mesh.scale + 0.0005 * amount, 0.0005, 0.032);
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
  if (key == 'i') {
    [fgcol, bgcol] = [bgcol, fgcol];
  }
  if (key == '1') { meshA_on = (cur_mesh !== meshA); cur_mesh = meshA_on ? meshA : meshB; }
  if (key == '2') { meshB_on = (cur_mesh !== meshB); cur_mesh = meshB_on ? meshB : meshA; }
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