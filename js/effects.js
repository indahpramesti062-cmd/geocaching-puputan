// ============================================================
// effects.js — Visual Effects & Animations
// Confetti, shake, flash, typewriter, counters, pulse
// ============================================================

// ── Confetti Particles ───────────────────────────────────────
function createConfetti() {
  const colors = ['#DAA520', '#8B0000', '#F0A500', '#FFF8DC', '#FFD700', '#CD853F'];
  const shapes = ['circle', 'square', 'triangle'];
  const count = 80;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    const size = Math.random() * 10 + 5;
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const startX = Math.random() * 100;
    const delay = Math.random() * 0.8;
    const duration = Math.random() * 2 + 2;
    const drift = (Math.random() - 0.5) * 200;
    const spin = Math.random() * 720 - 360;

    particle.className = 'confetti-particle';
    particle.style.cssText = `
      position: fixed;
      top: -20px;
      left: ${startX}vw;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      opacity: 1;
      pointer-events: none;
      z-index: 10000;
      border-radius: ${shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '2px'};
      ${shape === 'triangle' ? `
        width: 0; height: 0; background: transparent;
        border-left: ${size/2}px solid transparent;
        border-right: ${size/2}px solid transparent;
        border-bottom: ${size}px solid ${color};
      ` : ''}
      animation: confettiFall ${duration}s ease-in forwards;
      animation-delay: ${delay}s;
    `;

    // Custom fall animation via CSS variable
    particle.style.setProperty('--drift', `${drift}px`);
    particle.style.setProperty('--spin', `${spin}deg`);

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), (duration + delay) * 1000 + 500);
  }
}

// ── Shake Animation ──────────────────────────────────────────
function shakeElement(element) {
  element.classList.add('shake-anim');
  element.addEventListener('animationend', () => {
    element.classList.remove('shake-anim');
  }, { once: true });
}

// ── Flash Effects ────────────────────────────────────────────
function flashCorrect(element) {
  const overlay = document.createElement('div');
  overlay.className = 'flash-overlay flash-gold';
  element.style.position = 'relative';
  element.appendChild(overlay);
  setTimeout(() => overlay.remove(), 800);
}

function flashIncorrect(element) {
  const overlay = document.createElement('div');
  overlay.className = 'flash-overlay flash-red';
  element.style.position = 'relative';
  element.appendChild(overlay);
  setTimeout(() => overlay.remove(), 800);
}

// ── Typewriter Effect ────────────────────────────────────────
function typeWriter(element, htmlContent, speed = 8, callback) {
  // Parse HTML and reveal character by character
  element.innerHTML = htmlContent;
  element.style.visibility = 'hidden';

  // Simple approach: set content, then use CSS animation
  requestAnimationFrame(() => {
    element.style.visibility = 'visible';
    element.classList.add('story-reveal');
    if (callback) {
      const totalTime = Math.min(htmlContent.length * speed, 3000);
      setTimeout(callback, totalTime);
    }
  });
}

// ── Animated Counter ─────────────────────────────────────────
function animateCounter(element, endValue, duration = 1500) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing: ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * endValue);

    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = endValue;
    }
  }

  requestAnimationFrame(update);
}

// ── Pulse Glow ───────────────────────────────────────────────
function pulseElement(element) {
  element.classList.add('pulse-glow');
  setTimeout(() => element.classList.remove('pulse-glow'), 2000);
}

// ── Smooth Page Transition ───────────────────────────────────
function transitionPage(fromPage, toPage, callback) {
  if (fromPage) {
    fromPage.classList.add('page-exit');
    fromPage.classList.remove('active');
  }

  setTimeout(() => {
    if (fromPage) {
      fromPage.classList.remove('page-exit');
      fromPage.style.display = 'none';
    }

    toPage.style.display = 'flex';
    // Force reflow
    toPage.offsetHeight;
    toPage.classList.add('active');

    if (callback) callback();
  }, fromPage ? 400 : 0);
}

// ── Unlock Animation (for level nodes) ───────────────────────
function animateUnlock(nodeElement) {
  const icon = nodeElement.querySelector('.node-icon');
  if (icon) {
    icon.classList.add('unlocking');
    setTimeout(() => {
      icon.classList.remove('unlocking');
      nodeElement.classList.remove('locked');
      nodeElement.classList.add('active');
    }, 800);
  }
}

// ── Shimmer Effect on Progress Bar ───────────────────────────
function animateProgressBar(fillElement, fromPercent, toPercent, duration = 1000) {
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = fromPercent + (toPercent - fromPercent) * eased;

    fillElement.style.width = `${current}%`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ── Notification Toast ───────────────────────────────────────
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}
