// ============================================================
// app.js — Main Game Controller (v2)
// State management, page routing, scoring, game flow
// Supports Level 0 (prolog, no GPS), Post-Test per level
// ============================================================

// ── Demo Mode Detection ─────────────────────────────────────
const DEMO_MODE = new URLSearchParams(window.location.search).get('demo') === 'true';

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
  started: false
};

let currentPage = null;
let gameMap = null;
let geoTracker = null;
let levelStartTime = null;
let timerInterval = null;

// ── State Persistence ────────────────────────────────────────
function saveState() {
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
    started: false
  };
  saveState();
}

// ── Page Router ──────────────────────────────────────────────
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
}

// ── Level Map Renderer (Pixel Art) ───────────────────────────
function renderLevelMap() {
  const container = document.getElementById('level-map-container');
  container.innerHTML = '';

  const completedCount = state.levelsCompleted.length;
  const totalCount = LEVELS.length;

  // Hotspot positions (% from top of image) for each level
  const hotspots = [
    { id: 0, top: 6,  left: 10, label: 'PROLOG' },
    { id: 1, top: 22, left: 48, label: 'PELABUHAN BATULAHAK' },
    { id: 2, top: 38, left: 8,  label: 'PURA GOA LAWAH' },
    { id: 3, top: 46, left: 42, label: 'PURI KUSANEGARA' },
    { id: 4, top: 62, left: 8,  label: 'GELGEL' },
    { id: 5, top: 74, left: 48, label: 'MONUMEN PUPUTAN' },
    { id: 6, top: 88, left: 22, label: 'TUKAD UNDA' },
  ];

  // HUD bar
  const hud = document.createElement('div');
  hud.className = 'pixmap-hud';
  hud.innerHTML = `
    <div class="pixmap-hud-item">🏆 <strong>${state.score}</strong></div>
    <div class="pixmap-hud-item">✅ <strong>${completedCount}/${totalCount}</strong></div>
  `;
  container.appendChild(hud);

  // Map wrapper with background
  const mapWrapper = document.createElement('div');
  mapWrapper.className = 'pixmap-wrapper';

  // Image
  const img = document.createElement('img');
  img.src = 'img/map-bg.jpg';
  img.alt = 'Peta Perjalanan';
  img.className = 'pixmap-bg';
  mapWrapper.appendChild(img);

  // Overlay for hotspots
  const overlay = document.createElement('div');
  overlay.className = 'pixmap-overlay';

  hotspots.forEach(spot => {
    const level = LEVELS.find(l => l.id === spot.id);
    if (!level) return;

    const isCompleted = state.levelsCompleted.includes(spot.id);
    const isCurrent = spot.id === state.currentLevel;
    const isLocked = spot.id > state.currentLevel;
    const status = isCompleted ? 'completed' : isCurrent ? 'active' : 'locked';

    const hotspot = document.createElement('div');
    hotspot.className = `pixmap-hotspot ${status}`;
    hotspot.style.top = `${spot.top}%`;
    hotspot.style.left = `${spot.left}%`;

    const icon = isCompleted ? '✅' : isCurrent ? '📍' : '🔒';
    const scoreHTML = isCompleted && state.postTestScores[spot.id] !== undefined
      ? `<span class="pixmap-score">+${state.postTestScores[spot.id]}</span>` : '';

    hotspot.innerHTML = `
      <div class="pixmap-marker ${status}">${icon}</div>
      <div class="pixmap-label">${spot.label} ${scoreHTML}</div>
    `;

    // Walking pixel character on current level
    if (isCurrent) {
      const walker = document.createElement('div');
      walker.className = 'pixel-walker';
      walker.innerHTML = '🚶';
      hotspot.appendChild(walker);
    }

    if (!isLocked) {
      hotspot.style.cursor = 'pointer';
      hotspot.addEventListener('click', () => startLevel(spot.id));
    }

    overlay.appendChild(hotspot);
  });

  mapWrapper.appendChild(overlay);
  container.appendChild(mapWrapper);
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

  // Show clue
  document.getElementById('clue-level-title').textContent = `⚔️ Level ${level.id}`;
  document.getElementById('clue-intro-text').innerHTML = `<em>"${level.clueIntro}"</em>`;
  document.getElementById('clue-question-text').textContent = level.clue;
  document.getElementById('answer-input').value = '';
  document.getElementById('answer-input').disabled = false;
  document.getElementById('btn-check').disabled = false;
  document.getElementById('hint-text').classList.add('hidden');

  // Start timer
  startLevelTimer();
  showPage('page-clue');
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

  if (isCorrect) {
    const level = LEVELS.find(l => l.id === levelId);
    stopLevelTimer();

    input.disabled = true;
    document.getElementById('btn-check').disabled = true;

    createConfetti();
    showToast('🎉 Jawaban benar!', 'success');

    // No score for clue (per user request)

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

  document.getElementById('hint-text').textContent = level.hint;
  document.getElementById('hint-text').classList.remove('hidden');

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

  document.getElementById('cache-location-name').textContent = `📍 ${level.locationName}`;

  // Set external links
  const lat = cache.lat;
  const lon = cache.lon;

  document.getElementById('btn-alpine').href = `geo:${lat},${lon}?q=${lat},${lon}(Cache Level ${levelId})`;
  document.getElementById('btn-gmaps').href = `https://www.google.com/maps?q=${lat},${lon}`;

  showPage('page-cache');
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

    const started = geoTracker.start(
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
      const simLat = level.cache.lat + (Math.random() - 0.5) * 0.0002;
      const simLon = level.cache.lon + (Math.random() - 0.5) * 0.0002;
      gameMap.setPlayerPosition(simLat, simLon, 5);
      gameMap.fitBounds();
      updateNavigationHUD({ lat: simLat, lon: simLon, accuracy: 5 }, level.cache);
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

  document.getElementById('story-level-title').textContent = `⚔️ ${level.title}`;
  document.getElementById('story-text').innerHTML = level.story;

  // Video section
  const videoSection = document.getElementById('video-section');
  const videoLinks = document.getElementById('video-links');
  videoLinks.innerHTML = '';

  if (level.videos && level.videos.length > 0) {
    level.videos.forEach(v => {
      const card = document.createElement('a');
      card.href = v.url;
      card.target = '_blank';
      card.className = 'video-card';
      card.innerHTML = `
        <div class="video-thumb">
          <div class="video-play-icon">▶</div>
        </div>
        <div class="video-info">
          <div class="video-title">${v.title}</div>
          <div class="video-source">YouTube</div>
        </div>
      `;
      videoLinks.appendChild(card);
    });
    videoSection.classList.remove('hidden');
  } else {
    videoSection.classList.add('hidden');
  }

  showPage('page-story');

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

  document.getElementById('posttest-level-title').textContent = `📝 Post-Test: Level ${levelId}`;
  document.getElementById('posttest-score-display').textContent = `🏆 ${state.score} Poin`;

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
    qDiv.className = 'quiz-card';

    if (q.type === 'mc') {
      qDiv.innerHTML = `
        <div class="quiz-question"><span class="quiz-number">${idx + 1}</span> ${q.question} <span style="color:var(--gold-pale);font-size:0.8rem">(${q.points} poin)</span></div>
        <div class="quiz-options" id="pq-options-${idx}">
          ${q.options.map((opt, optIdx) => `
            <div class="quiz-option" id="pq-opt-${idx}-${optIdx}" data-idx="${idx}" data-opt="${optIdx}">
              <div class="quiz-radio"></div>
              <span>${opt}</span>
              <input type="radio" name="pq-${idx}" value="${optIdx}" style="display:none">
            </div>
          `).join('')}
        </div>
      `;
    } else if (q.type === 'essay') {
      qDiv.innerHTML = `
        <div class="quiz-question"><span class="quiz-number">${idx + 1}</span> ${q.question} <span style="color:var(--gold-pale);font-size:0.8rem">(${q.points} poin — esai)</span></div>
        <div class="quiz-essay">
          <textarea id="pq-essay-${idx}" placeholder="Tulis jawaban esai kamu di sini..." rows="4"></textarea>
          <div style="font-size:0.75rem;color:var(--amber);margin-top:var(--space-xs)">💡 Jawaban esai akan direview manual oleh guru</div>
        </div>
      `;
    }

    container.appendChild(qDiv);
  });

  // Add click handlers for quiz options
  container.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', function() {
      const idx = this.dataset.idx;
      // Deselect siblings
      document.querySelectorAll(`#pq-options-${idx} .quiz-option`).forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
      this.querySelector('input[type="radio"]').checked = true;
    });
  });

  showPage('page-posttest');
}

function submitPostTest() {
  const levelId = state.currentLevel;
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return;

  let earnedPoints = 0;
  let totalPoints = 0;
  let allAnswered = true;
  const answers = {};

  level.postTest.forEach((q, idx) => {
    totalPoints += q.points;

    if (q.type === 'mc') {
      const selected = document.querySelector(`input[name="pq-${idx}"]:checked`);
      if (!selected) {
        allAnswered = false;
        return;
      }
      const selectedIdx = parseInt(selected.value);
      answers[idx] = { type: 'mc', selected: selectedIdx, correct: q.correct };

      if (selectedIdx === q.correct) {
        earnedPoints += q.points;
        // Mark correct
        document.getElementById(`pq-opt-${idx}-${selectedIdx}`).classList.add('correct');
      } else {
        // Mark wrong and show correct
        document.getElementById(`pq-opt-${idx}-${selectedIdx}`).classList.add('wrong');
        document.getElementById(`pq-opt-${idx}-${q.correct}`).classList.add('correct');
      }
    } else if (q.type === 'essay') {
      const textarea = document.getElementById(`pq-essay-${idx}`);
      const essayText = textarea ? textarea.value.trim() : '';
      if (!essayText) {
        allAnswered = false;
        return;
      }
      answers[idx] = { type: 'essay', text: essayText };
      earnedPoints += q.points; // Essay: points for filling in
    }
  });

  if (!allAnswered) {
    showToast('⚠️ Jawab semua soal terlebih dahulu!', 'warning');
    return;
  }

  // Save answers and score
  state.postTestScores[levelId] = earnedPoints;
  state.postTestAnswers[levelId] = answers;
  state.score += earnedPoints;
  saveState();

  // Disable inputs
  document.querySelectorAll('.pq-option input').forEach(i => i.disabled = true);
  document.querySelectorAll('.pq-textarea').forEach(t => t.disabled = true);

  // Show result
  const resultDiv = document.getElementById('posttest-result');
  const resultIcon = document.getElementById('posttest-result-icon');
  const resultText = document.getElementById('posttest-result-text');
  const resultScore = document.getElementById('posttest-result-score');

  const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  resultIcon.textContent = percentage >= 80 ? '🌟' : percentage >= 50 ? '🎯' : '📝';
  resultText.textContent = percentage >= 80 ? 'Luar biasa!' : percentage >= 50 ? 'Cukup baik!' : 'Tetap semangat!';
  resultScore.textContent = `${earnedPoints} / ${totalPoints} poin`;

  resultDiv.classList.remove('hidden');
  document.getElementById('btn-submit-posttest').classList.add('hidden');
  document.getElementById('btn-next-level').classList.remove('hidden');

  document.getElementById('posttest-score-display').textContent = `🏆 ${state.score} Poin`;

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
  document.getElementById('final-score').textContent = state.score;
  document.getElementById('complete-narrative').innerHTML = CLOSING_NARRATION;

  // Stats
  const statsDiv = document.getElementById('complete-stats');
  const totalLevels = LEVELS.length;
  const completed = state.levelsCompleted.length;
  const totalTime = Object.values(state.levelTimes).reduce((a, b) => a + b, 0);
  const avgTime = completed > 0 ? Math.round(totalTime / completed) : 0;

  statsDiv.innerHTML = `
    <div class="stat-item">
      <span class="stat-icon">🏁</span>
      <span class="stat-value">${completed}/${totalLevels}</span>
      <span class="stat-label">Level Selesai</span>
    </div>
    <div class="stat-item">
      <span class="stat-icon">⏱️</span>
      <span class="stat-value">${Math.floor(totalTime / 60)}m ${totalTime % 60}s</span>
      <span class="stat-label">Total Waktu</span>
    </div>
    <div class="stat-item">
      <span class="stat-icon">🎯</span>
      <span class="stat-value">${state.score}</span>
      <span class="stat-label">Total Poin</span>
    </div>
    <div class="stat-item">
      <span class="stat-icon">💡</span>
      <span class="stat-value">${state.hintsUsed.length}</span>
      <span class="stat-label">Hint Digunakan</span>
    </div>
  `;

  showPage('page-complete');
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
  const hasSaved = loadState();

  // Show continue button if there's saved progress
  if (hasSaved && state.started && state.levelsCompleted.length > 0) {
    document.getElementById('continue-section').classList.remove('hidden');
  }

  // ── Home Page ──
  document.getElementById('btn-start').addEventListener('click', () => {
    if (!state.started || state.levelsCompleted.length === 0) {
      resetState();
    }
    state.started = true;
    saveState();
    renderLevelMap();
    showPage('page-levels');
  });

  document.getElementById('btn-continue').addEventListener('click', () => {
    renderLevelMap();
    showPage('page-levels');
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Yakin ingin menghapus semua progress? Tindakan ini tidak dapat dibatalkan.')) {
      resetState();
      document.getElementById('continue-section').classList.add('hidden');
      showToast('🔄 Progress telah direset.', 'info');
    }
  });

  // ── Level Map ──
  document.getElementById('btn-back-home').addEventListener('click', () => {
    showPage('page-home');
  });

  // ── Clue Page ──
  document.getElementById('btn-check').addEventListener('click', checkAnswer);

  document.getElementById('answer-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkAnswer();
  });

  document.getElementById('btn-hint').addEventListener('click', useHint);

  document.getElementById('btn-back-levels').addEventListener('click', () => {
    stopLevelTimer();
    // Re-enable input
    document.getElementById('answer-input').disabled = false;
    document.getElementById('btn-check').disabled = false;
    renderLevelMap();
    showPage('page-levels');
  });

  // ── Cache Reveal ──
  document.getElementById('btn-navigate').addEventListener('click', startNavigation);

  // ── Navigation ──
  document.getElementById('btn-confirm').addEventListener('click', confirmPosition);

  document.getElementById('btn-nav-back').addEventListener('click', () => {
    stopNavigation();
    const levelId = state.currentLevel;
    revealCache(levelId);
  });

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
    renderLevelMap();
    showPage('page-home');
    showToast('🔄 Game direset! Siap untuk petualangan baru.', 'info');
  });

  document.getElementById('btn-share').addEventListener('click', shareResult);

  // ── Initialize first page ──
  showPage('page-home');

  // ── Demo Mode Banner ──
  if (DEMO_MODE) {
    const banner = document.createElement('div');
    banner.id = 'demo-banner';
    banner.innerHTML = '🛠️ <strong>DEVELOPER DEMO MODE</strong> — GPS bypass aktif · <a href="' + window.location.pathname + '" style="color:#1A1A2E;text-decoration:underline">Matikan Demo</a>';
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#F0A500;color:#1A1A2E;text-align:center;padding:8px 16px;font-size:0.8rem;font-family:var(--font-body);font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
    document.body.prepend(banner);
    document.body.style.paddingTop = '36px';
    console.log('%c🛠️ DEMO MODE ACTIVE', 'background:#F0A500;color:#1A1A2E;padding:8px 16px;font-size:16px;font-weight:bold;border-radius:4px;');
  }
});
