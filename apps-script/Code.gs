// ============================================================
// Code.gs — Penerima hasil game "Jejak Puputan Klungkung"
// Tempel di Google Sheet: Extensions > Apps Script
// Lihat PANDUAN.md untuk langkah lengkap.
// ============================================================

// Harus sama persis dengan "token" di js/config.js
const TOKEN = 'GANTI-DENGAN-KODE-RAHASIA';

const SHEETS = {
  Peserta: ['ID', 'Nama', 'No Absen', 'Kelas', 'Sekolah', 'Mulai', 'Aktivitas Terakhir',
            'Level Selesai', 'Total Skor', 'Total Waktu (detik)', 'Hint Dipakai', 'Status', 'Demo'],
  'Teka-teki': ['Waktu', 'ID', 'Nama', 'Kelas', 'Level', 'Jawaban Siswa', 'Benar', 'Percobaan ke', 'Demo'],
  PostTest: ['Waktu', 'ID', 'Nama', 'No Absen', 'Kelas', 'Level', 'No Soal', 'Tipe', 'Soal',
             'Jawaban Siswa', 'Kunci Jawaban', 'Benar', 'Poin Didapat', 'Poin Maks', 'Nilai Guru (esai)', 'Demo'],
  Log: ['Waktu', 'ID', 'Nama', 'Kelas', 'Jenis', 'Detail', 'Demo']
};

function doGet() {
  return ContentService.createTextOutput('Jejak Puputan: server aktif');
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ev = JSON.parse(e.postData.contents);
    if (ev.token !== TOKEN) return reply('token salah');

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const s = ev.siswa || {};
    const d = ev.data || {};
    const waktu = new Date(ev.ts);
    const demo = ev.demo ? 'YA' : '';

    upsertPeserta(sheet(ss, 'Peserta'), ev, waktu, demo);

    if (ev.type === 'teka_teki') {
      sheet(ss, 'Teka-teki').appendRow([waktu, s.id, s.nama, s.kelas, d.level, d.jawaban,
        d.benar ? 'BENAR' : 'SALAH', d.percobaan, demo]);
    } else if (ev.type === 'posttest') {
      const sh = sheet(ss, 'PostTest');
      (d.items || []).forEach(function (it) {
        sh.appendRow([waktu, s.id, s.nama, s.absen, s.kelas, d.level, it.no, it.tipe, it.soal,
          it.jawaban, it.kunci, it.tipe === 'esai' ? '(dinilai guru)' : (it.benar ? 'BENAR' : 'SALAH'),
          it.poin, it.maks, '', demo]);
      });
    }

    sheet(ss, 'Log').appendRow([waktu, s.id, s.nama, s.kelas, ev.type, JSON.stringify(d), demo]);
    return reply('ok');
  } catch (err) {
    return reply('error: ' + err);
  } finally {
    lock.releaseLock();
  }
}

function sheet(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(SHEETS[name]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, SHEETS[name].length).setFontWeight('bold').setBackground('#ffd23f');
  }
  return sh;
}

function upsertPeserta(sh, ev, waktu, demo) {
  const s = ev.siswa || {};
  const r = ev.ringkas || {};
  const row = [s.id, s.nama, s.absen, s.kelas, s.sekolah, new Date(s.mulai), waktu,
    r.levelSelesai || 0, r.skor || 0, r.waktu || 0, r.hint || 0,
    ev.type === 'selesai' ? 'SELESAI' : 'BERMAIN', demo];

  const last = sh.getLastRow();
  if (last > 1) {
    const ids = sh.getRange(2, 1, last - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (ids[i][0] === s.id) {
        sh.getRange(i + 2, 1, 1, row.length).setValues([row]);
        return;
      }
    }
  }
  sh.appendRow(row);
}

function reply(msg) {
  return ContentService.createTextOutput(msg);
}
