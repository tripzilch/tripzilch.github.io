const view = document.getElementById('view');
const info = document.getElementById('info');
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

  const BPM = 168, EPS = 1E-6;
  const t4 = 60 / BPM, t8 = t4 / 2, t16 = t4 / 4;

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
    return cLUT.R((this.y) * 80, 0, w, t);
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
let cur_hit = null, next_hit = null;
let last_kick = 0, last_snare = 0;
let framecount = 0;
let next_init = Infinity;
// KKSrrKSr
function draw(now) {
  if (cur_hit === null) cur_hit = QQ.popleft();
  if (next_hit === null) next_hit = QQ.popleft();
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

function run() {
  // hide tap to start message
  info.style.display = 'none';

  // get and start audio context
  const audio = new (window.AudioContext || window.webkitAudioContext)();
  audio.resume();

  // setup audio system
  const dB = a => 10 ** (0.05 * a);
  function make_dist_curve(a=1.0, strength=8.0) {
    const dist_curve = new Float32Array(1024);
    for (let i = 0; i < dist_curve.length; i++) {
      let x = (i / dist_curve.length) * 2 * strength - strength;
      dist_curve[i] = a * x / Math.sqrt(1 + x * x);
    }
    return dist_curve;
  }
  const dist_curve = make_dist_curve();
  function sample(buf, when, where, rate=1, len=false, level=1) {
    const src = new AudioBufferSourceNode(audio, {buffer: buf, playbackRate: rate});
    if (len) {
      const vol = new GainNode(audio, {gain: level});
      src.connect(vol);
      vol.connect(where);
      vol.gain.linearRampToValueAtTime(level, when + len - EPS);
      vol.gain.linearRampToValueAtTime(0, when + len);
    } else {
      src.connect(where);
    }
    src.start(when);
  }
  // define instruments
  class Breakz {
    constructor(dest) {
      this.preamp = new GainNode(audio, {gain: dB(0)});   
      this.cym_amp = new GainNode(audio, {gain: dB(-12)});
      this.dist = new WaveShaperNode(audio, {curve: dist_curve});
      this.post = new GainNode(audio, {gain: dB(-12)});      
      this.preamp.connect(this.dist);
      this.cym_amp.connect(this.dist);
      this.dist.connect(this.post);
      this.out = this.post;
      this.out.connect(dest);
    }
    hit(when) {
      // 0   1   2   3   4   5   6   7 
      // K-- r r S-- r r R-- R-- S-- r r
      const sn = n => n == 2 || n == 6; 
      let pn = 0, ff = 1;
      for (let i = 0; i < 8; i++) {
        const n = (i === 0 || sn(i)) ? i : irand(8);
        const dub = (i === 1 || i === 3 || i === 7); 
        if (sn(n) && sn(pn)) {
          ff *= 2 ** (1 / 12);
        } else {
          ff = 1;
        }        
        sample(amen_slices[n], when + i * t8, this.preamp, ff * BPM / 136.79,  dub ? t16 : t8);
        QQ.append({n, when: when + i * t8});
        if (dub) {
          const n2 = irand(8);
          if (sn(n) && sn(n2)) {
            ff *= 2 ** (1 / 12);
          } else {
            ff = 1;
          }        
          sample(amen_slices[n2], when + i * t8 + t16, this.preamp, ff * BPM / 136.79,  t16, dB(-6));
          QQ.append({n: n2, when: when + i * t8 + t16});
          pn = n2;
        } else {
          ff = 1;
          pn = 0;
        }
      }
    }
    hit_cymbal(when) {
      sample(crash, when, this.cym_amp);
      QQ.append({n: 9, when});
    }
  }
  
  const breakz = new Breakz(audio.destination);

  // generation
  let bars = 0;
  function generate(when) {
    breakz.hit_cymbal(when + 0 * 2 * t4);
    breakz.hit(when + 0 * 8 * t8);
    breakz.hit(when + 1 * 8 * t8);
    if ((bars & 3) === 3) {
      breakz.hit(when + 2 * 8 * t8);
      sample(amen, when + 3 * 8 * t8, breakz.preamp, .5 * BPM / 136.79, 8 * t8);
      QQ.append({n: 0, when: when + 3 * 8 * t8});
      QQ.append({n: 1, when: when + 3 * 8 * t8 + t4});
      QQ.append({n: 2, when: when + 3 * 8 * t8 + 2 * t4});
    } else {
      breakz.hit(when + 2 * 8 * t8);
      breakz.hit(when + 3 * 8 * t8);
    }
    bars++;
    return when + 4 * 8 * t8;
  }

  // graphics


  // load samples and begin
  const fetch_sample = fn => fetch(fn).then(response => response.arrayBuffer())
      .then(data => audio.decodeAudioData(data));
  const amen_slice_off = [0, 9608, 19433, 29584, 39139, 48176, 57655, 67796, 77143];
  const amen_slices = [];
  let amen, crash;
  Promise.all(
    [
      fetch_sample("amen.flac")
      .then(buf => {
        amen = buf;
        const amen_array = amen.getChannelData(0);
        for (let i = 1; i < amen_slice_off.length; i++) {
          const start = amen_slice_off[i - 1];
          const end = amen_slice_off[i];
          const slice_array = amen_array.subarray(start, end);
          const slice = audio.createBuffer(1, end - start, audio.sampleRate);
          slice.copyToChannel(slice_array, 0);
          // slice.slice_number = i - 1;
          amen_slices.push(slice);
        }
      }),
      fetch_sample("crash.flac")
      .then(buf => {
        crash = buf;
      })
    ]
  ).then(() => {
    // go!
    let playing = true;
    let play_pos = audio.currentTime + t16;
    function go() {
      const now = audio.currentTime;
      if (play_pos - now < t4 && playing) {
        play_pos = generate(play_pos)
      } 
      draw(now);
      window.requestAnimationFrame(go);
    }
    go();
    view.addEventListener('click', () => {
      playing = !playing;
      if (playing) play_pos = audio.currentTime + t16;
    })
    // setInterval(() => {
    //   const now = audio.currentTime
    // }, 500);

    // generate(begin, begin + 16 * t4);

  });
} // run

info.addEventListener('click', run);
// info.click();



