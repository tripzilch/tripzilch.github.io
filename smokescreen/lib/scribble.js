class Noiz {
  constructor(dt, mean, dev) {
    this.t = 0;
    this.dt = dt;
    this.RND = () => vec2(mean + Math.random() * 2 * dev - dev,
                          mean + Math.random() * 2 * dev - dev);
    this.x0 = this.RND();
    this.x1 = this.RND();
  }
  val() {
    this.t += this.dt;
    if (this.t > 1) {
      this.t -= 1;
      this.x0 = this.x1;
      this.x1 = this.RND();
    }
    let r = this.t;
    r *= r * (3 - 2 * r);
    return this.x0.xy.mix(this.x1, r);
  }
}

// const noiz = (t, s=555) => gloop.noise1D(t, {seed:s, theta:0});
let Nscribble = 200;
function scribble(v0, v1, size, i=0) {
    // let a = 40, b = 40;
    let p = vec2(Math.random() * TAU, Math.random() * TAU);
    const dth = TAU / Nscribble;
    const Nc = 8 * dth, pja = Nc * 0.25;
    const dir = Math.sign(Math.random() - 0.50);
    
    const rp = new Noiz(0.3 * Nc, Nc * dir, pja), 
          rs = new Noiz(5 / Nscribble, size * 2, size), 
          rd = new Noiz(13 / Nscribble, 0, size * 2);
  
    const vv = [], ww = [];
    for (let j = 0; j < Nscribble; j++) {
      const t = j / Nscribble;
      p.add(rp.val());//;
      const r = rs.val().smul(0.1 + 0.9 * t);
      const v = Vec2.fromAngle(p.x, r.x).add(Vec2.fromAngle(-p.y, r.y));
      v.add(rd.val());
      v.add(v0.xy.mix(v1, t ** 3));
      // v.y -= 24 * size * t **cos 3;
      vv.push(v);
      tap = Math.min(1, t * 60) * Math.min(1, (1 - t) * 60);
      const w = 0.45 * size * (1 - 0.75 * t ** 2) * tap;
      ww.push(w);      
    }
    return thick_brush(vv, ww);
}
