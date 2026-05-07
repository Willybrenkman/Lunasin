-- ============================================================
-- LUNASIN.ID — MIGRATION: PASSWORDLESS AUTH FIX
-- ============================================================
-- Migration ini memperbaiki alur login menjadi:
-- 1. First-time user: email + unix code -> magic link -> dashboard
-- 2. Returning user: email saja -> magic link -> dashboard
--
-- Jalankan di Supabase SQL Editor SETELAH supabase_schema.sql
-- ============================================================

-- ============================================================
-- 1. TAMBAH KOLOM claimed_email DI vouchers
-- Mengikat satu voucher ke satu email selamanya
-- ============================================================
ALTER TABLE public.vouchers
  ADD COLUMN IF NOT EXISTS claimed_email TEXT;

-- Index untuk lookup cepat: "apakah email ini sudah punya voucher?"
CREATE INDEX IF NOT EXISTS idx_vouchers_claimed_email
  ON public.vouchers(claimed_email)
  WHERE claimed_email IS NOT NULL;

-- ============================================================
-- 2. RPC: redeem_voucher
-- Fungsi atomic untuk validasi + claim voucher dalam 1 transaksi
-- Dipanggil dari sisi client (anon role) sebelum signInWithOtp.
--
-- Logic:
-- - Jika email sudah punya voucher claimed -> return sukses (returning user)
-- - Jika voucher tidak ditemukan / sudah dipakai email lain -> error
-- - Jika voucher belum dipakai -> claim dengan email ini
-- ============================================================
CREATE OR REPLACE FUNCTION public.redeem_voucher(
  p_email TEXT,
  p_code TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_voucher RECORD;
  v_normalized_email TEXT;
  v_normalized_code TEXT;
BEGIN
  -- Normalisasi input
  v_normalized_email := LOWER(TRIM(p_email));
  v_normalized_code := UPPER(TRIM(p_code));

  IF v_normalized_email = '' OR v_normalized_code = '' THEN
    RETURN json_build_object('success', false, 'error', 'Email dan kode wajib diisi.');
  END IF;

  -- 1. Cari voucher
  SELECT * INTO v_voucher
  FROM public.vouchers
  WHERE code = v_normalized_code
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Kode unix tidak valid.');
  END IF;

  -- 2. Voucher sudah di-claim oleh email LAIN -> tolak
  IF v_voucher.claimed_email IS NOT NULL
     AND v_voucher.claimed_email <> v_normalized_email THEN
    RETURN json_build_object('success', false, 'error', 'Kode unix sudah digunakan oleh akun lain.');
  END IF;

  -- 3. Voucher sudah di-claim oleh email YANG SAMA -> sukses (idempotent)
  IF v_voucher.claimed_email = v_normalized_email THEN
    RETURN json_build_object('success', true, 'message', 'Voucher sudah aktif untuk email ini.');
  END IF;

  -- 4. Voucher fresh -> claim untuk email ini
  UPDATE public.vouchers
  SET
    claimed_email = v_normalized_email,
    is_used = TRUE,
    used_at = NOW()
  WHERE id = v_voucher.id;

  RETURN json_build_object('success', true, 'message', 'Kode berhasil diaktivasi.');
END;
$$;

-- Beri akses ke anon supaya bisa dipanggil sebelum login
GRANT EXECUTE ON FUNCTION public.redeem_voucher(TEXT, TEXT) TO anon, authenticated;

-- ============================================================
-- 3. RPC: check_email_has_voucher
-- Cek cepat: apakah email ini sudah pernah redeem voucher?
-- Digunakan di halaman login untuk menentukan UI:
--   - sudah punya voucher -> hanya tampilkan field email
--   - belum -> tampilkan field email + unix code
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_email_has_voucher(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.vouchers
    WHERE claimed_email = LOWER(TRIM(p_email))
  ) INTO v_exists;

  RETURN v_exists;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_email_has_voucher(TEXT) TO anon, authenticated;

-- ============================================================
-- 4. TRIGGER: link voucher ke profile saat user pertama kali login
-- Saat user baru dibuat di auth.users, otomatis set is_pro=true
-- jika emailnya sudah punya voucher claimed
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_with_voucher()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_voucher BOOLEAN;
BEGIN
  -- Cek apakah email user ini sudah punya voucher claimed
  SELECT EXISTS(
    SELECT 1 FROM public.vouchers
    WHERE claimed_email = LOWER(NEW.email)
  ) INTO v_has_voucher;

  -- Insert/update profile dengan status is_pro sesuai voucher
  INSERT INTO public.profiles (id, email, display_name, is_pro, pro_activated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', SPLIT_PART(NEW.email, '@', 1)),
    v_has_voucher,
    CASE WHEN v_has_voucher THEN NOW() ELSE NULL END
  )
  ON CONFLICT (id) DO UPDATE SET
    is_pro = EXCLUDED.is_pro,
    pro_activated_at = COALESCE(public.profiles.pro_activated_at, EXCLUDED.pro_activated_at);

  -- Update voucher dengan user_id yang baru terbuat
  UPDATE public.vouchers
  SET used_by = NEW.id
  WHERE claimed_email = LOWER(NEW.email)
    AND used_by IS NULL;

  RETURN NEW;
END;
$$;

-- Replace trigger lama dengan yang baru
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_with_voucher();

-- ============================================================
-- 5. RLS POLICY UPDATE untuk vouchers
-- Hapus policy lama yang terlalu permisif, ganti dengan yang aman
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can check vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Authenticated users can update vouchers" ON public.vouchers;

-- User hanya bisa lihat voucher milik emailnya sendiri
CREATE POLICY "Users can view own voucher"
  ON public.vouchers FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND claimed_email = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- ============================================================
-- 6. SAMPLE VOUCHER untuk testing alur baru
-- ============================================================
INSERT INTO public.vouchers (code) VALUES
  ('LNSN-NEW1-0001'),
  ('LNSN-NEW1-0002'),
  ('LNSN-NEW1-0003')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- SELESAI! Sekarang alur passwordless sudah siap.
-- ============================================================
