// ============================================================
// data.js — Geocaching: Jejak Puputan Klungkung (v2)
// 7 Levels (0–6): Clues, Materi, Post-Test, Video, Coordinates
// Based on: materi_game_lengkap 2.md
// ============================================================

const LEVELS = [
  // ═══════════════════════════════════════════════════════════
  // LEVEL 0 — Prolog: "Ketika Dunia Berubah" (Tanpa GPS)
  // ═══════════════════════════════════════════════════════════
  {
    id: 0,
    title: 'Prolog: "Ketika Dunia Berubah"',
    locationName: "Tanpa Lokasi (Prolog)",
    hasGPS: false,
    clueIntro: "Sebelum menjejak tanah Klungkung, kau harus tahu dulu: dari mana datangnya badai yang mengguncang seluruh Nusantara?",
    clue: "Susun 3 kata kunci berikut sesuai urutan waktu kemunculannya:\n\nTanam Paksa — VOC — Devide et Impera",
    answers: [
      "voc devide et impera tanam paksa",
      "voc, devide et impera, tanam paksa",
      "voc - devide et impera - tanam paksa",
      "voc → devide et impera → tanam paksa"
    ],
    hint: "VOC didirikan pada awal abad ke-17... Politik adu domba digunakan VOC untuk memecah kerajaan lokal... Tanam Paksa baru dimulai tahun 1830 di era Van den Bosch...",
    cache: null,
    story: `<p>Kedatangan bangsa Eropa ke Nusantara bermula dari perburuan rempah-rempah setelah jatuhnya <strong>Konstantinopel</strong> ke tangan Turki Usmani pada <span class="year-highlight">1453</span>, yang menutup akses dagang Eropa ke jalur rempah lewat darat. Portugis menjadi bangsa Eropa pertama yang berhasil menguasai <strong>Malaka</strong> (<span class="year-highlight">1511</span>), disusul kedatangan <strong>VOC</strong> (<em>Vereenigde Oostindische Compagnie</em>) Belanda pada awal abad ke-17.</p>
<p>Dari sekadar berdagang, VOC lambat laun menerapkan <strong>monopoli perdagangan</strong>, mencampuri urusan politik internal kerajaan-kerajaan lokal (<strong><em>devide et impera</em></strong> — politik adu domba), hingga menguasai wilayah secara langsung (kolonialisme). Setelah VOC bangkrut dan dibubarkan tahun <span class="year-highlight">1799</span>, kendali diambil alih pemerintah Hindia Belanda, yang melanjutkan eksploitasi lewat kebijakan seperti kerja paksa (<em>rodi</em>) era <strong>Daendels</strong> dan <strong>Tanam Paksa</strong> (<em>Cultuurstelsel</em>) era <strong>Van den Bosch</strong>.</p>
<p>Praktik ini memicu perlawanan di hampir seluruh penjuru Nusantara. Pola perlawanan abad ke-16–18 umumnya dipimpin figur sultan/raja lokal (<strong>Sultan Baabullah</strong> di Ternate, <strong>Sultan Ageng Tirtayasa</strong> di Banten), sedangkan perlawanan abad ke-19 — seperti <strong>Perang Diponegoro</strong>, <strong>Perang Padri</strong>, dan <strong>Perang Aceh</strong> — menggunakan strategi perang semesta berkepanjangan yang menguras kas kolonial.</p>
<p><strong>Bali bukan pengecualian.</strong> Justru di ujung timur Nusantara ini, pola yang sama terjadi dengan satu perbedaan mencolok: alih-alih menyerah saat kalah, raja-raja Bali memilih <em>puputan</em> — perang total hingga titik darah penghabisan. Perjalananmu di game ini akan menelusuri satu babak paling dramatis dari pola perlawanan itu: bagaimana Kerajaan Klungkung, dari sengketa hukum laut sederhana pada <span class="year-highlight">1849</span>, berujung pada kejatuhan total kerajaannya sendiri 59 tahun kemudian.</p>`,
    videos: [
      { title: "Kolonialisme Imperialisme / Penjelajahan Samudera — Sejarah Kelas XI", url: "https://www.youtube.com/watch?v=6svAwqP4QvQ" }
    ],
    postTest: [
      {
        type: 'mc',
        question: 'Manakah pola yang paling tepat menggambarkan hubungan antara VOC dan kerajaan-kerajaan lokal Nusantara pada awal kedatangannya?',
        options: [
          'Penaklukan militer langsung sejak hari pertama',
          'Hubungan dagang yang perlahan bergeser menjadi monopoli dan intervensi politik',
          'Aliansi setara tanpa unsur eksploitasi',
          'Penyebaran agama sebagai tujuan utama'
        ],
        correct: 1,
        points: 20
      },
      {
        type: 'mc',
        question: 'Mengapa perlawanan daerah abad ke-19 (seperti Perang Diponegoro, Perang Padri) dianggap lebih "menguras" kolonial Belanda dibanding perlawanan abad ke-16–18?',
        options: [
          'Karena memakai senjata lebih modern',
          'Karena berlangsung dalam jangka panjang dengan strategi gerilya/perang semesta',
          'Karena melibatkan kekuatan asing lain',
          'Karena terjadi di ibu kota kolonial'
        ],
        correct: 1,
        points: 20
      },
      {
        type: 'mc',
        question: 'Berdasarkan pola umum perlawanan daerah di Nusantara, apa yang membuat kasus Bali (termasuk Klungkung) berbeda dari kebanyakan daerah lain?',
        options: [
          'Bali tidak pernah menandatangani perjanjian apa pun dengan Belanda',
          'Perlawanan di Bali dipilih diselesaikan lewat puputan alih-alih menyerah',
          'Bali adalah satu-satunya wilayah yang tidak pernah diserang Belanda',
          'Bali menggunakan senjata modern setara Belanda'
        ],
        correct: 1,
        points: 20
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 1 — Pelabuhan Batulahak: Hukum Tawan Karang
  // ═══════════════════════════════════════════════════════════
  {
    id: 1,
    title: "Pelabuhan Batulahak: Hukum Tawan Karang",
    locationName: "Pelabuhan Batulahak, Kusamba",
    hasGPS: true,
    clueIntro: "Aku bukan hukum tertulis di atas kertas Eropa. Aku lahir dari laut, dari karang, dari keyakinan bahwa apa yang terdampar di pantaimu adalah milikmu. Namaku membuat kapal-kapal asing gentar mendekat.",
    clue: "Siapakah aku, dan di pelabuhan mana kisahku soal kapal 'King' bermula?",
    answers: [
      "tawan karang batulahak",
      "hukum tawan karang batulahak",
      "tawan karang pelabuhan batulahak",
      "hukum tawan karang",
      "tawan karang",
      "batulahak"
    ],
    hint: "Hukum adat maritim ini berlaku di seluruh kerajaan Bali sejak abad ke-9/10. Kapal asing yang kandas di perairan Bali menjadi hak milik raja... Pelabuhan ini terletak di area Kusamba/Pesinggahan...",
    cache: {
      lat: -8.5530,
      lon: 115.4680,
      latDMS: "S 8°33'11.0″",
      lonDMS: "E 115°28'05.0″"
    },
    story: `<p><strong><em>Tawan karang</em></strong> adalah hukum adat maritim yang berlaku di seluruh kerajaan Bali sejak sekitar abad ke-9/10 — jauh sebelum Eropa datang. Aturannya sederhana namun tegas: kapal asing yang kandas di perairan sebuah kerajaan Bali, beserta seluruh muatan dan awaknya, menjadi hak milik raja penguasa wilayah tersebut.</p>
<p>Belanda, yang berkali-kali dirugikan kapal dagangnya kandas dan disita, memandang aturan ini sebagai penghalang dagang. Sejak awal abad ke-19 Belanda menekan raja-raja Bali untuk menghapuskannya. Pada <span class="year-highlight">24 Mei 1843</span>, tujuh kerajaan Bali — termasuk Klungkung — menandatangani perjanjian yang salah satu isinya adalah penghapusan tawan karang. Namun di lapangan, perjanjian ini nyaris tak pernah benar-benar dijalankan.</p>
<p>Ketegangan memuncak ketika dua <em>skoner</em> (perahu) milik <strong>G.P. King</strong>, seorang pedagang berkebangsaan Belanda yang berbasis di Ampenan, Lombok, terdampar di <strong>Pelabuhan Batulahak</strong>, sekitar Pesinggahan. Sesuai tawan karang, penduduk Pesinggahan dan Dawan merampas kapal tersebut. <strong>Raja Klungkung</strong> bahkan memerintahkan agar awak kapal dibunuh karena dianggap sebagai pengacau.</p>
<p>Insiden ini dilaporkan <strong>Mads Lange</strong> (pengusaha Denmark di Kuta) kepada Residen Belanda di Besuki, yang segera memprotes keras. Kemarahan Belanda kian memuncak karena Klungkung juga diketahui membantu <strong>Kerajaan Buleleng</strong> dalam <strong>Perang Jagaraga</strong> pada April <span class="year-highlight">1849</span>. Kombinasi dua faktor inilah — pelanggaran tawan karang di Kusamba dan dukungan Klungkung terhadap Buleleng — yang membuat Belanda memutuskan mengarahkan ekspedisi militernya langsung ke Klungkung.</p>`,
    videos: [
      { title: "Lintasan Sejarah Perang Bali | Dari Jagaraga Hingga Klungkung", url: "https://www.youtube.com/watch?v=Ac2qfcBG_YA" }
    ],
    postTest: [
      {
        type: 'mc',
        question: 'Apa akar penyebab konflik antara Belanda dan kerajaan-kerajaan Bali terkait tawan karang?',
        options: [
          'Belanda ingin mengambil alih seluruh sistem hukum adat Bali',
          'Tawan karang merugikan Belanda karena kapal dagangnya sering kandas dan disita',
          'Belanda melarang segala bentuk hukum adat di wilayah jajahannya',
          'Tawan karang hanya berlaku untuk kapal-kapal Inggris'
        ],
        correct: 1,
        points: 20
      },
      {
        type: 'mc',
        question: 'Analisislah: mengapa Belanda memilih menyerang Klungkung tepat setelah Perang Jagaraga, bukan sebelumnya atau langsung setelah insiden kapal King?',
        options: [
          'Karena pasukan Belanda sedang berada di dekat Bali (Jagaraga) sekaligus Klungkung dianggap ikut membantu Buleleng, sehingga dua faktor itu saling memperkuat alasan penyerangan',
          'Karena Klungkung meminta untuk diserang lebih dulu',
          'Karena tidak ada hubungan sama sekali antara Jagaraga dan Klungkung',
          'Karena Belanda kehabisan pasukan sehingga menunggu bantuan'
        ],
        correct: 0,
        points: 20
      },
      {
        type: 'mc',
        question: 'Perjanjian 1843 menuntut penghapusan tawan karang, tetapi praktiknya tetap berlangsung di Klungkung. Apa yang bisa dianalisis dari kesenjangan ini?',
        options: [
          'Perjanjian tersebut sebenarnya tidak pernah ditandatangani',
          'Raja-raja Bali menandatangani perjanjian sebagai strategi diplomatik jangka pendek, tanpa niat melaksanakannya secara penuh karena tawan karang tetap dianggap bagian penting kedaulatan',
          'Belanda yang melanggar perjanjian tersebut lebih dulu',
          'Tawan karang sudah dihapus total sebelum 1849'
        ],
        correct: 1,
        points: 20
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 2 — Pura Goa Lawah: Perang Kusamba Dimulai
  // ═══════════════════════════════════════════════════════════
  {
    id: 2,
    title: "Pura Goa Lawah: Perang Kusamba Dimulai",
    locationName: "Pura Goa Lawah",
    hasGPS: true,
    clueIntro: "Ribuan kelelawar menjaga gua suci ini di siang hari. Namun pada 24 Mei 1849, yang berjaga bukan hanya kelelawar — melainkan sekitar 2.000 sikep Klungkung menanti pasukan seorang jenderal yang telah menaklukkan tujuh daerah.",
    clue: "Temukan tempat mereka bertahan.",
    answers: [
      "pura goa lawah",
      "goa lawah",
      "goalawah"
    ],
    hint: "Tempat ini adalah pura yang terkenal di Bali timur, terletak di tebing pantai dan dipenuhi ribuan kelelawar...",
    cache: {
      lat: -8.5433,
      lon: 115.4706,
      latDMS: "S 8°32'36.0″",
      lonDMS: "E 115°28'14.0″"
    },
    story: `<p>Ekspedisi militer Belanda ke Klungkung dipimpin <strong>Mayor Jenderal Andreas Victor Michiels</strong> — seorang komandan dengan reputasi telah memenangkan kampanye di tujuh daerah berbeda. <strong>Perang Kusamba</strong> (dikenal juga sebagai <strong>Perang Bali III</strong>) resmi pecah pada <span class="year-highlight">24–25 Mei 1849</span>, tak lama setelah Belanda menuntaskan penaklukan Jagaraga dan Karangasem.</p>
<p>Pada <span class="year-highlight">24 Mei 1849</span>, Belanda menyerang dari arah timur menuju Kusamba. Laskar Klungkung — dipimpin <strong>Anak Agung Made Sangging</strong>, panglima perang sekaligus adik raja Klungkung — telah memperkuat garis pertahanan sepanjang punggung bukit Wates, dengan pasukan induk sekitar <strong>2.000 prajurit</strong> berpusat di kompleks <strong>Pura Goa Lawah</strong>.</p>
<p>Pertempuran berlangsung sengit selama kurang lebih <strong>lima jam</strong>. Karena senjata tradisional (keris, tombak, pedang) tak sepadan menghadapi senapan modern Belanda, laskar Klungkung akhirnya mengambil keputusan taktis: <strong>mundur ke arah barat menuju benteng Kusamba</strong> sambil membakar desa-desa yang dilewati untuk memperlambat pengejaran pasukan Belanda.</p>
<p>Benteng Kusamba terletak sekitar 4 km dari Goa Lawah, dan segera menjadi pertahanan kedua Klungkung yang lebih kuat — dikelilingi tembok berlapis dan permukiman padat berlorong yang sulit ditembus pasukan asing.</p>`,
    videos: [
      { title: "Lintasan Sejarah Perang Bali | Dari Jagaraga Hingga Klungkung", url: "https://www.youtube.com/watch?v=Ac2qfcBG_YA" }
    ],
    postTest: [
      {
        type: 'mc',
        question: 'Mengapa laskar Klungkung memilih mundur dari Goa Lawah ke Kusamba, alih-alih terus bertahan di posisi awal?',
        options: [
          'Karena mereka menyerah kepada Belanda',
          'Karena senjata tradisional tidak sepadan menghadapi senapan modern, sehingga mundur taktis ke benteng yang lebih kuat dianggap strategi lebih rasional',
          'Karena Pura Goa Lawah dihancurkan total',
          'Karena mereka kehabisan jumlah pasukan sejak awal'
        ],
        correct: 1,
        points: 20
      },
      {
        type: 'mc',
        question: 'Analisislah fungsi taktis dari membakar desa-desa yang dilewati saat mundur menuju Kusamba.',
        options: [
          'Sekadar tradisi ritual keagamaan',
          'Menghambat laju kejaran pasukan Belanda dan mengacaukan jalur logistik mereka',
          'Untuk merayakan kemenangan sementara',
          'Perintah langsung dari pemerintah Belanda'
        ],
        correct: 1,
        points: 20
      },
      {
        type: 'mc',
        question: 'Reputasi Jenderal Michiels sebagai penakluk tujuh daerah relevan untuk memahami peristiwa di titik selanjutnya. Apa relevansi informasi ini?',
        options: [
          'Tidak relevan sama sekali dengan peristiwa berikutnya',
          'Membuat kematiannya di Kusamba nanti menjadi kejadian luar biasa langka dan bermakna simbolis besar bagi Klungkung',
          'Menunjukkan bahwa Klungkung pasti kalah total',
          'Membuktikan Belanda tidak pernah kalah sebelumnya'
        ],
        correct: 1,
        points: 20
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 3 — Puri Kusanegara: Gugurnya Jenderal Michiels
  // ═══════════════════════════════════════════════════════════
  {
    id: 3,
    title: "Puri Kusanegara: Gugurnya Jenderal Michiels",
    locationName: "Puri Kusanegara, Desa Kusamba",
    hasGPS: true,
    clueIntro: "Istana ini dibangun di pesisir oleh seorang raja bernama I Dewa Agung Putra. Di sinilah, dalam gelap dini hari, kegelapan berubah jadi terang oleh peluru penerang musuh sendiri — dan keputusan itu berbalik menjadi bencana bagi mereka.",
    clue: "Di manakah istana tersebut berada?",
    answers: [
      "puri kusanegara",
      "kusanegara",
      "puri kusanegara kusamba",
      "kusanegara kusamba"
    ],
    hint: "Istana ini dibangun di Desa Kusamba, menjadikan Kusamba pusat pemerintahan kedua Klungkung sekaligus pelabuhan penting...",
    cache: {
      lat: -8.5520,
      lon: 115.4640,
      latDMS: "S 8°33'07.0″",
      lonDMS: "E 115°27'50.0″"
    },
    story: `<p><strong>Kusanegara</strong> adalah istana yang dibangun Raja <strong>I Dewa Agung Putra</strong> di Desa Kusamba, menjadikan Kusamba pusat pemerintahan kedua Klungkung sekaligus pelabuhan penting.</p>
<p>Setelah mundur dari Goa Lawah, pasukan Belanda mendirikan perkemahan di sekitar Puri Kusamba pada malam <span class="year-highlight">24 Mei 1849</span> karena kelelahan — sekitar <strong>3.000 sikep Klungkung</strong> telah memperkuat pertahanan di sana. Situasi ini dimanfaatkan penguasa Klungkung saat itu, <strong>I Dewa Agung Istri Kanya</strong>.</p>
<p>Sekitar <span class="year-highlight">pukul 03.00 dini hari 25 Mei</span>, di bawah komando lapangan <strong>Anak Agung Ketut Agung</strong>, laskar sikep dan pemating Klungkung menyergap perkemahan Belanda yang lengah.</p>
<p>Dalam kekacauan itu, <strong>Jenderal Michiels</strong> berdiri di depan puri untuk menilai situasi. Pasukannya menembakkan peluru penerang ke udara — namun cahaya itu justru membantu laskar Klungkung membidik sasaran. Menurut tradisi tutur masyarakat Klungkung, sebuah meriam pusaka bernama <strong>I Selisik</strong>, yang diyakini "bisa mencari sasarannya sendiri," ditembakkan dan mengenai kaki kanan sang jenderal. Michiels meninggal sekitar pukul 23.00 malam itu juga.</p>
<p>Klungkung kehilangan sekitar <strong>800 laskar</strong> (1.000 lainnya luka-luka); Belanda kehilangan <strong>Jenderal Michiels</strong>, <strong>Kapten H. Everste</strong>, dan tujuh tentara lain. Kematian seorang jenderal Belanda di medan perang adalah kejadian yang sangat jarang — sebuah <strong>kemenangan moral</strong> yang mengangkat kehormatan Klungkung.</p>
<p>Meski begitu, secara militer-politik, Belanda tetap berhasil menguasai kembali Kusamba pada <span class="year-highlight">10 Juni 1849</span> lewat serangan kedua di bawah <strong>Letnan Kolonel Van Swieten</strong>.</p>
<p><em>(Catatan: kisah meriam I Selisik yang "mencari sasaran sendiri" adalah bagian dari tradisi lisan Klungkung, bukan fakta militer yang bisa diverifikasi secara ilmiah — namun tetap sah menjadi bagian identitas budaya.)</em></p>`,
    videos: [
      { title: "Lintasan Sejarah Perang Bali | Dari Jagaraga Hingga Klungkung", url: "https://www.youtube.com/watch?v=Ac2qfcBG_YA" }
    ],
    postTest: [
      {
        type: 'mc',
        question: 'Evaluasilah: apakah kemenangan di Kusamba ini dapat disebut sebagai "kemenangan penuh" bagi Klungkung?',
        options: [
          'Ya, karena Belanda tidak pernah kembali ke Bali setelahnya',
          'Tidak sepenuhnya — secara simbolis/moral ini kemenangan besar (jenderal musuh gugur), tetapi secara militer-politik Belanda tetap merebut kembali Kusamba dua minggu kemudian',
          'Ya, karena seluruh pasukan Belanda musnah',
          'Tidak sama sekali, karena Klungkung yang menyerah'
        ],
        correct: 1,
        points: 20
      },
      {
        type: 'mc',
        question: 'Bandingkan dan evaluasi: mana yang lebih menentukan hasil serangan balasan 25 Mei — faktor kejutan atau faktor jumlah pasukan?',
        options: [
          'Jumlah pasukan, karena Klungkung jauh lebih banyak dari Belanda saat itu',
          'Faktor kejutan lebih menentukan — laskar Klungkung memanfaatkan kelengahan dan cahaya peluru penerang musuh sendiri untuk membidik sasaran secara presisi',
          'Keduanya sama sekali tidak berpengaruh',
          'Faktor cuaca menjadi penentu utama'
        ],
        correct: 1,
        points: 20
      },
      {
        type: 'mc',
        question: 'Legenda meriam I Selisik yang "mencari sasaran sendiri" tetap dikisahkan turun-temurun meski tak terverifikasi ilmiah. Apa nilai pentingnya?',
        options: [
          'Tidak ada nilainya karena tidak ilmiah, sebaiknya dihapus dari cerita',
          'Kisah ini memperkaya identitas budaya dan semangat kolektif masyarakat, asal disampaikan secara jujur sebagai tradisi lisan — bukan dicampuradukkan dengan fakta militer',
          'Kisah ini harus dianggap sepenuhnya sebagai fakta sejarah tunggal',
          'Kisah semacam ini hanya cocok untuk hiburan, tidak untuk pembelajaran'
        ],
        correct: 1,
        points: 20
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 4 — Gelgel: Bayang-Bayang Opium dan Puputan Badung
  // ═══════════════════════════════════════════════════════════
  {
    id: 4,
    title: "Gelgel: Bayang-Bayang Opium dan Puputan Badung",
    locationName: "Desa Gelgel",
    hasGPS: true,
    clueIntro: "Aku pernah menjadi pusat kerajaan sebelum Semarapura berdiri. Setengah abad kemudian, aku menjadi tempat sebuah patroli kecil memicu badai besar — bukan tentang tanah atau laut kali ini, melainkan tentang asap putih yang diperdagangkan penjajah.",
    clue: "Di desa manakah patroli opium Belanda pada April 1908 memicu eskalasi menuju Puputan Klungkung?",
    answers: [
      "gelgel",
      "desa gelgel",
      "gelgel patroli opium",
      "gelgel april 1908"
    ],
    hint: "Desa ini dulunya adalah pusat kerajaan sebelum Semarapura berdiri... Patroli opium Belanda berlangsung pada 13–16 April 1908 di desa ini...",
    cache: {
      lat: -8.5431,
      lon: 115.4069,
      latDMS: "S 8°32'35.0″",
      lonDMS: "E 115°24'25.0″"
    },
    story: `<p>Setelah Perang Kusamba, Klungkung terpaksa menandatangani ulang kontrak dengan Belanda pada <span class="year-highlight">13 Juli 1849</span> — namun ini lebih merupakan taktik diplomasi untuk menahan laju serangan lanjutan ke ibu kota, bukan penyerahan sesungguhnya. Selama lebih dari lima dekade berikutnya, dominasi Belanda di Bali diperluas bertahap lewat tekanan ekonomi, salah satunya lewat kebijakan <strong>monopoli perdagangan opium (candu)</strong> — sistem <em>opium regie</em>.</p>
<p>Pemicu proksimat pecahnya perang pada April <span class="year-highlight">1908</span> adalah <strong>patroli keamanan Belanda di Desa Gelgel</strong> pada <span class="year-highlight">13–16 April 1908</span>, yang bertujuan memeriksa tempat-tempat penjualan candu di bawah monopoli Belanda. Klungkung menganggap patroli ini sebagai pelanggaran kedaulatan. Kerabat raja, <strong>Cokorda Gelgel</strong>, mempersiapkan penyerangan, dan serangan dilancarkan pada <span class="year-highlight">16 April 1908</span>.</p>
<p>Dua tahun sebelumnya, pada <span class="year-highlight">27 Mei 1904</span>, kapal dagang <em>Sri Kumala</em> milik saudagar <strong>Kwee Ten Tjiang</strong> kandas di perairan Sanur, wilayah Kerajaan Badung. Fakta yang jarang diketahui: raja yang menolak tuntutan ganti rugi Belanda bukan hanya Raja Badung (<strong>I Gusti Ngurah Made Agung</strong>), <strong>melainkan juga Raja Klungkung sendiri, Dewa Agung Jambe II, dan Raja Tabanan Cokorda Ngurah Rai</strong>.</p>
<p>Pada <span class="year-highlight">20 September 1906</span>, Raja Badung beserta seluruh keluarga dan rakyatnya — berpakaian serba putih — memilih keluar istana dan bertempur hingga titik darah penghabisan: <strong>Puputan Badung</strong>. Karena raja Klungkung sudah terlibat personal dalam sengketa Sri Kumala sejak 1904, peristiwa Badung bukan sekadar berita dari daerah tetangga — melainkan <strong>peringatan langsung</strong> bahwa nasib serupa bisa menimpa Klungkung kapan saja.</p>`,
    videos: [
      { title: "Sejarah Perang Puputan Badung Bali Tahun 1906", url: "https://www.youtube.com/watch?v=A_qQhXtX8jY" },
      { title: "Sejarah Perang Puputan Badung di Pulau Bali (tvOne)", url: "https://www.youtube.com/watch?v=Svh4yoqAZJE" }
    ],
    postTest: [
      {
        type: 'mc',
        question: 'Evaluasilah klaim resmi Belanda bahwa patroli di Gelgel semata-mata untuk "keamanan perdagangan candu." Seberapa meyakinkan alasan ini jika dikaitkan dengan pola insiden Sri Kumala di Badung?',
        options: [
          'Sangat meyakinkan, karena candu memang berbahaya dan perlu diawasi',
          'Kurang meyakinkan — polanya mirip Sri Kumala: insiden kecil dijadikan dalih untuk intervensi/ekspansi kekuasaan yang sebenarnya sudah direncanakan',
          'Tidak ada hubungannya sama sekali dengan Sri Kumala',
          'Meyakinkan karena Belanda tidak pernah berbohong soal alasan militer'
        ],
        correct: 1,
        points: 20
      },
      {
        type: 'mc',
        question: 'Mengapa fakta bahwa Dewa Agung Jambe II juga terlibat langsung dalam sengketa Sri Kumala (1904) penting untuk mengevaluasi sikap Klungkung menjelang 1908?',
        options: [
          'Tidak penting, kedua peristiwa itu berdiri sendiri-sendiri',
          'Penting — itu menunjukkan raja Klungkung sudah punya alasan personal untuk waspada terhadap pola intervensi Belanda, bukan sekadar bersimpati pada Badung dari kejauhan',
          'Menunjukkan bahwa Klungkung sebenarnya berpihak pada Belanda',
          'Membuktikan Sri Kumala tidak berkaitan dengan opium'
        ],
        correct: 1,
        points: 20
      },
      {
        type: 'mc',
        question: 'Bandingkan pemicu Perang Kusamba (1849, tawan karang) dengan pemicu Puputan Klungkung (1908, patroli opium). Apa kesamaan polanya?',
        options: [
          'Tidak ada kesamaan, keduanya soal yang sama sekali berbeda',
          'Kedua peristiwa sama-sama dipicu insiden yang relatif kecil, namun mencerminkan konflik kedaulatan yang lebih besar antara adat/kekuasaan lokal dengan ambisi kontrol ekonomi-politik kolonial',
          'Keduanya murni soal agama',
          'Keduanya tidak melibatkan Belanda sama sekali'
        ],
        correct: 1,
        points: 20
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 5 — Monumen Puputan Klungkung: Klimaks, 28 April 1908
  // ═══════════════════════════════════════════════════════════
  {
    id: 5,
    title: "Monumen Puputan Klungkung: Klimaks, 28 April 1908",
    locationName: "Monumen Puputan Klungkung, Semarapura",
    hasGPS: true,
    clueIntro: "Dua puluh delapan meter tingginya, empat pintu gerbangnya, delapan anak tangganya — semua angka ini menyimpan satu tanggal yang tak boleh dilupakan Klungkung.",
    clue: "Temukan monumen yang mengabadikannya.",
    answers: [
      "monumen puputan klungkung",
      "monumen puputan",
      "puputan klungkung",
      "monumen puputan klungkung semarapura",
      "28-4-1908",
      "28 april 1908"
    ],
    hint: "Monumen ini berdiri di jantung Kota Semarapura... Angka-angka pada bangunan menyimbolkan tanggal 28-4-1908...",
    cache: {
      lat: -8.5389,
      lon: 115.4044,
      latDMS: "S 8°32'20.0″",
      lonDMS: "E 115°24'16.0″"
    },
    story: `<p>Setelah bentrokan patroli di Gelgel (<span class="year-highlight">16 April</span>), Residen Bali-Lombok <strong>F.A. Liefrinck</strong> tiba di Jumpai membawa empat kapal perang untuk memberi ultimatum kepada Raja Klungkung. Sejak <span class="year-highlight">20 April</span>, kapal perang Belanda mulai membombardir pesisir Klungkung dengan tembakan meriam bertubi-tubi. Ribuan tentara didatangkan dari Batavia, mendarat bertahap hingga <span class="year-highlight">26 April 1908</span>.</p>
<p>Pada pagi <span class="year-highlight">28 April 1908</span>, pasukan Belanda menembus pertahanan di Kusamba dan Jumpai, lalu merangsek ke Semarapura hingga mengepung istana. Pertempuran di depan istana berlangsung berlapis dan tragis: <strong>Cokorda Gelgel</strong> dan <strong>Dewa Agung Gde Semarabawa</strong> gugur lebih dulu di benteng selatan.</p>
<p>Mendengar kabar itu, permaisuri <strong>Dewa Agung Istri Muter</strong> bersama putra mahkota yang masih anak-anak, <strong>Ida I Dewa Agung Gde Agung</strong>, ikut turun ke medan pertempuran berpakaian serba putih — keduanya gugur.</p>
<p>Mendengar istri dan putra mahkotanya telah tiada, <strong>Ida Dewa Agung Jambe</strong> (<strong>Dewa Agung Jambe II</strong>) justru semakin mantap untuk maju. Atas nasihat pamannya, <strong>Cokorda Jambe</strong>, ia menancapkan keris pusakanya ke tanah sebagai simbol kepasrahan total sebelum keluar dari <strong>Pamedal Agung</strong> — gerbang istana — diiringi keluarga istana dan sekitar <strong>200 pengikut setia</strong> untuk bertempur hingga gugur bersama.</p>
<p>Kompleks istana Semarapura sebagian besar dihancurkan setelah pertempuran; hanya <strong>Kerta Gosa</strong>, <strong>Bale Kambang</strong> beserta Taman Gili, dan <strong>Gapura Kraton</strong> tersisa sebagai saksi bisu.</p>
<p>Pada <span class="year-highlight">10 November 2023</span>, Presiden <strong>Joko Widodo</strong> menganugerahkan gelar <strong>Pahlawan Nasional</strong> kepada <strong>Ida Dewa Agung Jambe</strong> atas jasanya dalam Puputan Klungkung.</p>`,
    videos: [
      { title: "Perang Puputan Klungkung 1908 - Gugurnya Raja Bali penentang Belanda", url: "https://www.youtube.com/watch?v=tPcIf1gfzGo" },
      { title: "Hari Puputan Klungkung ke-117, Penyebab dan Sejarah Jalannya Perang", url: "https://www.youtube.com/watch?v=OqPcqrEKZC8" }
    ],
    postTest: [
      {
        type: 'mc',
        question: 'Evaluasilah keputusan Ida Dewa Agung Jambe untuk tetap maju berperang setelah mengetahui istri dan putra mahkotanya telah gugur. Dari sudut pandang kepemimpinan, apa makna dari keputusan ini?',
        options: [
          'Keputusan tidak rasional yang hanya menambah korban',
          'Bentuk kepemimpinan yang mengutamakan kehormatan kolektif dan solidaritas dengan rakyatnya, alih-alih menyelamatkan diri sendiri setelah kehilangan pewaris takhta',
          'Keputusan yang dipaksakan oleh Belanda',
          'Tidak ada makna khusus, hanya kebetulan'
        ],
        correct: 1,
        points: 20
      },
      {
        type: 'essay',
        question: 'Jika kamu menjadi penasihat kerajaan pada 20 April 1908 (saat pemboman pesisir dimulai, sebelum pertempuran puncak), gagasan strategi apa yang bisa kamu ajukan untuk mengurangi korban jiwa tanpa mengubah keputusan akhir untuk mempertahankan kehormatan kerajaan? Jelaskan alasannya.',
        points: 10
      },
      {
        type: 'essay',
        question: 'Bandingkan pola gugurnya keluarga kerajaan (permaisuri & putra mahkota lebih dulu, baru raja) dengan konsep kepahlawanan modern. Menurutmu, nilai apa dari pola ini yang paling relevan diangkat untuk generasi muda saat ini?',
        points: 10
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // LEVEL 6 — Tukad Unda: Refleksi dan Warisan Nilai
  // ═══════════════════════════════════════════════════════════
  {
    id: 6,
    title: "Tukad Unda: Refleksi dan Warisan Nilai",
    locationName: "Tukad Unda",
    hasGPS: true,
    clueIntro: "Air ini tak pernah berhenti mengalir sejak 1908 — seperti kisah yang kau bawa pulang hari ini.",
    clue: "Temukan sungai yang menjadi titik akhir perjalananmu.",
    answers: [
      "tukad unda",
      "sungai unda",
      "tukad unda klungkung"
    ],
    hint: "Sungai ini mengalir di sisi barat Semarapura... Namanya terdiri dari dua kata, kata pertama berarti 'sungai' dalam bahasa Bali...",
    cache: {
      lat: -8.5194,
      lon: 115.3808,
      latDMS: "S 8°31'10.0″",
      lonDMS: "E 115°22'51.0″"
    },
    story: `<p>Dalam kosmologi Hindu Bali, upacara <strong>Ngaben</strong> (kremasi) bertujuan mengembalikan lima unsur alam (<em>Panca Maha Bhuta</em>) yang membentuk tubuh manusia kepada asalnya. Salah satu tahapannya adalah melarungkan abu jenazah ke air yang mengalir — sungai atau laut — sebagai simbol pemurnian dan pelepasan roh menuju alam berikutnya.</p>
<p><strong>Menurut tradisi lisan masyarakat Klungkung</strong>, abu jenazah <strong>Ida Dewa Agung Jambe</strong> beserta kerabat dan pengikutnya yang gugur pada <span class="year-highlight">1908</span> dilarungkan di <strong>Tukad Unda</strong>, sungai yang mengalir di sisi barat Semarapura.</p>
<p><em>(Catatan kejujuran sumber: klaim spesifik ini belum ditemukan dalam sumber akademik tertulis independen; ia diyakini secara turun-temurun oleh masyarakat setempat, sementara tradisi pelarungan abu ke sungai sendiri adalah praktik Hindu Bali yang terverifikasi luas.)</em></p>
<p>Terlepas dari detail spesifiknya, Tukad Unda tetap relevan secara simbolis sebagai titik penutup perjalananmu: aliran sungai yang membelah Klungkung menjadi metafora bahwa peristiwa <span class="year-highlight">1849–1908</span> bukan sekadar catatan yang usai, melainkan terus "mengalir" membentuk identitas dan kebanggaan Klungkung hingga kini.</p>
<p><strong>Renungkan perjalananmu:</strong> dari hukum laut yang dilanggar di Batulahak, pertahanan yang gugur di Goa Lawah, kemenangan pahit di Kusanegara, bayang-bayang candu dan Puputan Badung di Gelgel, hingga pengorbanan total di depan istana Semarapura — semua adalah satu rangkaian, bukan potongan-potongan terpisah. <em>Nilai apa yang paling ingin kamu bawa pulang?</em></p>`,
    videos: [],
    postTest: [
      {
        type: 'essay',
        question: 'Rumuskan sebuah slogan atau kalimat pendek (maksimal 15 kata) yang merangkum nilai perjuangan Puputan Klungkung, yang relevan diterapkan dalam kehidupanmu sebagai pelajar masa kini.',
        points: 10
      },
      {
        type: 'essay',
        question: 'Ciptakan satu gagasan konkret (program sekolah, konten digital, kegiatan komunitas, dll.) untuk melestarikan nilai sejarah Perlawanan Klungkung (1849–1908) agar tetap dikenal generasi muda. Jelaskan langkah pelaksanaannya secara singkat.',
        points: 10
      }
    ]
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
    return normalized.includes(normalizedAnswer) || normalizedAnswer.includes(normalized);
  });
}

// ── Post-Test Max Score Calculation ──────────────────────────
function getMaxPostTestScore() {
  return LEVELS.reduce((total, level) => {
    return total + level.postTest.reduce((lvlTotal, q) => lvlTotal + q.points, 0);
  }, 0);
}

// ── Closing Narration ────────────────────────────────────────
const CLOSING_NARRATION = `
<p>Anda telah menyelesaikan seluruh perjalanan <strong>Geocaching: Jejak Puputan Klungkung</strong>.</p>
<p>Dari hukum laut <em>tawan karang</em> di Batulahak (<span class="year-highlight">1843</span>), pertempuran sengit di Goa Lawah dan Kusanegara (<span class="year-highlight">1849</span>), bayang-bayang opium dan Puputan Badung (<span class="year-highlight">1904–1906</span>), hingga peristiwa heroik <strong>Puputan Klungkung</strong> pada <span class="year-highlight">28 April 1908</span> — Anda telah menelusuri rangkaian utuh perjuangan Kerajaan Klungkung.</p>
<p>Pengakuan tertinggi datang pada <span class="year-highlight">10 November 2023</span>, ketika <strong>Ida Dewa Agung Jambe</strong> resmi dianugerahi gelar <strong>Pahlawan Nasional</strong> oleh Presiden Joko Widodo.</p>
<p>Puputan bukan sekadar peristiwa sejarah — ia adalah simbol keberanian, kehormatan, dan cinta tanah air yang abadi.</p>
<p class="closing-sign">— Semangat Puputan Klungkung —</p>
`;
