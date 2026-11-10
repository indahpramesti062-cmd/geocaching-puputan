// ============================================================
// pixelmap.js — Peta Perjalanan bergaya Pixel Art (Page 2)
// - Papan rumput siang dengan jalan setapak berliku
// - Anak petualang (pemain) berjalan ke setiap titik lokasi
// - Sang Penjaga (NPC berjubah) berdiri di dekat papan MULAI
// Sprite & latar diambil dari js/pixelkit.js
// ============================================================

const PixelMap = (() => {
  'use strict';

  const AVATAR_KEY = 'geocaching_puputan_avatar';
  const START = -1;          // indeks titik "MULAI"
  const ROW_GAP = 170;       // jarak vertikal antar titik lokasi (px)
  const TOP_PAD = 170;       // posisi y titik pertama
  const START_Y = 74;        // posisi y titik MULAI
  const SPEED = 165;         // kecepatan jalan (px/detik)
  const MAX_WALK_MS = 5200;  // batas durasi jalan jauh
  const STEP_MS = 150;       // ganti frame langkah
  const AV_W = 48, AV_H = 72;
  const reduceMotion = !!(window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const PLAYER_LINES = [
    'Ayo jelajahi Klungkung!',
    'Ketuk titik yang bersinar!',
    'Siap berpetualang!',
    'Ikuti jejak sejarah!'
  ];
  const GUIDE_LINES = [
    'Om Swastyastu! Aku Sang Penjaga.',
    'Ketuk titik hijau untuk mulai.',
    'Bendera Merah Putih = level selesai.',
    'Gerbang terbuka jika semua selesai.',
    'Puputan artinya berjuang sampai akhir.'
  ];

  const K = () => PixelKit;

  // ══════════════════════════════════════════════════════════
  //  STATE
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
    clearTimeout(ctx.guideT);
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
    const esc = K().esc;

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
        (st === 'completed' ? K().objectSVG('flag', 3, 'pm-flag') : '') +
        (st === 'locked' ? K().objectSVG('lock', 2, 'pm-lock') : '') +
        (cur ? K().objectSVG('arrow', 3, 'pm-arrow') : '') +
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
            <div class="pm-hud-box pm-hud-score">${K().icon('coin', 2, 'pm-coin')}<span class="pm-hud-num">${opts.score || 0}</span><span class="pm-hud-unit">POIN</span></div>
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
          <div class="pm-guide" title="Sang Penjaga">${K().guideSVG(3, 'px-float')}<div class="pm-bubble pm-guide-bubble"></div></div>
          ${nodesHTML}
          ${cardsHTML}
          <div class="pm-gate ${allDone ? 'is-open' : 'is-closed'}" role="button" tabindex="0"
               aria-label="${allDone ? 'Gerbang kemenangan' : 'Gerbang akhir (terkunci)'}">${K().objectSVG('gate', 4, 'pm-gate-svg')}</div>
          <div class="pm-gate-label">${allDone ? '★ GERBANG KEMENANGAN ★' : 'SELESAIKAN SEMUA LEVEL'}</div>
          <div class="pm-avatar" title="Ketuk aku!">
            <div class="pm-shadow"></div>
            <div class="pm-avatar-flip">${K().playerSVG(3, 'pm-avatar-svg')}</div>
            <div class="pm-bubble pm-player-bubble"></div>
          </div>
        </div>
      </div>`;

    const board = container.querySelector('.pm-board');

    const saved = loadAvatar();
    let startIdx = saved === null ? START : Math.max(START, Math.min(n, saved));
    if (startIdx > target) startIdx = target;

    ctx = {
      opts, levels, n, frontier, allDone, target, statusOf,
      board,
      svg: board.querySelector('.pm-road-svg'),
      deco: board.querySelector('.pm-deco'),
      sign: board.querySelector('.pm-sign'),
      guide: board.querySelector('.pm-guide'),
      guideBubble: board.querySelector('.pm-guide-bubble'),
      nodes: Array.from(board.querySelectorAll('.pm-node')),
      cards: Array.from(board.querySelectorAll('.pm-card')),
      gate: board.querySelector('.pm-gate'),
      gateLabel: board.querySelector('.pm-gate-label'),
      avatar: board.querySelector('.pm-avatar'),
      bubble: board.querySelector('.pm-player-bubble'),
      geo: null,
      avatarIdx: startIdx,
      av: { x: 0, y: 0 },
      walking: false,
      rafId: 0,
      timers: [],
      bubbleT: 0,
      guideT: 0,
      lineIdx: 0,
      guideIdx: 0,
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
          if (!ctx) return;
          if (ctx.walking) { ctx.needsLayout = true; return; }
          layout();
        }, 150);
      });
    }

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
    const finish = { x: Math.round(W / 2), y: pts[n - 1].y + 200 };
    return { W, xL, xR, pts, start, finish, H: finish.y + 60 };
  }

  function pointOf(idx) {
    const g = ctx.geo;
    if (idx === START) return g.start;
    if (idx >= ctx.n) return g.finish;
    return g.pts[idx];
  }

  // Jalur siku ala game RPG: turun → menyamping → turun
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
    return `<div class="pm-d pm-d-${type}" style="left:${Math.round(x)}px;top:${Math.round(y)}px">${K().objectSVG(type, 3)}</div>`;
  }

  function layout() {
    const c = ctx;
    if (!c) return false;
    const W = c.board.clientWidth;
    if (!W) return false;

    const g = computeGeo(W, c.n);
    c.geo = g;
    c.board.style.height = g.H + 'px';

    c.nodes.forEach((el, i) => {
      el.style.left = g.pts[i].x + 'px';
      el.style.top = g.pts[i].y + 'px';
    });

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
      (done.length > 1 ? `<path class="pm-road-trail" d="${pathD(done)}"/>` : '');

    // Dekorasi di sisi luar jalan
    let deco = '';
    const lx = Math.max(22, Math.round(g.xL / 2) - 4);
    const rx = W - lx;
    const kinds = [['palm', 'tree'], ['tree', 'bush'], ['bush', 'palm'], ['palm', 'flower'], ['tree', 'palm'], ['flower', 'tree']];
    for (let i = 0; i < c.n - 1; i++) {
      const my = Math.round((g.pts[i].y + g.pts[i + 1].y) / 2);
      const [a, b] = kinds[i % kinds.length];
      deco += decoAt(a, lx, my + 22);
      deco += decoAt(b, rx, my + 22);
    }
    deco += decoAt('flower', Math.max(16, g.start.x - 32), g.start.y + 12);
    deco += decoAt('bush', g.finish.x - 92, g.finish.y + 12);
    deco += decoAt('bush', g.finish.x + 92, g.finish.y + 12);
    c.deco.innerHTML = deco;

    // Papan MULAI, Sang Penjaga, gerbang akhir
    c.sign.style.left = (g.start.x + 24) + 'px';
    c.sign.style.top = (g.start.y - 40) + 'px';
    c.guide.style.left = Math.min(W - 40, g.start.x + 130) + 'px';
    c.guide.style.top = (g.start.y + 6) + 'px';
    c.gate.style.left = g.finish.x + 'px';
    c.gate.style.top = g.finish.y + 'px';
    c.gateLabel.style.top = (g.finish.y + 22) + 'px';

    const p = pointOf(c.avatarIdx);
    setAvatarXY(p.x, p.y);
    updateMarks();
    return true;
  }

  function setAvatarXY(x, y) {
    const c = ctx;
    c.av.x = x; c.av.y = y;
    c.avatar.style.transform = `translate3d(${Math.round(x - AV_W / 2)}px, ${Math.round(y - AV_H + 3)}px, 0)`;
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
      if (c.avatarIdx === START) guideSay('Selamat datang! Ayo mulai dari Prolog.', 2600);
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
    if (e.target.closest('.pm-guide')) { handleGuideTap(); return; }
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
    say(PLAYER_LINES[c.lineIdx++ % PLAYER_LINES.length], 1800);
  }

  function handleGuideTap() {
    const c = ctx;
    guideSay(GUIDE_LINES[c.guideIdx++ % GUIDE_LINES.length], 2600);
  }

  function popBubble(b, text, ms, timerKey) {
    const c = ctx;
    if (!c) return;
    b.textContent = text;
    b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
    clearTimeout(c[timerKey]);
    c[timerKey] = setTimeout(() => b.classList.remove('show'), ms);
  }
  function say(text, ms = 1400) { if (ctx) popBubble(ctx.bubble, text, ms, 'bubbleT'); }
  function guideSay(text, ms = 2000) { if (ctx) popBubble(ctx.guideBubble, text, ms, 'guideT'); }

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
    const screenY = r.top + ctx.av.y - 36;
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
