(() => {
  'use strict';

  const E = window.CasioEngine;

  
  const DEFAULT_SETTINGS = {
    ioMode: 'Math',       
    angleUnit: 'Deg',     
    numFmt: 'Norm',       
    fmtDigits: 3,
    normMode: 1,          
    fracFmt: 'd/c',       
    cmplxFmt: 'rect',     
    statFreq: false,
    dispDot: 'Dot',       
    contrast: 7,          
    scale: 1.0,           
    sound: false
  };

  const DESIGN_W = 364;
  const DESIGN_H = 757;

  function loadSettings() {
    const injected = window.__casioSettings;
    return injected && typeof injected === 'object'
      ? { ...DEFAULT_SETTINGS, ...injected }
      : { ...DEFAULT_SETTINGS };
  }

  function saveSettings(s) {
    try { window.casioWindow?.setSettings?.(s); } catch {}
  }

  
  function playKeyClick() {}

  
  const NODE_SLOTS = {
    frac: ['num', 'den'],
    mfrac: ['whole', 'num', 'den'],
    sqrt: ['body'],
    cbrt: ['body'],
    nroot: ['deg', 'body'],
    sup: ['exp'],
    logb: ['base', 'arg'],
    abs: ['body'],
    int: ['expr', 'lower', 'upper'],
    deriv: ['expr', 'at'],
    sum: ['expr', 'start', 'end']
  };

  const VAR_KEY_MAP = {
    NEG: 'A', DMS: 'B', HYP: 'C', SIN: 'D', COS: 'E', TAN: 'F',
    RPAR: 'X', SD: 'Y', MPLUS: 'M'
  };

  function cloneSeq(seq) {
    return JSON.parse(JSON.stringify(seq));
  }

  
  const state = {
    settings: loadSettings(),
    scaleLimits: { min: 0.75, max: 1.40 },
    mode: 'COMP',       
    base: 'DEC',        

    shift: false,
    alpha: false,
    stoPending: false,
    rclPending: false,
    insMode: false,

    expr: [],
    path: [],
    pos: 0,

    resultObj: null,
    showDecimal: false,
    showMixed: false,
    showDMS: false,
    engShift: 0,
    engActive: false,
    justEvaluated: false,

    history: [],
    histIdx: -1,

    ans: 0,
    ansObj: null,
    vars: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 },
    varObjs: {},

    statType: 1,
    statRows: [{ x: 0, y: 0, f: 1 }],
    matrices: {
      MatA: E.Matrix.create(2, 2),
      MatB: E.Matrix.create(2, 2),
      MatC: E.Matrix.create(2, 2),
      MatAns: E.Matrix.create(2, 2)
    },
    vectors: {
      VctA: [0, 0, 0],
      VctB: [0, 0, 0],
      VctC: [0, 0, 0],
      VctAns: [0, 0, 0]
    },

    overlay: null,
    isPoweringOff: false,
    bootOff: true
  };

  function clearDisplayFlags() {
    state.showDecimal = false;
    state.showMixed = false;
    state.showDMS = false;
    state.engShift = 0;
    state.engActive = false;
  }

  
  const dom = {
    scaleRoot: document.getElementById('scale-root'),
    solar: document.getElementById('solar-panel'),
    lcd: document.getElementById('lcd'),
    exprWrap: document.getElementById('lcd-expr-wrap'),
    expr: document.getElementById('lcd-expr'),
    res: document.getElementById('lcd-res'),
    overlay: document.getElementById('lcd-overlay'),
    indS: document.getElementById('ind-s'),
    indA: document.getElementById('ind-a'),
    indM: document.getElementById('ind-m'),
    indSto: document.getElementById('ind-sto'),
    indRcl: document.getElementById('ind-rcl'),
    indMode: document.getElementById('ind-mode'),
    indAng: document.getElementById('ind-ang'),
    indFmt: document.getElementById('ind-fmt'),
    indIo: document.getElementById('ind-io'),
    indArrows: document.getElementById('ind-arrows'),
    indDisp: document.getElementById('ind-disp')
  };

  
  function getTargetSeq(path = state.path) {
    let seq = state.expr;
    for (const step of path) {
      const node = seq[step.idx];
      if (!node || !node[step.slot]) {
        state.path = [];
        state.pos = state.expr.length;
        return state.expr;
      }
      seq = node[step.slot];
    }
    return seq;
  }

  function clearExpr() {
    state.expr = [];
    state.path = [];
    state.pos = 0;
    state.resultObj = null;
    state.justEvaluated = false;
    state.showDecimal = false;
    state.showMixed = false;
    state.showDMS = false;
    state.engShift = 0;
    state.engActive = false;
    state.histIdx = -1;
  }

  function insertNode(node, enterSlot = null) {
    if (state.justEvaluated) {
      const isContOp =
        (node.t === 'tok' && ['+', '−', '×', '÷', 'P', 'C', 'Dot', 'and', 'or', 'xor', 'xnor', '!', '%', '►r∠θ', '►a+bi'].includes(node.v)) ||
        (node.t === 'tok' && node.v.startsWith('CONV:')) ||
        node.t === 'sup';
      const ansTok = state.mode === 'MATRIX' ? 'MatAns' : state.mode === 'VECTOR' ? 'VctAns' : 'Ans';
      clearExpr();
      if (isContOp) {
        state.expr.push({ t: 'tok', v: ansTok });
        state.pos = 1;
      }
    }

    const seq = getTargetSeq();
    if (state.insMode && state.pos < seq.length && node.t === 'tok' && seq[state.pos].t === 'tok') {
      seq[state.pos] = node;
      state.pos++;
    } else {
      seq.splice(state.pos, 0, node);
      if (enterSlot) {
        state.path.push({ idx: state.pos, slot: enterSlot });
        state.pos = 0;
      } else {
        state.pos++;
      }
    }
  }

  function insertFraction() {
    if (state.justEvaluated) clearExpr();
    const seq = getTargetSeq();
    const pulled = [];
    if (state.pos > 0) {
      let i = state.pos - 1;
      const prev = seq[i];
      if (prev.t === 'tok' && /^[0-9.]$/.test(prev.v)) {
        while (i >= 0 && seq[i].t === 'tok' && /^[0-9.]$/.test(seq[i].v)) i--;
        const count = state.pos - (i + 1);
        pulled.push(...seq.splice(i + 1, count));
        state.pos = i + 1;
      } else if (prev.t === 'sqrt' || prev.t === 'cbrt' || prev.t === 'abs' ||
                 (prev.t === 'tok' && (/^[A-FXYMπei]$/.test(prev.v) || prev.v === 'Ans'))) {
        pulled.push(...seq.splice(i, 1));
        state.pos = i;
      }
    }
    const node = { t: 'frac', num: pulled, den: [] };
    seq.splice(state.pos, 0, node);
    state.path.push({ idx: state.pos, slot: pulled.length > 0 ? 'den' : 'num' });
    state.pos = 0;
  }

  function moveCursor(dir) {
    if (state.justEvaluated && (dir === 'LEFT' || dir === 'RIGHT')) {
      state.justEvaluated = false;
      state.path = [];
      state.pos = dir === 'LEFT' ? state.expr.length : 0;
      return;
    }

    const seq = getTargetSeq();

    if (dir === 'RIGHT') {
      if (state.pos < seq.length) {
        const node = seq[state.pos];
        const slots = NODE_SLOTS[node.t];
        if (slots) {
          state.path.push({ idx: state.pos, slot: slots[0] });
          state.pos = 0;
        } else {
          state.pos++;
        }
      } else if (state.path.length > 0) {
        const step = state.path.pop();
        const parentSeq = getTargetSeq();
        const parentNode = parentSeq[step.idx];
        const slots = NODE_SLOTS[parentNode.t];
        const si = slots.indexOf(step.slot);
        if (si < slots.length - 1) {
          state.path.push({ idx: step.idx, slot: slots[si + 1] });
          state.pos = 0;
        } else {
          state.pos = step.idx + 1;
        }
      } else {
        state.pos = 0;
      }
      return;
    }

    if (dir === 'LEFT') {
      if (state.pos > 0) {
        const node = seq[state.pos - 1];
        const slots = NODE_SLOTS[node.t];
        if (slots) {
          const lastSlot = slots[slots.length - 1];
          state.path.push({ idx: state.pos - 1, slot: lastSlot });
          state.pos = node[lastSlot].length;
        } else {
          state.pos--;
        }
      } else if (state.path.length > 0) {
        const step = state.path.pop();
        const parentSeq = getTargetSeq();
        const parentNode = parentSeq[step.idx];
        const slots = NODE_SLOTS[parentNode.t];
        const si = slots.indexOf(step.slot);
        if (si > 0) {
          const prevSlot = slots[si - 1];
          state.path.push({ idx: step.idx, slot: prevSlot });
          state.pos = parentNode[prevSlot].length;
        } else {
          state.pos = step.idx;
        }
      } else {
        state.pos = seq.length;
      }
      return;
    }

    if (state.path.length > 0) {
      const step = state.path[state.path.length - 1];
      const parentSeq = getTargetSeq(state.path.slice(0, -1));
      const pNode = parentSeq[step.idx];
      if (pNode.t === 'frac' || pNode.t === 'mfrac') {
        if (dir === 'DOWN' && step.slot === 'num') { step.slot = 'den'; state.pos = pNode.den.length; return; }
        if (dir === 'UP' && step.slot === 'den') { step.slot = 'num'; state.pos = pNode.num.length; return; }
      }
      if (pNode.t === 'int') {
        if (dir === 'UP' && step.slot === 'lower') { step.slot = 'upper'; state.pos = pNode.upper.length; return; }
        if (dir === 'DOWN' && step.slot === 'upper') { step.slot = 'lower'; state.pos = pNode.lower.length; return; }
      }
      if (pNode.t === 'sum') {
        if (dir === 'UP' && step.slot === 'start') { step.slot = 'end'; state.pos = pNode.end.length; return; }
        if (dir === 'DOWN' && step.slot === 'end') { step.slot = 'start'; state.pos = pNode.start.length; return; }
      }
    }

    if (state.history.length > 0) {
      if (dir === 'UP') {
        const nextIdx = state.histIdx === -1 ? state.history.length - 1 : Math.max(0, state.histIdx - 1);
        state.histIdx = nextIdx;
        const h = state.history[nextIdx];
        state.expr = cloneSeq(h.expr);
        state.path = [];
        state.pos = state.expr.length;
        state.resultObj = h.resultObj;
        state.justEvaluated = true;
      } else if (dir === 'DOWN' && state.histIdx !== -1 && state.histIdx < state.history.length - 1) {
        state.histIdx++;
        const h = state.history[state.histIdx];
        state.expr = cloneSeq(h.expr);
        state.path = [];
        state.pos = state.expr.length;
        state.resultObj = h.resultObj;
        state.justEvaluated = true;
      }
    }
  }

  function deleteAtCursor() {
    if (state.justEvaluated) {
      state.justEvaluated = false;
      state.resultObj = null;
      clearDisplayFlags();
      return;
    }
    const seq = getTargetSeq();
    if (state.pos > 0) {
      seq.splice(state.pos - 1, 1);
      state.pos--;
    } else if (state.path.length > 0) {
      const step = state.path.pop();
      const parentSeq = getTargetSeq();
      const node = parentSeq[step.idx];
      const slots = NODE_SLOTS[node.t];
      const si = slots.indexOf(step.slot);
      if (si === 0) {
        const contents = node[slots[0]] || [];
        parentSeq.splice(step.idx, 1, ...contents);
        state.pos = step.idx;
      } else {
        const prevSlot = slots[si - 1];
        state.path.push({ idx: step.idx, slot: prevSlot });
        state.pos = node[prevSlot].length;
      }
    }
  }

  
  function pathEquals(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i].idx !== b[i].idx || a[i].slot !== b[i].slot) return false;
    }
    return true;
  }

  function childPath(prefixWithIdx, slot) {
    const copy = prefixWithIdx.slice(0, -1);
    const last = prefixWithIdx[prefixWithIdx.length - 1];
    copy.push({ idx: last.idx, slot });
    return copy;
  }

  function escapeHTML(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderSeqHTML(seq, curPathPrefix) {
    const isHere = !state.justEvaluated && pathEquals(curPathPrefix, state.path);
    if (seq.length === 0) {
      if (isHere) return `<span class="m-cursor${state.insMode ? ' ins' : ''}"></span>`;
      return '<span class="m-box"></span>';
    }
    let html = '<span class="m-seq">';
    for (let i = 0; i <= seq.length; i++) {
      if (isHere && state.pos === i) {
        html += `<span class="m-cursor${state.insMode ? ' ins' : ''}"></span>`;
      }
      if (i < seq.length) {
        html += renderNodeHTML(seq[i], [...curPathPrefix, { idx: i }]);
      }
    }
    html += '</span>';
    return html;
  }

  function renderNodeHTML(node, pfx) {
    if (node.t === 'tok') {
      const v = node.v;
      if (v.startsWith('CONST:')) {
        const c = E.CONSTANTS[Number(v.slice(6))];
        return c ? escapeHTML(c.sym) : '?';
      }
      if (v.startsWith('CONV:')) {
        const c = E.CONVERSIONS[Number(v.slice(5))];
        return c ? `<span style="font-size:0.7em">${escapeHTML(c.label)}</span>` : '?';
      }
      if (v.startsWith('STAT:')) {
        const map = {
          n: 'n', sx: 'Σx', sx2: 'Σx²', sy: 'Σy', sy2: 'Σy²', sxy: 'Σxy',
          xbar: 'x̄', sigX: 'σx', sX: 'sx', ybar: 'ȳ', sigY: 'σy', sY: 'sy',
          A: 'A', B: 'B', C: 'C', r: 'r', minX: 'minX', maxX: 'maxX', minY: 'minY', maxY: 'maxY',
          t: 't', xhat: 'x̂', yhat: 'ŷ', xhat1: 'x̂1', xhat2: 'x̂2'
        };
        return map[v.slice(5)] || v.slice(5);
      }
      if (v === '×10^') return '<span style="font-size:0.75em">×10</span>';
      if (v === 'i') return '<i>i</i>';
      if (v === 'DMS') return '°';
      return escapeHTML(v);
    }

    if (node.t === 'frac') {
      return `<span class="m-frac"><span class="m-num">${renderSeqHTML(node.num, childPath(pfx, 'num'))}</span><span class="m-den">${renderSeqHTML(node.den, childPath(pfx, 'den'))}</span></span>`;
    }
    if (node.t === 'mfrac') {
      return `${renderSeqHTML(node.whole, childPath(pfx, 'whole'))}<span class="m-frac"><span class="m-num">${renderSeqHTML(node.num, childPath(pfx, 'num'))}</span><span class="m-den">${renderSeqHTML(node.den, childPath(pfx, 'den'))}</span></span>`;
    }
    if (node.t === 'sqrt') {
      return `<span class="m-sqrt"><span class="m-sqrt-rad">√</span><span class="m-sqrt-body">${renderSeqHTML(node.body, childPath(pfx, 'body'))}</span></span>`;
    }
    if (node.t === 'cbrt') {
      return `<span class="m-sqrt"><span class="m-sqrt-deg">3</span><span class="m-sqrt-rad">√</span><span class="m-sqrt-body">${renderSeqHTML(node.body, childPath(pfx, 'body'))}</span></span>`;
    }
    if (node.t === 'nroot') {
      return `<span class="m-sqrt"><span class="m-sqrt-deg">${renderSeqHTML(node.deg, childPath(pfx, 'deg'))}</span><span class="m-sqrt-rad">√</span><span class="m-sqrt-body">${renderSeqHTML(node.body, childPath(pfx, 'body'))}</span></span>`;
    }
    if (node.t === 'sup') {
      return `<span class="m-sup">${renderSeqHTML(node.exp, childPath(pfx, 'exp'))}</span>`;
    }
    if (node.t === 'logb') {
      return `log<span class="m-sub">${renderSeqHTML(node.base, childPath(pfx, 'base'))}</span>(${renderSeqHTML(node.arg, childPath(pfx, 'arg'))})`;
    }
    if (node.t === 'abs') {
      return `<span class="m-abs">${renderSeqHTML(node.body, childPath(pfx, 'body'))}</span>`;
    }
    if (node.t === 'int') {
      return `<span class="m-int"><span class="m-int-sym">∫</span><span class="m-int-lims"><span>${renderSeqHTML(node.upper, childPath(pfx, 'upper'))}</span><span>${renderSeqHTML(node.lower, childPath(pfx, 'lower'))}</span></span><span>${renderSeqHTML(node.expr, childPath(pfx, 'expr'))}dx</span></span>`;
    }
    if (node.t === 'deriv') {
      return `<span class="m-deriv"><span class="m-frac"><span class="m-num">d</span><span class="m-den">dx</span></span>(${renderSeqHTML(node.expr, childPath(pfx, 'expr'))})<span class="m-eval-bar">x=${renderSeqHTML(node.at, childPath(pfx, 'at'))}</span></span>`;
    }
    if (node.t === 'sum') {
      return `<span class="m-int"><span class="m-sum-stack"><span class="m-sum-lim">${renderSeqHTML(node.end, childPath(pfx, 'end'))}</span><span class="m-sum-sym">Σ</span><span class="m-sum-lim">x=${renderSeqHTML(node.start, childPath(pfx, 'start'))}</span></span>(${renderSeqHTML(node.expr, childPath(pfx, 'expr'))})</span>`;
    }
    return '';
  }

  function renderResultHTML() {
    const r = state.resultObj;
    if (!r) return '';
    if (r.kind === 'base') {
      return `<span style="font-size:0.73em;margin-right:8px;opacity:0.75">${r.base[0]}</span>${E.formatBaseN(r.value, r.base)}`;
    }
    if (r.kind === 'polrec') {
      return `<span style="font-size:0.91em">${escapeHTML(r.label)}</span>`;
    }
    if (r.kind === 'cmplx') {
      const html = E.formatComplex(r.value, state.settings, r.displayPolar ?? null);
      return `<span style="font-size:${html.length > 16 ? 0.91 : 1.15}em">${html}</span>`;
    }
    if (r.kind === 'num') {
      if (state.showDMS) return E.formatDMS(r.value);
      if (state.engActive) return E.formatNumber(r.value, state.settings, state.engShift);
      if (state.settings.ioMode === 'Math' && !state.showDecimal && r.sym &&
          state.settings.numFmt === 'Norm') {
        const useMixed = state.showMixed || state.settings.fracFmt === 'ab/c';
        return r.sym.toHTML(useMixed);
      }
      return E.formatNumber(r.value, state.settings, null);
    }
    return '';
  }

  function renderStatusBar() {
    dom.indS.classList.toggle('on', state.shift);
    dom.indA.classList.toggle('on', state.alpha);
    dom.indM.classList.toggle('on', Math.abs(state.vars.M || 0) > 1e-14);
    dom.indSto.classList.toggle('on', state.stoPending);
    dom.indRcl.classList.toggle('on', state.rclPending);

    const modeBadge = {
      COMP: '', CMPLX: 'CMPLX', STAT: 'STAT', 'BASE-N': state.base,
      EQN: 'EQN', MATRIX: 'MAT', TABLE: 'TABLE', VECTOR: 'VCT'
    }[state.mode] || '';
    dom.indMode.textContent = modeBadge;
    dom.indMode.classList.toggle('on', Boolean(modeBadge));

    dom.indAng.textContent = state.settings.angleUnit[0];
    dom.indAng.classList.toggle('on', state.mode !== 'BASE-N');

    dom.indFmt.textContent = state.settings.numFmt === 'Norm' ? '' : state.settings.numFmt.toUpperCase();
    dom.indFmt.classList.toggle('on', state.settings.numFmt !== 'Norm');

    dom.indIo.textContent = state.settings.ioMode === 'Math' ? 'Math' : 'Line';
    dom.indIo.classList.toggle('on', state.mode !== 'BASE-N');

    const arrows = state.history.length > 0 ? '▲▼' : '';
    dom.indArrows.textContent = arrows;
    dom.indArrows.classList.toggle('on', Boolean(arrows));
    dom.indDisp.classList.toggle('on', Boolean(state.overlay && state.overlay.type === 'eqnRes'));
  }

  function menuItems(ov) {
    if (ov.pages) return ov.pages[ov.page] || [];
    const capacity = (ov.columns || 2) * 4;
    if (ov.items && ov.items.length > capacity) {
      ov.pages = [];
      for (let i = 0; i < ov.items.length; i += capacity) ov.pages.push(ov.items.slice(i, i + capacity));
      ov.page = 0;
      return ov.pages[0];
    }
    return ov.items || [];
  }

  let overlayFadeTimer = null;
  let overlayFadeToken = 0;
  let lastOverlayType = 'none';

  function renderOverlay() {
    const before = lastOverlayType;
    renderOverlayBody();
    const after = state.overlay ? (state.overlay.type === 'menu' ? 'menu' : 'other') : 'none';
    lastOverlayType = after;
    if (state.bootOff || state.isPoweringOff) return;
    if (before === after) return;
    overlayFadeToken++;
    const token = overlayFadeToken;
    clearTimeout(overlayFadeTimer);
    const ovEl = dom.overlay;
    ovEl.classList.remove('overlay-fade-in', 'overlay-fade-out');
    if (after === 'menu') {
      void ovEl.offsetWidth;
      ovEl.classList.add('overlay-fade-in');
      return;
    }
    if (after === 'none') {
      ovEl.classList.add('overlay-fade-out');
      overlayFadeTimer = setTimeout(function () {
        if (token !== overlayFadeToken) return;
        ovEl.classList.add('hidden');
        ovEl.innerHTML = '';
        ovEl.classList.remove('overlay-fade-out');
      }, 130);
    }
    
    
  }

  function renderOverlayBody() {
    if (state.bootOff) {
      dom.lcd.classList.add('boot-off');
      dom.lcd.classList.remove('waking');
      dom.overlay.classList.remove('hidden');
      dom.overlay.classList.remove('overlay-fade-in', 'overlay-fade-out');
      dom.overlay.classList.add('boot-off');
      dom.overlay.innerHTML = '';
      return;
    }
    dom.lcd.classList.remove('boot-off');
    dom.overlay.classList.remove('boot-off');
    const ov = state.overlay;
    dom.lcd.classList.toggle('overlay-open', Boolean(ov));
    if (!ov) {
      if (lastOverlayType === 'menu') return;
      dom.overlay.classList.add('hidden');
      dom.overlay.innerHTML = '';
      return;
    }
    dom.overlay.classList.remove('hidden');

    if (ov.type === 'off') {
      dom.overlay.innerHTML = '<div class="casio-off-logo"><span class="off-brand">CASIO<span class="reg">®</span></span></div>';
      return;
    }

    if (ov.type === 'error') {
      dom.overlay.innerHTML = `
        <div class="err-screen">
          <div style="font-size:15px">${escapeHTML(ov.message)}</div>
          <div style="font-size:11px;margin-top:6px">[AC] :Cancel</div>
          <div style="font-size:11px">[◀][▶]:Goto</div>
        </div>`;
      return;
    }

    if (ov.type === 'menu') {
      const pageItems = menuItems(ov);
      const pageHint = ov.pages
        ? `${ov.page + 1}/${ov.pages.length} ${ov.page === 0 ? '▼' : ov.page === ov.pages.length - 1 ? '▲' : '▲▼'}`
        : '';
      dom.overlay.innerHTML = `
        <div class="menu-grid${ov.singleColumn ? ' single-column' : ''}"${ov.columns ? ` style="grid-template-columns:repeat(${ov.columns},1fr)"` : ''}>
          ${pageItems.map((it) => ov.numberedSquares ? `<div class="menu-item"><span class="menu-key">${escapeHTML(it.key)}</span>${escapeHTML(it.label)}</div>` : `<div class="menu-item">${escapeHTML(it.key)}:${escapeHTML(it.label)}</div>`).join('')}
        </div>`;
      return;
    }

    if (ov.type === 'prompt') {
      dom.overlay.innerHTML = `
        <div class="menu-title"><span>${escapeHTML(ov.title)}</span><span>${escapeHTML(ov.hint || '')}</span></div>
        <div style="margin-top:8px;font-size:14px">${escapeHTML(ov.label)}</div>
        <div style="margin-top:auto;text-align:right;font-size:18px;border-bottom:1px solid #111b21">
          ${escapeHTML(ov.input)}<span class="m-cursor"></span>
        </div>`;
      return;
    }

    if (ov.type === 'grid') {
      const { cols, rows, r, c, title, inputBuf } = ov;
      const visibleStart = Math.max(0, r - 2);
      const visibleRows = rows.slice(visibleStart, visibleStart + 3);
      const head = '<tr><th></th>' + cols.map((cn) => `<th>${escapeHTML(cn)}</th>`).join('') + '</tr>';
      let body = '';
      visibleRows.forEach((row, idx) => {
        const actualR = visibleStart + idx;
        body += `<tr><th>${actualR + 1}</th>`;
        row.forEach((val, ci) => {
          const active = actualR === r && ci === c;
          const blank = '<span class="eqn-slot">[&nbsp;&nbsp;&nbsp;&nbsp;]</span>';
          const shown = ov.kind === 'EQN' && val === 0 && inputBuf === ''
            ? (active ? '<span class="eqn-slot">[<span class="m-cursor"></span>&nbsp;&nbsp;&nbsp;]</span>' : blank)
            : E.formatNumber(val, { ...state.settings, numFmt: 'Norm' });
          body += `<td class="${active ? 'active-cell' : ''}">${shown}</td>`;
        });
        body += '</tr>';
      });
      const currentVal = inputBuf !== '' ? inputBuf + '_' : E.formatNumber(rows[r][c], state.settings);
      const hint = ov.kind === 'EQN' ? '[=]Solve' : '[AC]Calc';
      dom.overlay.innerHTML = `
        <div class="menu-title"><span>${escapeHTML(title)}</span><span>${hint}</span></div>
        <table class="grid-table"><thead>${head}</thead><tbody>${body}</tbody></table>
        <div class="grid-footer"><span>R${r + 1}C${c + 1}</span><span>${currentVal}</span></div>`;
      return;
    }

    if (ov.type === 'table') {
      const { rows, r, c } = ov;
      const start = Math.max(0, r - 2);
      const vis = rows.slice(start, start + 3);
      let body = '';
      vis.forEach((row, idx) => {
        const ar = start + idx;
        body += `<tr><th>${ar + 1}</th>
          <td class="${ar === r && c === 0 ? 'active-cell' : ''}">${E.formatNumber(row.x, state.settings)}</td>
          <td class="${ar === r && c === 1 ? 'active-cell' : ''}">${Number.isFinite(row.fx) ? E.formatNumber(row.fx, state.settings) : 'ERROR'}</td>
        </tr>`;
      });
      const selVal = c === 0 ? rows[r].x : rows[r].fx;
      dom.overlay.innerHTML = `
        <table class="grid-table">
          <thead><tr><th></th><th>X</th><th>f(X)</th></tr></thead>
          <tbody>${body}</tbody>
        </table>
        <div class="grid-footer"><span>${c === 0 ? 'X' : 'f(X)'}</span><span>${Number.isFinite(selVal) ? E.formatNumber(selVal, state.settings) : 'ERROR'}</span></div>`;
      return;
    }

    if (ov.type === 'eqnRes') {
      const item = ov.results[ov.idx];
      const valHTML = item.cmplx
        ? E.formatComplex(item.cmplx, state.settings)
        : (item.sym && state.settings.ioMode === 'Math' && state.settings.numFmt === 'Norm'
          ? item.sym.toHTML(state.showMixed || state.settings.fracFmt === 'ab/c')
          : (item.num !== undefined ? E.formatNumber(item.num, state.settings) : escapeHTML(item.val || '')));
      dom.overlay.innerHTML = `
        <div class="menu-title"><span>Result</span><span>${ov.idx + 1}/${ov.results.length} ▲▼</span></div>
        <div style="margin-top:8px;font-size:15px">${escapeHTML(item.label)}</div>
        <div style="margin-top:auto;text-align:right;font-size:20px">${valHTML}</div>`;
      return;
    }

    if (ov.type === 'matRes') {
      const M = ov.mat;
      const r = ov.r, c = ov.c;
      let body = '';
      M.forEach((row, ri) => {
        body += `<tr><th>${ri + 1}</th>`;
        row.forEach((v, ci) => {
          body += `<td class="${ri === r && ci === c ? 'active-cell' : ''}">${E.formatNumber(v, state.settings)}</td>`;
        });
        body += '</tr>';
      });
      dom.overlay.innerHTML = `
        <div class="menu-title"><span>MatAns (${M.length}×${M[0].length})</span><span>[AC]Exit</span></div>
        <table class="grid-table"><tbody>${body}</tbody></table>
        <div class="grid-footer"><span>[${r + 1},${c + 1}]</span><span>${E.formatNumber(M[r][c], state.settings)}</span></div>`;
      return;
    }

    if (ov.type === 'vctRes') {
      const V = ov.vct;
      const c = ov.c;
      const body = '<tr>' + V.map((v, i) => `<td class="${i === c ? 'active-cell' : ''}">${E.formatNumber(v, state.settings)}</td>`).join('') + '</tr>';
      dom.overlay.innerHTML = `
        <div class="menu-title"><span>VctAns (${V.length}D)</span><span>[AC]Exit</span></div>
        <table class="grid-table" style="margin-top:6px"><thead><tr>${V.map((_, i) => `<th>${['X', 'Y', 'Z'][i]}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table>
        <div class="grid-footer"><span>${['X', 'Y', 'Z'][c]}</span><span>${E.formatNumber(V[c], state.settings)}</span></div>`;
      return;
    }

    if (ov.type === 'contrast') {
      const pct = ((state.settings.contrast - 1) / 9) * 100;
      dom.overlay.innerHTML = `
        <div class="menu-title"><span>CONTRAST</span><span>[AC]Done</span></div>
        <div class="slider-bar"><span>LIGHT</span><div class="slider-track"><div class="slider-fill" style="width:${pct}%"></div></div><span>DARK</span></div>
        <div style="text-align:center;font-size:11px">Use [◀] / [▶]  Level: ${state.settings.contrast}/10</div>`;
      return;
    }

    if (ov.type === 'size') {
      const { min, max } = state.scaleLimits;
      const span = Math.max(0.01, max - min);
      const pct = Math.max(0, Math.min(100, ((state.settings.scale - min) / span) * 100));
      dom.overlay.innerHTML = `
        <div class="menu-title"><span>WINDOW SIZE</span><span>[=]Save</span></div>
        <div class="slider-bar"><span>${Math.round(min * 100)}%</span><div class="slider-track"><div class="slider-fill" style="width:${pct}%"></div></div><span>${Math.round(max * 100)}%</span></div>
        <div style="text-align:center;font-size:11px">◀ ▶ Scale: ${Math.round(state.settings.scale * 100)}% (Locked)</div>`;
      return;
    }
  }

  function fitResultLine() {
    const el = dom.res;
    const scroller = el.classList.contains('lcd-res-line') ? el : (el.parentElement || el);
    el.style.fontSize = '';
    let size = parseFloat(getComputedStyle(el).fontSize) || 16.5;
    while (scroller.scrollWidth > scroller.clientWidth && size > 10) {
      size -= 0.5;
      el.style.fontSize = `${size}px`;
    }
    scroller.scrollLeft = scroller.scrollWidth > scroller.clientWidth ? scroller.scrollWidth : 0;
  }

  function render() {
    const contrastAlpha = 0.55 + (state.settings.contrast / 10) * 0.45;
    document.documentElement.style.setProperty('--lcd-contrast', contrastAlpha.toFixed(2));

    renderStatusBar();
    renderOverlay();

    if (!state.overlay) {
      if (state.mode === 'BASE-N' && state.expr.length === 0 && !state.resultObj) {
        dom.expr.innerHTML = renderSeqHTML(state.expr, []);
        dom.res.innerHTML = `<span class="lcd-res-value"><span style="font-size:0.73em;margin-right:8px;opacity:0.75">${state.base[0]}</span>0</span>`;
      } else {
        const prefix = state.mode === 'TABLE' ? '<span>f(X)=</span>' : '';
        dom.expr.innerHTML = prefix + renderSeqHTML(state.expr, []);
        dom.res.innerHTML = `<span class="lcd-res-value">${renderResultHTML()}</span>`;
      }
      fitResultLine();
      dom.exprWrap.scrollLeft = dom.exprWrap.scrollWidth;
    } else {
      dom.expr.innerHTML = '';
      dom.res.innerHTML = '';
    }
  }

  
  function fitRootToViewport() {
    const vw = window.innerWidth || DESIGN_W;
    const vh = window.innerHeight || DESIGN_H;
    const fit = Math.min(vw / DESIGN_W, vh / DESIGN_H);
    const scale = Math.round(Math.max(fit, 0.1) * 1000) / 1000;
    dom.scaleRoot.style.transform = `scale(${scale})`;
    return scale;
  }

  window.addEventListener('resize', fitRootToViewport);
  fitRootToViewport();

  async function applyScale(newScale) {
    if (window.casioWindow) {
      const info = await window.casioWindow.setScale(newScale);
      state.settings.scale = info.scale;
      state.scaleLimits = { min: info.min, max: info.max };
    } else {
      state.settings.scale = Math.max(0.45, Math.min(1.4, Math.round(newScale * 100) / 100));
    }
    fitRootToViewport();
    saveSettings(state.settings);
    render();
  }

  
  function buildEvalCtx(wantSym = true) {
    let statRes = null;
    if (state.mode === 'STAT') {
      try { statRes = E.Stat.compute(state.statType, state.statRows); } catch {}
    }
    return {
      mode: state.mode,
      base: state.base,
      angleUnit: state.settings.angleUnit,
      settings: state.settings,
      vars: state.vars,
      matrices: state.matrices,
      vectors: state.vectors,
      statRes,
      ans: state.ans,
      ansObj: state.ansObj,
      wantSym: wantSym && state.mode === 'COMP' && state.settings.ioMode === 'Math'
    };
  }

  function showError(msg) {
    state.overlay = { type: 'error', message: msg || 'Syntax ERROR' };
    render();
  }

  function evaluateCurrent() {
    if (state.mode === 'TABLE') {
      startTableWorkflow();
      return;
    }
    if (state.expr.length === 0) return;

    try {
      const res = E.evaluateSequence(state.expr, buildEvalCtx(true));
      clearDisplayFlags();

      if (res.kind === 'mat') {
        state.matrices.MatAns = E.Matrix.clone(res.value);
        state.justEvaluated = true;
        state.overlay = { type: 'matRes', mat: res.value, r: 0, c: 0 };
        render();
        return;
      }

      if (res.kind === 'vct') {
        state.vectors.VctAns = [...res.value];
        state.justEvaluated = true;
        state.overlay = { type: 'vctRes', vct: res.value, c: 0 };
        render();
        return;
      }

      state.resultObj = res;
      state.ansObj = res;
      if (res.kind === 'num' || res.kind === 'base' || res.kind === 'polrec') {
        state.ans = res.value;
      } else if (res.kind === 'cmplx') {
        state.ans = res.value;
      }

      state.history.push({ expr: cloneSeq(state.expr), resultObj: res });
      if (state.history.length > 30) state.history.shift();
      state.histIdx = -1;
      state.justEvaluated = true;
      render();
    } catch (err) {
      showError(err.message || 'Syntax ERROR');
    }
  }

  
  function openModeMenu() {
    state.overlay = {
      type: 'menu',
      title: 'MODE',
      numberedSquares: true,
      items: [
        { key: '1', label: 'COMP', action: () => setMode('COMP') },
        { key: '2', label: 'CMPLX', action: () => setMode('CMPLX') },
        { key: '3', label: 'STAT', action: () => openStatTypeMenu() },
        { key: '4', label: 'BASE-N', action: () => setMode('BASE-N') },
        { key: '5', label: 'EQN', action: () => openEqnMenu() },
        { key: '6', label: 'MATRIX', action: () => openMatrixSelectMenu('Dim') },
        { key: '7', label: 'TABLE', action: () => setMode('TABLE') },
        { key: '8', label: 'VECTOR', action: () => openVectorSelectMenu('Dim') }
      ]
    };
  }

  function setMode(m) {
    state.mode = m;
    state.overlay = null;
    clearExpr();
    render();
  }

  function openSetupMenu() {
    state.overlay = {
      type: 'menu',
      title: 'SETUP',
      page: 0,
      pages: [
        [
          { key: '1', label: 'MthIO', action: () => { state.settings.ioMode = 'Math'; finishSetup(); } },
          { key: '2', label: 'LineIO', action: () => { state.settings.ioMode = 'Line'; finishSetup(); } },
          { key: '3', label: 'Deg', action: () => { state.settings.angleUnit = 'Deg'; finishSetup(); } },
          { key: '4', label: 'Rad', action: () => { state.settings.angleUnit = 'Rad'; finishSetup(); } },
          { key: '5', label: 'Gra', action: () => { state.settings.angleUnit = 'Gra'; finishSetup(); } },
          { key: '6', label: 'Fix', action: () => openDigitPrompt('Fix 0~9?', (d) => { state.settings.numFmt = 'Fix'; state.settings.fmtDigits = d; finishSetup(); }) },
          { key: '7', label: 'Sci', action: () => openDigitPrompt('Sci 0~9?', (d) => { state.settings.numFmt = 'Sci'; state.settings.fmtDigits = d; finishSetup(); }) },
          { key: '8', label: 'Norm', action: () => openChoiceMenu('Norm', ['Norm 1', 'Norm 2'], (i) => { state.settings.numFmt = 'Norm'; state.settings.normMode = i + 1; finishSetup(); }) }
        ],
        [
          { key: '1', label: 'ab/c', action: () => { state.settings.fracFmt = 'ab/c'; finishSetup(); } },
          { key: '2', label: 'd/c', action: () => { state.settings.fracFmt = 'd/c'; finishSetup(); } },
          { key: '3', label: 'CMPLX', action: () => openChoiceMenu('CMPLX Display', ['a+bi', 'r∠θ'], (i) => { state.settings.cmplxFmt = i === 0 ? 'rect' : 'polar'; finishSetup(); }) },
          { key: '4', label: 'STAT', action: () => openChoiceMenu('Frequency?', ['ON', 'OFF'], (i) => { state.settings.statFreq = i === 0; finishSetup(); }) },
          { key: '5', label: 'Disp', action: () => openChoiceMenu('Decimal Mark', ['Dot (.)', 'Comma (,)'], (i) => { state.settings.dispDot = i === 0 ? 'Dot' : 'Comma'; finishSetup(); }) },
          { key: '6', label: '◄CONT►', action: () => { state.overlay = { type: 'contrast' }; render(); } },
          { key: '7', label: '◄SIZE►', action: () => { state.overlay = { type: 'size' }; render(); } }
        ]
      ]
    };
  }

  function finishSetup() {
    saveSettings(state.settings);
    state.overlay = null;
    render();
  }

  function openChoiceMenu(title, labels, cb) {
    state.overlay = {
      type: 'menu',
      title,
      items: labels.map((l, i) => ({ key: String(i + 1), label: l, action: () => cb(i) }))
    };
  }

  function openDigitPrompt(title, cb) {
    state.overlay = {
      type: 'menu',
      title,
      columns: 5,
      items: Array.from({ length: 10 }, (_, d) => ({ key: String(d), label: String(d), action: () => cb(d) }))
    };
  }

  
  function openStatTypeMenu() {
    state.mode = 'STAT';
    const openData = (t) => { state.statType = t; openStatEditor(); };
    state.overlay = {
      type: 'menu',
      title: 'STAT Type',
      items: [
        { key: '1', label: '1-VAR', action: () => openData(1) },
        { key: '2', label: 'A+BX', action: () => openData(2) },
        { key: '3', label: '_+CX²', action: () => openData(3) },
        { key: '4', label: 'ln X', action: () => openData(4) },
        { key: '5', label: 'e^X', action: () => openData(5) },
        { key: '6', label: 'A·B^X', action: () => openData(6) },
        { key: '7', label: 'A·X^B', action: () => openData(7) },
        { key: '8', label: '1/X', action: () => openData(8) }
      ]
    };
  }

  function openStatEditor() {
    const is1Var = state.statType === 1;
    const cols = is1Var
      ? (state.settings.statFreq ? ['X', 'FREQ'] : ['X'])
      : (state.settings.statFreq ? ['X', 'Y', 'FREQ'] : ['X', 'Y']);
    const rows = state.statRows.map((p) => {
      if (is1Var) return state.settings.statFreq ? [p.x, p.f] : [p.x];
      return state.settings.statFreq ? [p.x, p.y, p.f] : [p.x, p.y];
    });
    if (rows.length === 0) rows.push(cols.map((_, i) => (i === cols.length - 1 && state.settings.statFreq ? 1 : 0)));

    state.overlay = {
      type: 'grid',
      kind: 'STAT',
      title: is1Var ? 'STAT 1-VAR' : 'STAT Reg',
      cols,
      rows,
      r: 0,
      c: 0,
      inputBuf: '',
      onSync: (gridRows) => {
        state.statRows = gridRows.map((rw) => {
          if (is1Var) return { x: rw[0], y: 0, f: state.settings.statFreq ? rw[1] : 1 };
          return { x: rw[0], y: rw[1], f: state.settings.statFreq ? rw[2] : 1 };
        });
      }
    };
  }

  function openStatSubMenu() {
    state.overlay = {
      type: 'menu',
      title: 'STAT',
      items: [
        { key: '1', label: 'Type', action: () => openStatTypeMenu() },
        { key: '2', label: 'Data', action: () => openStatEditor() },
        { key: '3', label: 'Sum', action: () => openStatVarPicker('Sum', [
          ['1', 'Σx²', 'STAT:sx2'], ['2', 'Σx', 'STAT:sx'],
          ['3', 'Σy²', 'STAT:sy2'], ['4', 'Σy', 'STAT:sy'],
          ['5', 'Σxy', 'STAT:sxy'], ['6', 'Σx³', 'STAT:sx3']
        ]) },
        { key: '4', label: 'Var', action: () => openStatVarPicker('Var', [
          ['1', 'n', 'STAT:n'], ['2', 'x̄', 'STAT:xbar'],
          ['3', 'σx', 'STAT:sigX'], ['4', 'sx', 'STAT:sX'],
          ['5', 'ȳ', 'STAT:ybar'], ['6', 'σy', 'STAT:sigY']
        ]) },
        { key: '5', label: 'Reg', action: () => openStatVarPicker('Reg', [
          ['1', 'A', 'STAT:A'], ['2', 'B', 'STAT:B'],
          ['3', 'C', 'STAT:C'], ['4', 'r', 'STAT:r']
        ]) },
        { key: '6', label: 'MinMax', action: () => openStatVarPicker('MinMax', [
          ['1', 'minX', 'STAT:minX'], ['2', 'maxX', 'STAT:maxX'],
          ['3', 'minY', 'STAT:minY'], ['4', 'maxY', 'STAT:maxY']
        ]) },
        { key: '7', label: 'Dist', action: () => openStatVarPicker('Dist', [
          ['1', 'P(', 'P('], ['2', 'Q(', 'Q('], ['3', 'R(', 'R('], ['4', 't', 'STAT:t']
        ]) },
        { key: '8', label: 'Est', action: () => openStatVarPicker('Est', [
          ['1', 'x̂', 'STAT:xhat'], ['2', 'ŷ', 'STAT:yhat'],
          ['3', 'x̂1', 'STAT:xhat1'], ['4', 'x̂2', 'STAT:xhat2']
        ]) }
      ]
    };
  }

  function openStatVarPicker(title, entries) {
    state.overlay = {
      type: 'menu',
      title,
      items: entries.map(([k, lbl, tok]) => ({
        key: k,
        label: lbl,
        action: () => { state.overlay = null; insertNode({ t: 'tok', v: tok }); render(); }
      }))
    };
  }

  
  function openEqnMenu() {
    state.mode = 'EQN';
    state.overlay = {
      type: 'menu',
      title: 'EQN',
      singleColumn: true,
      items: [
        { key: '1', label: 'anX+bnY=cn', action: () => openEqnGrid(1, '2x2 Linear', ['a', 'b', 'c'], [[1, 0, 0], [0, 1, 0]]) },
        { key: '2', label: 'anX+bnY+cnZ=dn', action: () => openEqnGrid(2, '3x3 Linear', ['a', 'b', 'c', 'd'], [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0]]) },
        { key: '3', label: 'aX²+bX+c=0', action: () => openEqnGrid(3, 'Quadratic', ['a', 'b', 'c'], [[1, 0, 0]]) },
        { key: '4', label: 'aX³+bX²+cX+d=0', action: () => openEqnGrid(4, 'Cubic', ['a', 'b', 'c', 'd'], [[1, 0, 0, 0]]) }
      ]
    };
  }

  function openEqnGrid(eqnKind, title, cols, initRows) {
    state.overlay = {
      type: 'grid',
      kind: 'EQN',
      eqnKind,
      title,
      cols,
      rows: initRows.map((r) => [...r]),
      r: 0,
      c: 0,
      inputBuf: ''
    };
  }

  function solveCurrentEqn(ov) {
    try {
      let results;
      const rw = ov.rows;
      if (ov.eqnKind === 1) results = E.Eqn.solve2x2(rw[0][0], rw[0][1], rw[0][2], rw[1][0], rw[1][1], rw[1][2]);
      else if (ov.eqnKind === 2) results = E.Eqn.solve3x3(rw);
      else if (ov.eqnKind === 3) results = E.Eqn.solveQuadratic(rw[0][0], rw[0][1], rw[0][2]);
      else results = E.Eqn.solveCubic(rw[0][0], rw[0][1], rw[0][2], rw[0][3]);

      state.overlay = { type: 'eqnRes', results, idx: 0, prevGrid: ov };
    } catch (err) {
      showError(err.message);
    }
  }

  
  function openMatrixSelectMenu(actionType) {
    state.mode = 'MATRIX';
    const names = ['MatA', 'MatB', 'MatC'];
    state.overlay = {
      type: 'menu',
      title: `Matrix ${actionType}`,
      items: names.map((nm, i) => ({
        key: String(i + 1),
        label: nm,
        action: () => actionType === 'Dim' ? openMatrixDimMenu(nm) : openMatrixEditor(nm)
      }))
    };
  }

  function openMatrixDimMenu(matName) {
    const dims = [[3, 3], [3, 2], [3, 1], [2, 3], [2, 2], [2, 1], [1, 3], [1, 2], [1, 1]];
    state.overlay = {
      type: 'menu',
      title: `${matName} m×n`,
      page: 0,
      pages: [
        dims.slice(0, 6).map(([r, c], i) => ({
          key: String(i + 1),
          label: `${r}×${c}`,
          action: () => { state.matrices[matName] = E.Matrix.create(r, c); openMatrixEditor(matName); }
        })),
        dims.slice(6).map(([r, c], i) => ({
          key: String(i + 7),
          label: `${r}×${c}`,
          action: () => { state.matrices[matName] = E.Matrix.create(r, c); openMatrixEditor(matName); }
        }))
      ]
    };
  }

  function openMatrixEditor(matName) {
    const M = state.matrices[matName];
    state.overlay = {
      type: 'grid',
      kind: 'MATRIX',
      title: matName,
      cols: M[0].map((_, j) => `C${j + 1}`),
      rows: E.Matrix.clone(M),
      r: 0,
      c: 0,
      inputBuf: '',
      onSync: (rows) => { state.matrices[matName] = E.Matrix.clone(rows); }
    };
  }

  function openMatrixSubMenu() {
    state.overlay = {
      type: 'menu',
      title: 'MATRIX',
      items: [
        { key: '1', label: 'Dim', action: () => openMatrixSelectMenu('Dim') },
        { key: '2', label: 'Data', action: () => openMatrixSelectMenu('Data') },
        { key: '3', label: 'MatA', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'MatA' }); } },
        { key: '4', label: 'MatB', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'MatB' }); } },
        { key: '5', label: 'MatC', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'MatC' }); } },
        { key: '6', label: 'MatAns', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'MatAns' }); } },
        { key: '7', label: 'det(', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'det(' }); } },
        { key: '8', label: 'Trn(', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'Trn(' }); } }
      ]
    };
  }

  
  function openVectorSelectMenu(actionType) {
    state.mode = 'VECTOR';
    const names = ['VctA', 'VctB', 'VctC'];
    state.overlay = {
      type: 'menu',
      title: `Vector ${actionType}`,
      items: names.map((nm, i) => ({
        key: String(i + 1),
        label: nm,
        action: () => actionType === 'Dim' ? openVectorDimMenu(nm) : openVectorEditor(nm)
      }))
    };
  }

  function openVectorDimMenu(vName) {
    state.overlay = {
      type: 'menu',
      title: `${vName} Dim`,
      items: [
        { key: '1', label: '3 (X,Y,Z)', action: () => { state.vectors[vName] = [0, 0, 0]; openVectorEditor(vName); } },
        { key: '2', label: '2 (X,Y)', action: () => { state.vectors[vName] = [0, 0]; openVectorEditor(vName); } }
      ]
    };
  }

  function openVectorEditor(vName) {
    const V = state.vectors[vName];
    state.overlay = {
      type: 'grid',
      kind: 'VECTOR',
      title: vName,
      cols: V.length === 3 ? ['X', 'Y', 'Z'] : ['X', 'Y'],
      rows: [[...V]],
      r: 0,
      c: 0,
      inputBuf: '',
      onSync: (rows) => { state.vectors[vName] = [...rows[0]]; }
    };
  }

  function openVectorSubMenu() {
    state.overlay = {
      type: 'menu',
      title: 'VECTOR',
      items: [
        { key: '1', label: 'Dim', action: () => openVectorSelectMenu('Dim') },
        { key: '2', label: 'Data', action: () => openVectorSelectMenu('Data') },
        { key: '3', label: 'VctA', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'VctA' }); } },
        { key: '4', label: 'VctB', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'VctB' }); } },
        { key: '5', label: 'VctC', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'VctC' }); } },
        { key: '6', label: 'VctAns', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'VctAns' }); } },
        { key: '7', label: 'Dot', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'Dot' }); } }
      ]
    };
  }

  
  function openCmplxSubMenu() {
    state.overlay = {
      type: 'menu',
      title: 'CMPLX',
      items: [
        { key: '1', label: 'arg(', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'arg(' }); } },
        { key: '2', label: 'Conjg(', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'Conjg(' }); } },
        { key: '3', label: '►r∠θ', action: () => { state.overlay = null; insertNode({ t: 'tok', v: '►r∠θ' }); } },
        { key: '4', label: '►a+bi', action: () => { state.overlay = null; insertNode({ t: 'tok', v: '►a+bi' }); } }
      ]
    };
  }

  function openBaseSubMenu() {
    state.overlay = {
      type: 'menu',
      title: 'BASE',
      page: 0,
      pages: [
        [
          { key: '1', label: 'and', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'and' }); } },
          { key: '2', label: 'or', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'or' }); } },
          { key: '3', label: 'xor', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'xor' }); } },
          { key: '4', label: 'xnor', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'xnor' }); } },
          { key: '5', label: 'Not(', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'Not(' }); } },
          { key: '6', label: 'Neg(', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'Neg(' }); } }
        ],
        [
          { key: '1', label: 'd (Dec)', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'd' }); } },
          { key: '2', label: 'h (Hex)', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'h' }); } },
          { key: '3', label: 'b (Bin)', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'b' }); } },
          { key: '4', label: 'o (Oct)', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'o' }); } }
        ]
      ]
    };
  }

  function openHypMenu() {
    state.overlay = {
      type: 'menu',
      title: 'Hyperbolic',
      items: [
        { key: '1', label: 'sinh', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'sinh(' }); } },
        { key: '2', label: 'cosh', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'cosh(' }); } },
        { key: '3', label: 'tanh', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'tanh(' }); } },
        { key: '4', label: 'sinh⁻¹', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'sinh⁻¹(' }); } },
        { key: '5', label: 'cosh⁻¹', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'cosh⁻¹(' }); } },
        { key: '6', label: 'tanh⁻¹', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'tanh⁻¹(' }); } }
      ]
    };
  }

  function openDrgMenu() {
    state.overlay = {
      type: 'menu',
      title: 'Angle Unit',
      items: [
        { key: '1', label: '° (Deg)', action: () => { state.overlay = null; insertNode({ t: 'tok', v: '°' }); } },
        { key: '2', label: 'r (Rad)', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'ʳ' }); } },
        { key: '3', label: 'g (Gra)', action: () => { state.overlay = null; insertNode({ t: 'tok', v: 'ᵍ' }); } }
      ]
    };
  }

  function openClrMenu() {
    state.overlay = {
      type: 'menu',
      title: 'Clear?',
      items: [
        { key: '1', label: 'Setup', action: () => {
          const keepScale = state.settings.scale;
          state.settings = { ...DEFAULT_SETTINGS, scale: keepScale };
          saveSettings(state.settings);
          state.overlay = null;
        } },
        { key: '2', label: 'Memory', action: () => {
          state.vars = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 };
          state.ans = 0; state.ansObj = null;
          state.overlay = null;
        } },
        { key: '3', label: 'All', action: () => {
          const keepScale = state.settings.scale;
          state.settings = { ...DEFAULT_SETTINGS, scale: keepScale };
          saveSettings(state.settings);
          state.vars = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0 };
          state.ans = 0; state.ansObj = null; state.history = [];
          state.mode = 'COMP'; clearExpr(); state.overlay = null;
        } }
      ]
    };
  }

  function openConstPrompt() {
    state.overlay = {
      type: 'prompt',
      title: 'CONST (01~40)',
      hint: '06:h 24:NA 28:c0 35:g',
      label: 'Const number (01-40)?',
      input: '',
      onSubmit: (val) => {
        const n = Number(val);
        if (n >= 1 && n <= 40) {
          state.overlay = null;
          insertNode({ t: 'tok', v: `CONST:${n}` });
        } else showError('Syntax ERROR');
      }
    };
  }

  function openConvPrompt() {
    state.overlay = {
      type: 'prompt',
      title: 'CONV (01~40)',
      hint: '01:in►cm 19:km/h►m/s 37:°F►°C',
      label: 'Conv number (01-40)?',
      input: '',
      onSubmit: (val) => {
        const n = Number(val);
        if (n >= 1 && n <= 40) {
          state.overlay = null;
          insertNode({ t: 'tok', v: `CONV:${n}` });
        } else showError('Syntax ERROR');
      }
    };
  }

  
  function findUsedVars(seq, out = new Set()) {
    for (const n of seq) {
      if (n.t === 'tok' && /^[A-FXYM]$/.test(n.v)) out.add(n.v);
      else if (NODE_SLOTS[n.t]) {
        for (const s of NODE_SLOTS[n.t]) findUsedVars(n[s], out);
      }
    }
    return Array.from(out);
  }

  function startCalcWorkflow() {
    if (state.expr.length === 0) return;
    const vars = findUsedVars(state.expr);
    if (vars.length === 0) { evaluateCurrent(); return; }
    promptVarSequence(vars, 0, () => {
      state.overlay = null;
      evaluateCurrent();
    });
  }

  function promptVarSequence(vars, idx, done) {
    const v = vars[idx];
    state.overlay = {
      type: 'prompt',
      title: 'CALC',
      hint: `Current: ${state.vars[v]}`,
      label: `${v}?`,
      input: String(state.vars[v]),
      onSubmit: (val) => {
        const num = val === '' ? state.vars[v] : Number(val);
        if (!Number.isFinite(num)) return showError('Syntax ERROR');
        state.vars[v] = num;
        if (idx + 1 < vars.length) promptVarSequence(vars, idx + 1, done);
        else done();
      }
    };
  }

  function startSolveWorkflow() {
    if (state.expr.length === 0) return;
    const eqIdx = state.expr.findIndex((n) => n.t === 'tok' && n.v === '=');
    const lhs = eqIdx === -1 ? state.expr : state.expr.slice(0, eqIdx);
    const rhs = eqIdx === -1 ? [{ t: 'tok', v: '0' }] : state.expr.slice(eqIdx + 1);
    if (lhs.length === 0 || rhs.length === 0) return showError('Syntax ERROR');

    state.overlay = {
      type: 'prompt',
      title: 'SOLVE',
      hint: 'Initial guess',
      label: 'Solve for X (init)?',
      input: String(state.vars.X || 0),
      onSubmit: (val) => {
        const x0 = val === '' ? 0 : Number(val);
        try {
          const evalSide = (side, x) => {
            const ctx = buildEvalCtx(false);
            ctx.vars = { ...ctx.vars, X: x };
            return E.evaluateSequence(side, ctx).value;
          };
          const { root, diff } = E.solveEquation((x) => evalSide(lhs, x), (x) => evalSide(rhs, x), x0, { variable: 'X' });
          state.vars.X = root;
          state.ans = root;
          state.overlay = {
            type: 'eqnRes',
            results: [
              { label: 'X =', num: root },
              { label: 'L−R =', num: diff }
            ],
            idx: 0
          };
        } catch (err) {
          showError(err.message);
        }
      }
    };
  }

  function startTableWorkflow() {
    if (state.expr.length === 0) return showError('Syntax ERROR');
    const exprCopy = cloneSeq(state.expr);
    let startV = 1, endV = 5, stepV = 1;

    const askStep = () => {
      state.overlay = {
        type: 'prompt',
        title: 'TABLE',
        hint: 'Step > 0',
        label: 'Step?',
        input: '1',
        onSubmit: (v) => {
          stepV = Number(v);
          if (!Number.isFinite(stepV) || stepV <= 0) return showError('Math ERROR');
          const count = Math.floor((endV - startV) / stepV + 1e-9) + 1;
          if (count > 50 || count < 1) return showError('Insufficient MEM');
          const rows = [];
          for (let i = 0; i < count; i++) {
            const x = E.cleanFloat(startV + i * stepV);
            let fx = NaN;
            try {
              const ctx = buildEvalCtx(false);
              ctx.vars = { ...ctx.vars, X: x };
              fx = E.evaluateSequence(exprCopy, ctx).value;
            } catch {}
            rows.push({ x, fx });
          }
          state.overlay = { type: 'table', rows, r: 0, c: 0 };
        }
      };
    };

    const askEnd = () => {
      state.overlay = {
        type: 'prompt',
        title: 'TABLE',
        hint: 'End value',
        label: 'End?',
        input: '5',
        onSubmit: (v) => {
          endV = Number(v);
          if (!Number.isFinite(endV)) return showError('Syntax ERROR');
          askStep();
        }
      };
    };

    state.overlay = {
      type: 'prompt',
      title: 'TABLE',
      hint: 'Start value',
      label: 'Start?',
      input: '1',
      onSubmit: (v) => {
        startV = Number(v);
        if (!Number.isFinite(startV)) return showError('Syntax ERROR');
        askEnd();
      }
    };
  }

  
  function powerOffSequence() {
    if (state.isPoweringOff) return;
    state.isPoweringOff = true;
    state.shift = false;
    state.alpha = false;
    state.overlay = { type: 'off' };
    dom.lcd.classList.add('power-off');
    render();
    setTimeout(() => {
      if (window.casioWindow) {
        window.casioWindow.close();
      } else {
        window.close();
      }
    }, 720);
  }

  
  function commitGridCell(ov) {
    if (ov.inputBuf !== '') {
      const n = Number(ov.inputBuf);
      if (Number.isFinite(n)) ov.rows[ov.r][ov.c] = n;
      ov.inputBuf = '';
      if (ov.onSync) ov.onSync(ov.rows);
    }
  }

  function handleOverlayKey(key) {
    const ov = state.overlay;
    if (!ov) return false;
    if (ov.type === 'off') return true;

    
    if (state.shift && key === 'AC') {
      powerOffSequence();
      return true;
    }

    
    if (key === 'MODE') {
      if (state.shift) { state.shift = false; openSetupMenu(); }
      else openModeMenu();
      render();
      return true;
    }

    if (ov.type === 'error') {
      if (key === 'AC' || key === 'ON') { state.overlay = null; clearExpr(); render(); return true; }
      if (key === 'LEFT' || key === 'RIGHT') { state.overlay = null; state.justEvaluated = false; render(); return true; }
      return true;
    }

    if (ov.type === 'menu') {
      if (key === 'AC' || key === 'ON') { state.overlay = null; render(); return true; }
      if (ov.pages && (key === 'DOWN' || key === 'UP')) {
        ov.page = key === 'DOWN' ? (ov.page + 1) % ov.pages.length : (ov.page + ov.pages.length - 1) % ov.pages.length;
        render();
        return true;
      }
      const list = menuItems(ov);
      const found = list.find((it) => it.key === key);
      if (found) {
        found.action();
        render();
      }
      return true;
    }

    if (ov.type === 'prompt') {
      if (key === 'AC' || key === 'ON') { state.overlay = null; render(); return true; }
      if (/^[0-9]$/.test(key)) { ov.input += key; render(); return true; }
      if (key === 'DOT' && !ov.input.includes('.')) { ov.input += '.'; render(); return true; }
      if (key === 'NEG' || key === 'SUB') {
        ov.input = ov.input.startsWith('-') ? ov.input.slice(1) : '-' + ov.input;
        render();
        return true;
      }
      if (key === 'DEL') { ov.input = ov.input.slice(0, -1); render(); return true; }
      if (key === 'EQ') { ov.onSubmit(ov.input); render(); return true; }
      return true;
    }

    if (ov.type === 'grid') {
      if (/^[0-9]$/.test(key)) { ov.inputBuf += key; render(); return true; }
      if (key === 'DOT' && !ov.inputBuf.includes('.')) { ov.inputBuf += '.'; render(); return true; }
      if (key === 'NEG' || key === 'SUB') {
        ov.inputBuf = ov.inputBuf.startsWith('-') ? ov.inputBuf.slice(1) : '-' + ov.inputBuf;
        render();
        return true;
      }
      if (key === 'DEL') {
        if (ov.inputBuf.length > 0) ov.inputBuf = ov.inputBuf.slice(0, -1);
        else { ov.rows[ov.r][ov.c] = 0; if (ov.onSync) ov.onSync(ov.rows); }
        render();
        return true;
      }
      if (key === 'LEFT') {
        commitGridCell(ov);
        ov.c = (ov.c + ov.cols.length - 1) % ov.cols.length;
        render(); return true;
      }
      if (key === 'RIGHT') {
        commitGridCell(ov);
        ov.c = (ov.c + 1) % ov.cols.length;
        render(); return true;
      }
      if (key === 'UP') {
        commitGridCell(ov);
        ov.r = Math.max(0, ov.r - 1);
        render(); return true;
      }
      if (key === 'DOWN') {
        commitGridCell(ov);
        if (ov.r + 1 < ov.rows.length) ov.r++;
        else if (ov.kind === 'STAT' && ov.rows.length < 40) {
          ov.rows.push(ov.cols.map((cn) => (cn === 'FREQ' ? 1 : 0)));
          ov.r++;
          if (ov.onSync) ov.onSync(ov.rows);
        }
        render(); return true;
      }
      if (key === 'EQ') {
        const hadBuf = ov.inputBuf !== '';
        commitGridCell(ov);
        const atLastCell = ov.r === ov.rows.length - 1 && ov.c === ov.cols.length - 1;
        if (ov.kind === 'EQN' && (atLastCell || !hadBuf && atLastCell)) {
          solveCurrentEqn(ov);
          render();
          return true;
        }
        if (ov.c + 1 < ov.cols.length) ov.c++;
        else if (ov.r + 1 < ov.rows.length) { ov.r++; ov.c = 0; }
        else if (ov.kind === 'STAT' && ov.rows.length < 40) {
          ov.rows.push(ov.cols.map((cn) => (cn === 'FREQ' ? 1 : 0)));
          ov.r++; ov.c = 0;
          if (ov.onSync) ov.onSync(ov.rows);
        } else if (ov.kind === 'EQN') {
          solveCurrentEqn(ov);
        }
        render(); return true;
      }
      if (key === 'AC' || key === 'ON') {
        commitGridCell(ov);
        if (ov.kind === 'EQN') { openEqnMenu(); }
        else { state.overlay = null; clearExpr(); }
        render(); return true;
      }
      return true;
    }

    if (ov.type === 'table') {
      if (key === 'UP') { ov.r = Math.max(0, ov.r - 1); render(); return true; }
      if (key === 'DOWN') { ov.r = Math.min(ov.rows.length - 1, ov.r + 1); render(); return true; }
      if (key === 'LEFT' || key === 'RIGHT') { ov.c = ov.c === 0 ? 1 : 0; render(); return true; }
      if (key === 'AC' || key === 'ON') { state.overlay = null; render(); return true; }
      return true;
    }

    if (ov.type === 'eqnRes') {
      if (key === 'DOWN' || key === 'EQ') {
        ov.idx = (ov.idx + 1) % ov.results.length;
        render(); return true;
      }
      if (key === 'UP') {
        ov.idx = (ov.idx + ov.results.length - 1) % ov.results.length;
        render(); return true;
      }
      if (key === 'AC' || key === 'ON') {
        state.overlay = ov.prevGrid || null;
        render(); return true;
      }
      return true;
    }

    if (ov.type === 'matRes') {
      if (key === 'UP') ov.r = (ov.r + ov.mat.length - 1) % ov.mat.length;
      else if (key === 'DOWN') ov.r = (ov.r + 1) % ov.mat.length;
      else if (key === 'LEFT') ov.c = (ov.c + ov.mat[0].length - 1) % ov.mat[0].length;
      else if (key === 'RIGHT') ov.c = (ov.c + 1) % ov.mat[0].length;
      else if (key === 'AC' || key === 'ON') state.overlay = null;
      render(); return true;
    }

    if (ov.type === 'vctRes') {
      if (key === 'LEFT') ov.c = (ov.c + ov.vct.length - 1) % ov.vct.length;
      else if (key === 'RIGHT') ov.c = (ov.c + 1) % ov.vct.length;
      else if (key === 'AC' || key === 'ON') state.overlay = null;
      render(); return true;
    }

    if (ov.type === 'contrast') {
      if (key === 'LEFT') {
        state.settings.contrast = Math.max(1, state.settings.contrast - 1);
        saveSettings(state.settings);
      } else if (key === 'RIGHT') {
        state.settings.contrast = Math.min(10, state.settings.contrast + 1);
        saveSettings(state.settings);
      } else if (key === 'AC' || key === 'EQ' || key === 'ON') {
        state.overlay = null;
      }
      render(); return true;
    }

    if (ov.type === 'size') {
      if (key === 'LEFT') {
        applyScale(state.settings.scale - 0.05);
        return true;
      }
      if (key === 'RIGHT') {
        applyScale(state.settings.scale + 0.05);
        return true;
      }
      if (key === 'AC' || key === 'EQ' || key === 'ON') {
        state.overlay = null;
        render();
        return true;
      }
      return true;
    }

    return false;
  }

  
  function handleKey(key) {
    if (state.isPoweringOff) return;
    if (state.bootOff) {
      if (key === 'SHIFT') {
        state.shift = !state.shift;
        render();
        return;
      }
      if (key === 'AC' && state.shift) {
        state.bootOff = false;
        powerOffSequence();
        return;
      }
      if (key === 'ON') {
        state.shift = false;
        state.bootOff = false;
        state.overlay = null;
        dom.lcd.classList.add('waking');
        setTimeout(() => dom.lcd.classList.remove('waking'), 480);
        render();
      }
      return;
    }
    playKeyClick(['SHIFT', 'ALPHA', 'MODE', 'ON', 'UP', 'DOWN', 'LEFT', 'RIGHT'].includes(key));

    
    if (key === 'SHIFT') {
      state.shift = !state.shift;
      if (state.shift) state.alpha = false;
      render();
      return;
    }
    if (key === 'ALPHA') {
      state.alpha = !state.alpha;
      if (state.alpha) state.shift = false;
      render();
      return;
    }

    
    if (state.overlay) {
      handleOverlayKey(key);
      return;
    }

    const isShift = state.shift;
    const isAlpha = state.alpha;
    state.shift = false;
    state.alpha = false;

    
    if (state.stoPending || state.rclPending) {
      const vName = VAR_KEY_MAP[key];
      const wasSto = state.stoPending;
      state.stoPending = false;
      state.rclPending = false;
      if (vName) {
        if (wasSto) {
          try {
            let val = state.ans;
            let sym = state.ansObj && state.ansObj.kind === 'num' ? state.ansObj.sym : null;
            if (state.expr.length > 0 && !state.justEvaluated) {
              const res = E.evaluateSequence(state.expr, buildEvalCtx(true));
              val = res.value;
              state.resultObj = res;
              state.ans = val;
              state.ansObj = res;
              state.justEvaluated = true;
              if (res.kind === 'num') sym = res.sym || null;
            }
            state.vars[vName] = val;
            state.varObjs[vName] = sym;
          } catch (err) {
            showError(err.message);
            return;
          }
        } else {
          
          const val = state.vars[vName] ?? 0;
          clearExpr();
          state.expr.push({ t: 'tok', v: vName });
          state.resultObj = val instanceof E.Complex
            ? { kind: 'cmplx', value: val }
            : { kind: 'num', value: Number(val), sym: state.varObjs[vName] || null };
          state.justEvaluated = true;
        }
        render();
        return;
      }
      if (key === 'AC') { render(); return; }
    }

    
    if (key === 'ON') {
      state.insMode = false;
      clearExpr();
      render();
      return;
    }

    
    if (isShift && key === 'AC') {
      powerOffSequence();
      return;
    }

    
    if (state.mode === 'BASE-N' && !isShift && !isAlpha) {
      const baseSwitch = { SQR: 'DEC', POW: 'HEX', LOG: 'BIN', LN: 'OCT' }[key];
      if (baseSwitch) {
        try {
          if (state.resultObj && state.resultObj.kind === 'base') E.formatBaseN(state.resultObj.value, baseSwitch);
        } catch (err) {
          showError(err.message);
          return;
        }
        state.base = baseSwitch;
        if (state.resultObj && state.resultObj.kind === 'base') {
          state.resultObj = { kind: 'base', value: state.resultObj.value, base: state.base };
        }
        render();
        return;
      }
      const hexMap = { NEG: 'A', DMS: 'B', HYP: 'C', SIN: 'D', COS: 'E', TAN: 'F' };
      if (hexMap[key]) {
        insertNode({ t: 'tok', v: hexMap[key] });
        render();
        return;
      }
    }

    
    if (isAlpha) {
      if (VAR_KEY_MAP[key]) { insertNode({ t: 'tok', v: VAR_KEY_MAP[key] }); render(); return; }
      if (key === 'CALC') { insertNode({ t: 'tok', v: '=' }); render(); return; }
      if (key === 'INT') { insertNode({ t: 'tok', v: ':' }); render(); return; }
      if (key === 'DOT') { insertNode({ t: 'tok', v: 'RanInt#(' }); render(); return; }
      if (key === 'EXP10') { insertNode({ t: 'tok', v: 'e' }); render(); return; }
      render();
      return;
    }

    
    if (isShift) {
      switch (key) {
        case 'MODE': openSetupMenu(); break;
        case 'CALC': startSolveWorkflow(); break;
        case 'INT': insertNode({ t: 'deriv', expr: [], at: [] }, 'expr'); break;
        case 'INV': insertNode({ t: 'tok', v: '!' }); break;
        case 'LOGB': insertNode({ t: 'sum', expr: [], start: [], end: [] }, 'expr'); break;
        case 'FRAC': insertNode({ t: 'mfrac', whole: [], num: [], den: [] }, 'whole'); break;
        case 'SQRT': insertNode({ t: 'cbrt', body: [] }, 'body'); break;
        case 'SQR': insertNode({ t: 'sup', exp: [{ t: 'tok', v: '3' }] }); break;
        case 'POW': insertNode({ t: 'nroot', deg: [], body: [] }, 'deg'); break;
        case 'LOG':
          insertNode({ t: 'tok', v: '1' });
          insertNode({ t: 'tok', v: '0' });
          insertNode({ t: 'sup', exp: [] }, 'exp');
          break;
        case 'LN':
          insertNode({ t: 'tok', v: 'e' });
          insertNode({ t: 'sup', exp: [] }, 'exp');
          break;
        case 'NEG': insertNode({ t: 'tok', v: '∠' }); break;
        case 'HYP': insertNode({ t: 'abs', body: [] }, 'body'); break;
        case 'SIN': insertNode({ t: 'tok', v: 'sin⁻¹(' }); break;
        case 'COS': insertNode({ t: 'tok', v: 'cos⁻¹(' }); break;
        case 'TAN': insertNode({ t: 'tok', v: 'tan⁻¹(' }); break;
        case 'RCL': state.stoPending = true; break;
        case 'ENG':
          if (state.resultObj && state.resultObj.kind === 'num') {
            state.engShift--;
            state.engActive = true;
            state.showDMS = false;
          }
          break;
        case 'LPAR': insertNode({ t: 'tok', v: '%' }); break;
        case 'RPAR': insertNode({ t: 'tok', v: ',' }); break;
        case 'SD':
          if (state.resultObj && state.resultObj.kind === 'num') {
            state.showDecimal = false;
            state.showMixed = !state.showMixed;
            state.showDMS = false;
            state.engShift = 0;
            state.engActive = false;
          }
          break;
        case 'MPLUS': applyMemoryDelta(-1); break;
        case '7': openConstPrompt(); break;
        case '8': openConvPrompt(); break;
        case '9': openClrMenu(); break;
        case 'DEL': state.insMode = !state.insMode; break;
        case '4': openMatrixSubMenu(); break;
        case '5': openVectorSubMenu(); break;
        case 'MUL': insertNode({ t: 'tok', v: 'P' }); break;
        case 'DIV': insertNode({ t: 'tok', v: 'C' }); break;
        case '1': openStatSubMenu(); break;
        case '2': openCmplxSubMenu(); break;
        case '3': openBaseSubMenu(); break;
        case 'ADD': insertNode({ t: 'tok', v: 'Pol(' }); break;
        case 'SUB': insertNode({ t: 'tok', v: 'Rec(' }); break;
        case '0': insertNode({ t: 'tok', v: 'Rnd(' }); break;
        case 'DOT': insertNode({ t: 'tok', v: 'Ran#' }); break;
        case 'EXP10': insertNode({ t: 'tok', v: 'π' }); break;
        case 'ANS': openDrgMenu(); break;
        default: break;
      }
      render();
      return;
    }

    
    if (/^[0-9]$/.test(key)) { insertNode({ t: 'tok', v: key }); render(); return; }

    switch (key) {
      case 'MODE': openModeMenu(); break;
      case 'UP': case 'DOWN': case 'LEFT': case 'RIGHT': moveCursor(key); break;
      case 'CALC': startCalcWorkflow(); break;
      case 'INT': insertNode({ t: 'int', expr: [], lower: [], upper: [] }, 'expr'); break;
      case 'INV': insertNode({ t: 'sup', exp: [{ t: 'tok', v: '−' }, { t: 'tok', v: '1' }] }); break;
      case 'LOGB': insertNode({ t: 'logb', base: [], arg: [] }, 'base'); break;
      case 'FRAC': insertFraction(); break;
      case 'SQRT': insertNode({ t: 'sqrt', body: [] }, 'body'); break;
      case 'SQR': insertNode({ t: 'sup', exp: [{ t: 'tok', v: '2' }] }); break;
      case 'POW': insertNode({ t: 'sup', exp: [] }, 'exp'); break;
      case 'LOG': insertNode({ t: 'tok', v: 'log(' }); break;
      case 'LN': insertNode({ t: 'tok', v: 'ln(' }); break;
      case 'NEG': insertNode({ t: 'tok', v: '−' }); break;
      case 'DMS':
        if (state.justEvaluated && state.resultObj && state.resultObj.kind === 'num') {
          state.showDMS = !state.showDMS;
          if (state.showDMS) state.showDecimal = false;
          state.engShift = 0;
          state.engActive = false;
        } else {
          insertNode({ t: 'tok', v: 'DMS' });
        }
        break;
      case 'HYP': openHypMenu(); break;
      case 'SIN': insertNode({ t: 'tok', v: 'sin(' }); break;
      case 'COS': insertNode({ t: 'tok', v: 'cos(' }); break;
      case 'TAN': insertNode({ t: 'tok', v: 'tan(' }); break;
      case 'RCL': state.rclPending = true; break;
      case 'ENG':
        if (state.mode === 'CMPLX' && !state.justEvaluated) {
          insertNode({ t: 'tok', v: 'i' });
        } else if (state.resultObj && state.resultObj.kind === 'num') {
          state.engShift++;
          state.engActive = true;
          state.showDMS = false;
        }
        break;
      case 'LPAR': insertNode({ t: 'tok', v: '(' }); break;
      case 'RPAR': insertNode({ t: 'tok', v: ')' }); break;
      case 'SD':
        if (state.resultObj && state.resultObj.kind === 'num') {
          state.showDMS = false;
          state.engShift = 0;
          state.engActive = false;
          state.showDecimal = !state.showDecimal;
        }
        break;
      case 'MPLUS': applyMemoryDelta(1); break;
      case 'DEL': deleteAtCursor(); break;
      case 'AC': clearExpr(); break;
      case 'ADD': insertNode({ t: 'tok', v: '+' }); break;
      case 'SUB': insertNode({ t: 'tok', v: '−' }); break;
      case 'MUL': insertNode({ t: 'tok', v: '×' }); break;
      case 'DIV': insertNode({ t: 'tok', v: '÷' }); break;
      case 'DOT': insertNode({ t: 'tok', v: '.' }); break;
      case 'EXP10': insertNode({ t: 'tok', v: '×10^' }); break;
      case 'ANS': insertNode({ t: 'tok', v: 'Ans' }); break;
      case 'EQ': evaluateCurrent(); return;
      default: break;
    }
    render();
  }

  function applyMemoryDelta(sign) {
    try {
      let val = typeof state.ans === 'number' ? state.ans : 0;
      if (state.expr.length > 0 && !state.justEvaluated) {
        const res = E.evaluateSequence(state.expr, buildEvalCtx(true));
        if (res.kind !== 'num') throw new Error('Math ERROR');
        val = res.value;
        state.resultObj = res;
        state.ans = val;
        state.ansObj = res;
        state.justEvaluated = true;
      }
      state.vars.M = E.cleanFloat((state.vars.M || 0) + sign * val);
    } catch (err) {
      showError(err.message);
    }
  }

  
  document.querySelectorAll('[data-key]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleKey(btn.getAttribute('data-key'));
    });
  });

  
  dom.solar.addEventListener('mouseenter', () => {
    if (!state.isPoweringOff) dom.lcd.classList.add('solar-dim');
  });
  dom.solar.addEventListener('mouseleave', () => {
    dom.lcd.classList.remove('solar-dim');
  });
  dom.solar.addEventListener('click', () => {
    if (state.isPoweringOff) return;
    playKeyClick(true);
    dom.lcd.classList.add('sleeping');
    setTimeout(() => {
      if (window.casioWindow) window.casioWindow.minimize();
      setTimeout(() => dom.lcd.classList.remove('sleeping', 'solar-dim'), 350);
    }, 240);
  });

  window.addEventListener('focus', () => {
    dom.lcd.classList.remove('sleeping', 'solar-dim');
  });

  
  const KB_MAP = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    '.': 'DOT', '+': 'ADD', '-': 'SUB', '*': 'MUL', '/': 'DIV',
    '(': 'LPAR', ')': 'RPAR', '^': 'POW',
    Enter: 'EQ', '=': 'EQ',
    Backspace: 'DEL', Delete: 'DEL', Escape: 'AC',
    ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT'
  };

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const mapped = KB_MAP[e.key];
    if (!mapped) return;
    e.preventDefault();
    const btn = document.querySelector(`[data-key="${mapped}"]`);
    if (btn) {
      btn.classList.add('is-pressed');
      setTimeout(() => btn.classList.remove('is-pressed'), 95);
    }
    handleKey(mapped);
  });

  
  async function init() {
    if (window.casioWindow) {
      try {
        state.scaleLimits = await window.casioWindow.getLimits();
        await applyScale(state.settings.scale);
      } catch {}
    }
    fitRootToViewport();
    render();
  }

  document.querySelectorAll('[data-shift-key]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      state.shift = true;
      handleKey(el.getAttribute('data-shift-key'));
    });
  });
  render();
  init();
})();
(function () {
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'F5') e.preventDefault();
  }, true);
})();


(function () {
  var gate = document.getElementById('ownership-gate');
  if (!gate) return;
  var yes = gate.querySelector('[data-ownership="yes"]');
  var no = gate.querySelector('[data-ownership="no"]');

  function openLid() {
    var cover = document.getElementById('calc-cover');
    gate.classList.add('hidden');
    if (!cover || cover.classList.contains('lid-open')) return;
    
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        setTimeout(function () {
          cover.classList.add('lid-open');
          setTimeout(function () { cover.remove(); }, 2000);
        }, 300);
      });
    });
  }

  async function confirmOwnership() {
    if (window.casioWindow && window.casioWindow.setOwnership) {
      try { await window.casioWindow.setOwnership(); } catch (e) {}
    }
    openLid();
  }

  function declineOwnership() {
    if (window.casioWindow && window.casioWindow.close) window.casioWindow.close();
    else window.close();
  }

  yes.addEventListener('pointerup', function (e) {
    if (!e.isTrusted || e.button !== 0) return;
    confirmOwnership();
  });
  no.addEventListener('pointerup', function (e) {
    if (!e.isTrusted || e.button !== 0) return;
    declineOwnership();
  });

  
  yes.blur();
  no.blur();

  if (window.__casioOwnershipConfirmed === true) openLid();
  else gate.classList.remove('hidden');
})();