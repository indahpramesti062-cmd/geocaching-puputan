// ============================================================
// pixelkit.js — Perangkat Pixel Art bersama
// - Sprite: anak petualang (pemain), Sang Penjaga (NPC berjubah),
//   ikon, peti harta, piala, pohon, dll. (semua digambar dari data
//   pixel, tanpa file gambar)
// - Latar pemandangan pixel: siang & senja
// - Kotak dialog NPC dengan efek mengetik
// ============================================================

const PixelKit = (() => {
  'use strict';

  // ══════════════════════════════════════════════════════════
  //  HELPER PIXEL → SVG
  // ══════════════════════════════════════════════════════════

  function padRows(rows, h) {
    const w = rows[0].length;
    const out = rows.slice();
    while (out.length < h) out.push('.'.repeat(w));
    return out;
  }

  // Baris karakter → <rect>; pixel sewarna yang berderet digabung
  function rects(rows, pal, y0 = 0) {
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

  // Versi tanpa warna (warna diatur lewat CSS pada <g>)
  function rectsMono(rows, ch, y0 = 0) {
    let out = '';
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      let x = 0;
      while (x < row.length) {
        if (row[x] !== ch) { x++; continue; }
        let run = 1;
        while (x + run < row.length && row[x + run] === ch) run++;
        out += `<rect x="${x}" y="${y + y0}" width="${run}" height="1"/>`;
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
    return svgWrap(rows[0].length, rows.length, scale, rects(rows, pal), cls);
  }

  function layered(layers, pal, scale, cls = '') {
    const w = layers[0].rows[0].length;
    const h = layers[0].rows.length;
    const inner = layers.map(l => `<g class="${l.cls || ''}">${rects(l.rows, pal)}</g>`).join('');
    return svgWrap(w, h, scale, inner, cls);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ══════════════════════════════════════════════════════════
  //  PEMAIN: ANAK PETUALANG (16 x 24)
  // ══════════════════════════════════════════════════════════
  const PLAYER_PAL = {
    k: '#2a1a12', h: '#5a3418', H: '#7a4a24', s: '#f2c29a', S: '#e0a07a',
    m: '#b0584a', j: '#4f8a3c', J: '#356a28', g: '#74ad52', b: '#3a3a44',
    p: '#cdb68c', P: '#a68c62', o: '#6a4226', O: '#4a2c16'
  };
  const PLAYER_TOP = [
    '....kkkkkkkk....',
    '...khHHhhhhhk...',
    '..khHhhhhhhhhk..',
    '..khhhhhhhhhhk..',
    '..khhshhhshhhk..',
    '..khsssssssshk..',
    '..kssksssskssk..',
    '..kssksssskssk..',
    '..ksSssmmssSsk..',
    '...kssssssssk...',
    '....kjjssjjk....',
    '..kjjbjjjjbjjk..',
    '.kjjjbjjjjbjjjk.',
    '.kjgjbjjjjbjgjk.',
    '.kjgjjjJJjjjgjk.',
    '.ksjjjjJJjjjjsk.',
    '..kJJJJJJJJJJk..',
    '..kppppppppppk..',
    '..kpppPkkPpppk..'
  ];
  const LEGS_IDLE = [
    '..kppPk..kPppk..',
    '..kppPk..kPppk..',
    '..kooOk..kOook..',
    '.koooOk..kOoook.',
    '.kkkkkk..kkkkkk.'
  ];
  const LEGS_A = [
    '..kppPk..kPppk..',
    '..kooOk..kPppk..',
    '.koooOk..kOook..',
    '.kkkkkk..kOoook.',
    '.........kkkkkk.'
  ];
  const LEGS_B = [
    '..kppPk..kPppk..',
    '..kppPk..kOook..',
    '..kooOk..kOoook.',
    '.koooOk..kkkkkk.',
    '.kkkkkk.........'
  ];

  function playerSVG(scale = 3, cls = '') {
    const inner =
      `<g>${rects(PLAYER_TOP, PLAYER_PAL)}</g>` +
      `<g class="legs-idle">${rects(LEGS_IDLE, PLAYER_PAL, 19)}</g>` +
      `<g class="legs-a">${rects(LEGS_A, PLAYER_PAL, 19)}</g>` +
      `<g class="legs-b">${rects(LEGS_B, PLAYER_PAL, 19)}</g>`;
    return svgWrap(16, 24, scale, inner, `px-player ${cls}`);
  }

  // ══════════════════════════════════════════════════════════
  //  NPC: SANG PENJAGA BERJUBAH UNGU (16 x 20)
  // ══════════════════════════════════════════════════════════
  const GUIDE_PAL = {
    K: '#1a0b2e', D: '#3b1d66', P: '#6237a8', L: '#8b5fd3',
    H: '#b896f2', B: '#07040f', E: '#ff5cf4', G: '#ffd23f'
  };
  const GUIDE_BODY = [
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
  const GUIDE_HEM_A = ['KDDDDDDDDDDDDDDK', '.KKKK.KKKKK.KKK.'];
  const GUIDE_HEM_B = ['KDDDDDDDDDDDDDDK', 'KKK.KKKKK.KKKK..'];

  function guideSVG(scale = 3, cls = '') {
    const body = GUIDE_BODY.map(r => r.replace(/E/g, 'B'));
    const eyes = GUIDE_BODY.map(r => r.replace(/[^E]/g, '.'));
    const inner =
      `<g>${rects(body, GUIDE_PAL)}</g>` +
      `<g class="px-eyes">${rects(eyes, GUIDE_PAL)}</g>` +
      `<g class="hem-a">${rects(GUIDE_HEM_A, GUIDE_PAL, 18)}</g>` +
      `<g class="hem-b">${rects(GUIDE_HEM_B, GUIDE_PAL, 18)}</g>`;
    return svgWrap(16, 20, scale, inner, `px-guide ${cls}`);
  }

  function portrait(who) {
    if (who === 'player') {
      return svgWrap(16, 13, 4, rects(PLAYER_TOP.slice(0, 13), PLAYER_PAL), 'px-portrait-svg');
    }
    const top = GUIDE_BODY.slice(0, 12);
    const body = top.map(r => r.replace(/E/g, 'B'));
    const eyes = top.map(r => r.replace(/[^E]/g, '.'));
    return svgWrap(16, 12, 4,
      `<g>${rects(body, GUIDE_PAL)}</g><g class="px-eyes">${rects(eyes, GUIDE_PAL)}</g>`,
      'px-portrait-svg');
  }

  // ══════════════════════════════════════════════════════════
  //  IKON (dipakai di tombol & teks)
  // ══════════════════════════════════════════════════════════
  const ICON_PAL = {
    k: '#1b1e2b', w: '#ffffff', y: '#ffd23f', o: '#f08a24', r: '#e0503c',
    g: '#5cc04a', G: '#2f7a2a', b: '#4a9ae0', B: '#2a5a9a', n: '#a0683a',
    N: '#6e4220', p: '#f6e6c0', s: '#c8ccd8', S: '#7a8090', u: '#b04ae0'
  };
  const ICONS = {
    back: [
      '...k....', '..kwk...', '.kwwkkkk', 'kwwwwwwk', '.kwwkkkk', '..kwk...', '...k....'
    ],
    next: [
      '....k...', '...kwk..', 'kkkkwwk.', 'kwwwwwwk', 'kkkkwwk.', '...kwk..', '....k...'
    ],
    play: [
      'kk.....', 'kwk....', 'kwwk...', 'kwwwk..', 'kwwwk..', 'kwwk...', 'kwk....', 'kk.....'
    ],
    search: [
      '.kkkk....', 'kbwbbk...', 'kwbbbk...', 'kbbbbk...', '.kkkkn...',
      '.....nn..', '......nn.', '.......nn'
    ],
    bulb: [
      '..kkkk..', '.kyyyyk.', 'kyywyyyk', 'kyyyyyyk', '.kyyyyk.', '..kyyk..', '..kssk..', '..kSSk..', '...kk...'
    ],
    map: [
      'kkkkkkkkk', 'kpprpppgk', 'kprrpgggk', 'kppppgpbk', 'kpgppppbk', 'kgggpprbk', 'kppgpprrk', 'kkkkkkkkk'
    ],
    compass: [
      '..kkkkk..', '.kwwrwwk.', 'kwwwrwwwk', 'kwwwrwwwk', 'kwwwkwwwk', 'kwwwBwwwk', 'kwwwBwwwk', '.kwwBwwk.', '..kkkkk..'
    ],
    pin: [
      '.kkkkk.', 'krrrrrk', 'krrwrrk', 'krrrrrk', '.krrrk.', '..krk..', '...k...'
    ],
    key: [
      '.kkk.....', 'kyyykkkkk', 'kykyyyyyk', 'kyyykykyk', '.kkk.k.k.'
    ],
    book: [
      '.kkkkkkk.', 'kGggggggk', 'kGgyyyggk', 'kGggggggk', 'kGgyyyggk', 'kGggggggk', 'kwwwwwwwk', '.kkkkkkk.'
    ],
    check: [
      '.......kk', '......kwk', 'k....kwk.', 'kwk.kwk..', '.kwkwk...', '..kwk....', '...k.....'
    ],
    cross: [
      'kk....kk', 'kwk..kwk', '.kwkkwk.', '..kwwk..', '..kwwk..', '.kwkkwk.', 'kwk..kwk', 'kk....kk'
    ],
    star: [
      '....k....', '...kyk...', 'kkkyyykkk', 'kyyyyyyyk', '.kyyyyyk.', '..kyyyk..', '.kyykyyk.', '.kyk.kyk.', '.kk...kk.'
    ],
    trophy: [
      'kkkkkkkkk', 'kyywyyyyk', 'kyywyyyyk', '.kyyyyyk.', '..kyyyk..', '...kyk...', '...kok...', '..kooook.', '..kkkkkk.'
    ],
    clock: [
      '..kkkk..', '.kwwwwk.', 'kwwwkwwk', 'kwwwkwwk', 'kwwkkwwk', 'kwwwwwwk', '.kwwwwk.', '..kkkk..'
    ],
    warn: [
      '....k....', '...kyk...', '...kyk...', '..kykyk..', '..kykyk..', '.kyyyyyk.', '.kyykyyk.', 'kkkkkkkkk'
    ],
    video: [
      'kkkkkkkkk', 'krrwrrrrk', 'krrwwrrrk', 'krrwwwrrk', 'krrwwrrrk', 'krrwrrrrk', 'kkkkkkkkk'
    ],
    chest: [
      '.kkkkkkkk.', 'knnnnnnnnk', 'kNyNNNNyNk', 'kkkkkkkkkk', 'knnnyynnnk', 'knnnkknnnk', 'kNNNNNNNNk', 'kkkkkkkkkk'
    ],
    replay: [
      '..kkkkk.', '.kwwwwwk', 'kwk..kkk', 'kwk.....', 'kwk...k.', 'kwk..kwk', '.kwwwwk.', '..kkkk..'
    ],
    coin: [
      '..kkkk..', '.kyyyyk.', 'kywyyyok', 'kywykyok', 'kywykyok', 'kyyyyyok', '.kooook.', '..kkkk..'
    ],
    heart: [
      '.kk.kk.', 'krrkrrk', 'krwrrrk', 'krrrrrk', '.krrrk.', '..krk..', '...k...'
    ]
  };

  function icon(name, scale = 2, cls = '') {
    const rows = ICONS[name];
    if (!rows) return '';
    return sprite(rows, ICON_PAL, scale, `px-icon ${cls}`);
  }

  function hydrateIcons(root = document) {
    root.querySelectorAll('i.px-ico[data-ico]').forEach(el => {
      if (el.dataset.done) return;
      el.innerHTML = icon(el.dataset.ico, parseInt(el.dataset.scale || '2', 10));
      el.dataset.done = '1';
    });
  }

  // ══════════════════════════════════════════════════════════
  //  OBJEK & DEKORASI
  // ══════════════════════════════════════════════════════════
  const OBJ = {
    tree: {
      pal: { g: '#3f9a2c', G: '#5cb83a', l: '#8ee06a', T: '#8a5630', t: '#6a3f22', k: '#1f3a1a' },
      rows: [
        '....kkkkkk....',
        '..kkgggGGgkk..',
        '.kggGGGggggGk.',
        'kggGGlGGgggGGk',
        'kgGGllGGggGGgk',
        'kgGlGGGgGGlGgk',
        'kggGGGggGGGggk',
        '.kgggGGggggkk.',
        '..kkggkkggkk..',
        '....kkTTkk....',
        '......Tt......',
        '......tT......',
        '......Tt......',
        '.....kTtk.....',
        '....kkkkkk....'
      ]
    },
    palm: {
      pal: { g: '#2f8a3a', G: '#4fb04a', l: '#8ee06a', T: '#a06a3a', t: '#7a4a24', k: 'rgba(0,0,0,0.25)' },
      rows: [
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
      ]
    },
    bush: {
      pal: { b: '#3f9a2c', B: '#5cb83a', h: '#8ee06a', k: 'rgba(0,0,0,0.25)' },
      rows: ['...bbbb...', '.bbBBhbbb.', 'bbBhBBbBbb', 'bbbbbbbbbb', '.kkkkkkkk.']
    },
    flower: {
      pal: { w: '#ffffff', y: '#ffd23f', p: '#ff8ac0', g: '#3f9a2c' },
      rows: ['.w...p.', 'wyw.pyp', '.w.g.p.', '..ggg..']
    },
    sign: {
      pal: { k: '#2a1a12', n: '#a0683a', N: '#6e4220' },
      rows: padRows([
        '.kkkkkkkkk..',
        'knnnnnnnnnk.',
        'knNNnNNnnnnk',
        'knnnnnnnnnk.',
        '.kkkkkkkkk..'
      ].concat(Array(8).fill('....kNk.....')).concat(['...kkkkk....']), 14)
    },
    chest: {
      pal: { k: '#2a1a12', n: '#b0703a', N: '#7a4a24', y: '#ffd23f', Y: '#fff3a0', d: '#4a2c14' },
      rows: [
        '..kkkkkkkkkkkk..',
        '.knnnnnnnnnnnnk.',
        'knnYnnnnnnnnYnnk',
        'knnynnnnnnnnynnk',
        'kNNyNNNNNNNNyNNk',
        'kkkkkkkyykkkkkkk',
        'kdddddkYykddddk.',
        'knnnnnkyykynnnnk',
        'knnynnnkknnnynnk',
        'knnynnnnnnnnynnk',
        'kNNyNNNNNNNNyNNk',
        'kkkkkkkkkkkkkkkk'
      ]
    },
    trophy: {
      pal: { k: '#2a1a12', y: '#ffd23f', Y: '#fff3a0', o: '#e0a020', O: '#a06a10', n: '#7a4a24', N: '#4a2c14' },
      rows: [
        '..kkkkkkkkkkkk..',
        'kkkyyYYyyyyyokkk',
        'k.kyyYYyyyyyok.k',
        'k.kyyYyyyyyyok.k',
        'kkkyyYyyyyyyokkk',
        '..kyyyyyyyyyok..',
        '..kyyyyyyyyyok..',
        '...kyyyyyyyok...',
        '....kyyyyyok....',
        '.....kyyyok.....',
        '......kyok......',
        '......kyok......',
        '.....kooook.....',
        '....knnnnnnk....',
        '....kNNNNNNk....',
        '....kkkkkkkk....'
      ]
    },
    flag: {
      pal: { p: '#d8d0b0', R: '#e02424', W: '#f5f5f5', k: '#1a0b2e' },
      layers: [
        { rows: padRows(['p.......'].concat(Array(10).fill('p.......')).concat(['k.......']), 12) },
        { rows: padRows(['.RRRRRR.', '.RRRRRR.', '.WWWWWW.', '.WWWWWW.'], 12), cls: 'f-a' },
        { rows: padRows(['.RRRRR..', '.RRRRRRR', '.WWWWWWW', '.WWWWW..'], 12), cls: 'f-b' }
      ]
    },
    lock: {
      pal: { k: '#1b1e2b', s: '#c8ccd8', y: '#8a8f9e', h: '#e0e4ec' },
      rows: ['..ssss..', '.s....s.', '.s....s.', 'kkkkkkkk', 'khyyyyyk', 'kyykkyyk', 'kyykkyyk', 'kyyyyyyk', 'kkkkkkkk']
    },
    arrow: {
      pal: { G: '#ffd23f', k: '#7a4a00' },
      rows: ['kkkkkkk', 'kGGGGGk', '.kGGGk.', '..kGk..', '...k...']
    },
    gate: (() => {
      const half = [
        '..........dd', '.........ddd', '........dSSd', '........dddd', '.......dSSSd',
        '......dddddd', '.....dSSSSSd', '....dddddddd', '....dSSSSSSd', '...ddddddddd',
        '...dSSSSSSSd', '..dddddddddd', '..dSSgSSSSSd', '..dSSSSSSSSd', '.ddddddddddd',
        '.dSSSSSSSSSd', '.dSSSSSSSSSd', 'dddddddddddd', 'dSSSSSSSSSSd', 'dSSSSSSSSSSd',
        'dddddddddddd'
      ];
      return {
        pal: { d: '#6a2e1a', S: '#b0603a', g: '#ffd23f', t: '#9a94a8' },
        rows: half.map((row, r) => {
          const gap = r === 20 ? 'tttttt' : r === 19 ? '.tttt.' : '......';
          return row + gap + row.split('').reverse().join('');
        })
      };
    })()
  };

  const objCache = {};
  function objectSVG(name, scale = 3, cls = '') {
    const key = `${name}:${scale}:${cls}`;
    if (objCache[key]) return objCache[key];
    const o = OBJ[name];
    if (!o) return '';
    const svg = o.layers ? layered(o.layers, o.pal, scale, cls) : sprite(o.rows, o.pal, scale, cls);
    objCache[key] = svg;
    return svg;
  }

  // ══════════════════════════════════════════════════════════
  //  LATAR PEMANDANGAN (siang / senja)
  // ══════════════════════════════════════════════════════════
  const LAND_PAL = {
    day: {
      far: '#9cc0ec', agung: '#6a8fd0', agungShade: '#5878bd', mid: '#4a9a5a', midDark: '#3a7a4a',
      lake: '#3d86d8', lakeLight: '#8cc4f6', lakeDark: '#2f6fc0',
      cliff: '#8a6a4a', cliffDark: '#6a4f36', cliffGrass: '#5cb83a',
      roof: '#4a2e26', roofLight: '#7a4a34', wall: '#c08a52', window: '#4a2e26',
      grass: '#5cb83a', grassLight: '#8ee06a', grassDark: '#3f9a2c',
      dirt: '#8a5630', dirtDark: '#6a3f22', stone: '#a87a50'
    },
    dusk: {
      far: '#7a5a9a', agung: '#4a3270', agungShade: '#3a2660', mid: '#2f2a50', midDark: '#251f42',
      lake: '#5a3f86', lakeLight: '#f5a860', lakeDark: '#3f2c66',
      cliff: '#3a2c3c', cliffDark: '#2a2030', cliffGrass: '#3f5a3a',
      roof: '#1f1420', roofLight: '#33222f', wall: '#4a3040', window: '#ffd060',
      grass: '#3f7a34', grassLight: '#5a9a44', grassDark: '#2c5a26',
      dirt: '#4a2e1e', dirtDark: '#2e1c12', stone: '#5a3a28',
      sun: '#ff9a4a', sunCore: '#ffd890'
    }
  };

  const CLOUD = [
    '........wwww............',
    '.....wwwwwwwww...www....',
    '...wwwwwwwwwwwwwwwwwww..',
    '.wwwwwwwwwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwwwwwwwwwww',
    '.ssssssssssssssssssssss.',
    '...ssssssssssssssssss...'
  ];
  const BIRD_A = ['k.....k', '.k...k.', '..k.k..'];
  const BIRD_B = ['.......', 'kkk.kkk', '...k...'];

  let sceneEl = null;
  let sceneVariant = 'day';

  function cloudSVG(scale) {
    return svgWrap(24, 8, scale,
      `<g class="cw">${rectsMono(CLOUD, 'w')}</g><g class="cs">${rectsMono(CLOUD, 's')}</g>`, '');
  }

  function ensureScene() {
    if (sceneEl && document.body.contains(sceneEl)) return sceneEl;
    sceneEl = document.createElement('div');
    sceneEl.id = 'px-scene';
    sceneEl.setAttribute('aria-hidden', 'true');

    const rnd = mulberry32(1908);
    let stars = '';
    for (let i = 0; i < 45; i++) {
      const x = (rnd() * 100).toFixed(2);
      const y = (rnd() * 40).toFixed(2);
      const d = (rnd() * 4).toFixed(2);
      stars += `<i class="px-star${rnd() < 0.2 ? ' big' : ''}" style="left:${x}%;top:${y}%;animation-delay:-${d}s"></i>`;
    }
    let flies = '';
    for (let i = 0; i < 10; i++) {
      const x = (rnd() * 100).toFixed(2);
      const y = (62 + rnd() * 30).toFixed(2);
      const d = (rnd() * 6).toFixed(2);
      flies += `<i class="px-fly" style="left:${x}%;top:${y}%;animation-delay:-${d}s,-${d}s"></i>`;
    }
    const bird = layered([{ rows: BIRD_A, cls: 'f-a' }, { rows: BIRD_B, cls: 'f-b' }],
      { k: '#1b1e2b' }, 2, '');

    sceneEl.innerHTML =
      `<div class="px-sky"></div>` +
      `<div class="px-sun"></div>` +
      `<div class="px-stars">${stars}</div>` +
      `<div class="px-cloud c1">${cloudSVG(6)}</div>` +
      `<div class="px-cloud c2">${cloudSVG(4)}</div>` +
      `<div class="px-cloud c3">${cloudSVG(5)}</div>` +
      `<div class="px-cloud c4">${cloudSVG(3)}</div>` +
      `<div class="px-birds"><i class="px-bird b1">${bird}</i><i class="px-bird b2">${bird}</i><i class="px-bird b3">${bird}</i></div>` +
      `<div class="px-land"></div>` +
      `<div class="px-flies">${flies}</div>`;
    document.body.prepend(sceneEl);

    let t = 0;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(drawLand, 150);
    });
    drawLand();
    return sceneEl;
  }

  function setScene(variant) {
    ensureScene();
    if (variant !== 'day' && variant !== 'dusk') variant = 'day';
    document.body.dataset.scene = variant;
    if (variant !== sceneVariant) {
      sceneVariant = variant;
      drawLand();
    }
  }

  function steppedTop(W, baseY, hFn, step) {
    let d = `M0 ${baseY}`;
    for (let x = 0; x < W + step; x += step) {
      const h = Math.max(0, Math.round(hFn(x) / step) * step);
      d += ` L${x} ${baseY - h} L${x + step} ${baseY - h}`;
    }
    return d + ` L${W + step} ${baseY} Z`;
  }

  function pixelDisc(cx, cy, r, color, step = 3) {
    let out = '';
    for (let dy = -r; dy <= r; dy += step) {
      const half = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)) / step) * step;
      if (half > 0) out += `<rect x="${cx - half}" y="${cy + dy}" width="${half * 2}" height="${step}" fill="${color}"/>`;
    }
    return out;
  }

  function meru(cx, base, tiers, P) {
    let s = '';
    s += `<rect x="${cx - 9}" y="${base - 12}" width="18" height="12" fill="${P.wall}"/>`;
    s += `<rect x="${cx - 3}" y="${base - 8}" width="6" height="8" fill="${P.window}"/>`;
    let y = base - 12;
    for (let t = 0; t < tiers; t++) {
      const w = 30 - t * 6;
      s += `<rect x="${cx - w / 2}" y="${y - 5}" width="${w}" height="5" fill="${P.roof}"/>`;
      s += `<rect x="${cx - w / 2 + 2}" y="${y - 6}" width="${w - 4}" height="1" fill="${P.roofLight}"/>`;
      if (t < tiers - 1) s += `<rect x="${cx - 4}" y="${y - 9}" width="8" height="3" fill="${P.wall}"/>`;
      y -= 9;
    }
    s += `<rect x="${cx - 1}" y="${y - 6}" width="2" height="6" fill="${P.roof}"/>`;
    return s;
  }

  function drawLand() {
    if (!sceneEl) return;
    const holder = sceneEl.querySelector('.px-land');
    const v = sceneVariant;
    const P = LAND_PAL[v];
    const W = Math.max(320, window.innerWidth);
    const H = Math.round(Math.min(520, Math.max(260, window.innerHeight * 0.5)));
    const key = `${v}:${W}x${H}`;
    if (holder.dataset.key === key) return;
    holder.dataset.key = key;

    const step = 6;
    const groundH = 36;
    const groundTop = H - groundH;
    const lakeTop = groundTop - Math.round(H * 0.2);
    const rnd = mulberry32(28041908);
    let s = '';

    if (v === 'dusk') {
      s += pixelDisc(Math.round(W * 0.3), lakeTop - 8, 34, P.sun);
      s += pixelDisc(Math.round(W * 0.3), lakeTop - 8, 22, P.sunCore);
    }

    // Pegunungan jauh
    s += `<path d="${steppedTop(W, lakeTop, x => H * 0.16 + Math.sin(x / 53) * 10 + Math.sin(x / 19 + 1) * 4, step)}" fill="${P.far}"/>`;

    // Gunung Agung (sisi terang & sisi bayangan)
    const peak = W * 0.62;
    const agung = x => Math.min(H * 0.56, H * 0.64 * (1 - Math.abs(x - peak) / (W * 0.34)));
    s += `<path d="${steppedTop(W, lakeTop, agung, step)}" fill="${P.agung}"/>`;
    s += `<path d="${steppedTop(W, lakeTop, x => (x >= peak ? agung(x) : 0), step)}" fill="${P.agungShade}"/>`;

    // Bukit hutan
    s += `<path d="${steppedTop(W, lakeTop, x => H * 0.07 + Math.sin(x / 37) * 6 + Math.sin(x / 13 + 2) * 3, step)}" fill="${P.mid}"/>`;

    // Danau
    s += `<rect x="0" y="${lakeTop}" width="${W}" height="${groundTop - lakeTop}" fill="${P.lake}"/>`;
    s += `<rect x="0" y="${lakeTop}" width="${W}" height="3" fill="${P.lakeDark}"/>`;
    for (let i = 0; i < 22; i++) {
      const w = 6 + Math.round(rnd() * 3) * 6;
      const x = Math.round(rnd() * W);
      const y = lakeTop + 8 + Math.round(rnd() * (groundTop - lakeTop - 14));
      s += `<rect class="px-shim" x="${x}" y="${y}" width="${w}" height="2" fill="${P.lakeLight}" style="animation-delay:-${(rnd() * 3).toFixed(2)}s"/>`;
    }

    // Pulau kecil
    [[0.1, 70, 20], [0.24, 46, 12]].forEach(([fx, w, hMax]) => {
      const cx = W * fx;
      s += `<path d="${steppedTop(W, lakeTop + 6, x => (Math.abs(x - cx) < w / 2 ? hMax * (1 - Math.abs(x - cx) / (w / 2)) + 4 : 0), step)}" fill="${P.midDark}"/>`;
    });

    // Tebing + pura (kanan)
    const x0 = Math.round(W * 0.7);
    const top = lakeTop - 42;
    s += `<path d="M${x0} ${groundTop} L${x0} ${lakeTop + 12} L${x0 + 6} ${lakeTop + 12} L${x0 + 6} ${lakeTop - 6} ` +
      `L${x0 + 12} ${lakeTop - 6} L${x0 + 12} ${lakeTop - 24} L${x0 + 20} ${lakeTop - 24} L${x0 + 20} ${top} ` +
      `L${W} ${top} L${W} ${groundTop} Z" fill="${P.cliff}"/>`;
    for (let i = 0; i < 8; i++) {
      const rx = x0 + 14 + Math.round(rnd() * (W - x0 - 20));
      const ry = top + 10 + Math.round(rnd() * (groundTop - top - 20));
      s += `<rect x="${rx}" y="${ry}" width="${6 + Math.round(rnd() * 2) * 6}" height="3" fill="${P.cliffDark}"/>`;
    }
    s += `<rect x="${x0 + 20}" y="${top - 4}" width="${W - x0 - 20}" height="6" fill="${P.cliffGrass}"/>`;
    s += `<rect x="${x0 + 12}" y="${lakeTop - 28}" width="8" height="4" fill="${P.cliffGrass}"/>`;
    const span = W - x0;
    s += meru(Math.round(x0 + span * 0.38), top - 4, 4, P);
    s += meru(Math.round(x0 + span * 0.72), top - 4, 3, P);
    s += pixelDisc(Math.round(x0 + span * 0.16), top - 10, 9, P.midDark, 3);
    s += pixelDisc(Math.round(x0 + span * 0.92), top - 8, 8, P.midDark, 3);

    // Tanah depan: rumput + tanah berbatu
    s += `<rect x="0" y="${groundTop}" width="${W}" height="${groundH}" fill="${P.dirt}"/>`;
    s += `<rect x="0" y="${groundTop}" width="${W}" height="9" fill="${P.grass}"/>`;
    s += `<rect x="0" y="${groundTop}" width="${W}" height="2" fill="${P.grassLight}"/>`;
    s += `<rect x="0" y="${groundTop + 9}" width="${W}" height="3" fill="${P.grassDark}"/>`;
    for (let x = 4; x < W; x += 18 + Math.round(rnd() * 3) * 6) {
      s += `<rect x="${x}" y="${groundTop - 3}" width="2" height="3" fill="${P.grass}"/>`;
      s += `<rect x="${x + 3}" y="${groundTop - 5}" width="2" height="5" fill="${P.grass}"/>`;
    }
    for (let i = 0; i < Math.round(W / 26); i++) {
      const sx = Math.round(rnd() * W);
      const sy = groundTop + 15 + Math.round(rnd() * (groundH - 20));
      s += `<rect x="${sx}" y="${sy}" width="${6 + Math.round(rnd()) * 3}" height="4" fill="${rnd() < 0.5 ? P.stone : P.dirtDark}"/>`;
    }

    holder.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">${s}</svg>`;
  }

  // ══════════════════════════════════════════════════════════
  //  KOTAK DIALOG NPC
  // ══════════════════════════════════════════════════════════
  function dialog(slot, opts = {}) {
    if (!slot) return;
    const who = opts.who === 'player' ? 'player' : 'guide';
    const name = opts.name || (who === 'guide' ? 'SANG PENJAGA' : 'KAMU');
    clearInterval(slot._pxTimer);
    slot.innerHTML =
      `<div class="px-dialog px-dialog-${who}" role="note">` +
      `<div class="px-portrait">${portrait(who)}</div>` +
      `<div class="px-dialog-body"><div class="px-speaker">${esc(name)}</div>` +
      `<div class="px-dialog-text"></div><span class="px-next" aria-hidden="true"></span></div></div>`;
    const box = slot.querySelector('.px-dialog');
    const textEl = slot.querySelector('.px-dialog-text');
    const text = String(opts.text || '');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (opts.typing === false || reduce) {
      textEl.textContent = text;
      box.classList.add('done');
      return;
    }
    let i = 0;
    const speed = opts.speed || 18;
    slot._pxTimer = setInterval(() => {
      i = Math.min(text.length, i + 2);
      textEl.textContent = text.slice(0, i);
      if (i >= text.length) { clearInterval(slot._pxTimer); box.classList.add('done'); }
    }, speed);
    box.addEventListener('click', () => {
      clearInterval(slot._pxTimer);
      textEl.textContent = text;
      box.classList.add('done');
    });
  }

  // ══════════════════════════════════════════════════════════
  //  ADEGAN KECIL UNTUK HALAMAN
  // ══════════════════════════════════════════════════════════
  function renderHero(el) {
    if (!el) return;
    el.innerHTML =
      `<div class="px-stage">` +
      `<div class="px-stage-sign">${objectSVG('sign', 4)}</div>` +
      `<div class="px-stage-player">${playerSVG(4, 'px-idle')}</div>` +
      `<div class="px-stage-guide">${guideSVG(4, 'px-float')}` +
      `<div class="px-bubble show">Om Swastyastu, penjelajah!</div></div>` +
      `<div class="px-stage-bush l">${objectSVG('bush', 3)}</div>` +
      `<div class="px-stage-bush r">${objectSVG('flower', 3)}</div>` +
      `<div class="px-ledge"></div>` +
      `</div>`;
  }

  function renderCacheArt(el) {
    if (!el) return;
    el.innerHTML =
      `<div class="px-stage px-stage-sm">` +
      `<div class="px-stage-player">${playerSVG(4, 'px-idle')}</div>` +
      `<div class="px-stage-chest">${objectSVG('chest', 4)}` +
      `<i class="px-spark s1"></i><i class="px-spark s2"></i><i class="px-spark s3"></i></div>` +
      `<div class="px-ledge"></div>` +
      `</div>`;
  }

  function renderTrophy(el) {
    if (!el) return;
    el.innerHTML =
      `<div class="px-stage px-stage-trophy">` +
      `<div class="px-stage-player">${playerSVG(4, 'px-cheer')}</div>` +
      `<div class="px-stage-trophy-obj">${objectSVG('trophy', 5)}` +
      `<i class="px-spark s1"></i><i class="px-spark s2"></i><i class="px-spark s3"></i></div>` +
      `<div class="px-stage-guide">${guideSVG(4, 'px-float')}</div>` +
      `<div class="px-ledge"></div>` +
      `</div>`;
  }

  return {
    // helper
    rects, rectsMono, svgWrap, sprite, layered, padRows, esc, mulberry32,
    // sprite
    playerSVG, guideSVG, portrait, icon, hydrateIcons, objectSVG,
    // latar
    ensureScene, setScene,
    // UI
    dialog, renderHero, renderCacheArt, renderTrophy
  };
})();
