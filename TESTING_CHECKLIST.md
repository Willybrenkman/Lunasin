# TESTING CHECKLIST — LUNASIN.ID
**Tanggal:** 2026-05-25  
**Tester:** Manual (owner)  
**Status:** ⏳ Belum dijalankan

Legend: ✅ Pass | ❌ Fail (catat error) | ⏭️ Skip (tidak relevan)

---

## Auth Flow

- [ ] Buka `/login` di browser incognito — UI tampil benar (dark theme, gold accent)
- [ ] Input email random (belum terdaftar) → klik "Lanjutkan" — field unix code muncul
- [ ] Input unix code salah → error muncul dengan pesan spesifik
- [ ] Input unix code valid → magic link terkirim, screen "Cek Email" muncul
- [ ] Tombol "Kirim Ulang" disable 30 detik setelah send
- [ ] Klik link di email → redirect ke `/dashboard`
- [ ] Status PRO aktif di sidebar sesuai dengan kepemilikan voucher
- [ ] Logout → redirect ke `/`
- [ ] Login lagi dengan email yang sudah terdaftar → **langsung** kirim magic link (tanpa minta unix code)
- [ ] Buka `/dashboard` tanpa login (incognito) → redirect ke `/login` (diblok middleware)
- [ ] Login, kemudian akses `/login` lagi → redirect ke `/dashboard`

---

## Dashboard

- [ ] Buka `/dashboard` setelah login — skeleton loading muncul dulu, lalu data ke-load
- [ ] Jika belum ada hutang → empty state muncul dengan tombol "Tambah Hutang Pertama"
- [ ] Summary cards (Total Hutang, Sisa Hutang, Estimasi Lunas, Progress) menampilkan angka benar
- [ ] Privacy toggle (ikon mata) → angka berubah jadi `***`
- [ ] Privacy toggle off → angka kembali tampil
- [ ] Search menu (ikon kaca pembesar) → overlay muncul, bisa filter menu
- [ ] Ganti strategi (Snowball/Avalanche/Smart Priority) → chart re-render

---

## CRUD Hutang

- [ ] Klik "Tambah Hutang" → buka form `/dashboard/add`
- [ ] Submit form kosong → browser validation mencegah submit
- [ ] Isi form lengkap → submit berhasil → toast hijau muncul → redirect ke `/dashboard/debts`
- [ ] Data hutang baru muncul di tabel
- [ ] Refresh halaman → data tetap ada (persistent)
- [ ] Klik ikon edit → modal terbuka dengan **semua field sudah prefilled** (nama, total, sisa, bunga, cicilan, tanggal mulai, jatuh tempo, tgl tagihan, catatan, status)
- [ ] Edit salah satu field → simpan → perubahan tersimpan di tabel
- [ ] Klik ikon hapus → confirm dialog muncul
- [ ] Konfirmasi hapus → hutang hilang dari tabel
- [ ] Batal hapus → hutang tetap ada

---

## Pembayaran

- [ ] Buka `/dashboard/pembayaran` → daftar pembayaran ke-load
- [ ] Jika belum ada pembayaran → empty state muncul
- [ ] Klik "Catat Pembayaran" → modal muncul dengan dropdown daftar hutang
- [ ] Submit pembayaran → sukses, muncul di riwayat
- [ ] Sisa hutang berkurang sesuai jumlah pembayaran (via trigger database)
- [ ] Total pembayaran bulan ini ter-update

---

## Asisten Lunasin (Chat)

- [ ] Buka `/dashboard/ai` — header menampilkan "Asisten Lunasin" (bukan "Konsultan AI" atau "Lunasin AI")
- [ ] Pesan awal dari asisten muncul otomatis
- [ ] Tanya "strategi terbaik" → respons relevan keluar
- [ ] Tanya "kapan saya bisa lunas?" → kasih estimasi bulan
- [ ] Tombol quick action (Strategi, Estimasi Lunas, Hak vs DC) → mengisi input otomatis
- [ ] Typing indicator muncul saat waiting respons
- [ ] User tanpa hutang → pesan "belum ada data hutang" muncul

---

## ProLock & Status PRO

- [ ] User non-PRO buka `/dashboard/laporan` → ProLock overlay muncul (blur + tombol upgrade)
- [ ] User non-PRO buka `/dashboard/pembayaran` → ProLock muncul
- [ ] User non-PRO buka `/dashboard` → **bebas akses** (tidak di-lock)
- [ ] User non-PRO buka `/dashboard/simulasi` → **bebas akses** (tidak di-lock)
- [ ] User PRO buka semua halaman → bebas akses, tidak ada ProLock
- [ ] Di sidebar: badge status sesuai (Pro Member / Free Account)
- [ ] Tombol "Dapatkan Akses PRO" di ProLock → buka WA admin

---

## Mobile Responsive (375px)

- [ ] Header menampilkan hamburger menu (ikon ≡) di mobile
- [ ] Klik hamburger → drawer sidebar muncul dari kiri
- [ ] Klik overlay gelap → drawer tutup
- [ ] Klik menu di drawer → navigate + drawer tutup otomatis
- [ ] Tabel hutang bisa di-scroll horizontal di mobile
- [ ] Form tambah hutang bisa diisi dengan nyaman di mobile
- [ ] Tombol-tombol touch target minimal 44x44px (tidak terlalu kecil)
- [ ] Chat AI bisa digunakan di mobile

---

## Edge Cases & Security

- [ ] Logout → refresh → redirect ke `/login`, tidak bisa akses dashboard
- [ ] Buka `/dashboard/any-page` tanpa login → redirect ke `/login`
- [ ] Submit form tambah hutang 2x cepat (double click) → hanya 1 data yang masuk (tombol disabled saat loading)
- [ ] Network offline saat fetch dashboard → halaman tetap tampil dari cache, tidak stuck loading
- [ ] API `/api/debts` GET dipanggil tanpa session cookie → response 401 Unauthorized
- [ ] API `/api/debts` POST tanpa session → response 401 Unauthorized
- [ ] Data hutang hanya menampilkan milik user yang login (tidak bocor ke user lain)

---

## Performance (Lighthouse di `/dashboard`)

- [ ] Performance score > 85
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] DebtChart tidak muncul di initial server render (ssr: false — tidak ada hydration mismatch)

---

## Smoke Test Post-Deploy

- [ ] Buka `https://lunasin.id` → halaman tampil
- [ ] Full flow: login → tambah hutang → catat bayar → logout → login ulang → data masih ada
- [ ] Magic link email sampai dan redirect URL benar (`https://lunasin.id/auth/callback`)
- [ ] Supabase dashboard → data masuk ke tabel `debts` dan `payments`
- [ ] Vercel logs → tidak ada error 500

---

## Hasil Testing

| Area | Pass | Fail | Notes |
|------|------|------|-------|
| Auth Flow | | | |
| Dashboard | | | |
| CRUD Hutang | | | |
| Pembayaran | | | |
| Asisten Lunasin | | | |
| ProLock | | | |
| Mobile | | | |
| Edge Cases | | | |
| Performance | | | |

**Overall Status:** ⏳ Belum dijalankan  
**Siap Deploy:** ☐ Ya / ☐ Tidak
