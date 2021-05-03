const default_opts = {
  seed: false,
  BPM: 89
};

function hash_opts(defaults={}) {
  const ifnum = s => { const x = Number(s); return isNaN(x) ? s : x; }
  const h = decodeURIComponent(location.hash.substring(1));
  const res = Object.assign({}, defaults);
  for (const key_value of h.split('&')) {
    let [k, v] = key_value.split('=');
    if (v === undefined) { v = true; } 
    else if (v.includes(',')) { v = v.split(',').map(ifnum); } 
    else { v = ifnum(v); }
    res[k] = v;
  }
  return res;
}
const opts = hash_opts(default_opts);

const view = document.getElementById('view');
const splash = document.getElementById('splash');
const credits = document.getElementById('credits');
const info = document.getElementById('info');
const PROJ_NAME = /([^\/]+)\/$/.exec(location.pathname)[1];
document.title = PROJ_NAME;

function log(s) {
  splash.innerHTML += s + '\n';
  console.log(s);
}

RNG = xorshift128;
view.width = 1080; view.height = 1080;
const W = view.width, H = view.height;
const centre = vec2(W * .5, H * .5), scale = .4 * W;
const ctx = view.getContext('2d');
xorshift128_seed(Date.now() + '');
const _burn = [...$G.loop(235, i => RNG())];

class Queue {
  constructor() {
    this.tail = this.head = null;
    this.length = 0;
  }
  append(x) {
    const el = {prev: this.head, next: null, data: x};
    if (this.head) this.head.next = el;
    if (!this.tail) this.tail = el;
    this.head = el;
    this.length++;
  }
  popleft() {
    if (!this.tail) return undefined;
    const el = this.tail;
    this.tail = this.tail.next;
    this.length--;
    return el.data;
  }
}
QQ = new Queue();

class Epi5x {
  constructor() {
    // M=Math;T=2*M.PI;s=M.sin;c=M.cos;G=M.random;
    this.f = 1 + 4 * RNG()|0;
    this.g = this.f + 1 + RNG() * (5 - this.f)|0;
    const h = this.f + this.g; this.h = h;
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
    return cLUT.R((this.y) * 30 * this.h, 0, w, t);
  }
  fn(t){
    const rA = cLUT.R(this.f, cLUT.O(this.h0, this.p0, this.p1, this.k0, t), cLUT.O(this.y, this.p2, 1 - this.a * .4, this.k1, t), t);
    const rB = cLUT.R(-this.g, cLUT.O(this.h1, this.p3, this.p4, this.k2, t), cLUT.O(this.y, this.p5, .3 + this.a * .4, this.k3, t), t);
    return rA.add(rB).add(this.wob(t));
  }
}

const rp = 'p0,p1,p2,p3,p4,p5,wr6,wr7'.split(',');
let epi, kkp, snp, ks;
const rsign = () => RNG() > .5 ? 1 : -1;
function init() {
  epi = new Epi5x(); 
  ks = [...rp];
  ks = ks.map((par, i) => ({par, f: drand(), d: drand(), p: RNG(), is_kick: i < 4}));
  shuffle(ks);
  // console.log(ks);
  ru = [...$G.loop(rp.length, () => Vec3.unit_rand())];
}
init();
// document.addEventListener('click', init); 

const N = 7999, N1 = 1 / N;
const [dax, day, daz] = qphi(3);
const start_time = Date.now();
let cur_hit = {when: 0, n: 0}, next_hit = {when: 0, n: 0};
let last_kick = 0, last_snare = 0;
let framecount = 0;
let next_init = Infinity;
// KKSrrKSr
function draw(now) {
  // if (cur_hit === null) cur_hit = QQ.popleft();
  // if (next_hit === null) next_hit = QQ.popleft();
  let ii = 0;
  while (next_hit.when <= now + t16 * .25 && QQ.length > 0) {
    cur_hit = next_hit;
    next_hit = QQ.popleft();
    if (next_hit.n === 9) {  // cymbal
      next_init = next_hit.when;
      next_hit = QQ.popleft();
    }
    ii++;
    const typ = 'KKSrrKSr'[cur_hit.n];
    if (typ === 'K') last_kick = cur_hit.when;
    if (typ === 'S') last_snare = cur_hit.when;
  }
  if (now > next_init) {
    init();
    next_init = Infinity;
  }  

  ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, .4 * H, W, .2 * H);
  ctx.strokeStyle = '#df4';
  ctx.lineJoin = 'bevel';
  ctx.lineCap = 'round';
  ctx.lineWidth = 5.0;
  ctx.beginPath();
  for (let {par, f, d, p, is_kick} of ks) {
    const last = is_kick ? last_kick : last_snare;
    const t = clamp((now - last) / t8, 0, 1);
    epi[par] = p + d * .3 * ((1 - t) ** 3) + frac(now * f * 1.0); 
    // console.log(par, f, p);
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
}

// ======================================== AUDIO ===================== -

  const BPM = opts.BPM; //136.79;
  const EPS = 1E-10;
  const t4 = 60 / BPM, t8 = t4 / 2, t16 = t4 / 4;

  const dB = a => 10 ** (0.05 * a);
  const midi_freq = n => 440 * 2**((n - 57) / 12.0);

  function make_dist_curve(a=1.0, strength=8.0) {
    const dist_curve = new Float32Array(1024);
    for (let i = 0; i < dist_curve.length; i++) {
      let x = (i / dist_curve.length) * 2 * strength - strength;
      dist_curve[i] = a * x / Math.sqrt(1 + x * x);
    }
    return dist_curve;
  }
  function make_buf(data, sampleRate) {
    data = Float32Array.from(data);
    const buf = new AudioBuffer({length: data.length, numberOfChannels: 1, sampleRate});
    buf.copyToChannel(data, 0);
    return buf;
  }

  function play_sample(buf, when, where, rate=1, len=false, level=1) {
    const actx = where.context;
    const src = new AudioBufferSourceNode(actx, {buffer: buf, playbackRate: rate});
    const vol = new GainNode(actx, {gain: level});
    src.connect(vol);
    vol.connect(where);
    src.start(when);
    if (len) {
      vol.gain.linearRampToValueAtTime(level, when + len - EPS * 2);
      vol.gain.linearRampToValueAtTime(0, when + len - EPS);
      src.stop(when + len - EPS);
    } 
  }
  // define instruments
  class Mixer {
    constructor(dest) {
      this.context = dest.context;
      this.ch = [];
      this.master = new GainNode(this.context, {gain: dB(0.0)});
      this.comp = new DynamicsCompressorNode(this.context, {
        attack: .070, knee: 12, ratio: 4, release: .050, threshold: -12});
      this.master.connect(this.comp);
      this.out = this.comp;
      this.out.connect(dest);
    }
    input(name, level=1.0) {
      this[name] = new GainNode(this.context, {gain: level});
      this[name].connect(this.master);
      return this[name];
    }
  }
// piano: 3 detune triangle with LP>dist>BP
  class Bass {
    constructor(dest) {
      this.context = dest.context;
      this.saw = new OscillatorNode(this.context, {type: 'sawtooth'});
      this.vol = new GainNode(this.context, {gain: 0});
      this.LP1 = new BiquadFilterNode(this.context, {type: 'lowpass', Q: 5.0});
      this.LP2 = new BiquadFilterNode(this.context, {type: 'lowpass', Q: 0.0});
      this.flt_frq = new ConstantSourceNode(this.context, {'offset': 1.0});
      this.flt_frq.connect(this.LP1.frequency);
      this.flt_frq.connect(this.LP2.frequency);
      this.flt_frq.start();
      this.saw.connect(this.vol);
      this.vol.connect(this.LP1);
      this.LP1.connect(this.LP2);
      this.out = this.LP2;
      this.out.connect(dest);
      this.saw.start();        
    }
    env(note, vol=1.0) {
      let sfrq = Env.lin(this.saw.frequency, [0, midi_freq(note)], t16);
      let amp = Env.lin(this.vol.gain, [0, 0, 0.05, vol, 0.25, vol, 0.8, 0], t16);
      let ffrq = Env.exp(this.flt_frq.offset, [0, 1300, 0.8, 30], t16);
      return Env.group(sfrq, amp, ffrq); 
    }
  }
  class Kick {
    constructor(dest) {
      this.context = dest.context;
      this.osc = new OscillatorNode(this.context, {type: 'sine'});
      this.vol = new GainNode(this.context, {gain: 0});
      this.osc.connect(this.vol);
      this.out = this.vol;
      this.out.connect(dest);
      this.osc.start();
    }
    env(vel=1.0) {
      let amp = Env.lin(this.vol.gain, [0, 0, 0.01, vel, 0.8, vel, .9, 0], t16);
      const f_0 = 250, f_1 = 50;
      let frq = Env.exp(this.osc.frequency, [0, f_0, 0.5, f_1], t16);
      return Env.group(amp, frq);
    }
  }
  function get_kick() {
    const offlineCtx = new OfflineAudioContext(1, 44100 * t16, 44100);
    const kick = new Kick(offlineCtx.destination);
    kick.env(0.5).hit(0);
    return offlineCtx.startRendering();
  }
  class Hihat {
    constructor(dest) {
      this.context = dest.context;
      this.noise = make_buf($G.loop(71353, i => frac(i * PHI1) - .5), 44100);
      this.src = new AudioBufferSourceNode(this.context, {buffer: this.noise, loop: true});
      this.vol = new GainNode(this.context, {gain: 0});
      this.HP = new BiquadFilterNode(this.context, {type: 'highpass', frequency: 6000, Q: 0.5});
      this.src.connect(this.vol);
      this.vol.connect(this.HP);
      this.out = this.HP;
      this.out.connect(dest);
      this.src.start();
    }
    env(vel=1.0) {
      const gain = vel;
      return Env.lin(this.vol.gain, [0, 0, 0.01, vel, 0.25, vel * 0.3, 1, 0], t16 * 0.75);
    }
  }
  class Clap {
    constructor(dest) {
      this.context = dest.context;
      this.noise = make_buf($G.loop(71353, i => RNG() - .5), 44100);
      this.src = new AudioBufferSourceNode(this.context, {buffer: this.noise, loop: true});
      this.vol = new GainNode(this.context, {gain: 0});
      this.HP = new BiquadFilterNode(this.context, {type: 'bandpass', frequency: 3000, Q: 0.5});
      this.src.connect(this.vol);
      this.vol.connect(this.HP);
      this.out = this.HP;
      this.out.connect(dest);
      this.src.start();
    }
    env(vel=1.0) {
      const gain = vel;
      return Env.lin(this.vol.gain, [0, 0, 0.01, vel, 0.1, vel * 0.3, .25, vel, .35, vel * 0.25, 1, 0], t16 * 0.75);
    }
  }

  function gen_4_pattern(fA, fB, fC) {
    if (!fB) fB = fA;
    if (!fC) fC = fB;
    const A = fA(), B = fB(), C = fC();
    return sample([
      [A,A,A,A], [A,A,B,B], [A,B,A,B], [A,B,A,C], 
      [A,A,A,B], [A,B,C,A], [A,B,C,B], [A,B,C,C]]);
  }
  function gen_8_pattern(fA, fB, fC) {
    if (!fB) fB = fA;
    if (!fC) fC = fB;
    const A = fA(), B = fB(), C = fC();
    return sample([
      [A,A,A,A, A,A,A,B], [A,A,A,B, A,A,A,C],
      [A,B,A,B, A,B,A,C], [A,A,B,B, A,A,B,B],
      [A,B,A,C, A,B,A,C], [A,A,B,B, A,A,B,C]]);
  }
  
  const boombap = (mask = 0) => () => {
    const res = [{}, {}, {}, {},  {}, {}, {}, {}];
    // basic structure
    if ((mask & 1) !== 0 || RNG() < .5) res[0].which = 'kick';
    if ((mask & 2) !== 0 || RNG() < .5) res[2].which = 'kick';
    res[4].which = 'snare1';
    if (RNG() < .25) {
      if (RNG() < .5) {
        res[6].which = 'kick';
      } else {
        res[6].which = 'snare1';
        if (RNG() < .5) res[4].which = false;
      }
    }
    // add ghost hits
    for (let r of res) r.ghost = (r.which && RNG() < .5);
    return res;
  };
  const hats = () => [...$G.loop(4, i => RNG() < .4 + .3 * (i & 1) ? 0 : 1)];
  const percs = () => [...$G.loop(4, i => RNG() < .35 + .3 * (i & 1) 
    ? {which: sample(['snap']), vol: .25 + .25 * RNG()} 
    : {})];

  // music generation generator function
  function* generate(when, instr) {
    const swing_mask = RNG() < .2 ? 2 : 1; // 2 = oizo mode
    const swing = .333 * RNG() / swing_mask;
    const groove = i => (i + (i & swing_mask) * swing) * t16;
    const pat2hit = pat => {

    }
    const bbpat = gen_8_pattern(boombap(1), boombap(0));
    // console.log(bbpat, t16);
    const hits = [];
    bbpat.flat().forEach((v, i) => {
      if (v.which) hits.push({
        which: v.which,
        offset: groove(i),
        rate: v.rate || 1, 
        vol: v.vol || 1
      });
      if (v.ghost) hits.push({
        which: v.which === 'kick' ? 'kick' : 'snare2',
        offset: groove(i - 1),
        rate: (v.rate || 1), 
        vol: (v.vol || 1) * .25
      });
    });
    const hhpat = gen_4_pattern(() => gen_4_pattern(hats).flat());
    // const hhpat4 = [...hhpat, ...hhpat, ...hhpat, ...hhpat];
    // console.log(hhpat);
    hhpat.flat().forEach((v, i) => {
      if (v !== 0) hits.push({
        which: 'chh',
        offset: groove(i) + 0.1 * t16,
        rate: 1, vol: .7
      });
    });

    for (let bars = 0; ; bars++) {
      const start = (bars % 4) * 16 * t16;
      for (let {which, offset, rate, vol} of hits) {
        const o = offset - start;
        if (o >= 0 && o < 16 * t16) {
          play_sample(instr.kit[which], when + o, instr.smp_out, rate, false, vol);
        }
      }
      when += 16 * t16; yield when;
    }
  }

function run() {
  // hide tap to start message
  splash.style.display = 'none';

  // get and start audio context
  const audio = new (window.AudioContext || window.webkitAudioContext)();
  audio.resume();

  // load samples and begin
  const fetch_sample = fn => fetch(fn).then(response => response.arrayBuffer())
      .then(data => audio.decodeAudioData(data));
  const drumkit_keys = 'kick snare1 snare2 chh ohh shaker clap snap'.split(' ');
  // const amen_slice_off = [0, 9608, 19433, 29584, 39139, 48176, 57655, 67796, 
    // 77143].map(t => Math.round(t * audio.sampleRate / 44100));
  let kick_smp, kit = {};
  Promise.all(
    [
      fetch_sample("tarkittmono.flac")
      .then(buf => {
        const wav = buf.getChannelData(0);
        console.log(wav.length);
        const N = drumkit_keys.length;
        for (let i = 0; i < N; i++) {
          const start = (wav.length * i / N) | 0;
          const end = (wav.length * (i + 1) / N) | 0;
          const slice = wav.slice(start, end);
          const slice_buf = audio.createBuffer(1, slice.length, audio.sampleRate);
          slice_buf.copyToChannel(slice, 0);
          kit[drumkit_keys[i]] = slice_buf;
        }
      }),
      get_kick()
      .then(buf => { kick_smp = buf; })
    ]
  ).then(() => {
    // go!
    // let playing = true;
    const mix = new Mixer(audio.destination);
    const instr = {
      kick: new Kick(mix.input('kick', dB(-9))),
      hihat: new Hihat(mix.input('hihat', dB(-18))),
      clap: new Clap(mix.input('clap', dB(-18))),
      bass: new Bass(mix.input('bass', dB(-9))),
      kick_smp: kick_smp,
      kit: kit,
      smp_out: mix.input('smp', dB(0))
    }

    const player = generate(audio.currentTime + t16, instr);
    let player_time = player.next().value;
    setInterval(() => {
      const now = audio.currentTime;
      while (player_time - now < 64 * t8) {
        player_time = player.next().value;
      }        
    }, t8 * 1000);

    function draw_loop() {
      const now = audio.currentTime;
      // draw(now);
      window.requestAnimationFrame(draw_loop);
    }
    draw_loop();
    console.log('ok1', audio.sampleRate);

    // view.addEventListener('click', () => {
    //   playing = !playing;
    //   if (playing) play_pos = audio.currentTime + t16;
    // })
    // setInterval(() => {
    //   const now = audio.currentTime
    // }, 500);

    // generate(begin, begin + 16 * t4);

  });
} // run

splash.addEventListener('click', run);
if (opts.autoclick) splash.click();
view.addEventListener('click', () => {
  info.style.display = 'block';
})
info.addEventListener('click', () => {
  info.style.display = 'none';
})


