// ============================================================
// app.js — Main Game Controller (v2)
// State management, page routing, scoring, game flow
// Supports Level 0 (prolog, no GPS), Post-Test per level
// ============================================================

// ── Demo Mode Detection ─────────────────────────────────────
const _qs = new URLSearchParams(window.location.search).get('demo');
if (_qs === 'true') localStorage.setItem('puputan_demo','1');
if (_qs === 'false') localStorage.removeItem('puputan_demo');
// Pratinjau per halaman: ?view=home|levels|clue|cache|nav|story|posttest|complete
const PREVIEW = new URLSearchParams(window.location.search).get('view');
const DEMO_MODE = localStorage.getItem('puputan_demo') === '1' || PREVIEW === 'nav';
let demoPos = null;
function demoWalk(fraction) {
  const level = LEVELS.find(l => l.id === state.currentLevel);
  if (!level || !demoPos) return;
  demoPos.lat += (level.cache.lat - demoPos.lat) * fraction;
  demoPos.lon += (level.cache.lon - demoPos.lon) * fraction;
  gameMap.setPlayerPosition(demoPos.lat, demoPos.lon, 5);
  updateNavigationHUD({ lat: demoPos.lat, lon: demoPos.lon, accuracy: 5 }, level.cache);
}

// ── State ────────────────────────────────────────────────────
const STATE_KEY = 'geocaching_puputan_state';

let state = {
  currentLevel: 0,
  score: 0,
  levelsCompleted: [],
  hintsUsed: [],
  levelScores: {},
  levelTimes: {},
  postTestScores: {},
  postTestAnswers: {},
  maxUnlocked: 0,
  cluesSolved: [],
  started: false
};

let currentPage = null;
const clueAttempts = {};
let gameMap = null;
let geoTracker = null;
let levelStartTime = null;
let timerInterval = null;

// ── State Persistence ────────────────────────────────────────
function saveState() {
  if (PREVIEW) return;
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) { /* quota exceeded, ignore */ }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
      return true;
    }
  } catch (e) { /* corrupt data, ignore */ }
  return false;
}

function resetState() {
  state = {
    currentLevel: 0,
    score: 0,
    levelsCompleted: [],
    hintsUsed: [],
    levelScores: {},
    levelTimes: {},
    postTestScores: {},
    postTestAnswers: {},
    maxUnlocked: 0,
    cluesSolved: [],
    started: false
  };
  saveState();
  if (typeof PixelMap !== 'undefined') PixelMap.resetAvatar();
}

// ── Page Router ──────────────────────────────────────────────
// Label tombol kembali (pojok kiri atas) untuk tiap halaman
const BACK_LABELS = {
  'page-identity': 'BERANDA',
  'page-levels': 'BERANDA',
  'page-clue': 'PETA',
  'page-cache': 'PETA',
  'page-story': 'PETA',
  'page-posttest': 'MATERI',
  'page-complete': 'PETA'
};

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active');
  });
  const page = document.getElementById(pageId);
  if (page) {
    page.style.display = 'flex';
    // Force reflow before adding active class for transition
    void page.offsetWidth;
    page.classList.add('active');
    page.scrollTop = 0;
    currentPage = pageId;
  }

  // Latar pixel: senja untuk halaman Selesai, siang untuk lainnya
  PixelKit.setScene(pageId === 'page-complete' ? 'dusk' : 'day');

  // Tombol kembali pixel
  const backBtn = document.getElementById('px-back');
  if (backBtn) {
    const label = BACK_LABELS[pageId];
    backBtn.classList.toggle('show', !!label);
    if (label) document.getElementById('px-back-label').textContent = label;
  }

  if (pageId === 'page-home') {
    refreshHome();
    // Buang "penjaga riwayat" agar tombol back HP di beranda keluar dengan normal
    if (history.state && history.state.app === 'guard') history.back();
  } else if (!history.state || history.state.app !== 'guard') {
    // Tambahkan satu entri riwayat, supaya tombol back HP/browser
    // kembali ke halaman sebelumnya di dalam game (bukan keluar link)
    history.pushState({ app: 'guard' }, '');
  }

  if (pageId !== 'page-nav') window.scrollTo(0, 0);
}

// Kembali ke halaman sebelumnya secara logis
function goBack() {
  switch (currentPage) {
    case 'page-identity':
    case 'page-levels':
      showPage('page-home');
      break;
    case 'page-clue':
      stopLevelTimer();
      document.getElementById('answer-input').disabled = false;
      document.getElementById('btn-check').disabled = false;
      renderLevelMap();
      showPage('page-levels');
      break;
    case 'page-nav':
      stopNavigation();
      revealCache(state.currentLevel);
      break;
    case 'page-posttest':
      showStory(state.currentLevel);
      break;
    case 'page-cache':
    case 'page-story':
    case 'page-complete':
      renderLevelMap();
      showPage('page-levels');
      break;
    default:
      break;
  }
}

function refreshHome() {
  const hasProgress = state.started && state.levelsCompleted.length > 0;
  document.getElementById('continue-section').classList.toggle('hidden', !hasProgress);
}

// ── Level Map Renderer (Pixel Art — lihat js/pixelmap.js) ────
function renderLevelMap() {
  const container = document.getElementById('level-map-container');

  // Simpan level tertinggi yang pernah terbuka, supaya membuka ulang
  // level lama tidak mengunci kembali level setelahnya.
  state.maxUnlocked = Math.max(state.maxUnlocked || 0, state.currentLevel);
  saveState();

  PixelMap.render(container, {
    levels: LEVELS,
    completed: state.levelsCompleted,
    unlockedUpTo: DEMO_MODE ? LEVELS.length : state.maxUnlocked,
    postTestScores: state.postTestScores,
    score: state.score,
    onSelect: (levelId) => startLevel(levelId),
    onFinish: () => showCompletion(),
    onLocked: (msg) => showToast(msg, 'warning')
  });
}

// ── Start Level ──────────────────────────────────────────────
function startLevel(levelId) {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return;

  state.currentLevel = levelId;
  saveState();

  // If already completed, show story directly
  if (state.levelsCompleted.includes(levelId)) {
    showStory(levelId);
    return;
  }

  // Teka-teki sudah pernah dijawab benar → langsung ke koordinat cache
  if (level.hasGPS && (state.cluesSolved || []).includes(levelId)) {
    revealCache(levelId);
    return;
  }

  // Show clue
  document.getElementById('clue-level-title').textContent = `LEVEL ${level.id}`;
  document.getElementById('clue-question-text').textContent = level.clue;
  document.getElementById('answer-input').value = '';
  document.getElementById('answer-input').disabled = false;
  document.getElementById('btn-check').disabled = false;
  document.getElementById('hint-text').classList.add('hidden');

  // Start timer
  startLevelTimer();
  showPage('page-clue');

  // Sang Penjaga membacakan pengantar teka-teki
  PixelKit.dialog(document.getElementById('clue-dialog'), { who: 'guide', text: level.clueIntro });
}

// ── Timer ────────────────────────────────────────────────────
function startLevelTimer() {
  levelStartTime = Date.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - levelStartTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    document.getElementById('clue-timer').textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopLevelTimer() {
  clearInterval(timerInterval);
  if (levelStartTime) {
    const elapsed = Math.floor((Date.now() - levelStartTime) / 1000);
    state.levelTimes[state.currentLevel] = elapsed;
    saveState();
  }
}

// ── Answer Check ─────────────────────────────────────────────
function checkAnswer() {
  const input = document.getElementById('answer-input');
  const answer = input.value.trim();
  if (!answer) {
    showToast('Ketik jawaban terlebih dahulu!', 'warning');
    shakeElement(input);
    return;
  }

  const levelId = state.currentLevel;
  const isCorrect = validateAnswer(levelId, answer);
  clueAttempts[levelId] = (clueAttempts[levelId] || 0) + 1;
  Reporter.log('teka_teki', { level: levelId, jawaban: answer, benar: isCorrect, percobaan: clueAttempts[levelId] });

  if (isCorrect) {
    const level = LEVELS.find(l => l.id === levelId);
    stopLevelTimer();

    input.disabled = true;
    document.getElementById('btn-check').disabled = true;

    createConfetti();
    showToast('🎉 Jawaban benar!', 'success');

    // No score for clue (per user request)

    // Ingat bahwa teka-teki ini sudah terjawab
    state.cluesSolved = state.cluesSolved || [];
    if (!state.cluesSolved.includes(levelId)) state.cluesSolved.push(levelId);
    saveState();

    setTimeout(() => {
      if (level.hasGPS) {
        // GPS level: show cache
        revealCache(levelId);
      } else {
        // Level 0 (prolog): skip cache & navigation, go to story
        if (!state.levelsCompleted.includes(levelId)) {
          state.levelsCompleted.push(levelId);
        }
        saveState();
        showStory(levelId);
      }
    }, 1200);
  } else {
    showToast('❌ Jawaban belum tepat. Coba lagi!', 'error');
    shakeElement(input);
  }
}

// ── Hint ─────────────────────────────────────────────────────
function useHint() {
  const levelId = state.currentLevel;
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return;

  if (state.hintsUsed.includes(levelId)) {
    document.getElementById('hint-text').classList.remove('hidden');
    return;
  }

  state.hintsUsed.push(levelId);
  saveState();
  Reporter.log('hint', { level: levelId });

  const hintEl = document.getElementById('hint-text');
  hintEl.classList.remove('hidden');
  PixelKit.dialog(hintEl, { who: 'guide', name: 'SANG PENJAGA · HINT', text: level.hint });

  showToast('💡 Hint digunakan!', 'warning');
}

// ── Cache Reveal Phase ───────────────────────────────────────
function revealCache(levelId) {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level || !level.cache) return;

  const cache = level.cache;

  // Display coordinates
  document.getElementById('cache-latlon').textContent = `${cache.latDMS}, ${cache.lonDMS}`;

  // Compute UTM dynamically
  if (typeof latLonToUTM === 'function') {
    const utm = latLonToUTM(cache.lat, cache.lon);
    document.getElementById('cache-utm').textContent = `Zone ${utm.zone}, E ${Math.round(utm.easting).toLocaleString('id-ID')}, N ${Math.round(utm.northing).toLocaleString('id-ID')}`;
  } else {
    document.getElementById('cache-utm').textContent = '—';
  }

  document.getElementById('cache-location-name').innerHTML =
    `${PixelKit.icon('pin', 2)}<span>${PixelKit.esc(level.locationName)}</span>`;

  // Set external links
  const lat = cache.lat;
  const lon = cache.lon;

  document.getElementById('btn-alpine').href = `geo:${lat},${lon}?q=${lat},${lon}(Cache Level ${levelId})`;
  document.getElementById('btn-gmaps').href = `https://www.google.com/maps?q=${lat},${lon}`;

  showPage('page-cache');

  PixelKit.renderCacheArt(document.getElementById('px-cache-art'));
  PixelKit.dialog(document.getElementById('cache-dialog'), {
    who: 'player',
    text: `Ketemu! Koordinat cache di ${level.locationName} sudah terbuka. Ayo kita ke sana!`
  });
}

// ── Navigation Phase ─────────────────────────────────────────
function startNavigation() {
  const levelId = state.currentLevel;
  const level = LEVELS.find(l => l.id === levelId);
  if (!level || !level.cache) return;

  showPage('page-nav');

  // Initialize map
  if (!gameMap) {
    gameMap = new GameMap('map-container');
  }

  setTimeout(() => {
    gameMap.init();

    // Set cache marker
    gameMap.setCachePosition(level.cache.lat, level.cache.lon, `Level ${levelId}`);

    // Reset confirm button
    if (DEMO_MODE) {
      document.getElementById('btn-confirm').disabled = false;
      document.getElementById('nav-notification').textContent = '🛠️ DEMO MODE — Konfirmasi posisi kapan saja';
      document.getElementById('nav-notification').classList.remove('hidden');
    } else {
      document.getElementById('btn-confirm').disabled = true;
      document.getElementById('nav-notification').classList.add('hidden');
    }

    // Start GPS tracking
    if (!geoTracker) {
      geoTracker = new GeoTracker();
    }

    const gpsDot = document.getElementById('gps-dot');
    const gpsText = document.getElementById('gps-status-text');

    const started = DEMO_MODE ? false : geoTracker.start(
      // On position update
      (pos) => {
        gpsDot.className = 'gps-dot active';
        gpsText.textContent = 'GPS aktif';

        // Update map
        gameMap.setPlayerPosition(pos.lat, pos.lon, pos.accuracy);

        // Fit bounds on first position
        if (!gameMap._hasFitted) {
          gameMap.fitBounds();
          gameMap._hasFitted = true;
        }

        // Update HUD
        updateNavigationHUD(pos, level.cache);
      },
      // On error
      (error) => {
        gpsDot.className = 'gps-dot error';
        gpsText.textContent = error.message;
        showToast(error.message, 'error', 5000);
      }
    );

    if (!started && DEMO_MODE) {
      // Demo mode: simulate GPS near cache
      showToast('🛠️ Demo Mode: GPS disimulasikan di dekat cache', 'info');
      gpsDot.className = 'gps-dot active';
      gpsText.textContent = 'GPS simulasi (demo)';
      demoPos = { lat: level.cache.lat + 0.0016, lon: level.cache.lon - 0.0013 };
      gameMap.setPlayerPosition(demoPos.lat, demoPos.lon, 5);
      gameMap.fitBounds();
      updateNavigationHUD({ lat: demoPos.lat, lon: demoPos.lon, accuracy: 5 }, level.cache);
      const wb = document.getElementById('btn-demo-walk'); if (wb) wb.classList.remove('hidden');
    } else if (!started) {
      showToast('GPS tidak tersedia pada perangkat ini.', 'error');
    }
  }, 400);
}

function updateNavigationHUD(playerPos, cache) {
  const distance = haversineDistance(playerPos.lat, playerPos.lon, cache.lat, cache.lon);
  const bearing = calculateBearing(playerPos.lat, playerPos.lon, cache.lat, cache.lon);
  const compass = bearingToCompass(bearing);

  // Distance
  const distEl = document.getElementById('nav-distance');
  distEl.textContent = formatDistance(distance);
  distEl.className = distance <= 30 ? 'hud-value distance-near' : 'hud-value';

  // Bearing
  document.getElementById('nav-bearing').textContent = `${Math.round(bearing)}° ${compass}`;

  // Accuracy
  document.getElementById('nav-accuracy').textContent = `±${Math.round(playerPos.accuracy)} m`;

  // Player position
  document.getElementById('nav-position').textContent = formatLatLon(playerPos.lat, playerPos.lon);

  // Confirm button state (non-demo)
  if (!DEMO_MODE) {
    const confirmBtn = document.getElementById('btn-confirm');
    const notification = document.getElementById('nav-notification');

    if (distance <= 30) {
      confirmBtn.disabled = false;
      notification.classList.remove('hidden');
    } else {
      confirmBtn.disabled = true;
      notification.classList.add('hidden');
    }
  }
}

function stopNavigation() {
  const wb = document.getElementById('btn-demo-walk'); if (wb) wb.classList.add('hidden');
  if (geoTracker) {
    geoTracker.stop();
  }
  if (gameMap) {
    gameMap._hasFitted = false;
  }
}

// ── Confirm Position ─────────────────────────────────────────
function confirmPosition() {
  const levelId = state.currentLevel;
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return;

  // Demo mode: bypass GPS check
  if (DEMO_MODE) {
    stopNavigation();
    createConfetti();
    showToast('🎉 [DEMO] Posisi dikonfirmasi! Cache ditemukan!', 'success');
    Reporter.log('cache', { level: levelId, jarak: null });

    if (!state.levelsCompleted.includes(levelId)) {
      state.levelsCompleted.push(levelId);
    }
    saveState();

    setTimeout(() => {
      showStory(levelId);
    }, 1500);
    return;
  }

  // Normal mode: require GPS within 30m
  if (!geoTracker || !geoTracker.currentPosition) return;

  const pos = geoTracker.currentPosition;
  const distance = haversineDistance(pos.lat, pos.lon, level.cache.lat, level.cache.lon);

  if (distance <= 30) {
    // Success!
    stopNavigation();
    createConfetti();
    showToast('🎉 Posisi dikonfirmasi! Cache ditemukan!', 'success');
    Reporter.log('cache', { level: levelId, jarak: Math.round(distance) });

    // Mark level as completed
    if (!state.levelsCompleted.includes(levelId)) {
      state.levelsCompleted.push(levelId);
    }
    saveState();

    // Show story after delay
    setTimeout(() => {
      showStory(levelId);
    }, 1500);
  } else {
    showToast(`❌ Anda masih ${Math.round(distance)}m dari cache. Jarak harus ≤30m.`, 'error');
    shakeElement(document.getElementById('btn-confirm'));
  }
}

// ── Story Phase ──────────────────────────────────────────────

function showStory(levelId) {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return;

  document.getElementById('story-level-title').textContent = level.title;

  // Add photo banner before story text
  const storyContent = document.querySelector('#page-story .story-content');
  const existingBanner = storyContent.querySelector('.story-photo-banner');
  if (existingBanner) existingBanner.remove();

  const photoUrl = `img/loc-${levelId}.jpg`;
  const banner = document.createElement('div');
  banner.className = 'story-photo-banner';
  banner.innerHTML = `
    <img src="${photoUrl}" alt="${level.locationName}" class="story-photo-img" loading="eager" onerror="this.style.display='none'">
    <span class="story-photo-label">${PixelKit.icon('pin', 2)}<span>${level.locationName}</span></span>
  `;
  const storyCard = storyContent.querySelector('.story-card');
  storyContent.insertBefore(banner, storyCard);

  document.getElementById('story-text').innerHTML = level.story;

  // Video section — upgraded thumbnail cards
  const videoSection = document.getElementById('video-section');
  const videoLinks = document.getElementById('video-links');
  videoLinks.innerHTML = '';

  if (level.videos && level.videos.length > 0) {
    level.videos.forEach(v => {
      const card = document.createElement('a');
      card.href = v.url;
      card.target = '_blank';
      card.className = 'video-thumb-card';
      card.innerHTML = `
        <div class="video-play-icon">${PixelKit.icon('video', 3)}</div>
        <span class="video-thumb-title">${v.title}</span>
      `;
      videoLinks.appendChild(card);
    });
    videoSection.classList.remove('hidden');
  } else {
    videoSection.classList.add('hidden');
  }

  showPage('page-story');

  PixelKit.dialog(document.getElementById('story-dialog'), {
    who: 'guide',
    text: level.hasGPS
      ? `Kamu sudah sampai di ${level.locationName}. Simak kisahnya baik-baik, nanti ada post-test!`
      : 'Sebelum berangkat, mari pahami dulu latar sejarahnya. Baca sampai habis, ya!'
  });

  // Typewriter effect on first paragraph
  const firstP = document.querySelector('#story-text p');
  if (firstP) {
    typeWriter(firstP, firstP.innerHTML);
  }
}

// ── Post-Test Phase ──────────────────────────────────────────
function showPostTest(levelId) {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return;

  document.getElementById('posttest-level-title').textContent = `POST-TEST · LEVEL ${levelId}`;
  document.getElementById('posttest-score-display').innerHTML = `${PixelKit.icon('coin', 2)}<span>${state.score} POIN</span>`;

  // Hide result, show submit button
  document.getElementById('posttest-result').classList.add('hidden');
  document.getElementById('btn-submit-posttest').classList.remove('hidden');
  document.getElementById('btn-submit-posttest').disabled = false;
  document.getElementById('btn-next-level').classList.add('hidden');

  // Render questions
  const container = document.getElementById('posttest-questions');
  container.innerHTML = '';

  level.postTest.forEach((q, idx) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'glass-card pq-card';

    if (q.type === 'mc') {
      qDiv.innerHTML = `
        <div class="pq-question"><span class="pq-number">${idx + 1}</span>${q.question} <small style="color:var(--gold);opacity:0.7">(${q.points} poin)</small></div>
        <div class="pq-options" id="pq-options-${idx}">
          ${q.options.map((opt, optIdx) => `
            <div class="pq-option" id="pq-opt-${idx}-${optIdx}" onclick="selectOption(${idx}, ${optIdx})">
              <div class="pq-radio"></div>
              <span>${opt}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else if (q.type === 'essay') {
      qDiv.innerHTML = `
        <div class="pq-question"><span class="pq-number">${idx + 1}</span>${q.question} <small style="color:var(--gold);opacity:0.7">(esai)</small></div>
        <textarea class="pq-essay" id="pq-essay-${idx}" placeholder="Tulis jawaban esai kamu di sini..." rows="4"></textarea>
        <div style="font-size:0.78rem;color:var(--amber);margin-top:var(--space-sm);opacity:0.8">💡 Jawaban esai akan direview manual oleh guru</div>
      `;
    }

    container.appendChild(qDiv);
  });

  showPage('page-posttest');
}

// Helper: select MC option (for div-based radio buttons)
function selectOption(qIdx, optIdx) {
  const options = document.querySelectorAll(`#pq-options-${qIdx} .pq-option`);
  options.forEach((opt, i) => {
    opt.classList.toggle('selected', i === optIdx);
    opt.dataset.selected = (i === optIdx) ? 'true' : 'false';
  });
}

function submitPostTest() {
  const levelId = state.currentLevel;
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return;

  let earnedPoints = 0;
  let totalPoints = 0;
  let allAnswered = true;
  const answers = {};
  const items = [];
  const plain = s => String(s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  level.postTest.forEach((q, idx) => {
    totalPoints += q.points;

    if (q.type === 'mc') {
      const options = document.querySelectorAll(`#pq-options-${idx} .pq-option`);
      let selectedIdx = -1;
      options.forEach((opt, i) => {
        if (opt.classList.contains('selected')) selectedIdx = i;
      });
      if (selectedIdx === -1) {
        allAnswered = false;
        return;
      }
      answers[idx] = { type: 'mc', selected: selectedIdx, correct: q.correct };

      // Siswa hanya melihat skor: kunci jawaban tidak ditampilkan
      const isRight = selectedIdx === q.correct;
      if (isRight) earnedPoints += q.points;
      items.push({ no: idx + 1, tipe: 'pilihan', soal: plain(q.question), jawaban: plain(q.options[selectedIdx]), kunci: plain(q.options[q.correct]), benar: isRight, poin: isRight ? q.points : 0, maks: q.points });
    } else if (q.type === 'essay') {
      const textarea = document.getElementById(`pq-essay-${idx}`);
      const essayText = textarea ? textarea.value.trim() : '';
      if (!essayText) {
        allAnswered = false;
        return;
      }
      answers[idx] = { type: 'essay', text: essayText };
      earnedPoints += q.points; // Essay: points for filling in
      items.push({ no: idx + 1, tipe: 'esai', soal: plain(q.question), jawaban: essayText, kunci: '', benar: null, poin: q.points, maks: q.points });
    }
  });

  if (!allAnswered) {
    showToast('⚠️ Jawab semua soal terlebih dahulu!', 'warning');
    return;
  }

  // Save answers and score (mengulang post-test mengganti skor lama, bukan menambah)
  const previousScore = state.postTestScores[levelId] || 0;
  state.postTestScores[levelId] = earnedPoints;
  state.postTestAnswers[levelId] = answers;
  state.score += earnedPoints - previousScore;
  saveState();
  Reporter.log('posttest', { level: levelId, skor: earnedPoints, total: totalPoints, items: items });

  // Disable inputs
  document.querySelectorAll('.pq-option input').forEach(i => i.disabled = true);
  document.querySelectorAll('.pq-textarea').forEach(t => t.disabled = true);

  // Show result
  const resultDiv = document.getElementById('posttest-result');
  const resultIcon = document.getElementById('posttest-result-icon');
  const resultText = document.getElementById('posttest-result-text');
  const resultScore = document.getElementById('posttest-result-score');

  const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  resultIcon.innerHTML = PixelKit.icon(percentage >= 80 ? 'trophy' : percentage >= 50 ? 'star' : 'book', 5);
  resultText.textContent = percentage >= 80 ? 'Luar biasa!' : percentage >= 50 ? 'Cukup baik!' : 'Tetap semangat!';
  resultScore.textContent = `${earnedPoints} / ${totalPoints} poin`;

  resultDiv.classList.remove('hidden');
  document.getElementById('btn-submit-posttest').classList.add('hidden');
  document.getElementById('btn-next-level').classList.remove('hidden');

  document.getElementById('posttest-score-display').innerHTML = `${PixelKit.icon('coin', 2)}<span>${state.score} POIN</span>`;

  PixelKit.dialog(document.getElementById('posttest-dialog'), {
    who: 'guide',
    text: percentage >= 80
      ? 'Hebat! Kamu benar-benar memahami kisah ini. Lanjutkan perjalananmu!'
      : percentage >= 50
        ? 'Bagus! Masih ada yang terlewat, tapi kamu siap ke lokasi berikutnya.'
        : 'Tidak apa-apa. Coba baca lagi materinya pelan-pelan, ya.'
  });

  if (percentage >= 80) createConfetti();
  showToast(`📝 Post-Test selesai! +${earnedPoints} poin`, 'success');
}

// ── Next Level ───────────────────────────────────────────────
function nextLevel() {
  const nextId = state.currentLevel + 1;
  const nextLevelExists = LEVELS.find(l => l.id === nextId);

  if (nextLevelExists) {
    state.currentLevel = nextId;
    saveState();
    renderLevelMap();
    showPage('page-levels');
  } else {
    // All levels completed!
    showCompletion();
  }
}

// ── Completion ───────────────────────────────────────────────
function showCompletion() {
  document.getElementById('final-score').textContent = `${state.score} POIN`;
  document.getElementById('complete-narrative').innerHTML = CLOSING_NARRATION;

  // Stats
  const statsDiv = document.getElementById('complete-stats');
  const totalLevels = LEVELS.length;
  const completed = state.levelsCompleted.length;
  const totalTime = Object.values(state.levelTimes).reduce((a, b) => a + b, 0);

  const stat = (ico, value, label) => `
    <div class="stat-item">
      <span class="stat-icon">${PixelKit.icon(ico, 3)}</span>
      <span class="stat-value">${value}</span>
      <span class="stat-label">${label}</span>
    </div>`;
  statsDiv.innerHTML =
    stat('map', `${completed}/${totalLevels}`, 'Level Selesai') +
    stat('clock', `${Math.floor(totalTime / 60)}m ${totalTime % 60}s`, 'Total Waktu') +
    stat('coin', state.score, 'Total Poin') +
    stat('bulb', state.hintsUsed.length, 'Hint Digunakan');

  Reporter.log('selesai', {});
  showPage('page-complete');
  PixelKit.renderTrophy(document.getElementById('px-trophy'));
  PixelKit.dialog(document.getElementById('complete-dialog'), {
    who: 'guide',
    text: 'Luar biasa! Kamu telah menelusuri seluruh jejak perjuangan Klungkung. Semangat puputan kini ada padamu.'
  });
  createConfetti();
}

// ── Share ────────────────────────────────────────────────────
function shareResult() {
  const totalScore = state.score;
  const text = `🏆 Saya menyelesaikan Geocaching: Jejak Puputan Klungkung dengan skor ${totalScore} poin! ⚔️\n\nTelusuri jejak kepahlawanan Perang Kusamba & Puputan Klungkung di Bali.\n#PuputanKlungkung #Geocaching #SejarahBali`;

  if (navigator.share) {
    navigator.share({
      title: 'Geocaching: Jejak Puputan Klungkung',
      text: text
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Teks berhasil disalin ke clipboard!', 'success');
    }).catch(() => {
      showToast('Tidak dapat membagikan. Salin teks secara manual.', 'error');
    });
  }
}

// ── Event Listeners ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  // Siapkan latar pixel, ikon, dan panggung beranda
  PixelKit.ensureScene();
  PixelKit.hydrateIcons();
  PixelKit.renderHero(document.getElementById('px-hero'));
  try { history.replaceState({ app: 'root' }, ''); } catch (e) { /* abaikan */ }

  // Tombol back HP/browser → kembali ke halaman sebelumnya di dalam game
  window.addEventListener('popstate', () => {
    if (currentPage && currentPage !== 'page-home') goBack();
  });

  // Tombol kembali pixel (pojok kiri atas)
  document.getElementById('px-back').addEventListener('click', goBack);

  // ── Home Page ──
  function openIdentity() {
    showPage('page-identity');
    PixelKit.dialog(document.getElementById('identity-dialog'), { who: 'guide', text: 'Selamat datang, calon penjelajah! Sebutkan dulu siapa dirimu agar gurumu bisa mencatat petualanganmu.' });
  }

  function beginGame() {
    if (!state.started || state.levelsCompleted.length === 0) {
      resetState();
    }
    state.started = true;
    saveState();
    renderLevelMap();
    showPage('page-levels');
  }

  Reporter.setSummary(() => ({
    levelSelesai: state.levelsCompleted.length,
    skor: state.score,
    waktu: Object.values(state.levelTimes || {}).reduce((a, b) => a + b, 0),
    hint: (state.hintsUsed || []).length
  }));

  document.getElementById('btn-start').addEventListener('click', () => {
    if (!Reporter.hasIdentity()) {
      openIdentity();
      return;
    }
    beginGame();
  });

  // ── Identitas Siswa ──
  document.getElementById('identity-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = id => document.getElementById(id).value.trim();
    const nama = v('id-nama'), absen = v('id-absen'), kelas = v('id-kelas');
    if (nama.length < 3) { showToast('Isi nama lengkap dulu ya.', 'warning'); shakeElement(document.getElementById('id-nama')); return; }
    if (!absen) { showToast('Isi nomor absen dulu ya.', 'warning'); shakeElement(document.getElementById('id-absen')); return; }
    if (!kelas) { showToast('Isi kelas dulu ya.', 'warning'); shakeElement(document.getElementById('id-kelas')); return; }
    resetState();
    Reporter.setIdentity({ nama, absen, kelas, sekolah: v('id-sekolah') });
    beginGame();
  });

  document.getElementById('btn-continue').addEventListener('click', () => {
    renderLevelMap();
    showPage('page-levels');
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Yakin ingin menghapus semua progress? Tindakan ini tidak dapat dibatalkan.')) {
      resetState();
      Reporter.clearIdentity();
      document.getElementById('continue-section').classList.add('hidden');
      showToast('🔄 Progress telah direset.', 'info');
    }
  });

  // ── Level Map ──
  document.getElementById('btn-back-home').addEventListener('click', goBack);

  // ── Clue Page ──
  document.getElementById('btn-check').addEventListener('click', checkAnswer);

  document.getElementById('answer-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAnswer();
  });

  document.getElementById('btn-hint').addEventListener('click', useHint);

  document.getElementById('btn-back-levels').addEventListener('click', goBack);

  // ── Cache Reveal ──
  document.getElementById('btn-navigate').addEventListener('click', startNavigation);

  // ── Navigation ──
  document.getElementById('btn-confirm').addEventListener('click', confirmPosition);
  document.getElementById('btn-demo-walk').addEventListener('click', () => demoWalk(0.4));
  const dt = document.getElementById('btn-demo-toggle');
  dt.textContent = DEMO_MODE ? 'MODE DEMO: ON (ketuk untuk matikan)' : 'MODE DEMO: OFF (tanpa ke lokasi)';
  dt.classList.toggle('on', DEMO_MODE);
  dt.addEventListener('click', () => { if (DEMO_MODE) localStorage.removeItem('puputan_demo'); else localStorage.setItem('puputan_demo','1'); location.href = location.pathname; });

  document.getElementById('btn-nav-back').addEventListener('click', goBack);

  // ── Story → Post-Test ──
  document.getElementById('btn-to-posttest').addEventListener('click', () => {
    showPostTest(state.currentLevel);
  });

  // ── Post-Test ──
  document.getElementById('btn-submit-posttest').addEventListener('click', submitPostTest);

  document.getElementById('btn-next-level').addEventListener('click', nextLevel);

  // ── Completion ──
  document.getElementById('btn-replay').addEventListener('click', () => {
    resetState();
    Reporter.clearIdentity();
    renderLevelMap();
    showPage('page-home');
    showToast('🔄 Game direset! Siap untuk petualangan baru.', 'info');
  });

  document.getElementById('btn-share').addEventListener('click', shareResult);

  // ── Initialize first page ──
  showPage('page-home');

  // ── Pratinjau halaman (untuk desain / impor ke Figma) ──
  if (PREVIEW) {
    state.started = true; state.levelsCompleted = [0, 1]; state.maxUnlocked = 2; state.currentLevel = 2; state.score = 350;
    setTimeout(() => {
      if (PREVIEW === 'identity') openIdentity();
      else if (PREVIEW === 'levels') { renderLevelMap(); showPage('page-levels'); }
      else if (PREVIEW === 'clue') startLevel(2);
      else if (PREVIEW === 'cache') revealCache(2);
      else if (PREVIEW === 'nav') { revealCache(2); startNavigation(); }
      else if (PREVIEW === 'story') showStory(2);
      else if (PREVIEW === 'posttest') showPostTest(2);
      else if (PREVIEW === 'complete') { state.levelsCompleted = [0,1,2,3,4,5,6]; showCompletion(); }
    }, 100);
  }

  // ── Demo Mode Banner ──
  if (DEMO_MODE) {
    const banner = document.createElement('div');
    banner.id = 'demo-banner';
    banner.textContent = 'MODE DEMO';
    banner.style.cssText = 'position:fixed;bottom:6px;left:6px;z-index:99999;background:#F0A500;color:#1A1A2E;padding:4px 8px;font-size:10px;font-family:var(--font-heading);border:2px solid #1A1A2E;pointer-events:none;';
    document.body.prepend(banner);
    console.log('%c🛠️ DEMO MODE ACTIVE', 'background:#F0A500;color:#1A1A2E;padding:8px 16px;font-size:16px;font-weight:bold;border-radius:4px;');
  }
});
