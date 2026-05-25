# AUDIT REPORT — LUNASIN.ID
**Tanggal:** 2026-05-25  
**Stack:** Next.js 15 + Supabase + Tailwind + Vercel  
**Status:** ⚠️ NOT PRODUCTION READY — 4 Critical Issues Blocking Launch

---

## RINGKASAN EKSEKUTIF

| Category     | 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low |
|--------------|------------|---------|-----------|--------|
| Security     | 4          | 6       | 5         | 1      |
| Performance  | 0          | 0       | 1         | 2      |
| UX/Features  | 0          | 0       | 1         | 1      |
| Code Quality | 0          | 0       | 0         | 2      |
| **TOTAL**    | **4**      | **6**   | **7**     | **6**  |

---

## 🔴 CRITICAL — HARUS DIFIX SEBELUM LAUNCH

### BUG-001: GET /api/debts — Data Breach (Semua User Data Bocor)
**File:** `app/api/debts/route.js` baris ~4–21  
**Problem:** Tidak ada auth check DAN tidak ada filter `user_id`. Query `.select("*")` tanpa `.eq("user_id", user.id)` sehingga mengembalikan SEMUA hutang dari SEMUA user di database.  
**Impact:** Information disclosure, privacy violation parah  
**Fix:**
```js
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const { data, error } = await supabase.from("debts").select("*").eq("user_id", user.id)...
```

### BUG-002: POST /api/debts — Insert Tanpa Auth (Data Poisoning)
**File:** `app/api/debts/route.js` baris ~37  
**Problem:** `user?.id || null` memungkinkan insert dengan `user_id = null`. User yang tidak login bisa menambahkan data ke database.  
**Impact:** Data poisoning, database integrity rusak  
**Fix:**
```js
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// Gunakan user.id (bukan user?.id || null)
```

### BUG-003: Logout Tidak Clear sessionStorage (Data Leakage)
**File:** `app/dashboard/layout.js` baris ~83–90` & `app/dashboard/pengaturan/page.js` baris ~97–104  
**Problem:** `sessionStorage` berisi cache `debts_cache` dan `payments_cache` tidak dihapus saat logout. User berikutnya di device yang sama bisa melihat data user sebelumnya.  
**Impact:** Data leakage pada shared device  
**Fix:**
```js
const handleLogout = async () => {
  sessionStorage.removeItem("debts_cache");
  sessionStorage.removeItem("payments_cache");
  await supabase.auth.signOut();
  router.push("/");
};
```

### BUG-004: Midtrans Hardcoded Customer (Payment Tidak Tertrack)
**File:** `app/api/payment/route.js` baris ~27–30  
**Problem:** `first_name: "User"` dan `email: "user@example.com"` hardcoded. Semua transaksi Midtrans tercatat atas nama dummy user, tidak bisa direconcile ke user asli.  
**Impact:** Payment tracking failure, reconciliation tidak bisa  
**Fix:** Ambil user dari Supabase session:
```js
const { data: { user } } = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
customer_details: {
  first_name: user.user_metadata?.full_name || "User",
  email: user.email
}
```

---

## 🟠 HIGH — Fix Di Fase 2

### BUG-005: is_pro Default true di Dashboard Layout
**File:** `app/dashboard/layout.js` baris ~20  
**Problem:** `useState({ display_name: "User", is_pro: true, email: "" })` — semua user tampak sebagai PRO di initial render sampai data fetched.  
**Fix:** Ganti `is_pro: true` → `is_pro: false`, tambah state `profileLoaded` untuk delay ProLock render.

### BUG-006: sessionStorage Dua Lokasi (layout + pengaturan)
**File:** `app/dashboard/layout.js` & `app/dashboard/pengaturan/page.js`  
**Problem:** Ada dua tempat logout handler, keduanya tidak clear sessionStorage.  
**Fix:** Perbaiki keduanya (atau extract ke shared function).

### BUG-007: Chat API Tanpa Rate Limiting
**File:** `app/api/chat/route.js`  
**Problem:** Tidak ada rate limiting per user. User bisa spam pesan unlimited dan membebani biaya AI.  
**Impact:** DoS, cost overrun  
**Fix:** Tambah simple rate limit (misal: 20 pesan/jam per user_id).

### BUG-008: Supabase Client Fallback ke Placeholder (Silent Failure)
**File:** `lib/supabase.js`  
**Problem:** Jika env var kosong, client fallback ke `"https://placeholder-project.supabase.co"` dengan `console.warn` saja. App tetap jalan tapi tidak ada data yang tersimpan.  
**Fix:** Throw error di non-demo environments, atau setidaknya tampilkan error yang jelas.

### BUG-009: Missing middleware.js
**File:** Root project  
**Problem:** Tidak ada `middleware.js`. Artinya semua route di `/dashboard/**` bisa diakses tanpa login — hanya client-side redirect yang melindungi, bukan server-side.  
**Fix:** Buat `middleware.js` yang cek session Supabase dan redirect ke `/login` jika tidak authenticated.

### BUG-010: Missing .env.example
**File:** Root project  
**Problem:** Tidak ada dokumentasi environment variables yang dibutuhkan.  
**Fix:** Buat `.env.example` dengan semua variable yang diperlukan.

### BUG-011: Midtrans isProduction: false (Sandbox Mode)
**File:** `app/api/payment/route.js` baris ~7  
**Problem:** `isProduction: false` — masih sandbox/test mode.  
**Fix:** Ganti ke `isProduction: process.env.NODE_ENV === "production"` atau `true` untuk launch.

---

## 🟡 MEDIUM

### BUG-012: DebtChart Tidak Lazy-Loaded
**File:** `app/dashboard/page.js` baris ~5  
**Problem:** Recharts bundle di-load saat initial page load, padahal berat.  
**Fix:** `const DebtChart = dynamic(() => import("@/components/DebtChart"), { ssr: false })`

### BUG-013: Gambar Tanpa next/image di Landing Page
**File:** `app/page.js` baris ~83–88  
**Problem:** Menggunakan `<img>` biasa dengan URL Unsplash eksternal. Tidak ada optimasi dan bisa block LCP.  
**Fix:** Gunakan `next/image` dengan domain Unsplash dikonfigurasi di `next.config.mjs`.

### BUG-014: Dashboard Tidak Handle Network Error di Loading State
**File:** `app/dashboard/page.js` baris ~30–50  
**Problem:** Jika `cache miss` DAN fetch gagal (offline), loading state bisa stuck `true` selamanya.  
**Fix:** Pastikan `setLoading(false)` selalu dipanggil di `finally` block bahkan saat cache miss.

### BUG-015: Edit Modal Tidak Prefill Semua Field
**File:** `app/dashboard/debts/page.js` baris ~61–68  
**Problem:** `tanggal_mulai`, `jatuh_tempo`, `tanggal_tagihan`, `notes` tidak diset saat buka edit modal. User edit tapi field tanggal kosong → bisa overwrite dengan null.  
**Fix:** Include semua field saat set `editModal.data`.

### BUG-016: dangerouslySetInnerHTML Tanpa Sanitasi
**File:** `app/dashboard/ai/page.js` baris ~126  
**Problem:** `formatText(msg.content)` dirender via `dangerouslySetInnerHTML`. Jika backend AI mengembalikan tag HTML berbahaya, akan ter-execute (XSS).  
**Fix:** Pakai library `DOMPurify` untuk sanitasi sebelum render, atau gunakan markdown renderer yang aman.

### BUG-017: Midtrans Server Key Fallback ke String Literal
**File:** `app/api/payment/route.js` baris ~6  
**Problem:** `serverKey: process.env.MIDTRANS_SERVER_KEY || "YOUR_SERVER_KEY"` — fallback ke string yang tidak valid. Payment akan gagal di production tanpa error yang jelas.  
**Fix:** Validasi env var dan throw error jika tidak ada.

---

## 🟢 LOW

### BUG-018: Error Message Tidak Auto-Clear di Login
**File:** `app/login/page.js`  
**Problem:** Pesan error tidak hilang saat user mulai ketik lagi. Minor UX issue.

### BUG-019: console.log Tersisa di Production Code
**File:** Multiple files  
**Problem:** Beberapa `console.log` dan `console.error` yang tidak perlu akan muncul di production.

### BUG-020: Privacy Preference di localStorage Tidak Dienkripsi
**File:** `components/privacy/PrivacyContext.js`  
**Problem:** Preferensi privacy disimpan plain di localStorage. Risiko rendah karena ini hanya UI preference, bukan data sensitif.

---

## FILE STRUCTURE SUMMARY

```
✅ app/             — Ada dan lengkap
✅ components/      — Ada dan lengkap
✅ lib/             — Ada dan lengkap
✅ package.json     — Ada, lengkap
✅ next.config.mjs  — Ada (tapi minimal)
✅ tailwind.config.js — Ada
✅ app/login/page.js — Ada DAN berisi konten (381 baris, flow 3-step sudah ada)
❌ middleware.js     — TIDAK ADA (critical gap)
❌ .env.example     — TIDAK ADA
❌ .env.local       — TIDAK ADA (expected tidak di-commit)
```

---

## KNOWN GOOD THINGS (Tidak Perlu Difix)

- ✅ Login page flow (3-step: email → unix code → magic link) sudah ada dan lengkap
- ✅ ProLock component sudah ada di `components/pro/ProLock.js`
- ✅ Privacy toggle (mata) sudah ada
- ✅ Delete confirmation dialog sudah ada di debt management
- ✅ Toast notification sudah ada (pakai custom state-based toast)
- ✅ AI chat UI sudah bagus dengan typing indicator
- ✅ Strategi Snowball/Avalanche/Smart sudah ada
- ✅ Empty state di payment list sudah ada
- ✅ `lib/calculate.js` (calculation engine) sudah solid
- ✅ Supabase SQL migrations sudah tersedia

---

## PRIORITAS FIX (Urutan Rekomendasi untuk Fase 2)

1. 🔴 BUG-001 — GET /api/debts: tambah auth + user_id filter
2. 🔴 BUG-002 — POST /api/debts: tambah auth check
3. 🔴 BUG-003 — Logout: clear sessionStorage (2 lokasi)
4. 🔴 BUG-004 — Midtrans: pakai user email asli + auth check
5. 🟠 BUG-005 — Dashboard layout: is_pro default false
6. 🟠 BUG-009 — Buat middleware.js
7. 🟠 BUG-010 — Buat .env.example
8. 🟠 BUG-011 — Midtrans isProduction setting
9. 🟡 BUG-012 — Lazy load DebtChart
10. 🟡 BUG-015 — Edit modal prefill semua field
