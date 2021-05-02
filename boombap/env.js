const ENV_EPS = 1E-10;
class Env {
  constructor(hit, len=1) {
    this.hit = hit;
    this.set_len(len);
  }
  set_len(len) {
    this.len = len;
    return this;
  }
  repeat(times) {
    return new Env(t => {
      for (let k = 0; k < times; k++) this.hit(t + k * this.len);
    }, this.len * times);
  }
}
Env.lin = (param, seq, len=1) => new Env(t => {
  param.setValueAtTime(seq[1], t); // fix/assume seq[0] == 0
  for (let i = 2; i < seq.length; i+=2) {
    param.linearRampToValueAtTime(seq[i + 1], t + seq[i] * len - ENV_EPS);
  }
}, len);
Env.exp = (param, seq, len=1) => new Env(t => {
  param.setValueAtTime(seq[1], t); // fix/assume seq[0] == 0
  for (let i = 2; i < seq.length; i+=2) {
    param.exponentialRampToValueAtTime(seq[i + 1], t + seq[i] * len - ENV_EPS);
  }
}, len);
Env.group = (...envs) => new Env(
  t => envs.forEach(env => env.hit(t)), // hit all envs at once
  envs.reduce((max_len, env) => max(max_len, env.len), 0)); // max of lengths
Env.cat = (...envs) => new Env(
  t => envs.reduce((tt, env) => { env.hit(tt); return tt + env.len; }, t), // hit all one after the other
  envs.reduce((sum, env) => sum + env.len, 0)); // sum of lengths
Env.pattern = (pat, envs, step, swing=0, swing_mask=1) => new Env(
  t => pat.forEach((v, i) => v > 0 && envs[v - 1].hit(t + i * step + (i & swing_mask) * swing * step)), 
  pat.length * step);

