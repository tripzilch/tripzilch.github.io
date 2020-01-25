class Tunnel {
  constructor() {
    this.size = 0.5;
    this.lineWidth = 16.0;
    this.hue = rand(0, 360);
    this.hue_f = 5;
    this.hue_a = 0;
    this.hue_s = 0;
    this.hue_phase = 0;
    this.sat = 100;
    this.lit = 50;
    this.r_f = 3;
    this.r_a = 0;
    this.r_s = 0;
    this.r_phase = 0;
  }

  draw(dt) {
    const N = 256, da = TAU / N;
    const size = map(this.size, 0, 1, this.lineWidth / (1 - this.r_a), (H2 - this.lineWidth) / (1 + this.r_a));
    this.hue_phase = (this.hue_phase + this.hue_s * dt) % TAU;
    this.r_phase = (this.r_phase + this.r_s * dt) % TAU;
    let px0, py0, px1, py1;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < N + 1; i++) {
      const a = i * da;
      let r = size * (1 + this.r_a * sin(this.r_phase + this.r_f * a));
      const x0 = W2 + (r - this.lineWidth) * cos(a);
      const y0 = H2 + (r - this.lineWidth) * sin(a);
      const x1 = W2 + (r + this.lineWidth) * cos(a);
      const y1 = H2 + (r + this.lineWidth) * sin(a);
      const hue = this.hue + this.hue_a * sin(this.hue_phase + this.hue_f * a);
      const c = hsl(hue, this.sat, this.lit);
      if (i > 0) {
        ctx.strokeStyle = c;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.moveTo(px0, py0);
        ctx.lineTo(px1, py1);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x0, y0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } 
      px0 = x0; py0 = y0; px1 = x1; py1 = y1;
    }
  }
}
