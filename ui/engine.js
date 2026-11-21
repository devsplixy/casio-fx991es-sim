(() => {
  'use strict';

  const CONSTANTS = [
    null,
    { n: '01', sym: 'mp', name: 'Proton mass', val: 1.672621898e-27 },
    { n: '02', sym: 'mn', name: 'Neutron mass', val: 1.674927471e-27 },
    { n: '03', sym: 'me', name: 'Electron mass', val: 9.10938356e-31 },
    { n: '04', sym: 'mμ', name: 'Muon mass', val: 1.883531594e-28 },
    { n: '05', sym: 'a0', name: 'Bohr radius', val: 5.2917721067e-11 },
    { n: '06', sym: 'h', name: 'Planck constant', val: 6.62607004e-34 },
    { n: '07', sym: 'μN', name: 'Nuclear magneton', val: 5.050783699e-27 },
    { n: '08', sym: 'μB', name: 'Bohr magneton', val: 9.274009994e-24 },
    { n: '09', sym: 'ħ', name: 'Reduced Planck', val: 1.0545718e-34 },
    { n: '10', sym: 'α', name: 'Fine-structure', val: 7.2973525664e-3 },
    { n: '11', sym: 're', name: 'Electron radius', val: 2.8179403227e-15 },
    { n: '12', sym: 'λc', name: 'Compton wavelen', val: 2.4263102367e-12 },
    { n: '13', sym: 'γp', name: 'Proton gyromag', val: 2.6752219e8 },
    { n: '14', sym: 'λcp', name: 'Proton Compton', val: 1.32140985396e-15 },
    { n: '15', sym: 'λcn', name: 'Neutron Compton', val: 1.31959090481e-15 },
    { n: '16', sym: 'R∞', name: 'Rydberg const', val: 10973731.568508 },
    { n: '17', sym: 'u', name: 'Atomic mass', val: 1.66053904e-27 },
    { n: '18', sym: 'μp', name: 'Proton mag mom', val: 1.4106067873e-26 },
    { n: '19', sym: 'μe', name: 'Electron mag mom', val: -9.28476462e-24 },
    { n: '20', sym: 'μn', name: 'Neutron mag mom', val: -9.662365e-27 },
    { n: '21', sym: 'μμ', name: 'Muon mag mom', val: -4.49044826e-26 },
    { n: '22', sym: 'F', name: 'Faraday const', val: 96485.33289 },
    { n: '23', sym: 'e', name: 'Elementary chg', val: 1.6021766208e-19 },
    { n: '24', sym: 'NA', name: 'Avogadro const', val: 6.022140857e23 },
    { n: '25', sym: 'k', name: 'Boltzmann const', val: 1.38064852e-23 },
    { n: '26', sym: 'Vm', name: 'Molar volume', val: 0.022710947 },
    { n: '27', sym: 'R', name: 'Molar gas const', val: 8.3144598 },
    { n: '28', sym: 'c0', name: 'Speed of light', val: 299792458 },
    { n: '29', sym: 'c1', name: '1st radiation', val: 3.74177179e-16 },
    { n: '30', sym: 'c2', name: '2nd radiation', val: 0.0143877736 },
    { n: '31', sym: 'σ', name: 'Stefan-Boltz', val: 5.670367e-8 },
    { n: '32', sym: 'ε0', name: 'Electric const', val: 8.854187817e-12 },
    { n: '33', sym: 'μ0', name: 'Magnetic const', val: 1.2566370614e-6 },
    { n: '34', sym: 'Φ0', name: 'Mag flux quant', val: 2.067833831e-15 },
    { n: '35', sym: 'g', name: 'Std gravity', val: 9.80665 },
    { n: '36', sym: 'G0', name: 'Conductance q', val: 7.748091731e-5 },
    { n: '37', sym: 'Z0', name: 'Impedance vac', val: 376.730313461 },
    { n: '38', sym: 't', name: 'Celsius temp', val: 273.15 },
    { n: '39', sym: 'G', name: 'Newton grav', val: 6.67408e-11 },
    { n: '40', sym: 'atm', name: 'Std atmosphere', val: 101325 }
  ];

  const CONVERSIONS = [
    null,
    { label: 'in►cm', fn: (x) => x * 2.54 },
    { label: 'cm►in', fn: (x) => x / 2.54 },
    { label: 'ft►m', fn: (x) => x * 0.3048 },
    { label: 'm►ft', fn: (x) => x / 0.3048 },
    { label: 'yd►m', fn: (x) => x * 0.9144 },
    { label: 'm►yd', fn: (x) => x / 0.9144 },
    { label: 'mile►km', fn: (x) => x * 1.609344 },
    { label: 'km►mile', fn: (x) => x / 1.609344 },
    { label: 'n mile►m', fn: (x) => x * 1852 },
    { label: 'm►n mile', fn: (x) => x / 1852 },
    { label: 'acre►m²', fn: (x) => x * 4046.8564224 },
    { label: 'm²►acre', fn: (x) => x / 4046.8564224 },
    { label: 'gal(US)►L', fn: (x) => x * 3.785411784 },
    { label: 'L►gal(US)', fn: (x) => x / 3.785411784 },
    { label: 'gal(UK)►L', fn: (x) => x * 4.54609 },
    { label: 'L►gal(UK)', fn: (x) => x / 4.54609 },
    { label: 'pc►km', fn: (x) => x * 3.085677581e13 },
    { label: 'km►pc', fn: (x) => x / 3.085677581e13 },
    { label: 'km/h►m/s', fn: (x) => x / 3.6 },
    { label: 'm/s►km/h', fn: (x) => x * 3.6 },
    { label: 'oz►g', fn: (x) => x * 28.349523125 },
    { label: 'g►oz', fn: (x) => x / 28.349523125 },
    { label: 'lb►kg', fn: (x) => x * 0.45359237 },
    { label: 'kg►lb', fn: (x) => x / 0.45359237 },
    { label: 'atm►Pa', fn: (x) => x * 101325 },
    { label: 'Pa►atm', fn: (x) => x / 101325 },
    { label: 'mmHg►Pa', fn: (x) => x * 133.322368421 },
    { label: 'Pa►mmHg', fn: (x) => x / 133.322368421 },
    { label: 'hp►kW', fn: (x) => x * 0.745699872 },
    { label: 'kW►hp', fn: (x) => x / 0.745699872 },
    { label: 'kgf/cm²►Pa', fn: (x) => x * 98066.5 },
    { label: 'Pa►kgf/cm²', fn: (x) => x / 98066.5 },
    { label: 'kgf·m►J', fn: (x) => x * 9.80665 },
    { label: 'J►kgf·m', fn: (x) => x / 9.80665 },
    { label: 'lbf/in²►kPa', fn: (x) => x * 6.894757293 },
    { label: 'kPa►lbf/in²', fn: (x) => x / 6.894757293 },
    { label: '°F►°C', fn: (x) => (x - 32) * (5 / 9) },
    { label: '°C►°F', fn: (x) => x * (9 / 5) + 32 },
    { label: 'J►cal', fn: (x) => x / 4.1868 },
    { label: 'cal►J', fn: (x) => x * 4.1868 }
  ];

  function bgcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b !== 0n) {
      const t = a % b;
      a = b;
      b = t;
    }
    return a === 0n ? 1n : a;
  }

  class Frac {
    constructor(n, d = 1n) {
      n = BigInt(n);
      d = BigInt(d);
      if (d === 0n) throw new Error('Math ERROR');
      if (d < 0n) { n = -n; d = -d; }
      const g = bgcd(n, d);
      this.n = n / g;
      this.d = d / g;
    }
    isZero() { return this.n === 0n; }
    neg() { return new Frac(-this.n, this.d); }
    add(o) { return new Frac(this.n * o.d + o.n * this.d, this.d * o.d); }
    sub(o) { return new Frac(this.n * o.d - o.n * this.d, this.d * o.d); }
    mul(o) { return new Frac(this.n * o.n, this.d * o.d); }
    div(o) {
      if (o.isZero()) throw new Error('Math ERROR');
      return new Frac(this.n * o.d, this.d * o.n);
    }
    toNumber() { return Number(this.n) / Number(this.d); }
    tooBig() {
      const lim = 1000000000n;
      return (this.n < -lim || this.n > lim || this.d > lim);
    }
  }

  function simplifyRadicand(n) {
    if (n <= 0 || !Number.isInteger(n) || !Number.isSafeInteger(n)) return null;
    let out = 1;
    let rem = n;
    for (let p = 2; p * p <= rem; p++) {
      while (rem % (p * p) === 0) {
        out *= p;
        rem /= (p * p);
      }
    }
    return [out, rem];
  }

  class Sym {
    constructor(termsMap, piPow = 0) {
      this.terms = new Map();
      this.piPow = piPow;
      for (const [r, f] of termsMap.entries()) {
        if (!f.isZero()) this.terms.set(r, f);
      }
      if (this.terms.size === 0) this.piPow = 0;
    }
    static fromInt(k) {
      const m = new Map();
      if (k !== 0) m.set(1, new Frac(BigInt(k), 1n));
      return new Sym(m, 0);
    }
    static fromFrac(n, d = 1n, r = 1, piPow = 0) {
      const m = new Map();
      const f = new Frac(n, d);
      if (!f.isZero()) m.set(r, f);
      return new Sym(m, piPow);
    }
    static fromDecimalString(str) {
      const neg = str.startsWith('-') || str.startsWith('−');
      const body = neg ? str.slice(1) : str;
      if (!/^[0-9]+(\.[0-9]+)?$/.test(body)) return null;
      const parts = body.split('.');
      if (parts.length === 1) {
        if (parts[0].length > 10) return null;
        return Sym.fromFrac(BigInt(neg ? '-' + parts[0] : parts[0]), 1n);
      }
      const dec = parts[1];
      if (parts[0].length + dec.length > 9) return null;
      const denom = 10n ** BigInt(dec.length);
      const digits = parts[0] + dec;
      return Sym.fromFrac(BigInt(neg ? '-' + digits : digits), denom);
    }
    static pi() { return Sym.fromFrac(1n, 1n, 1, 1); }
    isZero() { return this.terms.size === 0; }
    isValid() {
      if (this.terms.size > 2) return false;
      const pureRational = this.piPow === 0 && this.terms.size === 1 && this.terms.has(1);
      for (const [r, f] of this.terms.entries()) {
        if (r > 999 || f.tooBig()) return false;
        const absN = f.n < 0n ? -f.n : f.n;
        if (pureRational) continue;
        const coefLimit = this.terms.size === 2 ? 100n : 1000n;
        if (absN >= coefLimit * f.d) return false;
        if (r > 1 && f.d > 100n) return false;
      }
      if (pureRational) {
        const f = this.terms.get(1);
        const text = (f.n < 0n ? '-' : '') + f.n.toString().replace('-', '') + (f.d === 1n ? '' : '/' + f.d);
        if (text.length > 10) return false;
      }
      return true;
    }
    toNumber() {
      let s = 0;
      for (const [r, f] of this.terms.entries()) s += f.toNumber() * Math.sqrt(r);
      if (this.piPow === 1) s *= Math.PI;
      return s;
    }
    neg() {
      const m = new Map();
      for (const [r, f] of this.terms.entries()) m.set(r, f.neg());
      return new Sym(m, this.piPow);
    }
    add(o) {
      if (this.isZero()) return o;
      if (o.isZero()) return this;
      if (this.piPow !== o.piPow) return null;
      const m = new Map(this.terms);
      for (const [r, f] of o.terms.entries()) m.set(r, m.has(r) ? m.get(r).add(f) : f);
      const res = new Sym(m, this.piPow);
      return res.isValid() ? res : null;
    }
    sub(o) { return this.add(o.neg()); }
    mul(o) {
      if (this.isZero() || o.isZero()) return Sym.fromInt(0);
      if (this.piPow + o.piPow > 1) return null;
      const m = new Map();
      for (const [r1, f1] of this.terms.entries()) {
        for (const [r2, f2] of o.terms.entries()) {
          const simp = simplifyRadicand(r1 * r2);
          if (!simp) return null;
          const [out, rad] = simp;
          const prod = f1.mul(f2).mul(new Frac(BigInt(out), 1n));
          m.set(rad, m.has(rad) ? m.get(rad).add(prod) : prod);
        }
      }
      const res = new Sym(m, this.piPow + o.piPow);
      return res.isValid() ? res : null;
    }
    div(o) {
      if (o.isZero()) throw new Error('Math ERROR');
      if (this.isZero()) return Sym.fromInt(0);
      const newPi = this.piPow - o.piPow;
      if (newPi < 0 || newPi > 1) return null;
      const entries = Array.from(o.terms.entries());
      if (entries.length === 1) {
        const [r, f] = entries[0];
        const inv = Sym.fromFrac(f.d, f.n * BigInt(r), r, 0);
        const raw = this.mul(inv);
        if (!raw) return null;
        raw.piPow = newPi;
        return raw.isValid() ? raw : null;
      }
      if (entries.length === 2) {
        const [[r1, f1], [r2, f2]] = entries;
        const d1 = f1.mul(f1).mul(new Frac(BigInt(r1), 1n));
        const d2 = f2.mul(f2).mul(new Frac(BigInt(r2), 1n));
        const denom = d1.sub(d2);
        if (denom.isZero()) return null;
        const conj = new Map([[r1, f1.div(denom)], [r2, f2.neg().div(denom)]]);
        const inv = new Sym(conj, 0);
        const raw = this.mul(inv);
        if (!raw) return null;
        raw.piPow = newPi;
        return raw.isValid() ? raw : null;
      }
      return null;
    }
    sqrt() {
      if (this.piPow !== 0 || this.terms.size > 1) return null;
      if (this.isZero()) return Sym.fromInt(0);
      if (!this.terms.has(1)) return null;
      const f = this.terms.get(1);
      if (f.n < 0n) throw new Error('Math ERROR');
      const nNum = Number(f.n);
      const dNum = Number(f.d);
      const simp = simplifyRadicand(nNum * dNum);
      if (!simp) return null;
      const [out, rad] = simp;
      const res = Sym.fromFrac(BigInt(out), BigInt(dNum), rad, 0);
      return res.isValid() ? res : null;
    }
    cbrt() {
      if (this.piPow !== 0 || this.terms.size !== 1 || !this.terms.has(1)) return null;
      const f = this.terms.get(1);
      const cn = BigInt(Math.round(Math.cbrt(Number(f.n))));
      const cd = BigInt(Math.round(Math.cbrt(Number(f.d))));
      if (cn ** 3n !== f.n || cd ** 3n !== f.d) return null;
      const res = Sym.fromFrac(cn, cd);
      return res.isValid() ? res : null;
    }
    powRational(p, q) {
      if (!Number.isInteger(p) || !Number.isInteger(q) || q <= 0) return null;
      if (q === 2) {
        const root = this.sqrt();
        return root ? root.powInt(p) : null;
      }
      if (q === 3) {
        const root = this.cbrt();
        return root ? root.powInt(p) : null;
      }
      return null;
    }
    powInt(k) {
      if (!Number.isInteger(k) || Math.abs(k) > 12) return null;
      if (k === 0) return Sym.fromInt(1);
      if (k < 0) {
        const p = this.powInt(-k);
        return p ? Sym.fromInt(1).div(p) : null;
      }
      let acc = Sym.fromInt(1);
      for (let i = 0; i < k; i++) {
        acc = acc.mul(this);
        if (!acc) return null;
      }
      return acc;
    }
    toHTML(mixedFrac = false) {
      if (this.isZero()) return '0';
      const entries = Array.from(this.terms.entries()).sort((a, b) => a[0] - b[0]);
      let lcmD = 1n;
      for (const [, f] of entries) lcmD = (lcmD / bgcd(lcmD, f.d)) * f.d;

      if (entries.length === 1 && entries[0][0] === 1 && this.piPow === 0) {
        const f = entries[0][1];
        if (f.d === 1n) return f.n < 0n ? `−${-f.n}` : `${f.n}`;
        const neg = f.n < 0n;
        const absN = neg ? -f.n : f.n;
        if (mixedFrac && absN > f.d) {
          const whole = absN / f.d;
          const rem = absN % f.d;
          return `${neg ? '−' : ''}${whole}<span class="m-frac"><span class="m-num">${rem}</span><span class="m-den">${f.d}</span></span>`;
        }
        return `${neg ? '−' : ''}<span class="m-frac"><span class="m-num">${absN}</span><span class="m-den">${f.d}</span></span>`;
      }

      const buildTerms = (signFlip = false) => {
        let html = '';
        entries.forEach(([r, f], idx) => {
          let coef = f.n * (lcmD / f.d);
          if (signFlip) coef = -coef;
          const neg = coef < 0n;
          const absC = neg ? -coef : coef;
          const sign = idx === 0 ? (neg ? '−' : '') : (neg ? '−' : '+');
          let part = '';
          if (r === 1) {
            part = this.piPow === 1 ? (absC === 1n ? '' : absC.toString()) + 'π' : absC.toString();
          } else {
            const rad = `<span class="m-sqrt"><span class="m-sqrt-rad">√</span><span class="m-sqrt-body">${r}</span></span>`;
            part = (absC === 1n ? '' : absC.toString()) + rad + (this.piPow === 1 ? 'π' : '');
          }
          html += sign + part;
        });
        return html;
      };

      if (lcmD === 1n) return buildTerms(false);
      if (entries.length === 1 && entries[0][1].n < 0n) {
        return `−<span class="m-frac"><span class="m-num">${buildTerms(true)}</span><span class="m-den">${lcmD}</span></span>`;
      }
      return `<span class="m-frac"><span class="m-num">${buildTerms(false)}</span><span class="m-den">${lcmD}</span></span>`;
    }
  }

  function exactTrig(fn, angleVal, angleUnit) {
    let deg;
    if (angleUnit === 'Deg') deg = angleVal;
    else if (angleUnit === 'Rad') deg = (angleVal * 180) / Math.PI;
    else deg = angleVal * 0.9;

    const rounded = Math.round(deg);
    if (Math.abs(deg - rounded) > 1e-10) return null;
    const a = ((rounded % 360) + 360) % 360;
    if (a % 15 !== 0) return null;

    const sinMap = {
      0: Sym.fromInt(0),
      15: Sym.fromFrac(1n, 4n, 6).sub(Sym.fromFrac(1n, 4n, 2)),
      30: Sym.fromFrac(1n, 2n),
      45: Sym.fromFrac(1n, 2n, 2),
      60: Sym.fromFrac(1n, 2n, 3),
      75: Sym.fromFrac(1n, 4n, 6).add(Sym.fromFrac(1n, 4n, 2)),
      90: Sym.fromInt(1)
    };

    const getSin = (ang) => {
      if (ang <= 90) return sinMap[ang];
      if (ang <= 180) return sinMap[180 - ang];
      if (ang <= 270) return sinMap[ang - 180].neg();
      return sinMap[360 - ang].neg();
    };
    const getCos = (ang) => getSin((ang + 90) % 360);

    if (fn === 'sin') return getSin(a);
    if (fn === 'cos') return getCos(a);
    if (fn === 'tan') {
      const c = getCos(a);
      if (c.isZero()) throw new Error('Math ERROR');
      return getSin(a).div(c);
    }
    return null;
  }

  function trigQuadrant(x, unit) {
    const deg = unit === 'Deg' ? x : unit === 'Gra' ? x * 0.9 : (x * 180) / Math.PI;
    if (!Number.isFinite(deg)) return null;
    const qf = deg / 90;
    const q = Math.round(qf);
    if (!Number.isFinite(q) || Math.abs(qf - q) > 1e-9 * Math.max(1, Math.abs(qf))) return null;
    return ((q % 4) + 4) % 4;
  }

  function checkTrigRange(x, unit) {
    const limit = unit === 'Deg' ? 9e9 : unit === 'Rad' ? 5e7 * Math.PI : 1e10;
    if (!Number.isFinite(x) || Math.abs(x) >= limit) throw new Error('Math ERROR');
  }

  function reduceTrigAngle(x, unit) {
    checkTrigRange(x, unit);
    if (unit === 'Deg') return ((x % 360) + 360) % 360;
    if (unit === 'Gra') return ((x % 400) + 400) % 400;
    return ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  }

  function angleSymFromDeg(deg, unit) {
    if (unit === 'Deg') return Sym.fromFrac(BigInt(deg), 1n);
    if (unit === 'Gra') return Sym.fromFrac(BigInt(deg * 10), 9n);
    return Sym.fromFrac(BigInt(deg), 180n, 1, 1);
  }

  function inverseTrigSym(name, x, inputSym, unit) {
    if (!inputSym) return null;
    const r2 = Math.SQRT2 / 2, r3 = Math.sqrt(3) / 2, r13 = 1 / Math.sqrt(3), r15 = 2 - Math.sqrt(3), r75 = 2 + Math.sqrt(3);
    const tables = {
      'sin⁻¹': [[0,0],[0.5,30],[r2,45],[r3,60],[1,90]],
      'cos⁻¹': [[1,0],[r3,30],[r2,45],[0.5,60],[0,90]],
      'tan⁻¹': [[0,0],[r15,15],[r13,30],[1,45],[r3,60],[r75,75]]
    };
    const table = tables[name];
    if (!table) return null;
    const sign = x < 0 ? -1 : 1;
    for (const [value, deg] of table) {
      if (Math.abs(Math.abs(x) - value) < 1e-13 * Math.max(1, value)) {
        let outDeg = deg * sign;
        if (name === 'cos⁻¹' && sign < 0) outDeg = 180 - deg;
        return angleSymFromDeg(outDeg, unit);
      }
    }
    return null;
  }

  function relativeAddSub(a, b, op) {
    const result = op === '+' ? a + b : a - b;
    const tol = 1e-14 * Math.max(Math.abs(a), Math.abs(b));
    return result !== 0 && Math.abs(result) < tol ? 0 : result;
  }
  function symSum(a, b) { return a && b ? a.add(b) : (a || b || null); }
  function symDiff(a, b) { return a && b ? a.sub(b) : (b ? b.neg() : a); }
  function symProd(a, b) { return a && b ? a.mul(b) : null; }

  class Complex {
    constructor(re, im = 0, reSym = null, imSym = null) {
      const mag = Math.hypot(re, im);
      const tol = 1e-14 * mag;
      this.re = Math.abs(re) < tol ? 0 : re;
      this.im = Math.abs(im) < tol ? 0 : im;
      this.reSym = reSym && reSym.isValid() ? reSym : null;
      this.imSym = imSym && imSym.isValid() ? imSym : null;
    }
    static fromPolar(r, thetaRad, rSym = null, thetaSym = null) {
      const c = Math.cos(thetaRad), s = Math.sin(thetaRad);
      let reSym = null, imSym = null;
      if (rSym && thetaSym && thetaSym.piPow === 0 && thetaSym.terms.size === 1) {
        const angle = thetaSym.toNumber();
        if (Math.abs(c) < 1e-14) reSym = null;
        else if (Math.abs(s) < 1e-14) imSym = null;
      }
      return new Complex(r * c, r * s, reSym, imSym);
    }
    add(o) {
      return new Complex(
        relativeAddSub(this.re, o.re, '+'), relativeAddSub(this.im, o.im, '+'),
        symSum(this.reSym, o.reSym), symSum(this.imSym, o.imSym)
      );
    }
    sub(o) {
      return new Complex(
        relativeAddSub(this.re, o.re, '−'), relativeAddSub(this.im, o.im, '−'),
        symDiff(this.reSym, o.reSym), symDiff(this.imSym, o.imSym)
      );
    }
    mul(o) {
      const ac = symProd(this.reSym, o.reSym), bd = symProd(this.imSym, o.imSym);
      const ad = symProd(this.reSym, o.imSym), bc = symProd(this.imSym, o.reSym);
      return new Complex(
        this.re * o.re - this.im * o.im, this.re * o.im + this.im * o.re,
        symDiff(ac, bd), symSum(ad, bc)
      );
    }
    div(o) {
      const d = o.re * o.re + o.im * o.im;
      if (d === 0) throw new Error('Math ERROR');
      const ac = symProd(this.reSym, o.reSym), bd = symProd(this.imSym, o.imSym);
      const ad = symProd(this.reSym, o.imSym), bc = symProd(this.imSym, o.reSym);
      const c2 = symProd(o.reSym, o.reSym), d2 = symProd(o.imSym, o.imSym);
      const den = symSum(c2, d2);
      const realNum = symSum(ac, bd), imagNum = symDiff(bc, ad);
      const realSym = den && realNum ? realNum.div(den) : null;
      const imagSym = den && imagNum ? imagNum.div(den) : null;
      return new Complex(
        (this.re * o.re + this.im * o.im) / d, (this.im * o.re - this.re * o.im) / d,
        realSym, imagSym
      );
    }
    neg() { return new Complex(-this.re, -this.im, this.reSym ? this.reSym.neg() : null, this.imSym ? this.imSym.neg() : null); }
    abs() { return Math.hypot(this.re, this.im); }
    arg() { return Math.atan2(this.im, this.re); }
    conj() { return new Complex(this.re, -this.im, this.reSym, this.imSym ? this.imSym.neg() : null); }
    pow(n) {
      if (Number.isInteger(n) && Math.abs(n) <= 10) {
        if (n === 0) return new Complex(1, 0, Sym.fromInt(1), null);
        if (n < 0) return new Complex(1, 0, Sym.fromInt(1), null).div(this.pow(-n));
        let res = new Complex(1, 0, Sym.fromInt(1), null);
        for (let i = 0; i < n; i++) res = res.mul(this);
        return res;
      }
      return Complex.fromPolar(Math.pow(this.abs(), n), this.arg() * n);
    }
  }

  function cleanFloat(x) {
    if (!Number.isFinite(x) || Math.abs(x) >= 1e100) throw new Error('Math ERROR');
    if (x === 0) return 0;
    if (Math.abs(x) < 1e-99) return 0;
    const y = Number(x.toPrecision(15));
    if (!Number.isFinite(y) || Math.abs(y) >= 1e100) throw new Error('Math ERROR');
    return y;
  }

  function addSub(a, b, op) {
    const result = op === '+' ? a + b : a - b;
    const tol = 1e-14 * Math.max(Math.abs(a), Math.abs(b));
    return result !== 0 && Math.abs(result) < tol ? 0 : result;
  }

  function toRad(x, unit) {
    if (unit === 'Deg') return (x * Math.PI) / 180;
    if (unit === 'Gra') return (x * Math.PI) / 200;
    return x;
  }

  function fromRad(x, unit) {
    if (unit === 'Deg') return (x * 180) / Math.PI;
    if (unit === 'Gra') return (x * 200) / Math.PI;
    return x;
  }

  function gamma(z) {
    const g = 7;
    const p = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    z -= 1;
    let x = p[0];
    for (let i = 1; i < g + 2; i++) x += p[i] / (z + i);
    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }

  function erf(x) {
    if (x === 0) return 0;
    if (!Number.isFinite(x)) return x > 0 ? 1 : -1;
    const sign = x < 0 ? -1 : 1;
    const ax = Math.abs(x);
    if (ax < 1) {
      const sq = ax * ax;
      let term = ax, sum = ax;
      for (let n = 1; n < 100; n++) {
        term *= -sq / n;
        const add = term / (2 * n + 1);
        sum += add;
        if (Math.abs(add) < 1e-17) break;
      }
      return sign * (2 / Math.sqrt(Math.PI)) * sum;
    }
    const z = ax * ax;
    let b = z + 0.5, c = 1e300, d = 1 / b, h = d;
    for (let i = 1; i < 1000; i++) {
      const an = -i * (i - 0.5);
      b += 2;
      d = an * d + b;
      if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c;
      if (Math.abs(c) < 1e-300) c = 1e-300;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < 3e-16) break;
    }
    const erfc = Math.exp(-z) * Math.sqrt(z) / Math.sqrt(Math.PI) * h;
    return sign * (1 - Math.max(0, Math.min(2, erfc)));
  }

  function factorial(n) {
    if (!Number.isInteger(n) || n < 0 || n > 69) throw new Error('Math ERROR');
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  function checkPermutationRange(n, r) {
    if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n || n >= 1e10) {
      throw new Error('Math ERROR');
    }
  }

  function nPr(n, r) {
    checkPermutationRange(n, r);
    let res = 1, log10 = 0;
    for (let i = 0; i < r; i++) {
      const factor = n - i;
      log10 += Math.log10(factor);
      res *= factor;
      if (!Number.isFinite(res) || res >= 1e100 || log10 >= 100) throw new Error('Math ERROR');
    }
    return res;
  }

  function nCr(n, r) {
    checkPermutationRange(n, r);
    r = Math.min(r, n - r);
    let res = 1, log10 = 0;
    for (let i = 1; i <= r; i++) {
      log10 += Math.log10(n - r + i) - Math.log10(i);
      res = (res * (n - r + i)) / i;
      if (!Number.isFinite(res) || res >= 1e100 || log10 >= 100) throw new Error('Math ERROR');
    }
    return Math.round(res);
  }

  const GK_X = [
    0.9914553711208126, 0.9491079123427585, 0.8648644233597691,
    0.7415311855993945, 0.5860872354676911, 0.4058451513773972,
    0.2077849550078985
  ];
  const GK_W = [
    0.022935322010529224, 0.06309209262997855, 0.10479001032225018,
    0.14065325971552592, 0.1690047266392679, 0.1903505780647854,
    0.2044329400752989
  ];
  const G7_W = [0.1294849661688697, 0.27970539148927664, 0.3818300505051189, 0.4179591836734694];
  const GK_CENTER = 0.2094821410847278;

  function gaussKronrod(fn, l, r) {
    const center = (l + r) / 2, half = (r - l) / 2;
    let resK = GK_CENTER * fn(center);
    let resG = G7_W[3] * fn(center);
    for (let k = 0; k < GK_X.length; k++) {
      const delta = GK_X[k] * half;
      const sum = fn(center - delta) + fn(center + delta);
      resK += GK_W[k] * sum;
      if (k % 2 === 1) resG += G7_W[(k - 1) / 2] * sum;
    }
    return [resK * half, Math.abs(resK - resG) * half];
  }

  function integrate(fn, a, b) {
    if (a === b) return 0;
    const sign = a > b ? -1 : 1;
    if (a > b) [a, b] = [b, a];
    const tolerance = 1e-11;
    function adaptive(l, r, whole, err, depth) {
      const [part, estimate] = gaussKronrod(fn, l, r);
      if (!Number.isFinite(part) || !Number.isFinite(estimate)) {
        if (r - l < 1e-12 || depth <= 0) return [part, estimate];
        const m = (l + r) / 2;
        const left = adaptive(l, m, part, estimate, depth - 1);
        const right = adaptive(m, r, part, estimate, depth - 1);
        return [left[0] + right[0], left[1] + right[1]];
      }
      if (depth <= 0 || estimate <= tolerance * (r - l) / (b - a)) return [part, estimate];
      const m = (l + r) / 2;
      const left = adaptive(l, m, part, estimate, depth - 1);
      const right = adaptive(m, r, part, estimate, depth - 1);
      return [left[0] + right[0], left[1] + right[1]];
    }
    const [total] = adaptive(a, b, 0, Infinity, 45);
    return cleanFloat(sign * total);
  }

  function differentiate(fn, x) {
    const h = Math.max(1e-6, Math.abs(x) * 1e-5);
    const f0 = fn(x), f1p = fn(x + h), f2p = fn(x + 2 * h);
    const f1m = fn(x - h), f2m = fn(x - 2 * h);
    const candidates = [];
    if ([f2p, f1p, f1m, f2m].every(Number.isFinite)) {
      candidates.push((-f2p + 8 * f1p - 8 * f1m + f2m) / (12 * h));
    }
    if ([f0, f1p, f2p].every(Number.isFinite)) candidates.push((-3 * f0 + 4 * f1p - f2p) / (2 * h));
    if ([f0, f1m, f2m].every(Number.isFinite)) candidates.push((3 * f0 - 4 * f1m + f2m) / (2 * h));
    if ([f1p, f1m].every(Number.isFinite)) candidates.push((f1p - f1m) / (2 * h));
    if ([f0, f1p].every(Number.isFinite)) candidates.push((f1p - f0) / h);
    if ([f0, f1m].every(Number.isFinite)) candidates.push((f0 - f1m) / h);
    for (const value of candidates) if (Number.isFinite(value)) return cleanFloat(value);
    return NaN;
  }

  function solveEquation(lhsFn, rhsFn, x0 = 0, opts = {}) {
    if (rhsFn && typeof rhsFn === 'object' && !Array.isArray(rhsFn)) {
      opts = rhsFn;
      rhsFn = () => 0;
    }
    const variable = opts.variable || 'X';
    const f = (x) => lhsFn(x) - rhsFn(x);
    const converged = (x, fx) => Math.abs(fx) < 1e-10 * (1 + Math.abs(lhsFn(x)) + Math.abs(rhsFn(x)));
    let x = Number.isFinite(x0) ? x0 : 0;
    let fx = f(x);
    if (converged(x, fx)) return { root: cleanFloat(x), diff: cleanFloat(fx), variable };
    let prevX = null, prevFx = null;

    const valid = (v, value) => Number.isFinite(v) && Number.isFinite(value);
    const evaluate = (candidate) => {
      let value = f(candidate);
      let step = 1;
      while (!valid(candidate, value) && step < 50) {
        step *= 0.5;
        value = f(x + (candidate - x) * step);
      }
      if (!valid(candidate, value)) return null;
      return { x: x + (candidate - x) * step, value };
    };

    for (let iter = 0; iter < 200; iter++) {
      if (!Number.isFinite(fx)) {
        let probe = 1;
        let next = null;
        while (probe <= 1e6 && !next) {
          next = evaluate(x + probe);
          if (!next || Math.sign(next.value) === Math.sign(fx)) next = null;
          probe *= 2;
        }
        if (!next) { x += 0.137; fx = f(x); continue; }
        prevX = x; prevFx = fx; x = next.x; fx = next.value;
        if (converged(x, fx)) return { root: cleanFloat(x), diff: cleanFloat(fx), variable };
        continue;
      }

      const dfx = differentiate(f, x);
      let candidate = null;
      if (Number.isFinite(dfx) && Math.abs(dfx) > 1e-15) {
        const newton = x - fx / dfx;
        if (Number.isFinite(newton)) candidate = newton;
      }
      if (prevX !== null && Number.isFinite(prevFx) && prevFx !== fx) {
        const secant = x - fx * (x - prevX) / (fx - prevFx);
        if (Number.isFinite(secant) && (candidate === null || Math.abs(secant - x) < Math.abs(candidate - x))) candidate = secant;
      }
      if (candidate === null) {
        const step = Math.max(1, Math.abs(x) * 0.1);
        candidate = x + step * (fx < 0 ? 1 : -1);
      }
      if (Math.abs(candidate - x) > 1e6) candidate = x + Math.sign(candidate - x) * 1e6;
      let next = evaluate(candidate);
      let halved = 0;
      while ((!next || Math.abs(next.value) > Math.abs(fx)) && halved < 50) {
        halved++;
        next = evaluate(x + (candidate - x) / (2 ** halved));
      }
      if (!next) { x += 0.137; fx = f(x); prevX = null; prevFx = null; continue; }
      if (converged(next.x, next.value)) return { root: cleanFloat(next.x), diff: cleanFloat(next.value), variable };
      prevX = x; prevFx = fx; x = next.x; fx = next.value;
    }
    if (converged(x, fx)) return { root: cleanFloat(x), diff: cleanFloat(fx), variable };
    throw new Error("Can't Solve");
  }

  const Matrix = {
    create(r, c) { return Array.from({ length: r }, () => Array(c).fill(0)); },
    clone(M) { return M.map((row) => [...row]); },
    add(A, B) {
      if (A.length !== B.length || A[0].length !== B[0].length) throw new Error('Dimension ERROR');
      return A.map((row, i) => row.map((v, j) => cleanFloat(addSub(v, B[i][j], '+'))));
    },
    sub(A, B) {
      if (A.length !== B.length || A[0].length !== B[0].length) throw new Error('Dimension ERROR');
      return A.map((row, i) => row.map((v, j) => cleanFloat(addSub(v, B[i][j], '−'))));
    },
    scale(A, k) { return A.map((row) => row.map((v) => cleanFloat(v * k))); },
    mul(A, B) {
      if (A[0].length !== B.length) throw new Error('Dimension ERROR');
      const r = A.length, c = B[0].length, n = B.length;
      const out = Matrix.create(r, c);
      for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
          let s = 0;
          for (let k = 0; k < n; k++) s += A[i][k] * B[k][j];
          out[i][j] = cleanFloat(s);
        }
      }
      return out;
    },
    trn(A) {
      const r = A.length, c = A[0].length;
      const out = Matrix.create(c, r);
      for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) out[j][i] = A[i][j];
      return out;
    },
    det(A) {
      const n = A.length;
      if (n !== A[0].length) throw new Error('Dimension ERROR');
      if (n === 1) return cleanFloat(A[0][0]);
      if (n === 2) return cleanFloat(A[0][0] * A[1][1] - A[0][1] * A[1][0]);
      if (n === 3) {
        return cleanFloat(
          A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
          A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
          A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])
        );
      }
      throw new Error('Dimension ERROR');
    },
    inv(A) {
      const n = A.length;
      if (n !== A[0].length) throw new Error('Dimension ERROR');
      let maxAbs = 0;
      for (const row of A) for (const v of row) maxAbs = Math.max(maxAbs, Math.abs(v));
      const eps = 1e-13 * maxAbs;
      const M = A.map((row, i) => [
        ...row,
        ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
      ]);
      for (let col = 0; col < n; col++) {
        let p = col;
        for (let r = col + 1; r < n; r++) {
          if (Math.abs(M[r][col]) > Math.abs(M[p][col])) p = r;
        }
        if (Math.abs(M[p][col]) <= eps) throw new Error('Math ERROR');
        [M[col], M[p]] = [M[p], M[col]];
        const pv = M[col][col];
        for (let c = 0; c < 2 * n; c++) M[col][c] /= pv;
        for (let r = 0; r < n; r++) {
          if (r === col) continue;
          const f = M[r][col];
          if (f === 0) continue;
          for (let c = 0; c < 2 * n; c++) M[r][c] -= f * M[col][c];
        }
      }
      return M.map((row) => row.slice(n).map(cleanFloat));
    },
    pow(A, k) {
      if (A.length !== A[0].length) throw new Error('Dimension ERROR');
      if (k === -1) return Matrix.inv(A);
      if (k === 2) return Matrix.mul(A, A);
      if (k === 3) return Matrix.mul(Matrix.mul(A, A), A);
      throw new Error('Math ERROR');
    }
  };

  const Vector = {
    add(a, b) {
      if (a.length !== b.length) throw new Error('Dimension ERROR');
      return a.map((v, i) => cleanFloat(addSub(v, b[i], '+')));
    },
    sub(a, b) {
      if (a.length !== b.length) throw new Error('Dimension ERROR');
      return a.map((v, i) => cleanFloat(addSub(v, b[i], '−')));
    },
    scale(a, k) { return a.map((v) => cleanFloat(v * k)); },
    dot(a, b) {
      if (a.length !== b.length) throw new Error('Dimension ERROR');
      return cleanFloat(a.reduce((s, v, i) => s + v * b[i], 0));
    },
    cross(a, b) {
      const a3 = a.length === 2 ? [a[0], a[1], 0] : a;
      const b3 = b.length === 2 ? [b[0], b[1], 0] : b;
      return [
        cleanFloat(a3[1] * b3[2] - a3[2] * b3[1]),
        cleanFloat(a3[2] * b3[0] - a3[0] * b3[2]),
        cleanFloat(a3[0] * b3[1] - a3[1] * b3[0])
      ];
    },
    abs(a) { return cleanFloat(Math.hypot(...a)); }
  };

  function solveLinearSystem(A, b) {
    const n = A.length;
    const M = A.map((row, i) => [...row, b[i]]);
    let maxAbs = 0;
    for (const row of M) for (const v of row) maxAbs = Math.max(maxAbs, Math.abs(v));
    const eps = 1e-12 * maxAbs;

    let rank = 0;
    for (let col = 0; col < n && rank < n; col++) {
      let p = rank;
      for (let r = rank + 1; r < n; r++) {
        if (Math.abs(M[r][col]) > Math.abs(M[p][col])) p = r;
      }
      if (Math.abs(M[p][col]) <= eps) continue;
      [M[rank], M[p]] = [M[p], M[rank]];
      const pv = M[rank][col];
      for (let c = col; c <= n; c++) M[rank][c] /= pv;
      for (let r = 0; r < n; r++) {
        if (r === rank) continue;
        const f = M[r][col];
        if (f === 0) continue;
        for (let c = col; c <= n; c++) M[r][c] -= f * M[rank][c];
      }
      rank++;
    }
    for (let r = rank; r < n; r++) {
      if (Math.abs(M[r][n]) > eps) return { status: 'none' };
    }
    if (rank < n) return { status: 'infinite' };
    return { status: 'unique', x: M.map((row) => row[n]) };
  }

  const Eqn = {
    solve2x2(a1, b1, c1, a2, b2, c2) {
      const r = solveLinearSystem([[a1, b1], [a2, b2]], [c1, c2]);
      if (r.status === 'none') return [{ label: 'No Solution', val: '' }];
      if (r.status === 'infinite') return [{ label: 'Infinite Sol', val: '' }];
      return [
        { label: 'X =', num: cleanFloat(r.x[0]) },
        { label: 'Y =', num: cleanFloat(r.x[1]) }
      ];
    },
    solve3x3(m) {
      const A = m.map((r) => r.slice(0, 3));
      const b = m.map((r) => r[3]);
      const r = solveLinearSystem(A, b);
      if (r.status === 'none') return [{ label: 'No Solution', val: '' }];
      if (r.status === 'infinite') return [{ label: 'Infinite Sol', val: '' }];
      return [
        { label: 'X =', num: cleanFloat(r.x[0]) },
        { label: 'Y =', num: cleanFloat(r.x[1]) },
        { label: 'Z =', num: cleanFloat(r.x[2]) }
      ];
    },
    solveQuadratic(a, b, c, opts = {}) {
      const scale = Math.max(Math.abs(a), Math.abs(b), Math.abs(c));
      if (Math.abs(a) <= 1e-12 * scale || a === 0) throw new Error('Math ERROR');
      const disc = b * b - 4 * a * c;
      const symRoots = [];
      if (disc >= 0) {
        const sa = Sym.fromDecimalString(String(a)), sb = Sym.fromDecimalString(String(b)), sc = Sym.fromDecimalString(String(c));
        if (sa && sb && sc) {
          const discSym = sb.mul(sb).sub(sa.mul(sc).mul(Sym.fromInt(4)));
          const sqrtSym = discSym.isZero() ? Sym.fromInt(0) : discSym.sqrt();
          if (sqrtSym) {
            const den = sa.mul(Sym.fromInt(2));
            const plus = sb.neg().add(sqrtSym), minus = sb.neg().sub(sqrtSym);
            const r1 = plus.div(den), r2 = minus.div(den);
            if (r1 && r2) symRoots.push(r1, r2);
          }
        }
        const s = Math.sqrt(disc);
        const results = [
          { label: 'X1 =', num: cleanFloat((-b + s) / (2 * a)), sym: symRoots[0] || null },
          { label: 'X2 =', num: cleanFloat((-b - s) / (2 * a)), sym: symRoots[1] || null }
        ];
        if (opts.includeExtrema) {
          const vx = cleanFloat(-b / (2 * a));
          results.push({ label: `X-${a > 0 ? 'Min' : 'Max'}=`, num: vx }, { label: `Y-${a > 0 ? 'Min' : 'Max'}=`, num: cleanFloat(a * vx * vx + b * vx + c) });
        }
        return results;
      }
      const re = cleanFloat(-b / (2 * a));
      const im = cleanFloat(Math.sqrt(-disc) / Math.abs(2 * a));
      let reSym = null, imSym = null;
      const sa = Sym.fromDecimalString(String(a));
      const sb = Sym.fromDecimalString(String(b));
      const sc = Sym.fromDecimalString(String(c));
      const twoA = sa && sa.mul(Sym.fromInt(2));
      if (sa && sb && sc && twoA) {
        const negDiscSym = sa.mul(sc).mul(Sym.fromInt(4)).sub(sb.mul(sb));
        const sqrtNegDisc = negDiscSym && (negDiscSym.isZero() ? Sym.fromInt(0) : negDiscSym.sqrt());
        const twoAAbs = a < 0 ? twoA.neg() : twoA;
        const candidateRe = sb.neg().div(twoA);
        const candidateIm = sqrtNegDisc && twoAAbs ? sqrtNegDisc.div(twoAAbs) : null;
        if (candidateRe && candidateRe.isValid()) reSym = candidateRe;
        if (candidateIm && candidateIm.isValid()) imSym = candidateIm;
      }
      const results = [
        { label: 'X1 =', cmplx: new Complex(re, im, reSym, imSym) },
        { label: 'X2 =', cmplx: new Complex(re, -im, reSym, imSym && imSym.neg()) }
      ];
      if (opts.includeExtrema) {
        const vx = re;
        results.push({ label: `X-${a > 0 ? 'Min' : 'Max'}=`, num: vx }, { label: `Y-${a > 0 ? 'Min' : 'Max'}=`, num: cleanFloat(a * vx * vx + b * vx + c) });
      }
      return results;
    },
    solveCubic(a, b, c, d) {
      if (Math.abs(a) < 1e-14) throw new Error('Math ERROR');
      const p = (3 * a * c - b * b) / (3 * a * a);
      const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
      const shift = -b / (3 * a);
      const disc = (q * q) / 4 + (p * p * p) / 27;
      if (disc > 1e-13) {
        const sd = Math.sqrt(disc);
        const u = Math.cbrt(-q / 2 + sd);
        const v = Math.cbrt(-q / 2 - sd);
        const re = cleanFloat(-(u + v) / 2 + shift);
        const im = cleanFloat(((u - v) * Math.sqrt(3)) / 2);
        return [
          { label: 'X1 =', num: cleanFloat(u + v + shift) },
          { label: 'X2 =', cmplx: new Complex(re, Math.abs(im)) },
          { label: 'X3 =', cmplx: new Complex(re, -Math.abs(im)) }
        ];
      }
      if (Math.abs(disc) <= 1e-13) {
        const u = Math.cbrt(-q / 2);
        return [
          { label: 'X1 =', num: cleanFloat(2 * u + shift) },
          { label: 'X2 =', num: cleanFloat(-u + shift) },
          { label: 'X3 =', num: cleanFloat(-u + shift) }
        ];
      }
      const r = Math.sqrt(-(p * p * p) / 27);
      const phi = Math.acos(Math.max(-1, Math.min(1, -q / (2 * r))));
      const m = 2 * Math.cbrt(r);
      const roots = [
        cleanFloat(m * Math.cos(phi / 3) + shift),
        cleanFloat(m * Math.cos((phi + 2 * Math.PI) / 3) + shift),
        cleanFloat(m * Math.cos((phi + 4 * Math.PI) / 3) + shift)
      ].sort((x, y) => y - x);
      return [{ label: 'X1 =', num: roots[0] }, { label: 'X2 =', num: roots[1] }, { label: 'X3 =', num: roots[2] }];
    }
  };

  const Stat = {
    compute(type, rows) {
      const pts = rows.filter((r) => r.f > 0 && Number.isFinite(r.x));
      if (pts.length === 0) throw new Error('Math ERROR');
      let n = 0, sx = 0, sx2 = 0, sy = 0, sy2 = 0, sxy = 0, sx3 = 0, sx2y = 0, sx4 = 0;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const p of pts) {
        const f = p.f, x = p.x, y = Number.isFinite(p.y) ? p.y : 0;
        n += f; sx += f * x; sx2 += f * x * x; sx3 += f * x * x * x; sx4 += f * x * x * x * x;
        sy += f * y; sy2 += f * y * y; sxy += f * x * y; sx2y += f * x * x * y;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
      const xbar = sx / n, ybar = sy / n;
      let centeredX = 0, centeredY = 0;
      for (const p of pts) {
        const dx = p.x - xbar, dy = (Number.isFinite(p.y) ? p.y : 0) - ybar;
        centeredX += p.f * dx * dx;
        centeredY += p.f * dy * dy;
      }
      const varX = Math.max(0, centeredX / n);
      const varY = Math.max(0, centeredY / n);
      const sigX = Math.sqrt(varX), sigY = Math.sqrt(varY);
      const sX = n > 1 ? Math.sqrt((varX * n) / (n - 1)) : NaN;
      const sY = n > 1 ? Math.sqrt((varY * n) / (n - 1)) : NaN;
      let A = NaN, B = NaN, C = NaN, r = NaN;

      const linReg = (pairs) => {
        let N = 0, X = 0, Y = 0, XX = 0, YY = 0, XY = 0;
        for (const [tx, ty, f] of pairs) {
          if (!Number.isFinite(tx) || !Number.isFinite(ty)) throw new Error('Math ERROR');
          N += f; X += f * tx; Y += f * ty; XX += f * tx * tx; YY += f * ty * ty; XY += f * tx * ty;
        }
        const den = N * XX - X * X;
        if (Math.abs(den) < 1e-14) return { a: NaN, b: NaN, r: NaN };
        const b = (N * XY - X * Y) / den;
        const a = (Y - b * X) / N;
        const rDen = Math.sqrt(Math.max(0, den * (N * YY - Y * Y)));
        return { a, b, r: rDen > 1e-14 ? (N * XY - X * Y) / rDen : NaN };
      };

      if (type === 2) { const res = linReg(pts.map((p) => [p.x, p.y, p.f])); A = res.a; B = res.b; r = res.r; }
      else if (type === 3) {
        const sol = Eqn.solve3x3([[n, sx, sx2, sy], [sx, sx2, sx3, sxy], [sx2, sx3, sx4, sx2y]]);
        if (sol.length === 3 && sol[0].num !== undefined) { A = sol[0].num; B = sol[1].num; C = sol[2].num; }
      } else if (type === 4) { const res = linReg(pts.map((p) => [Math.log(p.x), p.y, p.f])); A = res.a; B = res.b; r = res.r; }
      else if (type === 5) { const res = linReg(pts.map((p) => [p.x, Math.log(p.y), p.f])); A = Math.exp(res.a); B = res.b; r = res.r; }
      else if (type === 6) { const res = linReg(pts.map((p) => [p.x, Math.log(p.y), p.f])); A = Math.exp(res.a); B = Math.exp(res.b); r = res.r; }
      else if (type === 7) { const res = linReg(pts.map((p) => [Math.log(p.x), Math.log(p.y), p.f])); A = Math.exp(res.a); B = res.b; r = res.r; }
      else if (type === 8) { const res = linReg(pts.map((p) => [1 / p.x, p.y, p.f])); A = res.a; B = res.b; r = res.r; }

      return {
        type,
        n: cleanFloat(n), sx: cleanFloat(sx), sx2: cleanFloat(sx2),
        sy: cleanFloat(sy), sy2: cleanFloat(sy2), sxy: cleanFloat(sxy),
        sx3: cleanFloat(sx3), sx2y: cleanFloat(sx2y), sx4: cleanFloat(sx4),
        xbar: cleanFloat(xbar), sigX: cleanFloat(sigX), sX: Number.isFinite(sX) ? cleanFloat(sX) : NaN,
        ybar: cleanFloat(ybar), sigY: cleanFloat(sigY), sY: Number.isFinite(sY) ? cleanFloat(sY) : NaN,
        minX: cleanFloat(minX), maxX: cleanFloat(maxX), minY: cleanFloat(minY), maxY: cleanFloat(maxY),
        A: Number.isFinite(A) ? cleanFloat(A) : NaN, B: Number.isFinite(B) ? cleanFloat(B) : NaN,
        C: Number.isFinite(C) ? cleanFloat(C) : NaN, r: Number.isFinite(r) ? cleanFloat(r) : NaN
      };
    }
  };

  function statT(res, x) {
    if (!res || !Number.isFinite(res.sigX) || res.sigX === 0) throw new Error('Math ERROR');
    return (x - res.xbar) / res.sigX;
  }

  function normalP(t) { return 0.5 * (1 + erf(t / Math.SQRT2)); }
  function normalQ(t) { return 0.5 * erf(t / Math.SQRT2); }
  function normalR(t) { return 0.5 * (1 - erf(t / Math.SQRT2)); }

  function statEstimate(res, kind, value) {
    if (!res) throw new Error('Math ERROR');
    const { type, A, B, C } = res;
    if (type === 1) throw new Error('Math ERROR');
    const valid = (v) => { if (!Number.isFinite(v)) throw new Error('Math ERROR'); return cleanFloat(v); };
    if (kind === 'yhat') {
      const x = value;
      if (type === 2) return valid(A + B * x);
      if (type === 3) return valid(A + B * x + C * x * x);
      if (type === 4) { if (x <= 0) throw new Error('Math ERROR'); return valid(A + B * Math.log(x)); }
      if (type === 5) return valid(A * Math.exp(B * x));
      if (type === 6) return valid(A * Math.pow(B, x));
      if (type === 7) { if (x < 0) throw new Error('Math ERROR'); return valid(A * Math.pow(x, B)); }
      if (type === 8) { if (x === 0) throw new Error('Math ERROR'); return valid(A + B / x); }
      throw new Error('Math ERROR');
    }
    const y = value;
    if (type === 2) return valid(B === 0 ? NaN : (y - A) / B);
    if (type === 3) {
      if (!C) throw new Error('Math ERROR');
      const disc = B * B - 4 * C * (A - y);
      if (disc < 0) throw new Error('Math ERROR');
      const s = Math.sqrt(disc);
      return kind === 'xhat2' ? valid((-B - s) / (2 * C)) : valid((-B + s) / (2 * C));
    }
    if (type === 4) { if (!B) throw new Error('Math ERROR'); return valid(Math.exp((y - A) / B)); }
    if (type === 5) { if (!B || A <= 0 || y <= 0) throw new Error('Math ERROR'); return valid(Math.log(y / A) / B); }
    if (type === 6) { if (B <= 0 || B === 1 || A <= 0 || y <= 0) throw new Error('Math ERROR'); return valid(Math.log(y / A) / Math.log(B)); }
    if (type === 7) { if (!B || A === 0) throw new Error('Math ERROR'); const ratio = y / A; if (ratio < 0) throw new Error('Math ERROR'); return valid(Math.pow(ratio, 1 / B)); }
    if (type === 8) { if (y === A) throw new Error('Math ERROR'); return valid(B / (y - A)); }
    throw new Error('Math ERROR');
  }

  function baseBits(base) { return base === 'BIN' ? 16 : 32; }

  function parseBaseDigits(str, rad, bits) {
    const valid = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^[0-9]+$/, 16: /^[0-9A-F]+$/ }[rad];
    if (!valid.test(str)) throw new Error('Syntax ERROR');
    const big = BigInt(rad === 16 ? '0x' + str : rad === 8 ? '0o' + str : rad === 2 ? '0b' + str : str);
    if (big >= 1n << BigInt(bits)) throw new Error('Math ERROR');
    return Number(BigInt.asIntN(bits, big));
  }

  function checkedBaseValue(value, bits) {
    const limit = 1n << BigInt(bits - 1);
    const big = BigInt(value);
    if (big < -limit || big >= limit) throw new Error('Math ERROR');
    return Number(big);
  }

  function wrappedBaseValue(value, bits) { return Number(BigInt.asIntN(bits, BigInt(value))); }

  function evalBaseN(tokens, base, ctx = {}) {
    const bits = baseBits(base);
    const defaultRad = { DEC: 10, HEX: 16, BIN: 2, OCT: 8 }[base] || 10;
    const lex = [];
    let i = 0;
    while (i < tokens.length) {
      const v = tokens[i].v;
      if (['X', 'Y', 'M'].includes(v)) { lex.push({ type: 'var', v }); i++; continue; }
      if (['d', 'h', 'b', 'o'].includes(v) && i + 1 < tokens.length) {
        const prefRad = { d: 10, h: 16, b: 2, o: 8 }[v];
        i++;
        let digits = '';
        while (i < tokens.length && /^[0-9A-F]$/.test(tokens[i].v)) { digits += tokens[i].v; i++; }
        if (!digits) throw new Error('Syntax ERROR');
        lex.push({ type: 'num', val: parseBaseDigits(digits, prefRad, bits) });
        continue;
      }
      if (/^[0-9A-F]$/.test(v)) {
        let digits = '';
        while (i < tokens.length && /^[0-9A-F]$/.test(tokens[i].v)) { digits += tokens[i].v; i++; }
        lex.push({ type: 'num', val: parseBaseDigits(digits, defaultRad, bits) });
        continue;
      }
      lex.push({ type: 'op', v });
      i++;
    }
    let pos = 0;
    const peek = () => lex[pos], next = () => lex[pos++];
    function parseBitwise() {
      let left = parseAnd();
      while (peek() && ['or', 'xor', 'xnor'].includes(peek().v)) {
        const op = next().v, right = parseAnd();
        if (op === 'or') left = wrappedBaseValue(BigInt(left) | BigInt(right), bits);
        else if (op === 'xor') left = wrappedBaseValue(BigInt(left) ^ BigInt(right), bits);
        else left = wrappedBaseValue(~(BigInt(left) ^ BigInt(right)), bits);
      }
      return left;
    }
    function parseAnd() {
      let left = parseAdd();
      while (peek() && peek().v === 'and') {
        next();
        left = wrappedBaseValue(BigInt(left) & BigInt(parseAdd()), bits);
      }
      return left;
    }
    function parseAdd() {
      let left = parseMul();
      while (peek() && (peek().v === '+' || peek().v === '−')) {
        const op = next().v, right = parseMul();
        left = checkedBaseValue(BigInt(left) + (op === '+' ? BigInt(right) : -BigInt(right)), bits);
      }
      return left;
    }
    function parseMul() {
      let left = parseUnary();
      while (peek() && (peek().v === '×' || peek().v === '÷')) {
        const op = next().v, right = BigInt(parseUnary());
        if (op === '×') left = checkedBaseValue(BigInt(left) * right, bits);
        else { if (right === 0n) throw new Error('Math ERROR'); left = checkedBaseValue(BigInt(left) / right, bits); }
      }
      return left;
    }
    function parseUnary() {
      if (peek() && (peek().v === '−' || peek().v === 'Neg(')) {
        const op = next().v;
        if (op === 'Neg(') {
          const val = parseBitwise();
          if (peek() && peek().v === ')') next();
          return checkedBaseValue(-BigInt(val), bits);
        }
        return checkedBaseValue(-BigInt(parseUnary()), bits);
      }
      if (peek() && peek().v === 'Not(') {
        next();
        const val = parseBitwise();
        if (peek() && peek().v === ')') next();
        return wrappedBaseValue(~BigInt(val), bits);
      }
      if (peek() && peek().v === '+') { next(); return parseUnary(); }
      return parsePrimary();
    }
    function parsePrimary() {
      const t = next();
      if (!t) throw new Error('Syntax ERROR');
      if (t.type === 'num') return t.val;
      if (t.type === 'var') {
        const value = ctx.vars && Number.isFinite(ctx.vars[t.v]) ? ctx.vars[t.v] : 0;
        return wrappedBaseValue(value, bits);
      }
      if (t.v === '(') {
        const v = parseBitwise();
        if (peek() && peek().v === ')') next();
        return v;
      }
      throw new Error('Syntax ERROR');
    }
    const res = parseBitwise();
    if (pos < lex.length) throw new Error('Syntax ERROR');
    return wrappedBaseValue(res, bits);
  }

  function formatBaseN(val32, base) {
    const bits = baseBits(base);
    if (base === 'BIN' && (val32 < -32768 || val32 > 32767)) throw new Error('Math ERROR');
    if (base === 'DEC') return val32 < 0 ? `−${Math.abs(val32)}` : String(val32);
    const u = BigInt.asUintN(bits, BigInt(val32));
    if (base === 'HEX') return u.toString(16).toUpperCase().padStart(8, '0');
    if (base === 'OCT') return u.toString(8).padStart(11, '0');
    if (base === 'BIN') return u.toString(2).padStart(16, '0');
    return String(val32);
  }

  function evaluateMultiSequence(seq, ctx) {
    if (!seq || seq.length === 0) throw new Error('Syntax ERROR');
    const stmts = [[]];
    for (const node of seq) {
      if (node.t === 'tok' && node.v === ':') stmts.push([]);
      else stmts[stmts.length - 1].push(node);
    }
    if (stmts.length > 1) {
      const results = [];
      for (const s of stmts) {
        if (s.length === 0) continue;
        const result = evaluateSingleSequence(s, ctx);
        results.push(result);
        ctx.ansObj = result;
        if (result.kind === 'num') ctx.ans = result.value;
      }
      return results;
    }
    return [evaluateSingleSequence(seq, ctx)];
  }

  function evaluateSequence(seq, ctx) {
    const results = evaluateMultiSequence(seq, ctx);
    return results[results.length - 1];
  }

  function evaluateSingleSequence(seq, ctx) {
    if (!seq || seq.length === 0) throw new Error('Syntax ERROR');

    if (ctx.mode === 'BASE-N') {
      const flat = [];
      for (const n of seq) {
        if (n.t !== 'tok') throw new Error('Syntax ERROR');
        if (n.v === 'Ans') {
          const a = typeof ctx.ans === 'number' ? (ctx.ans | 0) : 0;
          const s = formatBaseN(a, ctx.base);
          if (s.startsWith('−')) flat.push({ t: 'tok', v: '−' });
          for (const ch of s.replace('−', '')) flat.push({ t: 'tok', v: ch });
        } else flat.push(n);
      }
      return { kind: 'base', value: evalBaseN(flat, ctx.base, ctx), base: ctx.base };
    }

    let postOp = null, mainSeq = seq;
    const lastNode = seq[seq.length - 1];
    if (lastNode && lastNode.t === 'tok' && (lastNode.v.startsWith('CONV:') || lastNode.v === '►r∠θ' || lastNode.v === '►a+bi')) {
      postOp = lastNode.v;
      mainSeq = seq.slice(0, -1);
    }

    const parser = new ExprParser(tokenizeSeq(mainSeq), ctx);
    let val = parser.parseExpression();
    if (!parser.eof()) throw new Error('Syntax ERROR');

    if (postOp) {
      if (postOp.startsWith('CONV:')) {
        const conv = CONVERSIONS[Number(postOp.slice(5))];
        if (!conv) throw new Error('Syntax ERROR');
        val = { kind: 'num', value: cleanFloat(conv.fn(asReal(val))), sym: null };
      } else if (postOp === '►r∠θ') val = { kind: 'cmplx', value: asComplex(val), displayPolar: true };
      else if (postOp === '►a+bi') val = { kind: 'cmplx', value: asComplex(val), displayPolar: false };
    }
    return val;
  }

  function tokenizeSeq(seq) {
    const out = [];
    let i = 0;
    while (i < seq.length) {
      const node = seq[i];
      if (node.t === 'tok') {
        if (/^[0-9.]$/.test(node.v)) {
          let numStr = '', dots = 0;
          while (i < seq.length && seq[i].t === 'tok' && /^[0-9.]$/.test(seq[i].v)) {
            if (seq[i].v === '.') dots++;
            if (dots > 1) throw new Error('Syntax ERROR');
            numStr += seq[i].v; i++;
          }
          if (numStr === '.') throw new Error('Syntax ERROR');
          out.push({ type: 'num', raw: numStr, val: Number(numStr) });
          continue;
        }
        out.push({ type: 'tok', v: node.v }); i++;
      } else { out.push({ type: 'node', node }); i++; }
    }
    return out;
  }

  function asReal(v) {
    if (v.kind === 'num') return v.value;
    if (v.kind === 'cmplx' && Math.abs(v.value.im) < 1e-12) return v.value.re;
    throw new Error('Math ERROR');
  }
  function asComplex(v) {
    if (v.kind === 'cmplx') return v.value;
    if (v.kind === 'num') return new Complex(v.value, 0, v.sym || null, null);
    throw new Error('Math ERROR');
  }
  function asSym(v) { return v && v.kind === 'num' ? v.sym : null; }
  function makeNum(val, sym = null) {
    return { kind: 'num', value: cleanFloat(val), sym: sym && sym.isValid() ? sym : null };
  }

  class ExprParser {
    constructor(tokens, ctx) { this.tokens = tokens; this.pos = 0; this.ctx = ctx; this.callDepth = 0; }
    peek(o = 0) { return this.tokens[this.pos + o]; }
    next() { return this.tokens[this.pos++]; }
    eof() { return this.pos >= this.tokens.length; }
    parseExpression() { return this.parseAddSub(); }

    parseAddSub() {
      let left = this.parseMulDiv();
      while (this.peek() && this.peek().type === 'tok' && (this.peek().v === '+' || this.peek().v === '−')) {
        const op = this.next().v;
        left = this.binaryAddSub(left, this.parseMulDiv(), op);
      }
      return left;
    }
    binaryAddSub(a, b, op) {
      if (a.kind === 'mat' && b.kind === 'mat') return { kind: 'mat', value: op === '+' ? Matrix.add(a.value, b.value) : Matrix.sub(a.value, b.value) };
      if (a.kind === 'vct' && b.kind === 'vct') return { kind: 'vct', value: op === '+' ? Vector.add(a.value, b.value) : Vector.sub(a.value, b.value) };
      if (a.kind === 'cmplx' || b.kind === 'cmplx') {
        const ca = asComplex(a), cb = asComplex(b);
        return { kind: 'cmplx', value: op === '+' ? ca.add(cb) : ca.sub(cb) };
      }
      const sa = asSym(a), sb = asSym(b);
      const result = addSub(a.value, b.value, op);
      const sym = (sa && sb && result !== 0) ? (op === '+' ? sa.add(sb) : sa.sub(sb)) : null;
      return makeNum(result, sym);
    }
    isImplicitMulStart(tok) {
      if (!tok) return false;
      if (tok.type === 'node' && tok.node.t !== 'sup') return true;
      if (tok.type === 'tok') {
        const v = tok.v;
        if (v === 'P' || v === 'C') return false;
        if (v === '(' || v === 'π' || v === 'e' || v === 'i' || v === 'Ans' || v === 'Ran#' ||
            /^[A-FXYM]$/.test(v) || v.startsWith('Mat') || v.startsWith('Vct') || v.startsWith('CONST:') || v.endsWith('(')) return true;
      }
      return false;
    }
    parseMulDiv() {
      let left = this.parsePermutation();
      while (true) {
        const t = this.peek();
        if (t && t.type === 'tok' && (t.v === '×' || t.v === '÷' || t.v === 'Dot')) {
          const op = this.next().v;
          left = this.binaryMulDiv(left, this.parsePermutation(), op);
        } else break;
      }
      return left;
    }

    parsePermutation() {
      let left = this.parseImplicitMul();
      while (this.peek() && this.peek().type === 'tok' && (this.peek().v === 'P' || this.peek().v === 'C')) {
        const op = this.next().v;
        left = this.binaryMulDiv(left, this.parseImplicitMul(), op);
      }
      return left;
    }

    parseImplicitMul() {
      let left = this.parsePolar();
      while (this.isImplicitMulStart(this.peek())) {
        left = this.binaryMulDiv(left, this.parsePolar(), '×');
      }
      return left;
    }
    binaryMulDiv(a, b, op) {
      if (op === 'Dot') { if (a.kind !== 'vct' || b.kind !== 'vct') throw new Error('Syntax ERROR'); return makeNum(Vector.dot(a.value, b.value)); }
      if (op === 'P' || op === 'C') {
        const n = asReal(a), r = asReal(b);
        const value = op === 'P' ? nPr(n, r) : nCr(n, r);
        const sym = (asSym(a) && asSym(b) && n <= 1e9 && r <= 1e9 && Number.isInteger(value))
          ? Sym.fromInt(value) : null;
        return makeNum(value, sym);
      }
      if (op === '×') {
        if (a.kind === 'mat' && b.kind === 'mat') return { kind: 'mat', value: Matrix.mul(a.value, b.value) };
        if (a.kind === 'mat' && b.kind === 'num') return { kind: 'mat', value: Matrix.scale(a.value, b.value) };
        if (a.kind === 'num' && b.kind === 'mat') return { kind: 'mat', value: Matrix.scale(b.value, a.value) };
        if (a.kind === 'vct' && b.kind === 'vct') return { kind: 'vct', value: Vector.cross(a.value, b.value) };
        if (a.kind === 'vct' && b.kind === 'num') return { kind: 'vct', value: Vector.scale(a.value, b.value) };
        if (a.kind === 'num' && b.kind === 'vct') return { kind: 'vct', value: Vector.scale(b.value, a.value) };
        if (a.kind === 'cmplx' || b.kind === 'cmplx') return { kind: 'cmplx', value: asComplex(a).mul(asComplex(b)) };
        const sa = asSym(a), sb = asSym(b);
        return makeNum(a.value * b.value, (sa && sb) ? sa.mul(sb) : null);
      }
      if (op === '÷') {
        if (a.kind === 'mat' && b.kind === 'num') { if (b.value === 0) throw new Error('Math ERROR'); return { kind: 'mat', value: Matrix.scale(a.value, 1 / b.value) }; }
        if (a.kind === 'vct' && b.kind === 'num') { if (b.value === 0) throw new Error('Math ERROR'); return { kind: 'vct', value: Vector.scale(a.value, 1 / b.value) }; }
        if (a.kind === 'cmplx' || b.kind === 'cmplx') return { kind: 'cmplx', value: asComplex(a).div(asComplex(b)) };
        if (b.value === 0) throw new Error('Math ERROR');
        const sa = asSym(a), sb = asSym(b);
        return makeNum(a.value / b.value, (sa && sb) ? sa.div(sb) : null);
      }
      throw new Error('Syntax ERROR');
    }
    parsePolar() {
      let left = this.parseUnary();
      if (this.peek() && this.peek().type === 'tok' && this.peek().v === '∠') {
        if (this.ctx.mode !== 'CMPLX') throw new Error('Syntax ERROR');
        this.next();
        const th = toRad(asReal(this.parseUnary()), this.ctx.angleUnit);
        return { kind: 'cmplx', value: Complex.fromPolar(asReal(left), th) };
      }
      return left;
    }
    parseUnary() {
      const t = this.peek();
      if (t && t.type === 'tok' && (t.v === '−' || t.v === '(−)' || t.v === '+')) {
        const op = this.next().v, val = this.parseUnary();
        if (op === '+') return val;
        if (val.kind === 'mat') return { kind: 'mat', value: Matrix.scale(val.value, -1) };
        if (val.kind === 'vct') return { kind: 'vct', value: Vector.scale(val.value, -1) };
        if (val.kind === 'cmplx') return { kind: 'cmplx', value: val.value.neg() };
        return makeNum(-val.value, val.sym ? val.sym.neg() : null);
      }
      return this.parsePostfix();
    }
    parsePostfix() {
      let val = this.parsePrimary();
      if (this.peek() && this.peek().type === 'tok' && this.peek().v === 'DMS') {
        this.next();
        const raw = asReal(val);
        const sign = raw < 0 ? -1 : 1;
        let degrees = Math.abs(raw);
        const isSep = () => this.peek() && this.peek().type === 'tok' &&
          (this.peek().v === 'DMS' || this.peek().v === '°');
        if (this.peek() && this.peek().type === 'num') {
          degrees += this.next().val / 60;
          if (isSep()) this.next();
          if (this.peek() && this.peek().type === 'num') {
            degrees += this.next().val / 3600;
            if (isSep()) this.next();
          }
        }
        val = makeNum(sign * fromRad((degrees * Math.PI) / 180, this.ctx.angleUnit));
      }
      while (this.peek()) {
        const t = this.peek();
        if (t.type === 'node' && t.node.t === 'sup') {
          this.next();
          const expObj = evaluateSequence(t.node.exp, this.ctx);
          const eNum = asReal(expObj);
          if (val.kind === 'mat') val = { kind: 'mat', value: Matrix.pow(val.value, eNum) };
          else if (val.kind === 'cmplx') {
            const c = val.value;
            if (Math.abs(c.im) > 1e-14 * Math.max(1, c.abs()) && ![-1, 2, 3].includes(eNum)) {
              throw new Error('Math ERROR');
            }
            val = { kind: 'cmplx', value: c.pow(eNum) };
          } else {
            if (val.value < 0 && !Number.isInteger(eNum)) throw new Error('Math ERROR');
            if (val.value === 0 && eNum <= 0) throw new Error('Math ERROR');
            let sym = null;
            if (val.sym && expObj.sym) {
              if (Number.isInteger(eNum)) sym = val.sym.powInt(eNum);
              else if (expObj.sym.piPow === 0 && expObj.sym.terms.size === 1 && expObj.sym.terms.has(1)) {
                const f = expObj.sym.terms.get(1);
                sym = val.sym.powRational(Number(f.n), Number(f.d));
              }
            }
            val = makeNum(Math.pow(val.value, eNum), sym);
          }
          continue;
        }
        if (t.type === 'tok' && t.v === '×10^') { this.next(); val = makeNum(asReal(val) * Math.pow(10, asReal(this.parseUnary()))); continue; }
        if (t.type === 'tok' && t.v === '!') {
          this.next();
          const n = asReal(val), value = factorial(n);
          const sym = (val.sym && Number.isInteger(n) && value <= 1e9) ? Sym.fromInt(value) : null;
          val = makeNum(value, sym);
          continue;
        }
        if (t.type === 'tok' && t.v === '%') { this.next(); val = makeNum(asReal(val) / 100, val.sym ? val.sym.div(Sym.fromInt(100)) : null); continue; }
        if (t.type === 'tok' && (t.v === '°' || t.v === 'ʳ' || t.v === 'ᵍ')) {
          const u = this.next().v, x = asReal(val);
          let cur = x;
          if (u === '°') cur = fromRad((x * Math.PI) / 180, this.ctx.angleUnit);
          else if (u === 'ʳ') cur = fromRad(x, this.ctx.angleUnit);
          else if (u === 'ᵍ') cur = fromRad((x * Math.PI) / 200, this.ctx.angleUnit);
          val = makeNum(cur);
          continue;
        }
        if (t.type === 'tok' && t.v.startsWith('CONV:')) {
          this.next();
          const conv = CONVERSIONS[Number(t.v.slice(5))];
          if (!conv) throw new Error('Syntax ERROR');
          val = makeNum(conv.fn(asReal(val)));
          continue;
        }
        if (t.type === 'tok' && t.v === 'STAT:t') { this.next(); val = makeNum(statT(this.ctx.statRes, asReal(val))); continue; }
        if (t.type === 'tok' && ['STAT:xhat', 'STAT:yhat', 'STAT:xhat1', 'STAT:xhat2'].includes(t.v)) {
          this.next();
          const kind = t.v.slice(5);
          val = makeNum(statEstimate(this.ctx.statRes, kind, asReal(val)));
          continue;
        }
        break;
      }
      return val;
    }
    parsePrimary() {
      const t = this.next();
      if (!t) throw new Error('Syntax ERROR');
      if (t.type === 'num') return makeNum(t.val, this.ctx.wantSym ? Sym.fromDecimalString(t.raw) : null);
      if (t.type === 'node') {
        const n = t.node;
        if (n.t === 'frac') return this.binaryMulDiv(evaluateSequence(n.num, this.ctx), evaluateSequence(n.den, this.ctx), '÷');
        if (n.t === 'mfrac') {
          const w = evaluateSequence(n.whole, this.ctx);
          const frac = this.binaryMulDiv(evaluateSequence(n.num, this.ctx), evaluateSequence(n.den, this.ctx), '÷');
          return this.binaryAddSub(w, frac, asReal(w) < 0 ? '−' : '+');
        }
        if (n.t === 'sqrt') {
          const b = evaluateSequence(n.body, this.ctx);
          if (b.kind === 'cmplx') {
            if (Math.abs(b.value.im) > 1e-14 * Math.max(1, b.value.abs())) throw new Error('Math ERROR');
            if (b.value.re < 0) {
              const imSym = b.value.reSym ? b.value.reSym.neg().sqrt() : null;
              return { kind: 'cmplx', value: new Complex(0, Math.sqrt(-b.value.re), null, imSym) };
            }
            return makeNum(Math.sqrt(b.value.re), null);
          }
          if (b.value < 0) {
            if (this.ctx.mode !== 'CMPLX') throw new Error('Math ERROR');
            const imSym = b.sym ? b.sym.neg().sqrt() : null;
            return { kind: 'cmplx', value: new Complex(0, Math.sqrt(-b.value), null, imSym) };
          }
          return makeNum(Math.sqrt(b.value), b.sym ? b.sym.sqrt() : null);
        }
        if (n.t === 'cbrt') {
          const b = evaluateSequence(n.body, this.ctx);
          const r = asReal(b), c = Math.cbrt(r);
          const sym = b.sym ? b.sym.cbrt() : null;
          return makeNum(c, sym);
        }
        if (n.t === 'nroot') {
          const deg = asReal(evaluateSequence(n.deg, this.ctx)), body = asReal(evaluateSequence(n.body, this.ctx));
          if (deg === 0) throw new Error('Math ERROR');
          if (body < 0) {
            if (Number.isInteger(deg) && Math.abs(deg) % 2 === 1) return makeNum(-Math.pow(-body, 1 / deg));
            throw new Error('Math ERROR');
          }
          return makeNum(Math.pow(body, 1 / deg));
        }
        if (n.t === 'logb') {
          const base = asReal(evaluateSequence(n.base, this.ctx)), arg = asReal(evaluateSequence(n.arg, this.ctx));
          if (base <= 0 || base === 1 || arg <= 0) throw new Error('Math ERROR');
          const val = Math.log(arg) / Math.log(base);
          return makeNum(val, Math.abs(val - Math.round(val)) < 1e-12 ? Sym.fromInt(Math.round(val)) : null);
        }
        if (n.t === 'abs') {
          const b = evaluateSequence(n.body, this.ctx);
          if (b.kind === 'vct') return makeNum(Vector.abs(b.value));
          if (b.kind === 'cmplx') return makeNum(b.value.abs());
          return makeNum(Math.abs(b.value), b.sym ? (b.value < 0 ? b.sym.neg() : b.sym) : null);
        }
        if (n.t === 'int') {
          const a = asReal(evaluateSequence(n.lower, this.ctx)), b = asReal(evaluateSequence(n.upper, this.ctx));
          return makeNum(integrate((x) => asReal(evaluateSequence(n.expr, { ...this.ctx, wantSym: false, vars: { ...this.ctx.vars, X: x } })), a, b));
        }
        if (n.t === 'deriv') {
          const at = asReal(evaluateSequence(n.at, this.ctx));
          return makeNum(differentiate((x) => asReal(evaluateSequence(n.expr, { ...this.ctx, wantSym: false, vars: { ...this.ctx.vars, X: x } })), at));
        }
        if (n.t === 'sum') {
          const sVal = asReal(evaluateSequence(n.start, this.ctx)), eVal = asReal(evaluateSequence(n.end, this.ctx));
          if (!Number.isInteger(sVal) || !Number.isInteger(eVal) || sVal > eVal || eVal - sVal > 1000000) throw new Error('Math ERROR');
          let total = 0;
          for (let k = sVal; k <= eVal; k++) total += asReal(evaluateSequence(n.expr, { ...this.ctx, wantSym: false, vars: { ...this.ctx.vars, X: k } }));
          return makeNum(total);
        }
        throw new Error('Syntax ERROR');
      }
      const v = t.v;
      if (v === '(') { const inner = this.parseExpression(); if (this.peek() && this.peek().type === 'tok' && this.peek().v === ')') this.next(); return inner; }
      if (v === 'π') return makeNum(Math.PI, this.ctx.wantSym ? Sym.pi() : null);
      if (v === 'e') return makeNum(Math.E);
      if (v === 'i') {
        if (this.ctx.mode !== 'CMPLX') throw new Error('Syntax ERROR');
        return { kind: 'cmplx', value: new Complex(0, 1, null, this.ctx.wantSym ? Sym.fromInt(1) : null) };
      }
      if (v === 'Ran#') {
        const k = Math.floor(Math.random() * 1000);
        return makeNum(k / 1000, Sym.fromFrac(BigInt(k), 1000n));
      }
      if (v === 'Ans') return this.ctx.ansObj || makeNum(typeof this.ctx.ans === 'number' ? this.ctx.ans : 0);
      if (/^[A-FXYM]$/.test(v)) {
        const val = this.ctx.vars[v] ?? 0;
        return val instanceof Complex ? { kind: 'cmplx', value: val } : makeNum(val);
      }
      if (v.startsWith('CONST:')) {
        const c = CONSTANTS[Number(v.slice(6))];
        if (!c) throw new Error('Syntax ERROR');
        return makeNum(c.val);
      }
      if (v.startsWith('STAT:')) {
        const key = v.slice(5);
        if (!this.ctx.statRes || !Number.isFinite(this.ctx.statRes[key])) throw new Error('Math ERROR');
        return makeNum(this.ctx.statRes[key]);
      }
      if (v === 'MatA' || v === 'MatB' || v === 'MatC' || v === 'MatAns') {
        const mat = this.ctx.matrices[v];
        if (!mat) throw new Error('Dimension ERROR');
        return { kind: 'mat', value: Matrix.clone(mat) };
      }
      if (v === 'VctA' || v === 'VctB' || v === 'VctC' || v === 'VctAns') {
        const vct = this.ctx.vectors[v];
        if (!vct) throw new Error('Dimension ERROR');
        return { kind: 'vct', value: [...vct] };
      }
      if (v.endsWith('(')) {
        const fname = v.slice(0, -1);
        const startPos = this.pos - 1;
        const polrec = fname === 'Pol' || fname === 'Rec';
        if (polrec && (startPos > 0 || this.callDepth > 0)) throw new Error('Syntax ERROR');
        this.callDepth++;
        const args = [this.parseExpression()];
        while (this.peek() && this.peek().type === 'tok' && this.peek().v === ',') { this.next(); args.push(this.parseExpression()); }
        if (this.peek() && this.peek().type === 'tok' && this.peek().v === ')') this.next();
        this.callDepth--;
        const result = this.evalFunc(fname, args);
        if (polrec && !this.eof()) throw new Error('Syntax ERROR');
        return result;
      }
      throw new Error('Syntax ERROR');
    }
    evalFunc(name, args) {
      const a0 = args[0];
      if (name === 'det') { if (a0.kind !== 'mat') throw new Error('Syntax ERROR'); return makeNum(Matrix.det(a0.value)); }
      if (name === 'Trn') { if (a0.kind !== 'mat') throw new Error('Syntax ERROR'); return { kind: 'mat', value: Matrix.trn(a0.value) }; }
      if (name === 'arg') return makeNum(fromRad(asComplex(a0).arg(), this.ctx.angleUnit));
      if (name === 'Conjg') return { kind: 'cmplx', value: asComplex(a0).conj() };
      if (name === 'Pol') {
        if (args.length < 2) throw new Error('Syntax ERROR');
        const x = asReal(args[0]), y = asReal(args[1]);
        const r = cleanFloat(Math.hypot(x, y)), th = cleanFloat(fromRad(Math.atan2(y, x), this.ctx.angleUnit));
        this.ctx.vars.X = r; this.ctx.vars.Y = th;
        return { kind: 'polrec', label: `r=${r}, θ=${th}`, value: r };
      }
      if (name === 'Rec') {
        if (args.length < 2) throw new Error('Syntax ERROR');
        const r = asReal(args[0]), th = toRad(asReal(args[1]), this.ctx.angleUnit);
        const x = cleanFloat(r * Math.cos(th)), y = cleanFloat(r * Math.sin(th));
        this.ctx.vars.X = x; this.ctx.vars.Y = y;
        return { kind: 'polrec', label: `X=${x}, Y=${y}`, value: x };
      }
      if (name === 'RanInt#') {
        if (args.length < 2) throw new Error('Syntax ERROR');
        const lo = Math.ceil(asReal(args[0])), hi = Math.floor(asReal(args[1]));
        if (hi < lo) throw new Error('Math ERROR');
        const val = lo + Math.floor(Math.random() * (hi - lo + 1));
        return makeNum(val, Sym.fromInt(val));
      }
      if (name === 'P' || name === 'Q' || name === 'R') {
        const t = asReal(a0);
        const value = name === 'P' ? normalP(t) : name === 'Q' ? normalQ(t) : normalR(t);
        return makeNum(value);
      }
      if (name === 'Rnd') {
        const s = this.ctx.settings || { numFmt: 'Norm', fmtDigits: 3 };
        const value = asReal(a0);
        if (s.numFmt === 'Fix') return makeNum(Number(value.toFixed(s.fmtDigits)));
        const digits = s.numFmt === 'Sci' ? (s.fmtDigits === 0 ? 10 : s.fmtDigits) : 10;
        return makeNum(Number(value.toPrecision(digits)));
      }
      const x = asReal(a0), u = this.ctx.angleUnit;
      checkTrigRange(x, u);
      const ax = reduceTrigAngle(x, u);
      const q = trigQuadrant(ax, u);
      const symFor = (fn) => (this.ctx.wantSym ? exactTrig(fn, ax, u) : null);
      if (name === 'sin') return makeNum(q === null ? Math.sin(toRad(ax, u)) : [0, 1, 0, -1][q], symFor('sin'));
      if (name === 'cos') return makeNum(q === null ? Math.cos(toRad(ax, u)) : [1, 0, -1, 0][q], symFor('cos'));
      if (name === 'tan') {
        if (q === 1 || q === 3) throw new Error('Math ERROR');
        const sym = symFor('tan');
        if (q !== null) return makeNum(0, sym);
        const rad = toRad(ax, u);
        if (Math.abs(Math.cos(rad)) < 1e-13) throw new Error('Math ERROR');
        return makeNum(Math.tan(rad), sym);
      }
      if (name === 'sin⁻¹') {
        if (x < -1 || x > 1) throw new Error('Math ERROR');
        return makeNum(fromRad(Math.asin(x), u), inverseTrigSym(name, x, a0.sym, u));
      }
      if (name === 'cos⁻¹') {
        if (x < -1 || x > 1) throw new Error('Math ERROR');
        return makeNum(fromRad(Math.acos(x), u), inverseTrigSym(name, x, a0.sym, u));
      }
      if (name === 'tan⁻¹') return makeNum(fromRad(Math.atan(x), u), inverseTrigSym(name, x, a0.sym, u));
      if (name === 'sinh') return makeNum(Math.sinh(x));
      if (name === 'cosh') return makeNum(Math.cosh(x));
      if (name === 'tanh') return makeNum(Math.tanh(x));
      if (name === 'sinh⁻¹') return makeNum(Math.asinh(x));
      if (name === 'cosh⁻¹') { if (x < 1) throw new Error('Math ERROR'); return makeNum(Math.acosh(x)); }
      if (name === 'tanh⁻¹') { if (x <= -1 || x >= 1) throw new Error('Math ERROR'); return makeNum(Math.atanh(x)); }
      if (name === 'log') {
        if (x <= 0) throw new Error('Math ERROR');
        const k = Math.round(Math.log10(x));
        const sym = this.ctx.wantSym && k > -1000 && k < 1000 && Math.abs(Math.pow(10, k) - x) < 1e-9 * Math.max(1, Math.abs(x))
          ? Sym.fromInt(k) : null;
        return makeNum(Math.log10(x), sym);
      }
      if (name === 'ln') { if (x <= 0) throw new Error('Math ERROR'); return makeNum(Math.log(x)); }
      throw new Error('Syntax ERROR');
    }
  }

  function formatNumber(val, settings, engShift = null) {
    if (!Number.isFinite(val)) return 'Math ERROR';
    const decSep = settings.dispDot === 'Comma' ? ',' : '.';
    const applySep = (s) => (decSep === ',' ? s.replace('.', ',') : s).replace(/-/g, '−');
    if (engShift !== null && engShift !== undefined && val !== 0) {
      const step = engShift > 0 ? engShift - 1 : engShift;
      const exp = Math.floor(Math.log10(Math.abs(val)) / 3) * 3 + step * 3;
      if (exp === 0) return applySep(String(cleanFloat(val)));
      return `${applySep(String(cleanFloat(val / Math.pow(10, exp))))}×10<sup>${applySep(String(exp))}</sup>`;
    }
    if (settings.numFmt === 'Fix') return applySep(val.toFixed(settings.fmtDigits));
    if (settings.numFmt === 'Sci') {
      const digits = settings.fmtDigits === 0 ? 9 : settings.fmtDigits - 1;
      const [m, e] = val.toExponential(digits).split('e');
      return `${applySep(m)}×10<sup>${applySep(String(Number(e)))}</sup>`;
    }
    const lowThresh = settings.normMode === 2 ? 1e-9 : 1e-2;
    const abs = Math.abs(val);
    if (abs !== 0 && (abs < lowThresh || abs >= 1e10)) {
      const [m, e] = val.toExponential(9).split('e');
      const cleanM = m.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
      return `${applySep(cleanM)}×10<sup>${applySep(String(Number(e)))}</sup>`;
    }
    return applySep(Number(val.toPrecision(10)).toString());
  }

  function formatDMS(val) {
    const neg = val < 0;
    const totalHundredths = Math.round(Math.abs(val) * 360000);
    const d = Math.floor(totalHundredths / 360000);
    const rem1 = totalHundredths % 360000;
    const m = Math.floor(rem1 / 6000);
    const s = (rem1 % 6000) / 100;
    return `${neg ? '−' : ''}${d}°${m}'${s}"`;
  }

  function formatComplex(c, settings, forcePolar = null) {
    const polar = forcePolar !== null ? forcePolar : (settings.cmplxFmt === 'polar');
    if (polar) return `${formatNumber(cleanFloat(c.abs()), settings)}∠${formatNumber(cleanFloat(fromRad(c.arg(), settings.angleUnit)), settings)}`;
    const re = c.re, im = c.im;
    const tol = 1e-13 * c.abs();
    const useSym = settings.ioMode === 'Math' && (c.reSym || c.imSym);
    if (useSym) {
      const reHTML = c.reSym ? c.reSym.toHTML(settings.fracFmt === 'ab/c') : (Math.abs(re) > tol ? formatNumber(re, settings) : '');
      const imHTML = c.imSym ? c.imSym.toHTML(settings.fracFmt === 'ab/c') : formatNumber(Math.abs(im), settings);
      if (!c.imSym && Math.abs(im) <= tol) return reHTML || '0';
      const imNegative = c.imSym ? c.imSym.toHTML().trim().startsWith('−') : im < 0;
      const joiner = imNegative ? '−' : (!reHTML ? '' : '+');
      const magnitude = c.imSym && imNegative ? c.imSym.neg().toHTML(settings.fracFmt === 'ab/c') : imHTML;
      return `${reHTML}${joiner}${magnitude}<i>i</i>`;
    }
    if (Math.abs(im) <= tol) return formatNumber(re, settings);
    const imAbs = Math.abs(im);
    const imStr = Math.abs(imAbs - 1) < 1e-13 ? '<i>i</i>' : `${formatNumber(imAbs, settings)}<i>i</i>`;
    if (Math.abs(re) <= tol) return (im < 0 ? '−' : '') + imStr;
    return `${formatNumber(re, settings)}${im < 0 ? '−' : '+'}${imStr}`;
  }

  window.CasioEngine = {
    CONSTANTS, CONVERSIONS, Sym, Complex, Matrix, Vector, Eqn, Stat,
    evaluateSequence, evaluateMultiSequence, solveEquation, integrate, erf,
    formatNumber, formatDMS, formatComplex, formatBaseN, cleanFloat
  };
})();