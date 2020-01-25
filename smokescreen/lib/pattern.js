function createPattern(im) {
  return canvas.drawingContext.createPattern(im.canvas, 'repeat');
}

function setFill(arg) {
  fill(0);
  canvas._setFill(arg);
}

function setStroke(arg) {
  stroke(0);
  canvas._setStroke(arg);
}

class LinePattern {
  constructor(bg) {
    this.im = createGraphics(W, H);
    this.im.background(bg);
  }
  pattern(fg, N, a, lw=1.0, jj=0.2) {
    let imp = this.im;
    imp.noFill();
    imp.stroke(fg);
    imp.push();
    imp.translate(W2, H2);
    imp.rotate(a);
    const L = Math.hypot(W, H);
    const dx = L / N;
    const rj = (j=jj) => random(-j, j);
    for (let x = -L; x <= L; x += dx * (1 + rj(jj))) {
      const dr = dx * rj(jj);
      imp.strokeWeight(lw * (1 + rj(jj) * 1.5));
      imp.line(x - dr, -L, x + dr, L);
    }
    imp.pop();
    let p = createPattern(imp);
    return p;
  }
}

class HatchPattern {
  constructor(bg) {
    this.im = createGraphics(W, H);
    this.clear(bg);
  }
  clear(bg) { 
    this.im.push();
    this.im.blendMode(REPLACE);
    this.im.background(bg); 
    this.im.pop();
  }
  pattern(fg, N, lw=1.0, jj=0.3) {
    let imp = this.im;
    imp.noFill();
    imp.stroke(fg);
    imp.push();
    imp.translate(W2, H2);
    const L = Math.hypot(W, H);
    const rj = (j=jj) => random(-j, j);
    for (let i = 0; i < N; i++) {
      let x = random(-L, L);
      // imp.push();
      imp.rotate(random(TAU));
      imp.strokeWeight(lw * (1 + rj(jj)));
      imp.line(x, -L, x, L);
      // imp.pop();
    }
    imp.pop();
    let p = createPattern(imp);
    return p;
  }
}


function dot_pattern(fg, bg, d, r, a) {
  const p = createGraphics(W, H);
  p.background(bg);
  p.fill(fg);
  p.noStroke();
  p.push();
  p.translate(W2, H2);
  p.rotate(a);
  let o = 0;
  for (let y = -D2; y <= D2; y += d) {
    for (let x = -D2; x <= D2; x += d) {
      p.circle(x, y, r * 2);
    }
  }
  p.pop();
  return createPattern(p);
}

