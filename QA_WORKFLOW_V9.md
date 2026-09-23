# QA Alur End-to-End My MBG — v9

## Fokus pemeriksaan

Pemeriksaan difokuskan pada alur yang menghubungkan distribusi, validasi guru, anomali, corrective action, digital clearance, klaim vendor, dan keputusan pengawas.

## Alur yang diterapkan

1. Vendor membuat distribusi.
2. Distribusi bergerak melalui status operasional sampai `VALIDATION_PENDING`.
3. Guru melakukan Sidak Nalar: foto makanan, GPS, timestamp, AI QC, lalu human verification.
4. Jika hasil guru `Sesuai`, distribusi menjadi `VALIDATED` dan clearance dihitung ulang.
5. Jika hasil guru `Perlu Review` atau `Tidak Sesuai`, distribusi menjadi `REVIEW_REQUIRED`, anomali dibuat, dan clearance otomatis `ON_HOLD`.
6. Clearance memeriksa tujuh komponen: distribusi selesai, foto, GPS, timestamp, AI QC, human verification, dan tidak adanya anomali aktif.
7. Vendor hanya dapat menekan `Ajukan Klaim` ketika clearance `ELIGIBLE` atau `VERIFIED`.
8. Pengawas tidak dapat menyetujui clearance sebelum klaim vendor tersedia.
9. Pengawas dapat `Setujui Clearance`, `Tahan Klaim`, atau `Minta Klarifikasi`.
10. Persetujuan menghasilkan clearance `VERIFIED` dan klaim `READY_FOR_PAYMENT`.
11. Penahanan menghasilkan clearance dan klaim `ON_HOLD` beserta alasan.
12. Permintaan klarifikasi menghasilkan clearance `ON_HOLD` dan klaim `UNDER_REVIEW`; vendor dapat mengirim klarifikasi dari halaman klaim.
13. Corrective action/anomali yang diselesaikan menghitung ulang clearance. Jika seluruh bukti telah lengkap, status kembali `ELIGIBLE` untuk review ulang.
14. Seluruh perubahan material menambahkan audit log.

## Hasil pengujian logika

15 skenario alur otomatis dijalankan dan seluruhnya PASS:

- historical clearance terverifikasi tetap `VERIFIED`;
- bukti lengkap menghasilkan `ELIGIBLE`;
- anomali aktif menghasilkan `ON_HOLD`;
- validasi yang belum lengkap menghasilkan `PENDING`;
- foto + GPS + AI + human verification yang lengkap menghasilkan `ELIGIBLE`;
- vendor dapat mengajukan klaim setelah eligible;
- pengawas tidak dapat menyetujui sebelum klaim diajukan;
- permintaan klarifikasi mengubah clearance menjadi `ON_HOLD`;
- permintaan klarifikasi mengubah klaim menjadi `UNDER_REVIEW`;
- klarifikasi vendor mengembalikan klaim ke antrean review;
- approval pengawas menghasilkan clearance `VERIFIED`;
- approval pengawas menghasilkan klaim `READY_FOR_PAYMENT`;
- hasil human verification bermasalah menghasilkan `ON_HOLD`;
- vendor tidak dapat mengajukan klaim selama clearance `ON_HOLD`;
- penyelesaian anomali menghitung ulang clearance dan mengembalikan distribusi ke `VALIDATED` bila tidak ada temuan aktif lain.

## Pemeriksaan source

- 22 file TypeScript/TSX berhasil melewati syntax transpilation tanpa syntax error.
- Tidak ditemukan label pengembangan internal yang seharusnya tidak tampil pada pengalaman pengguna di folder `app`, `components`, `lib`, dan `public`.
- Evidence checklist pada clearance bersumber dari state aplikasi, bukan daftar statis.
- State storage dinaikkan ke `mymbg_state_v9` agar struktur workflow lama tidak terbawa dari localStorage.

## Catatan

Full production build tetap membutuhkan dependency Next.js/React terpasang melalui `npm install` pada environment yang memiliki akses registry paket.
