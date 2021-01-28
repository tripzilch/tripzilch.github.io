    let canvas = document.getElementById("display");
    let gfx = canvas.getContext("2d");
    let W = canvas.width = canvas.scrollWidth;
    let H = canvas.height = canvas.scrollHeight;
    let W2 = W / 2, H2 = H / 2;
    const bgcol = getComputedStyle(canvas).backgroundColor;
    gfx.lineCap = 'round'; gfx.lineJoin = 'round';

    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = n => Math.floor(n / 12);
    const pitch = n => n % 12;
    const note_str = n => notes[pitch(n)] + octave(n);
    const midi_freq = n => 440 * 2**((n - 57) / 12.0);

    let current_key = 7; // G

    const circle = (phi, r) => vec2(r * cos(phi), r * sin(phi));
    const R = (f, p, a, s) => circle((s * f + p) * TAU, a);
    const O = (f, p, v, d, s) => v + d * sin((s * f + p) * TAU);
    const rapok = x => max(0, 2 * x - 1);
    const ffs_table = [[1, 2, 3], [1, 3, 4], [1, 4, 5], [1, 5, 3], [2, 3, 5], [2, 4, 3], [2, 6, 4], [3, 5, 4]];

    let play_starttime = 999999;
    let next_wpar = 999999;
    let wpar;
    let render_mode = 'WOBBLY'; // WAVE | WOBBLY
    function render_wobbly() {
      const now = audioCtx.getOutputTimestamp().contextTime;
      if (now >= next_wpar) {
        let [f0, f1, sym] = sample(ffs_table);
        let ii = [sym, sym * 2, sym * 3];
        wpar = {
          p: [RNG(), RNG(), RNG(), RNG(), RNG(), RNG(), RNG(), RNG(), RNG(), RNG(), RNG(), RNG()],
          i: [sample(ii), sample(ii), sample(ii), sample(ii), sample(ii)],
          f0: f0, f1: f1, sym: sym, 
        }
        let pikmod = [1,3,11];
        if (wpar.p[7] > 0.5) pikmod.push(0);       
        if (wpar.p[8] > 0.5) pikmod.push(2);       
        if (wpar.p[9] > 0.5) pikmod.push(4);       
        if (wpar.p[10] > 0.5) pikmod.push(5);       
        wpar.pkick = sample(pikmod);
        wpar.phat = sample(pikmod);
        wpar.pflow = sample(pikmod);
        while (wpar.pkick == wpar.phat || wpar.pkick == wpar.pflow || wpar.phat == wpar.pflow) {
          wpar.pkick = sample(pikmod);
          wpar.phat = sample(pikmod);
          wpar.pflow = sample(pikmod);
        }
        next_wpar += PATTERN_LEN;
        if (now >= play_starttime + SONG_LEN) {
          gfx.fillStyle = bgcol;
          gfx.fillRect(0, 0, W, H);
          wpar = false;
        }
      }
      if (render_mode == 'WAVE') {
        gfx.fillStyle = "#000";
        gfx.fillRect(0, 0, W, H);
        let data = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(data);
        const nowx = audioCtx.currentTime - t8 * 0.4;
        const now8 = (nowx - play_starttime) / t8;
        const tbeat = frac(now8);
        const beat = t8 * audioCtx.sampleRate;
        const start = floor(beat * (1 - tbeat));
        const len = floor(beat * 2);
        const size = H2;
        gfx.beginPath();
        let peak = 0;
        if (start + len > data.length) console.log('aaaa', start, len);
        for (let i = 0; i < len; i+=1) {
          let x = (i / len);
          let y = data[i + start];
          if (abs(y) > peak) peak = abs(y);
          x *= W;
          y = H2 + y * size;
          if (i == 0) { gfx.moveTo(x, y); } else { gfx.lineTo(x, y); }
        }        
        gfx.strokeStyle = "#5be";
        gfx.lineWidth = 1.0;
        gfx.stroke();
        gfx.fillStyle = "#345";
        gfx.fillRect(0, H - size, 16, size);
        gfx.fillRect(32, H - size, 16, size);
        gfx.fillStyle = "#8cf";
        gfx.fillRect(0, H - size * peak, 16, size * peak);
        let cg = dB(comp_control.reduction);
        gfx.fillRect(32, H - size * cg, 16, size * cg);
      } else if (render_mode == 'WOBBLY' && now >= play_starttime && wpar) {
        const now4 = (now - play_starttime) / t4;
        const now2 = 0.5 * now4;
        const now1 = 0.25 * now4;
        const tkick = (frac(now2)) ** 2;
        const that = ( frac(now2 + 0.5)) ** 2;
        const N = 512, dt = 1 / N;
        const p = wpar.p;
        const oldpk = p[wpar.pkick], oldph = p[wpar.phat], oldpf = p[wpar.pflow];
        p[wpar.pkick] += 0.5 * tkick;
        p[wpar.phat] += 0.25 * that;
        gfx.fillStyle = bgcol;
        gfx.fillRect(0, 0, W, H);
        for (let k = 0; k < 8; k++) {
          let size = 150 + (k + frac(now * 0.5)) * 20;
          p[wpar.pflow] = now1 * 0.5 + k * 0.01;
          gfx.beginPath();
          for (let i = 0; i < N; i++) {
            const t = i * dt;
            let a0 = mix(0.3, 0.7, p[6]);
            let a1 = mix(0.7, 0.3, p[6]);
            let w0 = O(wpar.i[0], p[0], p[1], rapok(p[7]) * 0.5 * a1, t);
            let w1 = O(wpar.i[1], p[2], p[3], rapok(p[8]) * 0.5 * a0, t);
            a0 = O(wpar.i[2], p[4], a0, rapok(p[9]) * 0.25, t);
            a1 = O(wpar.i[3], p[5], a1, rapok(p[10]) * 0.25, t);
            let v = R(wpar.f0, w0, a0, t).add(R(-wpar.f1, w1, a1, t)).add(R(-wpar.f1 - wpar.sym, p[11], 0.2, t));
            if (i == 0) {
              gfx.moveTo(W2 + v.x * size, H2 + v.y * size);
            } else {
              gfx.lineTo(W2 + v.x * size, H2 + v.y * size);
            }
          }
          gfx.closePath();
          // 0.5 1.5 2.5 3.5 3.5 2.5 1.5 0.5
          let alpha = (4 - abs((k + frac(now * 0.5)) - 4)) / 4.1;
          gfx.strokeStyle = "#5be" + floor(alpha * 16).toString(16);
          gfx.lineWidth = 2.0;
          gfx.stroke();
        }
        p[wpar.pkick] = oldpk;
        p[wpar.phat] = oldph;
        p[wpar.pflow] = oldpf;
      }
      requestAnimationFrame(render_wobbly);
    }

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const BPM = 145;
    const t4 = 60 / BPM, t8 = t4 / 2, t16 = t4 / 4;
    const WHITE_NOISE = audioCtx.createBuffer(1, audioCtx.sampleRate * PHI, audioCtx.sampleRate);
    const REVERB = audioCtx.createBuffer(1, audioCtx.sampleRate * t4 * 4, audioCtx.sampleRate);
    const EPS = 1E-10;
    const dB = a => 10 ** (0.05 * a);
    let WHITE_NOISE_data = WHITE_NOISE.getChannelData(0);
    for (let i = 0; i < WHITE_NOISE_data.length; i++) {
      WHITE_NOISE_data[i] = Math.random() * 2 - 1;
    }
    let REVERB_data = REVERB.getChannelData(0);
    let xi = 0;
    for (let i = 0; i < REVERB_data.length; i++) {
      let t = i / REVERB_data.length;
      let p = Math.exp(-20 * t);
      let x = chance(p) ? 0 : drand(1.0) * Math.exp(-11 * t);
      xi += (x - xi) * 0.05;
      REVERB_data[i] = x - xi;
    }
    function make_dist_curve(a=1.0, strength=8.0) {
      const dist_curve = new Float32Array(1024);
      for (let i = 0; i < dist_curve.length; i++) {
        let x = (i / dist_curve.length) * 2 * strength - strength;
        dist_curve[i] = a * x / Math.sqrt(1 + x * x);
      }
      return dist_curve;
    }
    const dist_curve = make_dist_curve();

    class KickDrum {
      constructor() {
        this.osc = new OscillatorNode(audioCtx, {type: 'sine'});
        this.vol = new GainNode(audioCtx, {gain: 0});
        this.osc.connect(this.vol);
        this.out = this.vol;
        this.osc.start();
      }
      hit(when, vel=1.0) {
        const gain = vel;
        const g_atk = 0.002, g_len = t16 * 0.9, g_rel = 0.005;
        this.vol.gain.setValueAtTime(0, when);
        this.vol.gain.linearRampToValueAtTime(gain, when + g_atk);
        this.vol.gain.linearRampToValueAtTime(gain, when + g_len - g_rel);
        this.vol.gain.linearRampToValueAtTime(0, when + g_len);
        const f_0 = midi_freq(72 + current_key), f_1 = midi_freq(12 + current_key), f_decay = g_len * 0.5;
        this.osc.frequency.setValueAtTime(f_0, when);
        this.osc.frequency.exponentialRampToValueAtTime(f_1, when + f_decay);
      }
    }
    class Bass {
      constructor() {
        this.osc = new OscillatorNode(audioCtx, {type: 'sawtooth'});
        this.vol = new GainNode(audioCtx, {gain: 0});
        this.LP1 = new BiquadFilterNode(audioCtx, {type: 'lowpass', Q: 5.0});
        this.LP2 = new BiquadFilterNode(audioCtx, {type: 'lowpass', Q: 5.0});
        this.flt_frq = audioCtx.createConstantSource();
        this.flt_frq.connect(this.LP1.frequency);
        this.flt_frq.connect(this.LP2.frequency);
        this.flt_frq.start();        
        this.osc.connect(this.vol);
        this.vol.connect(this.LP1);
        this.LP1.connect(this.LP2);
        this.out = this.LP2;
        this.osc.start();        
      }
      hit(when, vel=1.0) {
        const gain = vel;
        const g_atk = 0.005, g_len = t16 * 0.8, g_rel = 0.005;
        this.osc.frequency.setValueAtTime(midi_freq(12 + current_key), when);
        this.vol.gain.setValueAtTime(0, when);
        this.vol.gain.linearRampToValueAtTime(gain, when + g_atk);
        this.vol.gain.linearRampToValueAtTime(gain, when + g_len - g_rel);
        this.vol.gain.linearRampToValueAtTime(0, when + g_len);
        const f_cut = 100.0, f_mod = 1500.0;
        this.flt_frq.offset.setValueAtTime(f_cut + f_mod, when);
        this.flt_frq.offset.exponentialRampToValueAtTime(f_cut, when + g_len * 0.8);
      }
    }
    class GatedSaw {
      constructor() {
        this.osc = new OscillatorNode(audioCtx, {type: 'sawtooth'});
        this.vol = new GainNode(audioCtx, {gain: 0});
        // this.init_gate_pattern(gate_pattern);
        // this.init_LFO();
        this.LP1 = new BiquadFilterNode(audioCtx, {type: 'lowpass', Q: 6.0});
        this.LP2 = new BiquadFilterNode(audioCtx, {type: 'lowpass', Q: 6.0});
        this.dist_gain = new GainNode(audioCtx, {gain: 15.5});
        this.dist = new WaveShaperNode(audioCtx, {curve: dist_curve});
        this.HP1 = new BiquadFilterNode(audioCtx, {type: 'highpass', Q: 0.5, frequency: 500});
        this.flt_frq = audioCtx.createConstantSource();
        this.flt_frq.connect(this.LP1.frequency);
        this.flt_frq.connect(this.LP2.frequency);
        this.comp = new DynamicsCompressorNode(audioCtx, {ratio: 20.0, threshold: -30.0, knee: 16.0, attack: .003, release: 0.025});
        this.comp_gain = new GainNode(audioCtx, {gain: 0.25});
        // this.flt_frq.offset.value = this.LFO[0];  
        this.flt_frq.start();
        this.osc.connect(this.vol);
        this.vol.connect(this.LP1);
        this.LP1.connect(this.LP2);
        this.LP2.connect(this.dist_gain);
        this.dist_gain.connect(this.dist);
        this.dist.connect(this.HP1);
        this.HP1.connect(this.comp_gain);
        this.comp_gain.connect(this.comp);
        this.out = this.comp;
        this.osc.start();
      }
      trigger_LFO(when, repeats) {
        const STEPS = 64, TICKS = 64;
        const f0 = 100.0, f1 = 12000.0;
        let vv = [];
        for (let i = 0; i < STEPS; i++) vv.push(RNG());
        let LFO = [];
        for (let i = 0; i < STEPS; i++) {
          let v0 = vv[i], v1 = vv[(i + 1) % STEPS];
          for (let j = 0; j < TICKS; j++) {
            let x = j / TICKS;
            let v = mix(v0, v1, x * x * (3 - 2 * x)) ** 3; // smoothstep**3
            LFO.push(mix(f0, f1, v)); // smoothstep
          }
        }
        LFO.push(LFO[0]);
        for (let i = 0; i < repeats; i++) {
          let t = when + i * STEPS * t4;
          this.flt_frq.offset.setValueCurveAtTime(LFO, t, STEPS * t4 - EPS);
        }
      }
      init_gate_pattern(gate_pattern, drive=0.1) {
        const W = []
        let vv = [];
        this.frq_env = [];
        for (let i = 0; i < gate_pattern.length; i++) {
          vv.push(gate_pattern[i].a);
          for (let f of gate_pattern[i].f) {
            this.frq_env.push([f[0] + i * gate_pattern[i].f.length, f[1]]);
          }
        }
        const TICKS = 8;
        vv = vv.flat();
        this.vol_env = [];
        for (let i = 0; i < vv.length; i++) {
          for (let j = 0; j < TICKS; j++) {
            this.vol_env.push(vv[i] * drive);
          }
        }
        this.vol_env[0] = 0; // start at 0
        this.vol_env.push(this.vol_env[0]); // I think it needs one extra to be precise
      }
      hit(when, vel=1.0) {
        const len = t16 * (this.vol_env.length - 1) / 16 - EPS;
        this.vol.gain.setValueCurveAtTime(this.vol_env, when, len);
        for (let i = 0; i < this.frq_env.length; i++) {
          let [t, n] = this.frq_env[i];
          if (i == 0) {
            this.osc.frequency.setValueAtTime(midi_freq(n), when);
          } else {
            this.osc.frequency.exponentialRampToValueAtTime(midi_freq(n), when + t16 * t - EPS); 
          }
        }
      }
    }
    class Hihat {
      constructor() {
        this.src = new AudioBufferSourceNode(audioCtx, {buffer: WHITE_NOISE, loop: true});
        this.vol = new GainNode(audioCtx, {gain: 0});
        this.HP = new BiquadFilterNode(audioCtx, {type: 'highpass', frequency: 6000, Q: 0.5});
        this.src.connect(this.vol);
        this.vol.connect(this.HP);
        this.out = this.HP;
        this.src.start();
      }
      hit(when, vel=1.0) {
        const gain = vel;
        const g_atk = 0.002, g_len = t16 * 0.75;
        this.vol.gain.setValueAtTime(0, when);
        this.vol.gain.linearRampToValueAtTime(gain, when + g_atk);
        this.vol.gain.linearRampToValueAtTime(gain * 0.3, when + g_len * 0.25);
        this.vol.gain.linearRampToValueAtTime(0.0, when + g_len);
      }
    }
    class Clap {
      constructor() {
        this.src = new AudioBufferSourceNode(audioCtx, {buffer: WHITE_NOISE, loop: true});
        this.vol = new GainNode(audioCtx, {gain: 0});
        this.filt = new BiquadFilterNode(audioCtx, {type: 'bandpass', frequency: 3000, Q: 1.5});
        this.src.connect(this.vol);
        this.vol.connect(this.filt);
        this.out = this.filt;
        this.src.start();
      }
      hit(when, vel=1.0) {
        const gain = vel;
        const g_atk = 0.01, g_len = t8 * 1;
        this.vol.gain.setValueAtTime(0, when);
        this.vol.gain.linearRampToValueAtTime(gain, when + g_atk);
        this.vol.gain.linearRampToValueAtTime(gain * 0.1, when + g_len * 0.10);
        this.vol.gain.linearRampToValueAtTime(gain * 0.4, when + g_len * 0.20);
        this.vol.gain.linearRampToValueAtTime(0.0, when + g_len - EPS);
        this.filt.frequency.setValueAtTime(5000, when);
        this.filt.frequency.exponentialRampToValueAtTime(2500, when + g_len * 0.8);
      }
    }
    class NoiseRiser {
      constructor() {
        this.src = new AudioBufferSourceNode(audioCtx, {buffer: WHITE_NOISE, loop: true});
        this.HP1 = new BiquadFilterNode(audioCtx, {type: 'highpass', frequency: 1000, Q: 0.25});
        this.LP1 = new BiquadFilterNode(audioCtx, {type: 'lowpass', Q: 6.0});
        this.BP1 = new BiquadFilterNode(audioCtx, {type: 'bandpass', Q: 6.0});
        this.flt_frq = audioCtx.createConstantSource();
        this.flt_frq.connect(this.LP1.frequency);
        this.flt_frq.connect(this.BP1.frequency);
        this.flt_frq.start();
        this.vol = new GainNode(audioCtx, {gain: 0});
        this.src.connect(this.HP1);
        this.HP1.connect(this.LP1);
        this.LP1.connect(this.BP1);
        this.BP1.connect(this.vol);
        this.out = this.vol;
        this.src.start();
        this.beats = 16;
      }
      hit(when, vel=1.0) {
        const gain = vel;
        const len = this.beats * t4 - EPS;
        const rel = t16 * 0.5;
        const frq0 = 2000.0, frq1 = 12000;
        this.vol.gain.setValueAtTime(0, when);
        this.vol.gain.linearRampToValueAtTime(gain, when + len - rel);
        this.vol.gain.linearRampToValueAtTime(0, when + len);
        for (let i = 0; i < this.beats; i++) {
          let t = when + i * t4;
          this.flt_frq.offset.setValueAtTime(frq0, t);
          this.flt_frq.offset.exponentialRampToValueAtTime(frq1, t + t4 - EPS);
        }
      }
    }
    class Perc {
      constructor() {
        this.noise = audioCtx.createBufferSource();
        this.noise.buffer = WHITE_NOISE;
        this.noise.loop = true;
        this.sin = new OscillatorNode(audioCtx, {type: 'sine'});
        this.vsin = new GainNode(audioCtx, {gain: 0});
        this.vnoise = new GainNode(audioCtx, {gain: 0});
        this.BP1 = new BiquadFilterNode(audioCtx, {type: 'bandpass', frequency: 5000, Q: 3.0});
        this.BP2 = new BiquadFilterNode(audioCtx, {type: 'bandpass', frequency: 5000, Q: 3.0});
        this.dist = new WaveShaperNode(audioCtx, {curve: dist_curve});
        this.comp = new DynamicsCompressorNode(audioCtx, {ratio: 20.0, threshold: -15.0, knee: 9.0, attack: .003, release: 0.02});

        this.noise.connect(this.vnoise);
        this.vnoise.connect(this.BP1);
        this.BP1.connect(this.dist);

        this.sin.connect(this.vsin);
        this.vsin.connect(this.dist);

        this.dist.connect(this.BP2);
        this.BP2.connect(this.comp);
        this.out = this.comp;
        this.noise.start();
        this.sin.start();
      }
      init_par() {
        const gmix = rand(0, 1);
        const driv = erand(1, 6);
        const f0 = erand(200, 12000), f1 = mix(erand(200, 12000), f0, RNG());
        let df = abs(f0 - f1) * 0.0001
        this.par = {
          gsin: driv * sqrt(gmix), gnoise: driv * sqrt(1 - gmix), f0: f0, f1: f1,
          lsin: rand(0.25, 1), lnoise: rand(0.25, 1), ff1: erand(1000, 8000), ff2: erand(1000, 8000)
        }
      }
      hit(when, vel=1.0) {
        const p = this.par;
        const g_atk = 0.01, g_len = t16 * 1 - EPS;
        this.BP1.frequency.value = p.ff1;
        this.BP2.frequency.value = p.ff2;
        this.vsin.gain.setValueAtTime(0, when);
        this.vsin.gain.linearRampToValueAtTime(p.gsin * vel, when + g_atk);
        this.vsin.gain.linearRampToValueAtTime(0.0, when + p.lsin * g_len);
        this.sin.frequency.setValueAtTime(p.f0, when);
        this.sin.frequency.exponentialRampToValueAtTime(p.f1, when + p.lsin * g_len);
        this.vnoise.gain.setValueAtTime(0, when);
        this.vnoise.gain.linearRampToValueAtTime(p.gnoise * vel, when + g_atk);
        this.vnoise.gain.linearRampToValueAtTime(0.0, when + p.lnoise * g_len);
      }
    }
    class Mixer {
      constructor() {
        this.ch = [];
        this.out = this.master = new GainNode(audioCtx, {gain: dB(0.0)});
      }
      input(chan, level=1.0, ch_no=-1) {
        if (chan.out) chan = chan.out;
        let channel_gain = new GainNode(audioCtx, {gain: level});
        chan.connect(channel_gain);
        channel_gain.connect(this.master);
        channel_gain.level = level;
        if (ch_no === -1) {
          this.ch.push(channel_gain);
        } else {
          this.ch[ch_no] = channel_gain;
        }
      }
    }
    class DelayFX1 extends Mixer {
      constructor() {
        super(); // it's just super        
        this.delay = new DelayNode(audioCtx, {delayTime: t16 * 2, maxDelayTime: t4 * 4});
        this.delay_gain = new GainNode(audioCtx, {gain: dB(-6.0)});
        this.HP1 = new BiquadFilterNode(audioCtx, {type: 'highpass', Q: 0.25, frequency: 1000});
        this.master.connect(this.delay);
        this.delay.connect(this.HP1);
        this.HP1.connect(this.delay_gain);
        this.delay_gain.connect(this.delay);
        this.out = this.delay_gain;
      }
    }
    class ReverbFX1 extends Mixer {
      constructor() {
        super(); // it's just super        
        this.reverb = new ConvolverNode(audioCtx, {buffer: REVERB});
        // this.HP1 = new BiquadFilterNode(audioCtx, {type: 'highpass', Q: 0.25, frequency: 1000});
        this.master.connect(this.reverb);
        this.out = this.reverb;
      }
    }
    class DelayFX2 extends Mixer {
      constructor() {
        super(); // it's just super        
        this.dist = new WaveShaperNode(audioCtx, {curve: make_dist_curve(dB(-30))});
        this.gainA = new GainNode(audioCtx, {gain: 1.0});
        this.delay = new DelayNode(audioCtx, {delayTime: t16 * 0.25, maxDelayTime: t4 * 4});
        this.gainB = new GainNode(audioCtx, {gain: 0.0});
        this.FLT1 = new BiquadFilterNode(audioCtx, {type: 'bandpass', Q: 2.0, frequency: 1000});
        this.FLT2 = new BiquadFilterNode(audioCtx, {type: 'bandpass', Q: 2.0, frequency: 1000});
        this.flt_frq = new ConstantSourceNode(audioCtx, {offset: 1000.0}); this.flt_frq.start();
        this.EQ = new BiquadFilterNode(audioCtx, {type: 'notch', Q: 2.0, frequency: 1000}); // connect to cutoff of gated saw
        this.comp = new DynamicsCompressorNode(audioCtx, {ratio: 12.0, threshold: -37.0, knee: 9.0, attack: .003, release: 0.02});
        this.vol_env = new GainNode(audioCtx, {gain: 1.0});
        this.post = new GainNode(audioCtx, {gain: 1.0});
        this.gate = new ConstantSourceNode(audioCtx, {offset: 0.0}); this.gate.start();
        this.c1 = new ConstantSourceNode(audioCtx, {offset: 1.0}); this.c1.start();
        this.neg = new GainNode(audioCtx, {gain: -1.0});
        this.master.connect(this.FLT1);
        this.master.gain.value = dB(24.0);
        this.FLT1.connect(this.dist);
        this.dist.connect(this.gainA);
        this.gainA.connect(this.delay);
        this.delay.connect(this.gainB);
        this.gainB.connect(this.delay);
        this.gainB.connect(this.FLT2);
        this.FLT2.connect(this.EQ);
        this.EQ.connect(this.comp);
        this.comp.connect(this.vol_env);
        this.vol_env.connect(this.post);
        this.out = this.post;
        // gate crossfades between gainB and gainA
        this.gate.connect(this.gainB.gain);
        this.gate.connect(this.neg);
        this.neg.connect(this.gainA.gain);
        this.c1.connect(this.gainA.gain);        
        this.flt_frq.connect(this.FLT1.frequency);
        this.flt_frq.connect(this.FLT2.frequency);
      }
      trigger_LFO(when, repeats) {
        const STEPS = 32, TICKS = 64;
        const f0 = 100.0, f1 = 12000.0;
        let vv = [];
        for (let i = 0; i < STEPS; i++) vv.push(RNG());
        let LFO = [];
        for (let i = 0; i < STEPS; i++) {
          let v0 = vv[i], v1 = vv[(i + 1) % STEPS];
          for (let j = 0; j < TICKS; j++) {
            let x = j / TICKS;
            let v = mix(v0, v1, x * x * (3 - 2 * x)) ** 3; // smoothstep**3
            LFO.push(mix(f0, f1, v)); // smoothstep
          }
        }
        LFO.push(LFO[0]);
        for (let i = 0; i < repeats; i++) {
          let t = when + i * STEPS * t16;
          this.flt_frq.offset.setValueCurveAtTime(LFO, t, STEPS * t16 - EPS);
        }
      }
    }

    let kick = new KickDrum();
    let hihat1 = new Hihat();
    let hihat2 = new Hihat();
    let clap = new Clap();
    let perc = new Perc();
    let perc2 = new Perc();
    let bass = new Bass();
    let noise_riser = new NoiseRiser();
    let gated_saw = new GatedSaw();
    
    let master_bus = new Mixer();
    master_bus.master.gain.value = dB(12.0);
    master_bus.out.connect(audioCtx.destination);

    let mixer = new Mixer();
    mixer.input(kick, dB(-22.0), 'kd');
    mixer.input(hihat1, dB(-27.0), 'h1');
    mixer.input(hihat2, dB(-27.0), 'h2');
    mixer.input(clap, dB(-18.0), 'cp');
    mixer.input(noise_riser, dB(-30.0), 'nr');
    mixer.input(perc, dB(-30.0), 'p1');
    mixer.input(perc2, dB(-30.0), 'p2');
    mixer.input(bass, dB(-30.0), 'bs');
    mixer.input(gated_saw, dB(-20.0), 'gs');
    master_bus.input(mixer.out);

    // mixer.ch.kd.disconnect();
    // mixer.ch.h1.disconnect();
    // mixer.ch.h2.disconnect();
    // // mixer.ch.cp.disconnect();
    // mixer.ch.nr.disconnect();
    // mixer.ch.p1.disconnect();
    // mixer.ch.p2.disconnect();
    // mixer.ch.bs.disconnect();
    // mixer.ch.gs.disconnect();

    let fx = new DelayFX2();
    fx.post.gain.value = dB(-12.0);
    gated_saw.flt_frq.connect(fx.EQ.frequency);
    fx.input(mixer.ch.kd, dB(0.0));
    fx.input(mixer.ch.h1, dB(0.0));
    fx.input(mixer.ch.h2, dB(0.0));
    fx.input(mixer.ch.cp, dB(0.0));
    fx.input(mixer.ch.p1, dB(0.0));
    fx.input(mixer.ch.p2, dB(0.0));
    fx.input(mixer.ch.bs, dB(0.0));
    // fx.input(mixer.ch.gs, dB(0.0));
    master_bus.input(fx.out);
    
    let delay = new DelayFX1();
    delay.input(mixer.ch.gs, dB(-6.0));
    delay.input(mixer.ch.nr, dB(-6.0));
    delay.input(mixer.ch.p1, dB(-9.0));
    delay.input(mixer.ch.p2, dB(-6.0));
    delay.input(fx.out, dB(-3.0));
    master_bus.input(delay.out);

    let reverb = new ReverbFX1();
    reverb.input(mixer.ch.cp, dB(0.0));
    reverb.input(delay, dB(0.0));
    master_bus.input(reverb, dB(0.0))

    let analyser = new AnalyserNode(audioCtx, {fftSize: 32768});
    master_bus.out.connect(analyser);    

    // let buf0;
    // fetch("samples/boombapkit/Kick1.flac")
    // .then(response => response.arrayBuffer())
    // .then(data => audioCtx.decodeAudioData(data))
    // .then(buf => {
    //   buf0 = buf;
    //   render_wav(buf.getChannelData(0));
    // });
    // double harmonic 0, 1, 4, 5, 7, 8, 11
    // phrygian        0, 1, 3, 5, 7, 8, 10

    //
    function gate_curve(gate_pattern, lo=0, hi=1, TICKS=8) {
      let vol_env = [];
      for (let i = 0; i < gate_pattern.length; i++) {
        for (let j = 0; j < TICKS; j++) {
          vol_env.push(lo + (hi - lo) * gate_pattern[i]);
        }
      }
      vol_env[0] = 0; // start at 0?
      vol_env.push(vol_env[0]); // I think it needs one extra to be precise
      return vol_env;
    }

    function gen_4_pattern(f) {  // TODO: expand to (...fs) -->
      const A = f(), B = f(), C = f();
      return sample([[A,A,A,A], [A,A,B,B], [A,B,A,B], [A,B,A,C], [A,B,B,A], [A,B,C,A], [A,B,C,B], [A,B,C,C]]); // --> then these become numerical indices

    }
    function gen_gate_pattern() {
      const scales = [ // not actual scales but combinations of intervals that work
        [-12, -11, -8, -1, 0, 1, 4, 11, 12],
        [-12, -11, -9, -2, 0, 1, 3, 10, 12],
        [-12, -11, -9, -1, 0, 1, 3, 11, 12],
      ]
      // probably place into gated_saw
      const base_note = sample([36 + current_key, 48 + current_key]);
      const scale = sample(scales);
      return gen_4_pattern(() => {
        let pp = [];
        [.8, .4, .6, .4].forEach(v => { pp.push(chance(v) ? [1, sample([0, 1])] : [0, 0])});
        let ff = [];
        let pos = irand(4);
        let n2 = base_note + sample(scale);
        if (pos > 0) ff.push([0, base_note]);
        ff.push([pos, base_note]);
        ff.push([pos + 1 - EPS, n2]);
        if (pos < 3) ff.push([3 - EPS, n2]);
        return {a:pp.flat(),f:ff};
      });
    }
    function gen_perc_pattern(beat=[.8,.4,.6,.4]) {
      return gen_4_pattern(() => {
        let pp = [];
        beat.forEach(v => { pp.push(chance(v) ? [1, sample([0, 1])] : [0, 0])});
        return pp.flat();
      }).flat();
    }
    // function gen_
    function schedule_hit_pattern(what, pattern, when, step, repeats) {
      let t = when;
      for (let k = 0; k < repeats; k++) {
        for (let p of pattern) {
          if (p != 0) what.hit(t, p);
          t += step;
        }
      }
    }

    function gen_kick_pattern() {
      const kp = [
        [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
        [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0.25],
        [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0.4,0],
        [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0.25,0,0.25],
        [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0.25,1,0,0.4,0],
      ]
      let i = 0, j = 0, k = 0;
      while (i == j) {
        i = irand(3); j =  i + 1 + irand(4 - i); k = irand(i + 1);
      }
      return [kp[k], kp[i], kp[k], kp[j]].flat();
    }

    const PATTERN_LEN = 64 * t4;
    const N_PATTERNS = 8;
    const SONG_LEN = N_PATTERNS * PATTERN_LEN;
    function play_psy() {
      play_starttime = audioCtx.currentTime + t4;
      next_wpar = play_starttime;
      for (let i = 0; i < N_PATTERNS; i++) {
        let t = play_starttime + i * PATTERN_LEN;
        schedule_hit_pattern(kick, gen_kick_pattern(), t, t16, 2); // schedule OFF at end of pattern via mixer
        mixer.ch.kd.gain.setValueAtTime(mixer.ch.kd.level, t);
        mixer.ch.kd.gain.setValueAtTime(mixer.ch.kd.level, t + PATTERN_LEN - t4 - 0.01);
        mixer.ch.kd.gain.linearRampToValueAtTime(0, t + PATTERN_LEN - t4);
        schedule_hit_pattern(clap, [0,0,0,0,1,0,0,0], t, t16, 32);
        schedule_hit_pattern(hihat1, [0.0, 0.0, 1.0, 0.0], t, t16, 64);
        schedule_hit_pattern(hihat2, [0.4, 0.2, 0.0, 0.2], t, t16, 64);
        mixer.ch.h2.gain.setValueAtTime(mixer.ch.h2.level, t);
        mixer.ch.h2.gain.setValueAtTime(mixer.ch.h2.level, t + PATTERN_LEN - 32 * t4);
        mixer.ch.h2.gain.linearRampToValueAtTime(mixer.ch.h2.level * 3.5, t + PATTERN_LEN - t4 - 0.01);
        mixer.ch.h2.gain.linearRampToValueAtTime(0, t + PATTERN_LEN - t4);        
        perc.init_par();
        perc2.init_par();
        schedule_hit_pattern(perc, gen_perc_pattern([.4,.15,.25,.15]), t, t16, 8);
        schedule_hit_pattern(perc2, gen_perc_pattern([.25,.15,.4,.15]), t, t16, 8);
        // for (let j = 0; j < 8; j++) {
        //   perc.init_par();
        //   schedule_hit_pattern(perc, [1,1,1,1], t + j * 8 * t4, t8, 4);
        // }
        // // schedule_hit_pattern(perc2, [0,0,1,1], t, t8, 32);
        schedule_hit_pattern(bass, [0,1,1,1], t, t16, 64);
        noise_riser.hit(t + 48 * t4, 1.0);
        gated_saw.init_gate_pattern(gen_gate_pattern(), erand(0.001, 0.05));
        gated_saw.trigger_LFO(t, 1);
        let gs_qr = sample([[1,1],[1,1],[1,0],[0,1]]);
        schedule_hit_pattern(gated_saw, gs_qr, t, 4 * t4, 8);
        let buzz_gate = gate_curve(gen_4_pattern(() => [1,1,chance(0.5)?1:0,chance(0.5)?1:0,1,1,1,chance(0.5)?1:0]).flat());
        let buzz_vol = gate_curve(gen_perc_pattern([.8,.4,.6,.4]));
        // 10 -> 11 01
        // 01 -> 11 10
        let opt = [[1,1],[1,0],[0,1]];
        if (gs_qr[0] == 0) { opt.splice(2, 1); } else if (gs_qr[1] == 0) { opt.splice(1, 1); }
        let bz_qr = sample(opt);
        console.log(gs_qr, bz_qr);
        for (let j = 0; j < 16; j++) {
          fx.gate.offset.setValueCurveAtTime(buzz_gate, t + 0.3 * t16 + 4 * j * t4, 4 * t4 - EPS);
          if (bz_qr[j&1]) {
            fx.vol_env.gain.setValueCurveAtTime(buzz_vol, t + 4 * j * t4, 4 * t4 - EPS);
          } else {
            fx.vol_env.gain.setValueCurveAtTime([0,0], t + 4 * j * t4, 4 * t4 - EPS);
          }
        }
        fx.trigger_LFO(t, 8);
      }
    }


    let comp_control = fx.comp;
    let paused = true;
    const play_button = document.getElementById("play");
    const pause_button = document.getElementById("pause");
    play_button.addEventListener('click', ev => {
      play_button.parentElement.className = 'playing';
      audioCtx.resume();      
    });
    pause_button.addEventListener('click', ev => {
        pause_button.parentElement.className = 'paused';
        audioCtx.suspend();
    });
    play_psy();
    render_wobbly();
    if(audioCtx.state === 'running') play_button.parentElement.className = 'playing';

    document.body.addEventListener('keyup', ev => {
      if (ev.code == 'KeyQ' || ev.code == 'KeyA') {
        let dir = ev.code == 'KeyQ' ? 1 : -1;
        let threshold = comp_control.threshold.value;
        threshold += 0.25 * dir;
        comp_control.threshold.value = threshold;
        console.log(threshold);
      } 
    });



      // let src = audioCtx.createBufferSource();
      // let now = audioCtx.currentTime;
      // src.buffer = buf0;
      // src.connect(audioCtx.destination);
      // src.start(now);
      // paused = false;
