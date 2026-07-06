// ============================================================
// app.js — Main Game Controller
// State management, page routing, scoring, game flow
// ============================================================

// ── State ────────────────────────────────────────────────────
const STATE_KEY = 'geocaching_puputan_state';

let state = {
  currentLevel: 1,
  score: 0,
  levelsCompleted: [],
  hintsUsed: [],
  levelScores: {},
  levelTimes: {},
  started: false
};

let currentPage = null;
let gameMap = null;
let geoTracker = null;
let levelTimer = null;
let levelStartTime = null;

// ── State Persistence ────────────────────────────────────────
function saveState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
      return true;
    }
  } catch (e) {
    console.warn('Could not load state:', e);
  }
  return false;
}

function resetState() {
  state = {
    currentLevel: 1,
    score: 0,
    levelsCompleted: [],
    hintsUsed: [],
    levelScores: {},
    levelTimes: {},
    started: false
  };
  saveState();
}

// ── Page Navigation ──────────────────────────────────────────
function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  const targetPage = document.getElementById(pageId);

  if (!targetPage) return;

  const fromPage = currentPage ? document.getElementById(currentPage) : null;

  // Stop GPS tracking when leaving nav page
  if (currentPage === 'page-nav' && pageId !== 'page-nav') {
    stopNavigation();
  }

  transitionPage(fromPage, targetPage, () => {
    // Scroll to top
    window.scrollTo(0, 0);

    // If entering nav page, init map
    if (pageId === 'page-nav') {
      setTimeout(() => {
        if (gameMap) {
          gameMap.init();
          gameMap.map.invalidateSize();
        }
      }, 300);
    }
  });

  currentPage = pageId;
}

// ── Level Map Generation ─────────────────────────────────────
function renderLevelMap() {
  const container = document.getElementById('level-path');
  container.innerHTML = '';

  LEVELS.forEach((level, index) => {
    const isCompleted = state.levelsCompleted.includes(level.id);
    const isActive = level.id === state.currentLevel && !isCompleted;
    const isLocked = level.id > state.currentLevel && !isCompleted;

    const statusClass = isCompleted ? 'completed' : isActive ? 'active' : 'locked';
    const icon = isCompleted ? '✅' : isActive ? '⚔️' : '🔒';

    const item = document.createElement('div');
    item.className = `level-item ${statusClass}`;
    item.innerHTML = `
      <div class="level-node ${statusClass}" data-level="${level.id}">
        <span class="node-icon">${icon}</span>
      </div>
      <div class="level-info">
        <div class="level-name">Level ${level.id}: ${level.title}</div>
        <div class="level-location">📍 ${level.locationName}</div>
        ${isCompleted && state.levelScores[level.id] !== undefined
          ? `<span class="level-score-badge">🏆 ${state.levelScores[level.id]} poin</span>`
          : ''}
      </div>
    `;

    // Click handler for active/completed levels
    if (isActive || isCompleted) {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        if (isActive) {
          loadClue(level.id);
        } else if (isCompleted) {
          // Show story again
          showStory(level.id);
        }
      });
    }

    container.appendChild(item);
  });

  // Update progress
  updateProgress();
}

function updateProgress() {
  const completed = state.levelsCompleted.length;
  const total = LEVELS.length;
  const percent = (completed / total) * 100;

  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  const scoreEl = document.getElementById('total-score');

  if (fill) animateProgressBar(fill, parseFloat(fill.style.width) || 0, percent);
  if (text) text.textContent = `${completed} / ${total} Level`;
  if (scoreEl) scoreEl.textContent = state.score;
}

// ── Clue Phase ───────────────────────────────────────────────
function loadClue(levelId) {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return;

  document.getElementById('clue-level-num').textContent = level.id;
  document.getElementById('clue-title').textContent = level.title;
  document.getElementById('clue-text').textContent = level.clue;
  document.getElementById('answer-input').value = '';
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';
  document.getElementById('hint-text').classList.add('hidden');

  // Hint button state
  const hintBtn = document.getElementById('btn-hint');
  const hintUsed = state.hintsUsed.includes(levelId);
  if (hintUsed) {
    hintBtn.classList.add('hidden');
    document.getElementById('hint-text').textContent = level.hint;
    document.getElementById('hint-text').classList.remove('hidden');
  } else {
    hintBtn.classList.remove('hidden');
  }

  // Start timer
  startLevelTimer();

  showPage('page-clue');

  // Focus input
  setTimeout(() => document.getElementById('answer-input').focus(), 500);
}

// ── Level Timer ──────────────────────────────────────────────
function startLevelTimer() {
  levelStartTime = Date.now();
  clearInterval(levelTimer);

  const timerEl = document.getElementById('level-timer');

  levelTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - levelStartTime) / 1000);
    const min = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const sec = (elapsed % 60).toString().padStart(2, '0');
    if (timerEl) timerEl.textContent = `⏱️ ${min}:${sec}`;
  }, 1000);
}

function stopLevelTimer() {
  clearInterval(levelTimer);
  if (levelStartTime) {
    return Math.floor((Date.now() - levelStartTime) / 1000);
  }
  return 0;
}

// ── Answer Checking ──────────────────────────────────────────
function checkAnswer() {
  const input = document.getElementById('answer-input');
  const feedback = document.getElementById('feedback');
  const userAnswer = input.value.trim();
  const levelId = state.currentLevel;

  if (!userAnswer) {
    feedback.textContent = 'Silakan masukkan jawaban Anda.';
    feedback.className = 'feedback incorrect';
    shakeElement(input);
    return;
  }

  if (validateAnswer(levelId, userAnswer)) {
    // Correct!
    const elapsed = stopLevelTimer();
    const hintUsed = state.hintsUsed.includes(levelId);
    let points = hintUsed ? 70 : 100;

    // Speed bonus
    if (elapsed < 300) { // < 5 minutes
      points += 10;
    }

    state.levelScores[levelId] = points;
    state.levelTimes[levelId] = elapsed;
    state.score = Object.values(state.levelScores).reduce((a, b) => a + b, 0);
    saveState();

    feedback.innerHTML = `✅ <strong>Benar!</strong> +${points} poin${elapsed < 300 ? ' (termasuk bonus kecepatan!)' : ''}`;
    feedback.className = 'feedback correct';

    createConfetti();
    flashCorrect(document.querySelector('.parchment-card'));

    // Disable input and show cache button
    input.disabled = true;
    document.getElementById('btn-check').disabled = true;
    document.getElementById('btn-hint').classList.add('hidden');

    // After delay, show cache reveal
    setTimeout(() => {
      revealCache(levelId);
    }, 2000);
  } else {
    // Incorrect
    feedback.textContent = '❌ Jawaban belum tepat. Coba lagi!';
    feedback.className = 'feedback incorrect';
    shakeElement(input);
    flashIncorrect(document.querySelector('.answer-section'));
    input.value = '';
    input.focus();
  }
}

// ── Hint System ──────────────────────────────────────────────
function useHint() {
  const levelId = state.currentLevel;
  const level = LEVELS.find(l => l.id === levelId);

  if (!level || state.hintsUsed.includes(levelId)) return;

  state.hintsUsed.push(levelId);
  saveState();

  document.getElementById('hint-text').textContent = level.hint;
  document.getElementById('hint-text').classList.remove('hidden');
  document.getElementById('btn-hint').classList.add('hidden');

  showToast('💡 Hint digunakan! Skor level ini berkurang 30 poin.', 'warning');
}

// ── Cache Reveal Phase ───────────────────────────────────────
function revealCache(levelId) {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return;

  const cache = level.cache;

  // Display coordinates
  document.getElementById('cache-latlon').textContent = `${cache.latDMS}, ${cache.lonDMS}`;
  document.getElementById('cache-utm').textContent = `Zone ${cache.utmZone}, E ${cache.utmEasting.toLocaleString('id-ID')}, N ${cache.utmNorthing.toLocaleString('id-ID')}`;
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
  if (!level) return;

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
    document.getElementById('btn-confirm').disabled = true;
    document.getElementById('nav-notification').classList.add('hidden');

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

    if (!started) {
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

  // Confirm button state
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
  if (!level || !geoTracker || !geoTracker.currentPosition) return;

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

  document.getElementById('story-level-num').textContent = level.id;
  document.getElementById('story-title').textContent = level.title;

  const storyText = document.getElementById('story-text');
  typeWriter(storyText, level.story);

  // Button text
  const nextBtn = document.getElementById('btn-next-level');
  if (levelId >= LEVELS.length) {
    nextBtn.textContent = '🏆 LIHAT HASIL AKHIR';
  } else {
    nextBtn.textContent = `LANJUT KE LEVEL ${levelId + 1} ➜`;
  }

  showPage('page-story');
}

// ── Level Up ─────────────────────────────────────────────────
function nextLevel() {
  const levelId = state.currentLevel;

  if (levelId >= LEVELS.length) {
    // Game complete
    completeGame();
    return;
  }

  state.currentLevel = levelId + 1;
  saveState();

  // Re-enable clue input
  document.getElementById('answer-input').disabled = false;
  document.getElementById('btn-check').disabled = false;

  // Show level map with updated progress
  renderLevelMap();
  showPage('page-levels');
}

// ── Game Completion ──────────────────────────────────────────
function completeGame() {
  // Calculate final score
  const totalScore = Object.values(state.levelScores).reduce((a, b) => a + b, 0);

  document.getElementById('final-score').textContent = totalScore;

  // Journey summary
  const summary = document.getElementById('journey-summary');
  summary.innerHTML = LEVELS.map(level => {
    const score = state.levelScores[level.id] || 0;
    const hintUsed = state.hintsUsed.includes(level.id);
    const time = state.levelTimes[level.id] || 0;
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `
      <div class="journey-item">
        <span class="level-label">Level ${level.id}: ${level.title}</span>
        <span class="level-pts">${score} pts ${hintUsed ? '(hint)' : ''} · ${min}m${sec}s</span>
      </div>
    `;
  }).join('');

  // Closing narration
  const closingEl = document.getElementById('closing-narration');
  closingEl.innerHTML = CLOSING_NARRATION;

  showPage('page-complete');
  createConfetti();

  setTimeout(() => animateCounter(document.getElementById('final-score'), totalScore), 500);
}

// ── Share Functionality ──────────────────────────────────────
function shareResult() {
  const totalScore = state.score;
  const text = `🏆 Saya menyelesaikan Geocaching: Jejak Puputan Klungkung dengan skor ${totalScore}/660! ⚔️\n\nTelusuri jejak kepahlawanan terakhir Kerajaan Klungkung di Bali.\n#PuputanKlungkung #Geocaching #SejarahBali`;

  if (navigator.share) {
    navigator.share({
      title: 'Geocaching: Jejak Puputan Klungkung',
      text: text
    }).catch(() => {});
  } else {
    // Fallback: copy to clipboard
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

  // ── Story ──
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
  document.getElementById('page-home').style.display = 'flex';
  currentPage = 'page-home';
});
