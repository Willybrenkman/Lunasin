-- ============================================================
-- LUNASIN.ID — DATABASE SCHEMA
-- ============================================================
-- Jalankan seluruh file ini di Supabase SQL Editor
-- (Dashboard Supabase → SQL Editor → New Query → Paste → Run)
-- ============================================================

-- ============================================================
-- 1. TABEL: profiles
-- Menyimpan data profil user (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  pro_activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query berdasarkan email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================================
-- 2. TABEL: debts
-- Menyimpan daftar hutang milik setiap user
-- ============================================================
CREATE TABLE IF NOT EXISTS public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                          -- "Kartu Kredit BCA"
  total BIGINT NOT NULL DEFAULT 0,             -- Total awal hutang (Rupiah)
  sisa BIGINT NOT NULL DEFAULT 0,              -- Sisa hutang saat ini
  interest NUMERIC(5,2) NOT NULL DEFAULT 0,    -- Bunga per tahun (%)
  min_payment BIGINT NOT NULL DEFAULT 0,       -- Cicilan minimum / bulan
  tanggal_mulai DATE,                           -- Tanggal mulai hutang
  jatuh_tempo DATE,                            -- Target tanggal lunas
  tanggal_tagihan SMALLINT CHECK (tanggal_tagihan BETWEEN 1 AND 31), -- Tgl cicilan bulanan (1-31)
  status TEXT NOT NULL DEFAULT 'active'        -- 'active' | 'paid_off'
    CHECK (status IN ('active', 'paid_off')),
  notes TEXT,                                  -- Catatan opsional
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query hutang berdasarkan user
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_status ON public.debts(user_id, status);

-- ============================================================
-- 3. TABEL: payments
-- Menyimpan riwayat pembayaran hutang
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL DEFAULT 0,            -- Jumlah yang dibayarkan
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query riwayat pembayaran
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_debt_id ON public.payments(debt_id);

-- ============================================================
-- 4. TABEL: vouchers
-- Menyimpan kode lisensi dari Scalev
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,                   -- "LNSN-ABCD-1234"
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk pencarian kode voucher (sering di-query saat redeem)
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON public.vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_unused ON public.vouchers(is_used) WHERE is_used = FALSE;

-- ============================================================
-- 5. TABEL: chat_messages
-- Menyimpan riwayat percakapan dengan AI Consultant
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query riwayat chat berdasarkan user
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON public.chat_messages(user_id, created_at);

-- ============================================================
-- 6. FUNGSI: Auto-create profile saat user baru mendaftar
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Trigger: jalankan fungsi di atas setiap ada user baru di auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 7. FUNGSI: Auto-update sisa hutang setelah pembayaran
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Kurangi sisa hutang
  UPDATE public.debts
  SET
    sisa = GREATEST(sisa - NEW.amount, 0),
    status = CASE WHEN (sisa - NEW.amount) <= 0 THEN 'paid_off' ELSE status END,
    updated_at = NOW()
  WHERE id = NEW.debt_id;
  
  RETURN NEW;
END;
$$;

-- Trigger: jalankan setiap ada pembayaran baru
DROP TRIGGER IF EXISTS on_payment_created ON public.payments;
CREATE TRIGGER on_payment_created
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_payment();

-- ============================================================
-- 8. FUNGSI: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger updated_at untuk profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger updated_at untuk debts
DROP TRIGGER IF EXISTS set_debts_updated_at ON public.debts;
CREATE TRIGGER set_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- Memastikan user hanya bisa akses datanya sendiri
-- ============================================================

-- Aktifkan RLS di semua tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- PROFILES: User hanya bisa baca/edit profilnya sendiri
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- DEBTS: User hanya bisa CRUD hutangnya sendiri
CREATE POLICY "Users can view own debts"
  ON public.debts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debts"
  ON public.debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts"
  ON public.debts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts"
  ON public.debts FOR DELETE
  USING (auth.uid() = user_id);

-- PAYMENTS: User hanya bisa lihat/tambah pembayarannya sendiri
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- VOUCHERS: Semua user yang login bisa baca voucher (untuk validasi kode)
CREATE POLICY "Authenticated users can check vouchers"
  ON public.vouchers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update vouchers"
  ON public.vouchers FOR UPDATE
  USING (auth.role() = 'authenticated');

-- CHAT: User hanya bisa lihat/tambah chat-nya sendiri
CREATE POLICY "Users can view own chats"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 10. SAMPLE VOUCHER CODES (untuk testing)
-- Hapus setelah production!
-- ============================================================
INSERT INTO public.vouchers (code) VALUES
  ('LNSN-TEST-0001'),
  ('LNSN-TEST-0002'),
  ('LNSN-TEST-0003'),
  ('LNSN-DEMO-1234'),
  ('LNSN-PRMO-5678')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- SELESAI! Skema database Lunasin.id sudah siap.
-- ============================================================
