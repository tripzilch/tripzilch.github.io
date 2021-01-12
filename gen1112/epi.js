class Epihyperderpflardioid {
  constructor(params={}) {
      // select form and frequency
      [this.f0, this.f1, this.sym] = sample(Epihyperderpflardioid.ffs_table);
      // phase mod
      this.pmf0 = 1 + irand(4);
      this.pmf1 = (this.pmf0 + irand(2)) % 3 + 1;
      this.pmp0 = RNG(); this.pmp1 = RNG(); 
      this.pmq0 = RNG(); this.pmq1 = RNG();
      this.pmd0 = (0.25 + drand(0.15)) / this.pmf0; 
      this.pmd1 = (0.25 + drand(0.15)) / this.pmf1; 
      this.pmode = irand(3);
      // amp mod
      const amp = 0.4;
      this.amf0 = 1 + irand(4);
      this.amf1 = (this.amf0 + irand(2)) % 3 + 1;
      this.amp0 = RNG(); this.amp1 = RNG();
      const ramp = RNG();
      this.a0 = mix(.3, .7, ramp) * amp; 
      this.a1 = mix(.7, .3, ramp) * amp;
      this.amd0 = (0.25 + drand(0.15)) / this.amf0; 
      this.amd1 = (0.25 + drand(0.15)) / this.amf1; 
      this.amode = irand(3);
      // morph params
      // if ('morph' === 'yes') {
        const pars = (['pmq0 pmp1 pmq1', 'pmp0 pmq0 pmq1', 'pmp0 pmq0 pmp1 pmq1'][this.pmode]
                    + ' ' + ['amp1', 'amp0', 'amp0 amp1'][this.amode]).split(' ');
        let mp0, mp1;
        while (mp0 === mp1) {
          mp0 = sample(pars); mp1 = sample(pars);
        }
        // console.log(`mod params = ${mp0}, ${mp1}`);
        const v0a = RNG(), v0b = frac(v0a + rand(0.4, 0.6));
        this[mp0] = `mix(${v0a}, ${v0b}, a)`;
        const v1a = RNG(), v1b = frac(v1a + rand(0.4, 0.6));
        this[mp1] = `mix(${v1a}, ${v1b}, a)`;
      // }
      Object.assign(this, params);
      this.update_fn();
      // console.log(this.fn_str);
  }
  update_fn() {
    this.fn = Function('cLUT', `"use strict";return ${this.fn_str}`)(new CircleLUT());
    this.ext = estimate_extent($G.loop1(2000, t => this.fn(t, frac(t * PHI * 44))));
  }
  get fn_str() {
    return `(t, a=0) => cLUT.R(${-this.f0}, ${this.pmod0}, ${this.amod0}, t)
            .add(cLUT.R(${this.f1}, ${this.pmod1}, ${this.amod1}, t));`
  }
  get pmod0() {
    return this.pmode == 0 ? `${this.pmq0}` 
                           : `cLUT.O(${this.pmf0 * this.sym}, 
                                     ${this.pmp0}, 
                                     ${this.pmq0},
                                     ${this.pmd0}, t)`;
  }
  get pmod1() {
    return this.pmode == 1 ? `${this.pmq1}`
                           : `cLUT.O(${this.pmf1 * this.sym}, 
                                     ${this.pmp1}, 
                                     ${this.pmq1}, 
                                     ${this.pmd1}, t)`;
  }
  get amod0() {
    return this.amode == 0 ? `${this.a0}`
                           : `cLUT.O(${this.amf0 * this.sym}, 
                                     ${this.amp0}, 
                                     ${this.a0}, 
                                     ${this.amd0}, t)`;
  }
  get amod1() {
    return this.amode == 1 ? `${this.a1}`
                           : `cLUT.O(${this.amf1 * this.sym}, 
                                     ${this.amp1}, 
                                     ${this.a1}, 
                                     ${this.amd1}, t)`;
  }
}
Epihyperderpflardioid.ffs_table = [
  [1, 2, 3], [1, 5, 3], [3, 4, 7],
  [1, 3, 2], [3, 5, 2], [2, 5, 7],
  [1, 4, 5], [2, 3, 5],
];

