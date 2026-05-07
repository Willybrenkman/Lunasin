# 🔧 LUNASIN.ID — PERBAIKAN ALUR LOGIN PASSWORDLESS

Halo Willy! Berikut ringkasan perbaikan yang sudah aku lakukan.

---

## 🎯 ALUR LOGIN BARU

### First-time user (login pertama kali):
1. User buka `/login`
2. Input **email** → klik "Lanjutkan"
3. Sistem cek: email ini belum pernah claim voucher → tampilkan field unix code
4. User input **kode unix** → klik "Aktivasi & Kirim Link"
5. Sistem validasi kode → bind ke email selamanya → kirim magic link
6. User cek email → klik link → **langsung masuk dashboard**

### Returning user (login ke-2, ke-3, dst):
1. User buka `/login`
2. Input **email saja** → klik "Lanjutkan"
3. Sistem cek: email ini sudah punya voucher claimed → langsung kirim magic link
4. User cek email → klik link → **langsung masuk dashboard**

**Tidak ada password sama sekali. Tidak ada step redeem terpisah.**

---

## 📋 LANGKAH DEPLOY (PENTING — IKUTI URUTAN INI)

### 1. Jalankan migration database
Buka Supabase Dashboard → SQL Editor → jalankan **`supabase_migration_auth_fix.sql`**

⚠️ **Jalankan ini SETELAH `supabase_schema.sql` sudah pernah di-run.** File migration ini menambah:
- Kolom `claimed_email` di tabel `vouchers`
- Function `redeem_voucher(email, code)` untuk validasi atomic
- Function `check_email_has_voucher(email)` untuk cek returning user
- Trigger baru `handle_new_user_with_voucher` yang otomatis set `is_pro=true` saat user pertama login

### 2. Setting Supabase Auth
Di Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://lunasin.id` (atau domain production-mu)
- **Redirect URLs** (tambahkan semua):
  - `https://lunasin.id/auth/callback`
  - `http://localhost:3000/auth/callback` (untuk dev)

Authentication → Providers → Email:
- **Enable Email** ✅
- **Confirm email**: ON (atau OFF tergantung preferensi — kalau OFF, user langsung bisa login tanpa konfirmasi pertama)
- **Secure email change**: ON

### 3. Environment variables (Vercel)
Pastikan ada di Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. Deploy ke Vercel
```bash
git add .
git commit -m "fix: passwordless auth flow with unix code binding"
git push origin main
```

Vercel auto-deploy. Selesai.

---

## 🗂️ FILE YANG DIUBAH / DITAMBAH

| File | Status | Keterangan |
|---|---|---|
| `supabase_migration_auth_fix.sql` | ➕ BARU | Migration database — WAJIB di-run di Supabase |
| `app/login/page.js` | ♻️ REWRITE | Login 2-step (email → unix code conditional → magic link sent) |
| `app/auth/callback/route.js` | ♻️ REWRITE | Redirect ke `/dashboard` (bukan `/redeem` lagi), set cookie session, handle error |
| `middleware.js` | ♻️ REWRITE | Logic auth lebih bersih, redirect `/redeem` legacy ke `/login` |
| `app/redeem/` | ❌ DIHAPUS | Tidak diperlukan lagi, logic-nya sudah pindah ke `/login` |
| `components/pro/ProLock.js` | ✏️ EDIT | Hapus link ke `/redeem`, ganti ke WA CS |

---

## 🔒 FITUR KEAMANAN BARU

1. **Voucher binding ke email**: Satu kode unix sekarang permanen terikat ke 1 email. User lain dengan email berbeda **tidak bisa pakai kode yang sama**.
2. **Idempotent redeem**: Kalau user yang sama input ulang kode unix-nya, sistem tidak error — langsung kirim magic link.
3. **Atomic transaction**: Validasi + claim voucher dilakukan via PostgreSQL function (RPC), tidak ada race condition.
4. **Auto PRO activation**: Begitu user pertama kali login (lewat magic link), trigger database otomatis set `is_pro=true` di profilnya.
5. **RLS policy diperketat**: User hanya bisa lihat voucher milik emailnya sendiri.

---

## 🧪 CARA TESTING

### Test 1 — First-time user
```
1. Buat voucher baru di Supabase: 
   INSERT INTO vouchers (code) VALUES ('LNSN-TEST-9999');

2. Buka /login
3. Input email: test@gmail.com → klik Lanjutkan
4. Field unix code muncul → input LNSN-TEST-9999 → klik Aktivasi
5. Cek email test@gmail.com
6. Klik link → harus masuk ke /dashboard
7. Status PRO harus aktif (cek di sidebar)
```

### Test 2 — Returning user
```
1. Pakai email yang sama (test@gmail.com) yang sudah claim voucher tadi
2. Buka /login (di browser baru atau setelah logout)
3. Input email: test@gmail.com → klik Lanjutkan
4. Field unix code TIDAK boleh muncul → langsung ke "Cek Email Anda"
5. Cek email → klik link → masuk dashboard
```

### Test 3 — Voucher salah / sudah dipakai email lain
```
1. Email A claim LNSN-TEST-9999 (test 1)
2. Email B coba pakai LNSN-TEST-9999 → harus error: "Kode unix sudah digunakan oleh akun lain"
3. Email C input kode random → harus error: "Kode unix tidak valid"
```

---

## 🔌 INTEGRASI SKALEV (NEXT STEP)

Setelah ini work, kamu tinggal generate voucher otomatis dari Skalev webhook:

```sql
-- Setiap order paid di Skalev, INSERT ke vouchers:
INSERT INTO vouchers (code) VALUES ('LNSN-XXXX-XXXX');
-- Lalu kirim kode itu ke email customer via Skalev autoresponder.
```

Kalau mau aku buatkan API endpoint webhook handler-nya, tinggal bilang.

---

## ⚠️ HAL YANG PERLU KAMU PERHATIKAN

1. **Email template Supabase**: Magic link default Supabase tampilannya sederhana. Kalau mau custom (branding Lunasin.id), edit di Supabase Dashboard → Authentication → Email Templates → Magic Link.

2. **Rate limit**: Supabase default rate limit untuk magic link adalah 4 email per jam per email. Kalau user spam tombol "Kirim Ulang", bakal kena limit. Pertimbangkan tambah debounce di tombol "Kirim Ulang" (misal disable selama 30 detik setelah klik).

3. **Voucher legacy**: Voucher yang sudah ada di database lama (sebelum migration) tetap valid, tapi `claimed_email`-nya kosong. Saat pertama kali user redeem, otomatis ke-bind.

4. **Cookie `httpOnly: false`**: Aku set cookie session dengan `httpOnly: false` supaya Supabase JS client di browser bisa baca. Ini standar untuk Supabase. Aman karena tetap pakai `secure: true` di production dan `sameSite: lax`.

---

## 🚀 SIAP LAUNCH!

Semuanya sudah aku test syntax-nya. Tinggal:
1. Run migration SQL ✅
2. Set env vars ✅
3. Deploy ✅
4. Testing 3 skenario di atas ✅

Kalau ada error pas testing, kirim screenshot console + Network tab, nanti aku bantu debug.

— Selamat launch, Willy! 💪
