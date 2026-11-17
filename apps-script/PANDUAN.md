# Panduan: Rekap Hasil Siswa ke Google Spreadsheet

Siswa mengisi identitas di awal. Setiap jawaban dan skor otomatis masuk ke spreadsheet milik guru.
Siswa **hanya melihat skornya sendiri** di game. Spreadsheet hanya bisa dibuka oleh akun Google guru.

## Langkah pemasangan (sekali saja, sekitar 5 menit)

1. Buka https://sheets.new lalu beri nama, misalnya **Rekap Jejak Puputan**.
2. Menu **Extensions (Ekstensi) > Apps Script**.
3. Hapus isi editor, lalu tempel seluruh isi file `apps-script/Code.gs`.
4. Ganti `GANTI-DENGAN-KODE-RAHASIA` pada baris `const TOKEN` dengan kode buatanmu sendiri (bebas, misalnya `puputan-kelas9a-2026`). Simpan (ikon disket).
5. Klik **Deploy > New deployment**. Jenis: **Web app**.
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
6. Klik **Deploy**, izinkan akses akun Google-mu (jika muncul "Google hasn't verified this app", pilih Advanced > Go to project).
7. Salin **Web app URL** (berakhiran `/exec`).
8. Buka `js/config.js` di project game, isi:
   ```js
   url: 'URL-WEB-APP-TADI',
   token: 'KODE-YANG-SAMA-DENGAN-DI-CODE.GS'
   ```
9. Commit dan push ke GitHub, tunggu GitHub Pages selesai deploy.

Setiap kali kamu mengubah `Code.gs`, buat **New deployment** lagi atau pilih **Manage deployments > Edit > New version**, supaya perubahan aktif.

## Isi spreadsheet

Sheet dibuat otomatis saat data pertama masuk.

| Sheet | Isi |
|---|---|
| **Peserta** | Satu baris per siswa: nama, absen, kelas, sekolah, level selesai, total skor, total waktu, hint, status (BERMAIN/SELESAI). Ini rekap utama. |
| **Teka-teki** | Semua jawaban teka-teki yang diketik siswa, benar atau salah, percobaan ke berapa. |
| **PostTest** | Jawaban tiap soal: teks pilihan siswa, kunci, benar/salah, poin. Jawaban esai ditulis lengkap, kolom **Nilai Guru** dikosongkan untuk kamu isi. |
| **Log** | Catatan semua kejadian (daftar, hint, cache ditemukan, selesai). |

Baris dari **mode demo** ditandai `YA` di kolom Demo. Filter kolom itu untuk menyembunyikan data uji coba.

## Catatan penting

- Poin esai di game otomatis penuh bila diisi, sesuai logika awal. Nilai sebenarnya kamu masukkan di kolom **Nilai Guru**.
- Jika siswa offline, data disimpan di HP dan dikirim saat online lagi.
- Token ada di kode web, jadi hanya mencegah kiriman iseng, bukan pengaman data. Spreadsheet-nya sendiri tetap privat.
- Memakai HP/perangkat bersama? Tombol **Reset Progress** juga menghapus identitas, jadi siswa berikutnya mengisi data baru.
- Bila `url` di `config.js` kosong, tidak ada data yang dikirim.
