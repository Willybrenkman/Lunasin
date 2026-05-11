-- ============================================================
-- LUNASIN.ID — FULL DATABASE RESET & SETUP
-- ⚠️  SCRIPT INI AKAN MENGHAPUS SEMUA DATA LAMA!
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================


-- ============================================================
-- STEP 0: BERSIHKAN DATABASE LAMA
-- ============================================================

-- Drop triggers
DROP TRIGGER IF EXISTS on_auth_user_created        ON auth.users;
DROP TRIGGER IF EXISTS on_payment_created          ON public.payments;
DROP TRIGGER IF EXISTS set_profiles_updated_at     ON public.profiles;
DROP TRIGGER IF EXISTS set_debts_updated_at        ON public.debts;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user_with_voucher();
DROP FUNCTION IF EXISTS public.handle_new_payment();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.redeem_voucher(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.check_email_has_voucher(TEXT);

-- Drop tables (urutan: child dulu baru parent)
DROP TABLE IF EXISTS public.chat_messages  CASCADE;
DROP TABLE IF EXISTS public.payments       CASCADE;
DROP TABLE IF EXISTS public.debts          CASCADE;
DROP TABLE IF EXISTS public.vouchers       CASCADE;
DROP TABLE IF EXISTS public.profiles       CASCADE;


-- ============================================================
-- STEP 1: TABEL profiles
-- ============================================================
CREATE TABLE public.profiles (
  id               UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            TEXT,
  display_name     TEXT,
  avatar_url       TEXT,
  is_pro           BOOLEAN     DEFAULT FALSE,
  pro_activated_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON public.profiles(email);


-- ============================================================
-- STEP 2: TABEL debts
-- ============================================================
CREATE TABLE public.debts (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  total            BIGINT      NOT NULL DEFAULT 0,
  sisa             BIGINT      NOT NULL DEFAULT 0,
  interest         NUMERIC(5,2) NOT NULL DEFAULT 0,
  min_payment      BIGINT      NOT NULL DEFAULT 0,
  tanggal_mulai    DATE,
  jatuh_tempo      DATE,
  tanggal_tagihan  SMALLINT    CHECK (tanggal_tagihan BETWEEN 1 AND 31),
  status           TEXT        NOT NULL DEFAULT 'active'
                               CHECK (status IN ('active', 'paid_off')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_debts_user_id ON public.debts(user_id);
CREATE INDEX idx_debts_status  ON public.debts(user_id, status);


-- ============================================================
-- STEP 3: TABEL payments
-- ============================================================
CREATE TABLE public.payments (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  debt_id      UUID    NOT NULL REFERENCES public.debts(id)    ON DELETE CASCADE,
  amount       BIGINT  NOT NULL DEFAULT 0,
  payment_date DATE    NOT NULL DEFAULT CURRENT_DATE,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_debt_id ON public.payments(debt_id);


-- ============================================================
-- STEP 4: TABEL vouchers
-- ============================================================
CREATE TABLE public.vouchers (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT    NOT NULL UNIQUE,
  claimed_email  TEXT,
  is_used        BOOLEAN DEFAULT FALSE,
  used_by        UUID    REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vouchers_code          ON public.vouchers(code);
CREATE INDEX idx_vouchers_claimed_email ON public.vouchers(claimed_email)
  WHERE claimed_email IS NOT NULL;
CREATE INDEX idx_vouchers_unused        ON public.vouchers(is_used)
  WHERE is_used = FALSE;


-- ============================================================
-- STEP 5: TABEL chat_messages
-- ============================================================
CREATE TABLE public.chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_user_id ON public.chat_messages(user_id, created_at);


-- ============================================================
-- STEP 6: FUNGSI handle_updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- STEP 7: FUNGSI & TRIGGER auto-potong sisa hutang saat bayar
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.debts
  SET
    sisa       = GREATEST(sisa - NEW.amount, 0),
    status     = CASE WHEN (sisa - NEW.amount) <= 0 THEN 'paid_off' ELSE status END,
    updated_at = NOW()
  WHERE id = NEW.debt_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_payment_created
  AFTER INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_payment();


-- ============================================================
-- STEP 8: FUNGSI & TRIGGER auto-create profile saat user signup
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
  -- Cek apakah email sudah claim voucher sebelum signup
  SELECT EXISTS(
    SELECT 1 FROM public.vouchers
    WHERE claimed_email = LOWER(NEW.email)
  ) INTO v_has_voucher;

  -- Buat profile, langsung set is_pro jika ada voucher
  INSERT INTO public.profiles (id, email, display_name, is_pro, pro_activated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', SPLIT_PART(NEW.email, '@', 1)),
    v_has_voucher,
    CASE WHEN v_has_voucher THEN NOW() ELSE NULL END
  )
  ON CONFLICT (id) DO UPDATE SET
    is_pro           = EXCLUDED.is_pro,
    pro_activated_at = COALESCE(public.profiles.pro_activated_at, EXCLUDED.pro_activated_at);

  -- Tautkan voucher ke user baru
  UPDATE public.vouchers
  SET used_by = NEW.id
  WHERE claimed_email = LOWER(NEW.email)
    AND used_by IS NULL;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_voucher();


-- ============================================================
-- STEP 9: RPC redeem_voucher — validasi & claim voucher (atomic)
-- ============================================================
CREATE OR REPLACE FUNCTION public.redeem_voucher(p_email TEXT, p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_voucher         RECORD;
  v_normalized_email TEXT;
  v_normalized_code  TEXT;
BEGIN
  v_normalized_email := LOWER(TRIM(p_email));
  v_normalized_code  := UPPER(TRIM(p_code));

  IF v_normalized_email = '' OR v_normalized_code = '' THEN
    RETURN json_build_object('success', false, 'error', 'Email dan kode wajib diisi.');
  END IF;

  SELECT * INTO v_voucher
  FROM public.vouchers
  WHERE code = v_normalized_code
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Kode unix tidak valid.');
  END IF;

  -- Dipakai email lain → tolak
  IF v_voucher.claimed_email IS NOT NULL
     AND v_voucher.claimed_email <> v_normalized_email THEN
    RETURN json_build_object('success', false, 'error', 'Kode unix sudah digunakan oleh akun lain.');
  END IF;

  -- Sudah di-claim email yang sama → idempotent
  IF v_voucher.claimed_email = v_normalized_email THEN
    RETURN json_build_object('success', true, 'message', 'Voucher sudah aktif untuk email ini.');
  END IF;

  -- Voucher baru → claim
  UPDATE public.vouchers
  SET
    claimed_email = v_normalized_email,
    is_used       = TRUE,
    used_at       = NOW()
  WHERE id = v_voucher.id;

  RETURN json_build_object('success', true, 'message', 'Kode berhasil diaktivasi.');
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_voucher(TEXT, TEXT) TO anon, authenticated;


-- ============================================================
-- STEP 10: RPC check_email_has_voucher
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
-- STEP 11: ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Debts
CREATE POLICY "debts_select_own" ON public.debts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "debts_insert_own" ON public.debts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "debts_update_own" ON public.debts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "debts_delete_own" ON public.debts
  FOR DELETE USING (auth.uid() = user_id);

-- Payments
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Vouchers
-- (SELECT langsung diblokir; akses voucher hanya via RPC SECURITY DEFINER)
CREATE POLICY "vouchers_select_own" ON public.vouchers
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND claimed_email = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Chat Messages
CREATE POLICY "chat_select_own" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "chat_insert_own" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- STEP 12: SAMPLE VOUCHER CODES
-- Ganti dengan kode asli sebelum production!
-- ============================================================
INSERT INTO public.vouchers (code) VALUES
  ('LNSN-TEST-0001'),
  ('LNSN-TEST-0002'),
  ('LNSN-TEST-0003'),
  ('LNSN-DEMO-1234'),
  ('LNSN-PRMO-5678'),
  ('LNSN-NEW1-0001'),
  ('LNSN-NEW1-0002'),
  ('LNSN-NEW1-0003')
ON CONFLICT (code) DO NOTHING;


-- ============================================================
-- SELESAI! Database Lunasin.id siap digunakan.
-- Tabel: profiles, debts, payments, vouchers, chat_messages
-- RPC: redeem_voucher, check_email_has_voucher
-- ============================================================
