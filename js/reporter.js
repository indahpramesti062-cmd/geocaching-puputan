// ============================================================
// reporter.js — Identitas siswa & pengiriman hasil ke Google Sheet
// Data yang gagal terkirim (offline) disimpan dan dikirim ulang.
// ============================================================
const Reporter = (() => {
  const ID_KEY = 'puputan_identity';
  const Q_KEY = 'puputan_queue';
  let identity = null;
  let flushing = false;
  let summaryFn = () => ({});

  try { identity = JSON.parse(localStorage.getItem(ID_KEY)); } catch (e) { identity = null; }

  const cfg = () => window.REPORT_CONFIG || {};
  const enabled = () => !!cfg().url;
  const isDemo = () => typeof DEMO_MODE !== 'undefined' && DEMO_MODE;
  const isPreview = () => typeof PREVIEW !== 'undefined' && PREVIEW;

  function readQueue() {
    try { return JSON.parse(localStorage.getItem(Q_KEY)) || []; } catch (e) { return []; }
  }
  function writeQueue(q) {
    try { localStorage.setItem(Q_KEY, JSON.stringify(q.slice(-500))); } catch (e) { /* penuh */ }
  }

  function newId() {
    return 'S' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
  }

  function setIdentity(d) {
    identity = {
      id: newId(),
      nama: d.nama.trim(),
      absen: d.absen.trim(),
      kelas: d.kelas.trim(),
      sekolah: (d.sekolah || '').trim(),
      mulai: new Date().toISOString()
    };
    localStorage.setItem(ID_KEY, JSON.stringify(identity));
    log('daftar', {});
  }

  function clearIdentity() {
    identity = null;
    localStorage.removeItem(ID_KEY);
  }

  function log(type, data) {
    if (!identity || isPreview()) return;
    const ev = {
      token: cfg().token || '',
      type,
      ts: new Date().toISOString(),
      demo: isDemo(),
      siswa: {
        id: identity.id, nama: identity.nama, absen: identity.absen,
        kelas: identity.kelas, sekolah: identity.sekolah, mulai: identity.mulai
      },
      ringkas: summaryFn(),
      data: data || {}
    };
    if (!enabled()) return;
    const q = readQueue();
    q.push(ev);
    writeQueue(q);
    flush();
  }

  async function flush() {
    if (!enabled() || flushing) return;
    flushing = true;
    try {
      let q = readQueue();
      while (q.length) {
        await fetch(cfg().url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(q[0])
        });
        q = readQueue();
        q.shift();
        writeQueue(q);
      }
    } catch (e) {
      /* offline: coba lagi nanti */
    } finally {
      flushing = false;
    }
  }

  window.addEventListener('online', flush);
  setTimeout(flush, 1500);

  return {
    get identity() { return identity; },
    hasIdentity: () => !!identity,
    enabled,
    setIdentity,
    clearIdentity,
    log,
    flush,
    setSummary(fn) { summaryFn = fn; }
  };
})();
