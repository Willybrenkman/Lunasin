-- ============================================================
-- LUNASIN.ID — SECURITY PATCH
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- Aman dijalankan tanpa reset data.
-- ============================================================


-- ============================================================
-- PATCH 1: Cegah user self-upgrade is_pro via anon/authenticated key
-- Hanya service_role (Skalev webhook) yang boleh ubah is_pro
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_pro_self_upgrade()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  jwt_role TEXT;
BEGIN
  BEGIN
    jwt_role := current_setting('request.jwt.claims', true)::json->>'role';
  EXCEPTION WHEN OTHERS THEN
    -- Tidak ada JWT context = dipanggil langsung oleh postgres/service_role
    RETURN NEW;
  END;

  -- Hanya service_role yang boleh mengubah is_pro dan pro_activated_at
  IF jwt_role IS DISTINCT FROM 'service_role' THEN
    NEW.is_pro := OLD.is_pro;
    NEW.pro_activated_at := OLD.pro_activated_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_pro_status ON public.profiles;
CREATE TRIGGER protect_pro_status
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_pro_self_upgrade();


-- ============================================================
-- PATCH 2: Atomic delete payment + restore sisa hutang
-- Menghilangkan race condition dan sekaligus reset status
-- ============================================================
CREATE OR REPLACE FUNCTION public.delete_payment_and_restore(p_payment_id UUID, p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_payment RECORD;
BEGIN
  -- Verifikasi kepemilikan
  SELECT * INTO v_payment
  FROM payments
  WHERE id = p_payment_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Pembayaran tidak ditemukan.');
  END IF;

  -- Hapus payment
  DELETE FROM payments WHERE id = p_payment_id;

  -- Atomic: tambahkan sisa kembali + reset status jika perlu
  UPDATE debts
  SET
    sisa       = LEAST(sisa + v_payment.amount, total),
    status     = CASE WHEN LEAST(sisa + v_payment.amount, total) > 0 THEN 'active' ELSE 'paid_off' END,
    updated_at = NOW()
  WHERE id = v_payment.debt_id;

  RETURN json_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_payment_and_restore(UUID, UUID) TO authenticated;


-- ============================================================
-- PATCH 3: Perketat CHECK tanggal_tagihan (1-31 → 1-28)
-- Agar valid di semua bulan termasuk Februari
-- ============================================================
ALTER TABLE public.debts
  DROP CONSTRAINT IF EXISTS debts_tanggal_tagihan_check;

ALTER TABLE public.debts
  ADD CONSTRAINT debts_tanggal_tagihan_check
  CHECK (tanggal_tagihan BETWEEN 1 AND 28);


-- ============================================================
-- SELESAI! Patch berhasil diaplikasikan.
-- ============================================================
