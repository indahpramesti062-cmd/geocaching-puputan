// ============================================================
// data.js — Geocaching: Jejak Puputan Klungkung
// All 6 levels: clues, answers, coordinates, hints, narratives
// ============================================================

const LEVELS = [
  // ── LEVEL 1 ─────────────────────────────────────────────────
  {
    id: 1,
    title: "Asal-Usul Kerajaan Klungkung",
    locationName: "Kertha Gosa / Taman Gili",
    clue: "Pada tahun berapakah Kerajaan Klungkung didirikan, dan siapa raja pertama yang memindahkan pusat pemerintahan dari Gelgel ke Klungkung setelah mengalahkan I Gusti Agung Maruti?",
    answers: [
      "1686",
      "dewa agung jambe",
      "ida dewa agung jambe",
      "ida dewa agung jambe i",
      "1686 ida dewa agung jambe",
      "1686 dewa agung jambe"
    ],
    hint: "Peristiwa ini terjadi di abad ke-17, ketika seorang pemberontak bernama Maruti berhasil digulingkan...",
    cache: {
      lat: -8.535556,
      lon: 115.403333,
      latDMS: 'S 8°32\'08.0"',
      lonDMS: 'E 115°24\'12.0"',
      utmZone: "50S",
      utmEasting: 315456,
      utmNorthing: 9054832
    },
    story: `<p>Kerajaan Klungkung merupakan pewaris langsung dari Kerajaan Gelgel, kerajaan Hindu terbesar di Bali. Pada pertengahan abad ke-17, terjadi pemberontakan oleh <strong>I Gusti Agung Maruti</strong> yang berhasil merebut kekuasaan Gelgel.</p>
    <p>Namun pada tahun <span class="year-highlight">1686</span>, <strong>Ida Dewa Agung Jambe I</strong> — keturunan sah dinasti Gelgel — berhasil mengalahkan Maruti dan memulihkan kekuasaan. Beliau kemudian memindahkan pusat kerajaan dari Gelgel ke lokasi baru yang dinamai <strong>Semarapura</strong> (kini dikenal sebagai Klungkung).</p>
    <p>Di sinilah beliau membangun istana megah yang kelak dikenal sebagai <strong>Puri Agung Klungkung</strong>, lengkap dengan <strong>Kertha Gosa</strong> — balai pengadilan kerajaan yang langit-langitnya dihiasi lukisan wayang Kamasan yang menceritakan kisah <em>Bhima Swarga</em>.</p>
    <p>Kerajaan Klungkung menjadi kerajaan paling disegani di Bali, dianggap sebagai <em>'primus inter pares'</em> (yang utama di antara yang setara) di antara kerajaan-kerajaan Bali lainnya.</p>`
  },

  // ── LEVEL 2 ─────────────────────────────────────────────────
  {
    id: 2,
    title: "Kedatangan Kolonial Belanda di Bali",
    locationName: "Monumen Puputan Klungkung",
    clue: "Intervensi militer Belanda di Bali dimulai jauh sebelum Puputan Klungkung. Peristiwa apakah pada tahun 1906 yang menjadi awal kejatuhan kerajaan-kerajaan Bali, di mana raja dan rakyatnya memilih berperang hingga mati daripada menyerah kepada Belanda?",
    answers: [
      "puputan badung",
      "badung",
      "puputan badung 1906"
    ],
    hint: "Peristiwa ini terjadi di kerajaan yang kini menjadi ibu kota Provinsi Bali...",
    cache: {
      lat: -8.538889,
      lon: 115.404444,
      latDMS: 'S 8°32\'20.0"',
      lonDMS: 'E 115°24\'16.0"',
      utmZone: "50S",
      utmEasting: 315575,
      utmNorthing: 9054462
    },
    story: `<p>Sejak awal abad ke-19, Belanda mulai memperluas pengaruhnya di Bali melalui <strong>ekspedisi militer</strong> yang dikenal sebagai intervensi Belanda di Bali. Total terdapat <strong>tujuh intervensi militer</strong> yang dilakukan antara tahun <span class="year-highlight">1846</span> hingga <span class="year-highlight">1908</span>.</p>
    <p>Peristiwa paling tragis sebelum Puputan Klungkung adalah <strong>Puputan Badung pada <span class="year-highlight">20 September 1906</span></strong>, di mana <strong>Raja I Gusti Ngurah Made Agung</strong> beserta keluarga kerajaan dan ratusan pengikutnya keluar dari istana Puri Denpasar dengan berpakaian putih dan bersenjatakan keris.</p>
    <p>Mereka maju menghadapi tembakan senapan dan meriam Belanda dalam aksi bunuh diri massal (<em>puputan</em>) daripada menyerahkan kehormatan mereka. Tragedi serupa juga terjadi di <strong>Kerajaan Tabanan</strong> tak lama setelahnya.</p>
    <p>Berita puputan ini mengguncang opini publik internasional dan menuai kecaman keras terhadap kebrutalan kolonialisme Belanda. Klungkung, sebagai kerajaan tertua dan paling dihormati, kini menjadi satu-satunya kerajaan Bali yang masih berdaulat — dan menjadi target terakhir Belanda.</p>`
  },

  // ── LEVEL 3 ─────────────────────────────────────────────────
  {
    id: 3,
    title: "Monopoli Opium dan Provokasi Belanda",
    locationName: "Area Desa Gelgel",
    clue: "Salah satu pemicu langsung konflik antara Belanda dan Klungkung adalah kebijakan monopoli perdagangan suatu komoditas. Komoditas apakah itu, dan di desa mana terjadi insiden penyerangan patroli Belanda oleh penduduk yang memicu eskalasi konflik?",
    answers: [
      "opium gelgel",
      "opium, gelgel",
      "opium di gelgel",
      "candu gelgel",
      "candu, gelgel",
      "opium",
      "gelgel"
    ],
    hint: "Komoditas ini adalah zat adiktif yang banyak diperdagangkan pada era kolonial... dan desa ini dulunya adalah pusat kerajaan sebelum Klungkung...",
    cache: {
      lat: -8.543056,
      lon: 115.406944,
      latDMS: 'S 8°32\'35.0"',
      lonDMS: 'E 115°24\'25.0"',
      utmZone: "50S",
      utmEasting: 315840,
      utmNorthing: 9054000
    },
    story: `<p>Memasuki awal tahun 1900-an, Belanda menerapkan kebijakan <strong>monopoli perdagangan opium (candu)</strong> di seluruh Hindia Belanda, termasuk Bali. Kebijakan ini sangat ditentang oleh para penguasa dan rakyat Bali karena dianggap sebagai bentuk intervensi asing terhadap kedaulatan mereka.</p>
    <p>Klungkung, sebagai kerajaan paling senior, menolak keras kebijakan ini. Ketegangan memuncak ketika Belanda melakukan <strong>patroli keamanan di Desa Gelgel</strong> — wilayah kekuasaan Klungkung — tanpa izin raja.</p>
    <p>Patroli ini dianggap sebagai penghinaan besar dan pelanggaran kedaulatan. Pada <span class="year-highlight">pertengahan April 1908</span>, penduduk Gelgel menyerang patroli Belanda, menewaskan beberapa serdadu termasuk pemimpin mereka, <strong>Letnan Haremaker</strong>.</p>
    <p>Peristiwa ini menjadi titik balik — Belanda menuduh Klungkung memberontak dan mulai mempersiapkan serangan militer besar-besaran.</p>`
  },

  // ── LEVEL 4 ─────────────────────────────────────────────────
  {
    id: 4,
    title: "Ultimatum dan Penolakan Raja",
    locationName: "Area Puri Agung Klungkung",
    clue: "Sebelum menyerang Klungkung, Belanda memberikan sebuah ultimatum kepada Raja. Kapan batas waktu ultimatum tersebut, dan siapa nama raja yang menolaknya dengan tegas?",
    answers: [
      "22 april 1908",
      "22 april",
      "dewa agung jambe ii",
      "ida dewa agung jambe ii",
      "22 april 1908 ida dewa agung jambe ii",
      "22 april dewa agung jambe ii",
      "22 april 1908 dewa agung jambe"
    ],
    hint: "Batas waktu ini jatuh di bulan April, beberapa hari sebelum peristiwa puputan... Raja ini memiliki gelar yang sama dengan pendiri kerajaan tetapi merupakan generasi kedua...",
    cache: {
      lat: -8.536667,
      lon: 115.402222,
      latDMS: 'S 8°32\'12.0"',
      lonDMS: 'E 115°24\'08.0"',
      utmZone: "50S",
      utmEasting: 315340,
      utmNorthing: 9054710
    },
    story: `<p>Setelah insiden di Gelgel, Belanda segera merespons dengan keras. Mereka mengirimkan <strong>ultimatum resmi</strong> kepada <strong>Ida Dewa Agung Jambe II</strong>, Raja Klungkung, yang isinya menuntut agar raja menyerah tanpa syarat dan menyerahkan kedaulatan kerajaan sebelum tanggal <span class="year-highlight">22 April 1908</span>.</p>
    <p><strong>Ida Dewa Agung Jambe II</strong>, yang bergelar <strong>'Dewa Agung'</strong> — gelar tertinggi di antara raja-raja Bali — <strong>menolak ultimatum tersebut dengan tegas</strong>. Bagi beliau, menyerahkan kedaulatan kerajaan sama artinya dengan mengkhianati leluhur dan rakyatnya.</p>
    <p>Beliau menyatakan bahwa lebih baik mati dengan terhormat daripada hidup dalam kehinaan di bawah kekuasaan asing.</p>
    <p>Dengan penolakan ini, nasib Klungkung sudah tersegel — Belanda mempersiapkan pasukan besar di bawah pimpinan <strong>Letnan Kolonel Marinus Bernardus Rost van Tonningen</strong> untuk menyerbu ibukota kerajaan.</p>`
  },

  // ── LEVEL 5 ─────────────────────────────────────────────────
  {
    id: 5,
    title: "Hari Puputan — 28 April 1908",
    locationName: "Lapangan / Alun-alun Depan Bekas Puri",
    clue: "Pada hari Puputan, Raja beserta keluarga dan pengikutnya keluar dari istana mengenakan pakaian berwarna tertentu dan membawa senjata tradisional. Warna pakaian apa yang mereka kenakan, senjata apa yang mereka bawa, dan berapa perkiraan jumlah pengikut yang turut serta dalam puputan?",
    answers: [
      "putih keris 200",
      "putih, keris, 200",
      "putih dan keris",
      "pakaian putih keris",
      "putih keris",
      "putih",
      "keris"
    ],
    hint: "Warna pakaian ini melambangkan kesucian dan kesiapan menghadapi kematian... Senjata ini adalah senjata khas Nusantara yang berbilah lurus atau berkelok...",
    cache: {
      lat: -8.5375,
      lon: 115.403889,
      latDMS: 'S 8°32\'15.0"',
      lonDMS: 'E 115°24\'14.0"',
      utmZone: "50S",
      utmEasting: 315520,
      utmNorthing: 9054620
    },
    story: `<p>Pagi hari tanggal <span class="year-highlight">28 April 1908</span> menjadi hari yang mengubah sejarah Bali selamanya. Setelah bombardemen meriam dari kapal perang Belanda yang dimulai sejak <span class="year-highlight">27 April</span>, pasukan kolonial dengan persenjataan lengkap — senapan, meriam, dan infanteri — memasuki Kota Semarapura.</p>
    <p><strong>Ida Dewa Agung Jambe II</strong> mengambil keputusan yang telah bulat: beliau tidak akan menyerah. Bersama <strong>permaisuri, keluarga kerajaan, para brahmana, dan sekitar 200 pengikut setia</strong>, Raja keluar dari gerbang <strong>Puri Agung Klungkung</strong> dalam prosesi yang khidmat namun mengerikan.</p>
    <p>Mereka mengenakan <strong>pakaian serba putih</strong> — simbol kesucian dan kesiapan menghadapi kematian — serta bersenjatakan <strong>keris</strong> dan tombak tradisional. Menghadapi senapan dan meriam Belanda, mereka bergerak maju tanpa gentar.</p>
    <p>Raja gugur diterjang peluru tentara Belanda. Permaisuri dan para perempuan kerajaan yang menyaksikan jatuhnya raja, kemudian melakukan <strong>bunuh diri ritual</strong> dengan menghunjamkan keris ke dada mereka sendiri. Pertumpahan darah ini berlanjut hingga seluruh rombongan kerajaan gugur.</p>
    <p><strong>Puputan Klungkung</strong> menandai berakhirnya era kerajaan-kerajaan independen di Bali dan merupakan <strong>intervensi militer Belanda yang ketujuh dan terakhir</strong> di pulau Dewata.</p>`
  },

  // ── LEVEL 6 ─────────────────────────────────────────────────
  {
    id: 6,
    title: "Warisan dan Peringatan",
    locationName: "Monumen Puputan Klungkung",
    clue: "Untuk mengenang peristiwa Puputan Klungkung, sebuah monumen setinggi 28 meter didirikan di jantung Kota Semarapura. Pada tahun berapa monumen ini dibangun, dan pada tahun berapa Ida Dewa Agung Jambe II resmi ditetapkan sebagai Pahlawan Nasional Indonesia?",
    answers: [
      "1992 2023",
      "1992, 2023",
      "1992 dan 2023",
      "monumen 1992 pahlawan 2023",
      "1992",
      "2023"
    ],
    hint: "Monumen ini didirikan menjelang akhir abad ke-20... dan pengakuan sebagai pahlawan nasional baru terjadi di era modern, setelah lebih dari satu abad sejak peristiwa puputan...",
    cache: {
      lat: -8.538889,
      lon: 115.404444,
      latDMS: 'S 8°32\'20.0"',
      lonDMS: 'E 115°24\'16.0"',
      utmZone: "50S",
      utmEasting: 315575,
      utmNorthing: 9054462
    },
    story: `<p>Peristiwa Puputan Klungkung meninggalkan luka mendalam sekaligus kebanggaan abadi bagi masyarakat Bali. Kata <strong>'Puputan'</strong> sendiri berasal dari kata <em>puput</em> yang berarti 'selesai' atau 'habis' — melambangkan penyelesaian perjuangan dengan semangat pantang menyerah hingga tetes darah penghabisan.</p>
    <p>Untuk mengenang kepahlawanan ini, pada tahun <span class="year-highlight">1992</span> didirikan <strong>Monumen Puputan Klungkung</strong> setinggi <strong>28 meter</strong> di kawasan <em>Catus Pata</em>, jantung Kota Semarapura. Angka 28 meter ini merujuk pada tanggal peristiwa puputan: <span class="year-highlight">28 April</span>.</p>
    <p>Setiap tanggal <span class="year-highlight">28 April</span>, masyarakat Klungkung memperingati <strong>Hari Puputan Klungkung</strong> yang sekaligus menjadi hari jadi Kota Semarapura.</p>
    <p>Pengakuan tertinggi datang pada <span class="year-highlight">November 2023</span>, ketika pemerintah Indonesia secara resmi menetapkan <strong>Ida Dewa Agung Jambe II sebagai Pahlawan Nasional</strong>. Pengakuan ini menjadi bukti bahwa pengorbanan beliau dan seluruh rakyat Klungkung tidak pernah dilupakan oleh bangsa Indonesia.</p>
    <p>Di sekitar kawasan bersejarah ini, berdiri pula <strong>Kertha Gosa</strong> — balai pengadilan kerajaan dengan lukisan wayang Kamasan yang menakjubkan — dan <strong>Museum Semarajaya</strong> yang menyimpan berbagai artefak sejarah kerajaan Klungkung. Semua ini menjadi saksi bisu kebesaran sebuah kerajaan yang memilih kehormatan di atas segalanya.</p>`
  }
];

// ── Answer Validation ────────────────────────────────────────
function validateAnswer(levelId, userAnswer) {
  const level = LEVELS.find(l => l.id === levelId);
  if (!level) return false;

  const normalized = userAnswer
    .toLowerCase()
    .trim()
    .replace(/[.,;:!?'"()]/g, '')
    .replace(/\s+/g, ' ');

  return level.answers.some(answer => {
    const normalizedAnswer = answer.toLowerCase().trim();
    // Check if user answer contains the accepted answer or vice versa
    return normalized.includes(normalizedAnswer) || normalizedAnswer.includes(normalized);
  });
}

// ── Closing Narration (shown after completing all 6 levels) ──
const CLOSING_NARRATION = `
  <p>Anda telah menyelesaikan seluruh perjalanan <strong>Geocaching: Jejak Puputan Klungkung</strong>.</p>
  <p>Melalui petualangan ini, Anda telah menelusuri jejak-jejak kepahlawanan terakhir Kerajaan Klungkung — dari berdirinya kerajaan pada tahun <span class="year-highlight">1686</span>, hingga peristiwa heroik <strong>Puputan Klungkung</strong> pada <span class="year-highlight">28 April 1908</span>, dan pengakuan <strong>Ida Dewa Agung Jambe II</strong> sebagai <strong>Pahlawan Nasional</strong> pada tahun <span class="year-highlight">2023</span>.</p>
  <p>Puputan bukan sekadar peristiwa sejarah — ia adalah simbol keberanian, kehormatan, dan cinta tanah air yang abadi. Semangat <em>puputan</em> mengajarkan kita bahwa ada hal-hal yang lebih berharga dari kehidupan itu sendiri: <strong>kehormatan, kedaulatan, dan martabat bangsa</strong>.</p>
  <p><em>"Lebih baik mati terhormat daripada hidup dalam kehinaan."</em></p>
  <p class="closing-sign">— Semangat Puputan Klungkung —</p>
`;
