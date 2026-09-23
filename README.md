# My MBG

Responsive Web/PWA untuk sistem audit, monitoring, validasi distribusi, pelaporan anomali, preferensi menu, food waste, dan intelijen gizi Program Makan Bergizi Gratis.

## Akun akses

| Role | Akun | Password |
|---|---|---|
| Siswa | `siswa@mymbg.id` | `mymbg2026` |
| Guru/Sekolah | `guru@mymbg.id` | `mymbg2026` |
| Vendor/SPPG | `vendor@mymbg.id` | `mymbg2026` |
| Pemerintah/Pengawas | `pemerintah@mymbg.id` | `mymbg2026` |
| Admin | `admin@mymbg.id` | `mymbg2026` |

## Menjalankan

```bash
npm install
npm run dev
```

## Deploy Vercel

Import repository/project ke Vercel dan jalankan deployment standar Next.js. Tidak ada environment variable wajib untuk versi ini.

## Isi aplikasi

- Siswa: menu dua minggu, detail gizi, voting, umpan balik konsumsi, bacaan gizi, dan profil.
- Sekolah/Guru: jadwal distribusi, Sidak Nalar, GPS, foto bukti, analisis AI, human verification, riwayat, anomali, musyawarah kelas, dan SOP.
- Vendor/SPPG: distribusi, rencana menu dan produksi, quality control, clearance, klaim, logistik, anomali, dan riwayat.
- Pemerintah/Pengawas: executive overview, peta monitoring, SPPG, distribusi, food waste dan preferensi, anomaly center, corrective action, audit trail, clearance, reports, dan analytics.
- Admin: pengguna, sekolah, SPPG, wilayah, menu master, system log, dan settings.

## Interaksi antarlayar

Perpindahan route memiliki indikator progress dan animasi transisi halaman. State interaksi utama disimpan melalui browser localStorage, termasuk voting, umpan balik konsumsi, validasi, anomali, corrective action, digital clearance, klaim vendor, keputusan pengawas, dan audit log.

Folder `supabase/schema.sql` tersedia sebagai rancangan migrasi backend PostgreSQL.

## Quality Control

Build ini telah melalui role-by-role QC serta pengujian alur end-to-end distribusi → Sidak Nalar → clearance → klaim → approval/hold. Ringkasan role tersedia di `QA_ROLE_BY_ROLE.md` dan pengujian workflow terbaru tersedia di `QA_WORKFLOW_V9.md`.


## Alur Clearance & Klaim

Clearance dihitung dari bukti distribusi nyata di state aplikasi: foto, GPS, timestamp, AI QC, human verification, dan status anomali. Klaim vendor hanya dapat diajukan saat clearance `ELIGIBLE`. Pengawas dapat menyetujui menjadi `READY_FOR_PAYMENT`, menahan klaim, atau meminta klarifikasi.
