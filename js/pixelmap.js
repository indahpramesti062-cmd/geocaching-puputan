// ============================================================
// pixelmap.js — Peta Perjalanan bergaya Pixel Art (Page 2)
// - Latar malam pixel: langit berpita, bintang, bulan, awan,
//   siluet Gunung Agung & meru, kunang-kunang
// - Papan rumput dengan jalan setapak berliku
// - Karakter berjubah ungu (sprite orisinal) yang berjalan
//   menyusuri jalan ke setiap titik lokasi
// Semua sprite digambar dari data pixel di bawah (tanpa file gambar).
// ============================================================

const PixelMap = (() => {
  'use strict';

  const AVATAR_KEY = 'geocaching_puputan_avatar';
  const START = -1;          // indeks titik "MULAI"
  const ROW_GAP = 170;       // jarak vertikal antar titik lokasi (px)
  const TOP_PAD = 160;       // posisi y titik pertama
  const START_Y = 62;        // posisi y titik MULAI
  const SPEED = 165;         // kecepatan jalan (px/detik)
  const MAX_WALK_MS = 5200;  // batas durasi jalan jauh
  const STEP_MS = 150;       // ganti frame langkah
  const reduceMotion = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ══════════════════════════════════════════════════════════
  //  DATA SPRITE PIXEL
  // ══════════════════════════════════════════════════════════

  // Karakter berjubah ungu (16 x 20)
  const AVATAR_PAL = {
    K: '#1a0b2e', D: '#3b1d66', P: '#6237a8', L: '#8b5fd3',
    H: '#b896f2', B: '#07040f', E: '#ff5cf4', G: '#ffd23f'
  };
  const AVATAR_BODY = [
    '.....KKKKKKK....',
    '...KKPHHPPPPKK..',
    'KK.KPLLPPPPPPPK.',
    'KPKPLPPPPPPPPPK.',
    '.KKPPKKKKKKKPPK.',
    '..KPKBBBBBBBKPK.',
    '..KPBEEBBBEEBPK.',
    '..KPBBBBBBBBBPK.',
    '..KDPBBBBBBBPDK.',
    '...KDPPPPPPPDK..',
    '...KPPPPGPPPPK..',
    '..KPLPPPDPPPPDK.',
    '..KPLPPPDPPPPDK.',
    '.KPLPPPPDPPPPDK.',
    '.KPLPPPPDPPPPDK.',
    '.KPLPPPPDPPPPPDK',
    'KPLPPPPPDPPPPPDK',
    'KPDPPDPPDPPDPPDK'
  ];
  const AVATAR_HEM_A = [
    'KDDDDDDDDDDDDDDK',
    '.KKKK.KKKKK.KKK.'
  ];
  const AVATAR_HEM_B = [
    'KDDDDDDDDDDDDDDK',
    'KKK.KKKKK.KKKK..'
  ];

  // Bendera Merah Putih (titik yang sudah selesai) — 8 x 12, 2 frame
  const FLAG_PAL = { p: '#d8d0b0', R: '#e02424', W: '#f5f5f5', k: '#1a0b2e' };
  const FLAG_POLE = padRows(['p.......'].concat(Array(10).fill('p.......')).concat(['k.......']), 12);
  const FLAG_A = padRows(['.RRRRRR.', '.RRRRRR.', '.WWWWWW.', '.WWWWWW.'], 12);
  const FLAG_B = padRows(['.RRRRR..', '.RRRRRRR', '.WWWWWWW', '.WWWWW..'], 12);

  // Gembok (titik terkunci) — 8 x 9
  const LOCK_PAL = { k: '#120e1e', s: '#9a96b0', y: '#6a6680', h: '#b0acc4' };
  const LOCK = [
    '..ssss..',
    '.s....s.',
    '.s....s.',
    'kkkkkkkk',
    'khyyyyyk',
    'kyykkyyk',
    'kyykkyyk',
    'kyyyyyyk',
    'kkkkkkkk'
  ];

  // Panah penunjuk (titik aktif) — 7 x 5
  const ARROW_PAL = { G: '#ffd23f', k: '#8a5a00' };
  const ARROW = [
    'kkkkkkk',
    'kGGGGGk',
    '.kGGGk.',
    '..kGk..',
    '...k...'
  ];

  // Koin skor — 8 x 8
  const COIN_PAL = { k: '#8a5a00', G: '#ffd23f', Y: '#fff6b0', O: '#e0a020' };
  const COIN = [
    '..kkkk..',
    '.kGGGGk.',
    'kGYGGGOk',
    'kGYGkGOk',
    'kGYGkGOk',
    'kGGGGGOk',
    '.kOOOOk.',
    '..kkkk..'
  ];

  // Pohon kelapa — 12 x 15
  const PALM_PAL = {
    g: '#1d4630', G: '#2c6a43', l: '#4c9a5c',
    T: '#7a5434', t: '#58391f', k: 'rgba(0,0,0,0.35)'
  };
  const PALM = [
    '...gG..Gg...',
    '.gGlGggGlGg.',
    'gGl.gGGg.lGg',
    'Gl..gTTg..lG',
    'g....TT....g',
    '.....Tt.....',
    '.....tT.....',
    '....Tt......',
    '....tT......',
    '....Tt......',
    '....tT......',
    '.....Tt.....',
    '.....tT.....',
    '....kTtk....',
    '...kkkkkk...'
  ];

  // Obor (dengan api berkedip) — 7 x 14, 2 frame api
  const TORCH_PAL = { f: '#ff5a1f', F: '#ffb21f', y: '#fff2a6', k: '#2b1d12', b: '#5e4128' };
  const TORCH_BASE = [
    '.......', '.......', '.......',
    '.kkkkk.', '.kbbbk.', '..kbk..',
    '...b...', '...b...', '...b...', '...b...', '...b...', '...b...',
    '..kbk..', '.kkkkk.'
  ];
  const TORCH_A = padRows(['...f...', '..fFf..', '.fFyFf.'], 14);
  const TORCH_B = padRows(['....f..', '..ffF..', '.fFyFf.'], 14);

  // Semak — 10 x 5
  const BUSH_PAL = { b: '#1d4630', B: '#2c6a43', k: 'rgba(0,0,0,0.35)' };
  const BUSH = [
    '...bbbb...',
    '.bbBBbbbb.',
    'bbBBbbbBbb',
    'bbbbbbbbbb',
    '.kkkkkkkk.'
  ];

  // Bulan purnama — 12 x 12
  const MOON_PAL = { m: '#fff3c4', c: '#e0d29a' };
  const MOON = [
    '....mmmm....',
    '..mmmmmmmm..',
    '.mmmmmmmmmm.',
    '.mmcmmmmmmm.',
    'mmcccmmmmmmm',
    'mmmcmmmmcmmm',
    'mmmmmmmccmmm',
    'mmmmmmmmmmmm',
    '.mmmmcmmmmm.',
    '.mmmmmmmmmm.',
    '..mmmmmmmm..',
    '....mmmm....'
  ];

  // Awan malam — 24 x 6
  const CLOUD_PAL = { h: '#4d3c8c', c: '#3b2d72', d: '#2a2058' };
  const CLOUD = [
    '........hhhh............',
    '......cccccccc...ccc....',
    '...ccccccccccccccccccc..',
    '.ccccccccccccccccccccccc',
    'cccccccccccccccccccccccc',
    '.dddddddddddddddddddddd.'
  ];

  // Gerbang akhir: Candi Bentar (gapura terbelah) — 30 x 21
  const GATE_PAL = { d: '#5a2a1a', S: '#9a4f2e', g: '#ffd23f', t: '#7a7090' };
  const GATE_HALF = [
    '..........dd',
    '.........ddd',
    '........dSSd',
    '........dddd',
    '.......dSSSd',
    '......dddddd',
    '.....dSSSSSd',
    '....dddddddd',
    '....dSSSSSSd',
    '...ddddddddd',
    '...dSSSSSSSd',
    '..dddddddddd',
    '..dSSgSSSSSd',
    '..dSSSSSSSSd',
    '.ddddddddddd',
    '.dSSSSSSSSSd',
    '.dSSSSSSSSSd',
    'dddddddddddd',
    'dSSSSSSSSSSd',
    'dSSSSSSSSSSd',
    'dddddddddddd'
  ];
  const GATE = GATE_HALF.map((row, r) => {
    const gap = r === 20 ? 'tttttt' : r === 19 ? '.tttt.' : '......';
    return row + gap + row.split('').reverse().join('');
  });

  // Kalimat karakter saat disentuh
  const AVATAR_LINES = [
    'Ayo jelajahi Klungkung!',
    'Ketuk titik yang bersinar!',
    'Puputan = berjuang sampai akhir!',
    'Siap berpetualang?',
    'Ikuti jejak sejarah!'
  ];

  // ══════════════════════════════════════════════════════════
  //  HELPER PIXEL → SVG
  // ══════════════════════════════════════════════════════════

  function padRows(rows, h) {
    const w = rows[0].length;
    const out = rows.slice();
    while (out.length < h) out.push('.'.repeat(w));
    return out;
  }

  // Ubah baris karakter menjadi <rect>, menggabungkan pixel sewarna berderet
  function rectsFromRows(rows, pal, y0 = 0) {
    let out = '';
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      let x = 0;
      while (x < row.length) {
        const ch = row[x];
        const color = pal[ch];
        if (!color) { x++; continue; }
        let run = 1;
        while (x + run < row.length && row[x + run] === ch) run++;
        out += `<rect x="${x}" y="${y + y0}" width="${run}" height="1" fill="${color}"/>`;
        x += run;
      }
    }
    return out;
  }

  function svgWrap(w, h, scale, inner, cls = '') {
    return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" width="${w * scale}" height="${h * scale}" ` +
      `shape-rendering="crispEdges" aria-hidden="true" focusable="false">${inner}</svg>`;
  }

  function sprite(rows, pal, scale, cls = '') {
    return svgWrap(rows[0].length, rows.length, scale, rectsFromRows(rows, pal), cls);
  }

  function layered(layers, pal, scale, cls = '') {
    const w = layers[0].rows[0].length;
    const h = layers[0].rows.length;
    const inner = layers.map(l => `<g class="${l.cls || ''}">${rectsFromRows(l.rows, pal)}</g>`).join('');
    return svgWrap(w, h, scale, inner, cls);
  }

  function avatarSVG() {
    const body = AVATAR_BODY.map(r => r.replace(/E/g, 'B'));
    const eyes = AVATAR_BODY.map(r => r.replace(/[^E]/g, '.'));
    const inner =
      `<g>${rectsFromRows(body, AVATAR_PAL)}</g>` +
      `<g class="pm-eyes">${rectsFromRows(eyes, AVATAR_PAL)}</g>` +
      `<g class="pm-hem-a">${rectsFromRows(AVATAR_HEM_A, AVATAR_PAL, 18)}</g>` +
      `<g class="pm-hem-b">${rectsFromRows(AVATAR_HEM_B, AVATAR_PAL, 18)}</g>`;
    return svgWrap(16, 20, 3, inner, 'pm-avatar-svg');
  }

  // Cache SVG dekorasi agar tidak dibangun ulang tiap render
  const SVG = {};
  function cached(key, fn) { return SVG[key] || (SVG[key] = fn()); }
  const palmSVG = () => cached('palm', () => sprite(PALM, PALM_PAL, 3));
  const bushSVG = () => cached('bush', () => sprite(BUSH, BUSH_PAL, 3));
  const torchSVG = () => cached('torch', () => layered([
    { rows: TORCH_A, cls: 'f-a' }, { rows: TORCH_B, cls: 'f-b' }, { rows: TORCH_BASE }
  ], TORCH_PAL, 3));
  const flagSVG = () => cached('flag', () => layered([
    { rows: FLAG_POLE }, { rows: FLAG_A, cls: 'f-a' }, { rows: FLAG_B, cls: 'f-b' }
  ], FLAG_PAL, 3, 'pm-flag'));
  const lockSVG = () => cached('lock', () => sprite(LOCK, LOCK_PAL, 2, 'pm-lock'));
  const arrowSVG = () => cached('arrow', () => sprite(ARROW, ARROW_PAL, 3, 'pm-arrow'));
  const coinSVG = () => cached('coin', () => sprite(COIN, COIN_PAL, 2, 'pm-coin'));
  const gateSVG = () => cached('gate', () => sprite(GATE, GATE_PAL, 4, 'pm-gate-svg'));

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // PRNG ber-seed agar posisi bintang selalu sama
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ══════════════════════════════════════════════════════════
  //  LATAR MALAM (dibuat sekali, dipakai ulang)
  // ══════════════════════════════════════════════════════════

  function ensureScene() {
    const page = document.getElementById('page-levels');
    if (!page) return;
    let scene = page.querySelector(':scope > .pm-scene');
    if (!scene) {
      scene = document.createElement('div');
      scene.className = 'pm-scene';
      scene.setAttribute('aria-hidden', 'true');

      const rnd = mulberry32(1908); // tahun Puputan Klungkung
      let stars = '';
      for (let i = 0; i < 70; i++) {
        const x = (rnd() * 100).toFixed(2);
        const y = (rnd() * 62).toFixed(2);
        const big = rnd() < 0.18 ? ' big' : '';
        const tone = rnd() < 0.25 ? ' lilac' : '';
        const delay = (rnd() * 4).toFixed(2);
        const dur = (2 + rnd() * 3).toFixed(2);
        stars += `<i class="pm-star${big}${tone}" style="left:${x}%;top:${y}%;animation-delay:-${delay}s;animation-duration:${dur}s"></i>`;
      }
      let flies = '';
      for (let i = 0; i < 12; i++) {
        const x = (rnd() * 100).toFixed(2);
        const y = (55 + rnd() * 40).toFixed(2);
        const delay = (rnd() * 6).toFixed(2);
        flies += `<i class="pm-fly" style="left:${x}%;top:${y}%;animation-delay:-${delay}s,-${delay}s"></i>`;
      }
      const cloud = sprite(CLOUD, CLOUD_PAL, 6);
      scene.innerHTML =
        `<div class="pm-stars">${stars}</div>` +
        `<i class="pm-shoot"></i>` +
        `<div class="pm-moon">${sprite(MOON, MOON_PAL, 5)}</div>` +
        `<div class="pm-cloud c1">${cloud}</div>` +
        `<div class="pm-cloud c2">${cloud}</div>` +
        `<div class="pm-cloud c3">${cloud}</div>` +
        `<div class="pm-mountains"></div>` +
        `<div class="pm-flies">${flies}</div>`;
      page.prepend(scene);
    }
    drawMountains(scene);
  }

  function steppedPath(W, H, fn, step) {
    let d = `M0 ${H}`;
    for (let x = 0; x < W + step; x += step) {
      const h = Math.max(0, Math.round(fn(x) / step) * step);
      d += ` L${x} ${H - h} L${x + step} ${H - h}`;
    }
    return d + ` L${W + step} ${H} Z`;
  }

  function drawMountains(scene) {
    const holder = scene.querySelector('.pm-mountains');
    if (!holder) return;
    const W = Math.max(320, window.innerWidth);
    const H = Math.round(Math.min(260, Math.max(150, window.innerHeight * 0.3)));
    if (holder.dataset.size === `${W}x${H}`) return;
    holder.dataset.size = `${W}x${H}`;

    const step = 6;
    // Gunung Agung (kanan) & Gunung Batur (kiri)
    const far = x => {
      const agung = H * 0.92 * (1 - Math.abs(x - W * 0.72) / (W * 0.38));
      const batur = H * 0.58 * (1 - Math.abs(x - W * 0.18) / (W * 0.24));
      return Math.max(H * 0.3 + Math.sin(x / 41) * 6, Math.min(agung, H * 0.86), batur);
    };
    const midFn = x => H * 0.32 + Math.sin(x / 63) * H * 0.07 + Math.sin(x / 23 + 2) * H * 0.03;
    const nearFn = x => H * 0.16 + Math.sin(x / 90 + 1) * H * 0.05;

    // Siluet meru (pura bertingkat) di bukit depan
    let merus = '';
    [0.1, 0.34, 0.58, 0.88].forEach((fx, idx) => {
      const cx = Math.round(W * fx / 2) * 2;
      const base = H - Math.round(nearFn(cx) / step) * step;
      const tiers = idx % 2 === 0 ? 4 : 3;
      let y = base;
      for (let t = 0; t < tiers; t++) {
        const w = 22 - t * 5;
        merus += `<rect x="${cx - w / 2}" y="${y - 6}" width="${w}" height="3"/>` +
                 `<rect x="${cx - 3}" y="${y - 3}" width="6" height="3"/>`;
        y -= 6;
      }
      merus += `<rect x="${cx - 1}" y="${y - 6}" width="2" height="6"/>`;
    });

    holder.innerHTML =
      `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">` +
      `<path d="${steppedPath(W, H, far, step)}" fill="#22194d"/>` +
      `<path d="${steppedPath(W, H, midFn, step)}" fill="#18123a"/>` +
      `<path d="${steppedPath(W, H, nearFn, step)}" fill="#100c28"/>` +
      `<g fill="#100c28">${merus}</g></svg>`;
  }

  // ══════════════════════════════════════════════════════════
  //  STATE RENDER
  // ══════════════════════════════════════════════════════════

  let ctx = null;
  let resizeBound = false;

  function loadAvatar() {
    try {
      const v = localStorage.getItem(AVATAR_KEY);
      if (v === null) return null;
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? n : null;
    } catch (e) { return null; }
  }
  function saveAvatar(idx) {
    try { localStorage.setItem(AVATAR_KEY, String(idx)); } catch (e) { /* abaikan */ }
  }
  function resetAvatar() {
    try { localStorage.removeItem(AVATAR_KEY); } catch (e) { /* abaikan */ }
  }

  function isVisible() {
    const pg = document.getElementById('page-levels');
    return !!pg && pg.classList.contains('active') && pg.style.display !== 'none';
  }

  function teardown() {
    if (!ctx) return;
    cancelAnimationFrame(ctx.rafId);
    ctx.timers.forEach(t => clearTimeout(t));
    clearTimeout(ctx.bubbleT);
    document.documentElement.style.scrollBehavior = '';
    ctx = null;
  }

  function splitTitle(t) {
    const i = t.indexOf(':');
    if (i <= 0) return [t, ''];
    return [t.slice(0, i).trim(), t.slice(i + 1).trim().replace(/^["“]|["”]$/g, '')];
  }

  // ══════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════

  function render(container, opts) {
    teardown();
    ensureScene();

    const levels = opts.levels;
    const n = levels.length;
    const completed = new Set(opts.completed || []);
    const frontier = Math.min(n - 1, Math.max(0, opts.unlockedUpTo || 0));
    const allDone = levels.every(l => completed.has(l.id));
    const target = allDone ? n : frontier;
    const scores = opts.postTestScores || {};

    const statusOf = i => completed.has(levels[i].id) ? 'completed' : (i <= frontier ? 'active' : 'locked');
    const doneCount = levels.filter(l => completed.has(l.id)).length;

    const segs = levels.map(l => `<i class="pm-seg${completed.has(l.id) ? ' on' : ''}"></i>`).join('');

    const nodesHTML = levels.map((l, i) => {
      const st = statusOf(i);
      const cur = i === frontier && st === 'active';
      return `<div class="pm-node is-${st}${cur ? ' is-current' : ''}" data-idx="${i}">` +
        `<span class="pm-glow"></span>` +
        `<span class="pm-pad-wrap"><span class="pm-pad"></span></span>` +
        (st === 'completed' ? flagSVG() : '') +
        (st === 'locked' ? lockSVG() : '') +
        (cur ? arrowSVG() : '') +
        `</div>`;
    }).join('');

    const cardsHTML = levels.map((l, i) => {
      const st = statusOf(i);
      const cur = i === frontier && st === 'active';
      const [title, sub] = splitTitle(l.title);
      const chip = st === 'completed' ? '<span class="pm-chip ok">SELESAI</span>'
        : st === 'locked' ? '<span class="pm-chip lock">TERKUNCI</span>'
        : '<span class="pm-chip go">MAIN!</span>';
      const tag = l.hasGPS ? '<span class="pm-tag">GPS</span>' : '<span class="pm-tag prolog">PROLOG</span>';
      const sc = (st === 'completed' && scores[l.id] !== undefined)
        ? `<span class="pm-tag score">★ ${scores[l.id]} POIN</span>` : '';
      return `<button type="button" class="pm-card is-${st}${cur ? ' is-current' : ''}" data-idx="${i}" ` +
        `aria-label="Level ${l.id}: ${esc(title)}${st === 'locked' ? ' (terkunci)' : ''}">` +
        `<span class="pm-card-top"><span class="pm-card-level">LEVEL ${l.id}</span>${chip}</span>` +
        `<span class="pm-card-title">${esc(title)}</span>` +
        (sub ? `<span class="pm-card-sub">${esc(sub)}</span>` : '') +
        `<span class="pm-card-meta">${tag}${sc}</span>` +
        `</button>`;
    }).join('');

    container.innerHTML = `
      <div class="pm-wrap">
        <header class="pm-header">
          <div class="pm-kicker">◆ JEJAK PUPUTAN KLUNGKUNG ◆</div>
          <h2 class="pm-title">PETA PERJALANAN</h2>
          <div class="pm-hud">
            <div class="pm-hud-box pm-hud-score">${coinSVG()}<span class="pm-hud-num">${opts.score || 0}</span><span class="pm-hud-unit">POIN</span></div>
            <div class="pm-hud-box pm-hud-prog">
              <span class="pm-hud-label">LEVEL ${doneCount}/${n}</span>
              <div class="pm-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${doneCount}">${segs}</div>
            </div>
          </div>
          <p class="pm-hint"><span class="pm-blink">▶</span> Ketuk titik lokasi, karakter akan berjalan ke sana</p>
        </header>
        <div class="pm-board">
          <svg class="pm-road-svg" aria-hidden="true" shape-rendering="crispEdges"></svg>
          <div class="pm-deco"></div>
          <div class="pm-sign"><span>MULAI</span></div>
          ${nodesHTML}
          ${cardsHTML}
          <div class="pm-gate ${allDone ? 'is-open' : 'is-closed'}" role="button" tabindex="0"
               aria-label="${allDone ? 'Gerbang kemenangan' : 'Gerbang akhir (terkunci)'}">${gateSVG()}</div>
          <div class="pm-gate-label">${allDone ? '★ GERBANG KEMENANGAN ★' : 'SELESAIKAN SEMUA LEVEL'}</div>
          <div class="pm-avatar" title="Ketuk aku!">
            <div class="pm-shadow"></div>
            <div class="pm-avatar-flip">${avatarSVG()}</div>
            <div class="pm-bubble"></div>
          </div>
        </div>
      </div>`;

    const board = container.querySelector('.pm-board');

    // Posisi awal karakter
    const saved = loadAvatar();
    let startIdx = saved === null ? START : Math.max(START, Math.min(n, saved));
    if (startIdx > target) startIdx = target;

    ctx = {
      opts, levels, n, frontier, allDone, target, statusOf,
      board,
      svg: board.querySelector('.pm-road-svg'),
      deco: board.querySelector('.pm-deco'),
      sign: board.querySelector('.pm-sign'),
      nodes: Array.from(board.querySelectorAll('.pm-node')),
      cards: Array.from(board.querySelectorAll('.pm-card')),
      gate: board.querySelector('.pm-gate'),
      gateLabel: board.querySelector('.pm-gate-label'),
      avatar: board.querySelector('.pm-avatar'),
      bubble: board.querySelector('.pm-bubble'),
      geo: null,
      avatarIdx: startIdx,
      av: { x: 0, y: 0 },
      walking: false,
      rafId: 0,
      timers: [],
      bubbleT: 0,
      lineIdx: 0,
      needsLayout: false
    };

    board.addEventListener('click', onBoardClick);
    ctx.gate.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGate(); }
    });

    if (!resizeBound) {
      resizeBound = true;
      let t = 0;
      window.addEventListener('resize', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          const scene = document.querySelector('#page-levels > .pm-scene');
          if (scene) drawMountains(scene);
          if (!ctx) return;
          if (ctx.walking) { ctx.needsLayout = true; return; }
          layout();
        }, 150);
      });
    }

    // Halaman mungkin belum terlihat saat render → tunggu sampai punya lebar
    const myCtx = ctx;
    const tryLayout = (tries = 0) => {
      if (ctx !== myCtx) return;
      if (layout()) afterFirstLayout();
      else if (tries < 40) requestAnimationFrame(() => tryLayout(tries + 1));
    };
    requestAnimationFrame(() => tryLayout());
  }

  // ══════════════════════════════════════════════════════════
  //  GEOMETRI & LAYOUT
  // ══════════════════════════════════════════════════════════

  function computeGeo(W, n) {
    const xL = Math.round(Math.max(56, W * 0.2));
    const xR = W - xL;
    const pts = [];
    for (let i = 0; i < n; i++) {
      pts.push({ x: i % 2 === 0 ? xL : xR, y: TOP_PAD + i * ROW_GAP, side: i % 2 === 0 ? 'L' : 'R' });
    }
    const start = { x: xL, y: START_Y };
    const finish = { x: Math.round(W / 2), y: pts[n - 1].y + 190 };
    return { W, xL, xR, pts, start, finish, H: finish.y + 60 };
  }

  function pointOf(idx) {
    const g = ctx.geo;
    if (idx === START) return g.start;
    if (idx >= ctx.n) return g.finish;
    return g.pts[idx];
  }

  // Jalur berbentuk siku (seperti game RPG): turun → menyamping → turun
  function segment(a, b) {
    const pa = pointOf(a), pb = pointOf(b);
    if (pa.x === pb.x) return [{ x: pb.x, y: pb.y }];
    const my = Math.round((pa.y + pb.y) / 2);
    return [{ x: pa.x, y: my }, { x: pb.x, y: my }, { x: pb.x, y: pb.y }];
  }

  function buildRoute(from, to) {
    const pts = [];
    if (from === to) return pts;
    const dir = to > from ? 1 : -1;
    for (let i = from; i !== to; i += dir) pts.push(...segment(i, i + dir));
    return pts;
  }

  function pathD(points) {
    return points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
  }

  function decoAt(type, x, y) {
    const svg = type === 'palm' ? palmSVG() : type === 'torch' ? torchSVG() : bushSVG();
    return `<div class="pm-d pm-d-${type}" style="left:${Math.round(x)}px;top:${Math.round(y)}px">${svg}</div>`;
  }

  function layout() {
    const c = ctx;
    if (!c) return false;
    const W = c.board.clientWidth;
    if (!W) return false;

    const g = computeGeo(W, c.n);
    c.geo = g;
    c.board.style.height = g.H + 'px';

    // Titik lokasi
    c.nodes.forEach((el, i) => {
      el.style.left = g.pts[i].x + 'px';
      el.style.top = g.pts[i].y + 'px';
    });

    // Kartu info di sisi dalam
    const gap = 38, edge = 10;
    c.cards.forEach((el, i) => {
      const p = g.pts[i];
      if (p.side === 'L') {
        el.style.left = (p.x + gap) + 'px';
        el.style.width = (W - p.x - gap - edge) + 'px';
      } else {
        el.style.left = edge + 'px';
        el.style.width = (p.x - gap - edge) + 'px';
      }
      el.style.top = p.y + 'px';
    });

    // Jalan setapak
    const full = [g.start];
    for (let i = START; i < c.n; i++) full.push(...segment(i, i + 1));
    const done = [g.start];
    for (let i = START; i < c.target; i++) done.push(...segment(i, i + 1));
    c.svg.setAttribute('width', W);
    c.svg.setAttribute('height', g.H);
    c.svg.setAttribute('viewBox', `0 0 ${W} ${g.H}`);
    const dFull = pathD(full);
    c.svg.innerHTML =
      `<path class="pm-road-edge" d="${dFull}"/>` +
      `<path class="pm-road" d="${dFull}"/>` +
      `<path class="pm-road-pebbles" d="${dFull}"/>` +
      (done.length > 1 ? `<path class="pm-road-gold" d="${pathD(done)}"/>` : '');

    // Dekorasi di sisi luar jalan
    let deco = '';
    const lx = Math.max(22, Math.round(g.xL / 2) - 4);
    const rx = W - lx;
    for (let i = 0; i < c.n - 1; i++) {
      const my = Math.round((g.pts[i].y + g.pts[i + 1].y) / 2);
      const leftPalm = i % 2 === 0;
      deco += decoAt(leftPalm ? 'palm' : 'torch', lx, my + 22);
      deco += decoAt(leftPalm ? 'torch' : 'palm', rx, my + 22);
    }
    deco += decoAt('torch', Math.max(16, g.start.x - 30), g.start.y + 14);
    deco += decoAt('bush', g.finish.x - 90, g.finish.y + 12);
    deco += decoAt('bush', g.finish.x + 90, g.finish.y + 12);
    c.deco.innerHTML = deco;

    // Papan MULAI, gerbang akhir
    c.sign.style.left = (g.start.x + 24) + 'px';
    c.sign.style.top = (g.start.y - 34) + 'px';
    c.gate.style.left = g.finish.x + 'px';
    c.gate.style.top = g.finish.y + 'px';
    c.gateLabel.style.top = (g.finish.y + 22) + 'px';

    // Karakter
    const p = pointOf(c.avatarIdx);
    setAvatarXY(p.x, p.y);
    updateMarks();
    return true;
  }

  function setAvatarXY(x, y) {
    const c = ctx;
    c.av.x = x; c.av.y = y;
    c.avatar.style.transform = `translate3d(${Math.round(x - 24)}px, ${Math.round(y - 57)}px, 0)`;
    const W = c.geo ? c.geo.W : 0;
    c.avatar.classList.toggle('edge-left', x < 110);
    c.avatar.classList.toggle('edge-right', W > 0 && x > W - 110);
  }

  function updateMarks() {
    const c = ctx;
    c.nodes.forEach((el, i) => el.classList.toggle('has-avatar', i === c.avatarIdx && !c.walking));
  }

  function afterFirstLayout() {
    const c = ctx;
    try { window.scrollTo(0, 0); } catch (e) { /* abaikan */ }
    if (c.avatarIdx !== c.target) {
      // Baru menyelesaikan level → karakter berjalan sendiri ke titik berikutnya
      c.timers.push(setTimeout(() => {
        if (ctx === c && !c.walking && isVisible()) walkTo(c.target, null, true);
      }, 700));
    } else {
      c.timers.push(setTimeout(() => {
        if (ctx !== c || !isVisible()) return;
        const r = c.avatar.getBoundingClientRect();
        if (r.bottom > window.innerHeight - 40) {
          c.avatar.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        }
        say(c.allDone ? 'Gerbang sudah terbuka!' : 'Ayo lanjut!', 1600);
      }, 500));
    }
  }

  // ══════════════════════════════════════════════════════════
  //  INTERAKSI
  // ══════════════════════════════════════════════════════════

  function onBoardClick(e) {
    if (!ctx) return;
    const item = e.target.closest('.pm-card, .pm-node');
    if (item) { handleSelect(parseInt(item.dataset.idx, 10)); return; }
    if (e.target.closest('.pm-gate')) { handleGate(); return; }
    if (e.target.closest('.pm-avatar')) handleAvatarTap();
  }

  function handleSelect(i) {
    const c = ctx;
    if (c.walking) return;
    if (c.statusOf(i) === 'locked') {
      const card = c.cards[i];
      card.classList.remove('pm-shake'); void card.offsetWidth; card.classList.add('pm-shake');
      if (c.opts.onLocked) c.opts.onLocked('🔒 Selesaikan level sebelumnya dulu!');
      say('Masih terkunci...', 1200);
      return;
    }
    const levelId = c.levels[i].id;
    walkTo(i, () => c.opts.onSelect && c.opts.onSelect(levelId), false);
  }

  function handleGate() {
    const c = ctx;
    if (c.walking) return;
    if (!c.allDone) {
      c.gate.classList.remove('pm-shake'); void c.gate.offsetWidth; c.gate.classList.add('pm-shake');
      if (c.opts.onLocked) c.opts.onLocked('🔒 Selesaikan semua level untuk membuka gerbang!');
      return;
    }
    walkTo(c.n, () => c.opts.onFinish && c.opts.onFinish(), false);
  }

  function handleAvatarTap() {
    const c = ctx;
    if (c.walking) return;
    c.avatar.classList.remove('jump'); void c.avatar.offsetWidth; c.avatar.classList.add('jump');
    say(AVATAR_LINES[c.lineIdx++ % AVATAR_LINES.length], 1800);
  }

  function say(text, ms = 1400) {
    const c = ctx;
    if (!c) return;
    const b = c.bubble;
    b.textContent = text;
    b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    clearTimeout(c.bubbleT);
    c.bubbleT = setTimeout(() => b.classList.remove('show'), ms);
  }

  function spawnDust(x, y) {
    const d = document.createElement('i');
    d.className = 'pm-dust';
    d.style.left = Math.round(x) + 'px';
    d.style.top = Math.round(y + 2) + 'px';
    d.addEventListener('animationend', () => d.remove());
    ctx.board.appendChild(d);
  }

  // Kamera mengikuti karakter saat berjalan
  function follow() {
    const r = ctx.board.getBoundingClientRect();
    const screenY = r.top + ctx.av.y - 30;
    const diff = screenY - window.innerHeight * 0.55;
    if (Math.abs(diff) > 4) window.scrollBy(0, diff * 0.12);
  }

  function arrive(target, cb, auto) {
    const c = ctx;
    const text = target >= c.n ? 'Gerbang terbuka!'
      : auto ? `Level ${c.levels[target].id}!` : '!';
    say(text, auto ? 1500 : 700);
    if (cb) c.timers.push(setTimeout(() => { if (ctx === c) cb(); }, reduceMotion ? 150 : 520));
  }

  function walkTo(target, cb, auto) {
    const c = ctx;
    const route = buildRoute(c.avatarIdx, target);

    const finish = (runCb) => {
      c.walking = false;
      c.avatar.classList.remove('walking', 'step');
      c.board.classList.remove('is-walking');
      document.documentElement.style.scrollBehavior = '';
      c.avatarIdx = target;
      saveAvatar(target);
      if (c.needsLayout) { c.needsLayout = false; layout(); }
      const p = pointOf(target);
      setAvatarXY(p.x, p.y);
      updateMarks();
      if (runCb) arrive(target, cb, auto);
    };

    if (!route.length || reduceMotion) { finish(true); return; }

    let total = 0;
    let px = c.av.x, py = c.av.y;
    route.forEach(p => { total += Math.abs(p.x - px) + Math.abs(p.y - py); px = p.x; py = p.y; });
    const speed = Math.max(SPEED, total / (MAX_WALK_MS / 1000));

    c.walking = true;
    c.avatar.classList.add('walking');
    c.board.classList.add('is-walking');
    c.bubble.classList.remove('show');
    updateMarks();
    document.documentElement.style.scrollBehavior = 'auto';

    let seg = 0, last = 0, stepT = 0, stepOn = false;
    const frame = (now) => {
      if (ctx !== c) return;
      if (!isVisible()) { finish(false); return; }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      let move = speed * dt;
      while (move > 0 && seg < route.length) {
        const t = route[seg];
        const dx = t.x - c.av.x, dy = t.y - c.av.y;
        const dist = Math.abs(dx) + Math.abs(dy);
        if (dx !== 0) c.avatar.classList.toggle('face-left', dx < 0);
        if (dist <= move) {
          c.av.x = t.x; c.av.y = t.y; move -= dist; seg++;
        } else {
          if (dx !== 0) c.av.x += Math.sign(dx) * move;
          else c.av.y += Math.sign(dy) * move;
          move = 0;
        }
      }
      setAvatarXY(c.av.x, c.av.y);

      stepT += dt * 1000;
      if (stepT >= STEP_MS) {
        stepT = 0;
        stepOn = !stepOn;
        c.avatar.classList.toggle('step', stepOn);
        if (stepOn) spawnDust(c.av.x, c.av.y);
      }
      follow();

      if (seg >= route.length) { finish(true); return; }
      c.rafId = requestAnimationFrame(frame);
    };
    c.rafId = requestAnimationFrame(frame);
  }

  return { render, resetAvatar };
})();
