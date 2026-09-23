# My MBG — Role-by-Role Quality Control

Tanggal QC: 23 September 2026
Build: v8 role-tested

## Ruang lingkup
QC dilakukan dengan menelusuri alur masing-masing role seperti pengguna nyata: login, navigasi, isi halaman, detail record, tombol aksi, perubahan state, pembatasan data, loading antarhalaman, asset, grafik, peta, dan hubungan antar-role. Selain walkthrough source/state, 56 pemeriksaan otomatis dijalankan terhadap route, action, data, asset, manifest, dan syntax TS/TSX.

Catatan lingkungan: build browser penuh belum dapat dijalankan pada workspace QC karena dependency Next.js belum tersedia lokal dan registry npm tidak dapat di-resolve. Karena itu, tile peta eksternal tidak dapat diuji secara live di workspace ini. Source map, event, filter, marker, loading, error, dan retry tetap diperiksa secara langsung.

---

## 1. Login & role access — PASS

Skenario yang dicek:
- login sebagai siswa, guru, vendor, pemerintah, dan admin;
- role akun menentukan portal tujuan;
- role guard mencegah session role lain membuka portal yang berbeda;
- logout membersihkan session;
- akun tambahan buatan admin dapat digunakan login selama berstatus Active.

Perbaikan QC:
- akun tambahan admin tersimpan persisten dan dibaca halaman login;
- state key dinaikkan agar deployment terbaru memakai struktur data QC terbaru;
- session role tetap diverifikasi di setiap route `/[role]/...`.

---

## 2. Siswa — PASS

Journey yang dicek:
1. login siswa;
2. lihat menu tanggal aktif;
3. buka detail menu;
4. pindah Minggu Ini / Minggu Depan;
5. pilih dan ubah voting;
6. kirim umpan balik konsumsi dan rating;
7. filter dan buka materi Belajar Gizi;
8. lihat jadwal dua minggu;
9. buka profil;
10. logout.

Isi yang tersedia:
- 10 menu sekolah untuk dua minggu;
- kandungan energi, protein, karbohidrat, lemak, dan komponen;
- voting persisten;
- 8 materi edukasi gizi;
- feedback Habis / Sebagian / Banyak sisa dan rating 1–5;
- preview menu berikutnya dan jadwal dua minggu.

Perbaikan QC:
- penanda Hari Ini mengikuti tanggal, bukan indeks;
- menu yang dinonaktifkan admin tidak muncul di daftar, voting, dan detail;
- feedback menyimpan sekolah agar dapat diolah per cakupan SPPG;
- tanggal feedback mengikuti Asia/Jakarta;
- profil tidak lagi hard-coded untuk satu nama/kelas: avatar, keterangan, dan akun membaca session user;
- admin tidak dapat menonaktifkan seluruh menu sekaligus sehingga portal siswa selalu memiliki minimal satu menu aktif.

---

## 3. Guru / Sekolah — PASS

Journey yang dicek:
1. login guru;
2. lihat agenda dan distribusi sekolah;
3. buka Jadwal Distribusi;
4. jalankan Sidak Nalar: konfirmasi distribusi → foto → lokasi → AI analysis → human verification → simpan;
5. buka hasil di Riwayat Validasi;
6. buat laporan anomali;
7. pantau status anomali;
8. buka Musyawarah Kelas;
9. buka SOP Gizi;
10. profil dan logout.

Perbaikan QC:
- KPI guru dihitung dari data sekolah;
- riwayat/detail validasi dibatasi ke sekolah akun;
- detail anomali dibatasi ke sekolah akun;
- Sidak Nalar tidak lagi boleh fallback ke distribusi sekolah lain;
- akun guru tanpa distribusi sendiri mendapat empty state yang aman;
- foto wajib tersedia sebelum melanjutkan dan file upload disimpan sebagai evidence terkompresi;
- hasil AI baru muncul setelah user menjalankan analisis;
- komponen AI mengikuti menu distribusi;
- GPS referensi sekolah tidak dianggap lokasi perangkat terverifikasi;
- ID dan timestamp mengikuti Asia/Jakarta;
- hasil human verification mengubah status distribusi dan membuat audit log;
- profil guru menggunakan data session, bukan inisial hard-coded.

Catatan fungsional: analisis AI saat ini rule-based dan konsisten untuk alur sistem; belum memanggil model Computer Vision eksternal.

---

## 4. Vendor / SPPG — PASS

Journey yang dicek:
1. login vendor;
2. lihat Overview;
3. ganti trend QC / On-time / Pemenuhan Porsi;
4. buat distribusi baru;
5. buka detail distribusi;
6. jalankan lifecycle SCHEDULED → PREPARING → IN_TRANSIT → DELIVERED → VALIDATION_PENDING;
7. buka Quality Control;
8. tandai kesiapan produksi;
9. buka Digital Clearance;
10. buka Klaim;
11. buka Logistik & Forecast;
12. tanggapi anomali dan kirim corrective action;
13. buka riwayat dan profil;
14. logout.

Perbaikan QC:
- grafik trend dihitung dari histori distribusi/QC per tanggal;
- QC, On-time, dan Pemenuhan Porsi memakai seri yang berbeda;
- grafik memiliki empty state bila SPPG baru belum punya histori;
- format tanggal aman bila organisasi baru belum memiliki data;
- distribusi baru hanya menawarkan sekolah yang terkait SPPG user;
- direct URL detail distribusi, clearance, dan anomali dibatasi ke SPPG user;
- status distribusi bergerak melalui lifecycle operasional dan setiap perubahan masuk audit log;
- saat DELIVERED, realisasi porsi dan waktu tiba ikut tercatat;
- readiness produksi persisten;
- preferensi menu dihitung dari suara yang tersimpan;
- food-waste signal hanya memakai feedback sekolah dalam cakupan SPPG;
- corrective action tersimpan dan dapat dilihat pemerintah.

---

## 5. Pemerintah / Pengawas — PASS pada logic/source

Journey yang dicek:
1. login pemerintah;
2. buka Executive Overview;
3. buka Peta Monitoring;
4. filter provinsi dan risk;
5. klik marker SPPG;
6. buka detail SPPG;
7. monitoring distribusi;
8. buka Food Waste & Preferensi dan switch 7/30 hari;
9. review anomali;
10. request clarification / resolve;
11. approve corrective action;
12. buka Audit Trail;
13. monitor clearance;
14. unduh report CSV;
15. buka Analytics;
16. logout.

Perbaikan QC:
- KPI, trend compliance, validation rate, risk, dan anomaly count dihitung dari state;
- detail SPPG memakai distribusi/validasi/anomali terkait;
- map marker menerima compliance, anomaly count, dan risk terbaru;
- filter provinsi dan risk benar-benar mengubah set marker;
- Food Waste 7/30 hari benar-benar memfilter record berdasarkan tanggal;
- preferensi menu memakai voting;
- approve corrective action juga menyelesaikan anomali terkait dan membuat audit log;
- report CSV memakai data saat ini;
- analytics memakai validation, anomaly, corrective action, dan distribusi aktual.

Peta menggunakan Leaflet + OpenStreetMap dengan zoom, pan, marker interaktif, popup, fit bounds, loading, error, dan retry. Tile membutuhkan koneksi internet saat web dijalankan.

---

## 6. Admin — PASS

Journey yang dicek:
1. login admin;
2. lihat KPI dan log terbaru;
3. cari user;
4. tambah user dengan role/organisasi/password;
5. aktif/nonaktifkan user tambahan;
6. gunakan akun tambahan untuk login;
7. cari sekolah dan SPPG;
8. lihat wilayah;
9. aktif/nonaktifkan menu;
10. buka System Logs;
11. ubah dan simpan Settings;
12. logout.

Perbaikan QC:
- managed user persisten dan login-capable;
- menu Active/Inactive persisten dan memengaruhi portal terkait;
- minimal satu menu wajib tetap aktif;
- settings persisten dan menghasilkan audit log;
- KPI admin dihitung dari data;
- sekolah/SPPG/wilayah dilabel sebagai direktori karena belum menyediakan CRUD penuh.

---

## 7. Navigasi, loading, tombol, dan asset — PASS

- Semua item sidebar memiliki dispatcher route yang sesuai.
- Tidak ditemukan tombol UI yang tampak aktif tanpa handler/submit.
- Perpindahan route memiliki progress/loading transition.
- `app/loading.tsx` tersedia untuk fallback loading.
- Root `/` langsung menuju `/login`.
- Semua image reference tersedia di folder public.
- Manifest JSON valid.
- Tidak ada label non-production yang dilarang pada source UI.

---

## 8. Data isolation — PASS pada layer UI/state

- Guru hanya dapat membuka data validation/anomaly sekolahnya.
- Vendor hanya dapat membuka detail distribution/clearance/anomaly SPPG miliknya.
- Pemerintah dapat memonitor lintas SPPG.
- Admin memiliki akses administrasi global.

Catatan teknis penting: autentikasi dan state versi ini masih berjalan di browser/localStorage. Untuk keamanan server-side saat benar-benar digunakan banyak user, tahap berikutnya adalah mengaktifkan Supabase Auth, database, storage policy, dan Row Level Security.

---

## 9. Hasil pemeriksaan otomatis

56/56 checks PASS, mencakup:
- parsing 20 file TS/TSX;
- 5 role account;
- 10 menu;
- 8 SPPG dengan koordinat;
- 8 sekolah;
- 30 distribusi;
- 8 validasi;
- 120 feedback konsumsi;
- route/dispatcher seluruh role;
- role guard dan data isolation;
- action penting setiap role;
- trend vendor;
- implementasi peta;
- loading;
- button action scan;
- asset dan manifest.

Tidak ditemukan failure pada pemeriksaan otomatis terakhir.
