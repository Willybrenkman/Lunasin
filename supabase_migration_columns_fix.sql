-- ============================================================
-- LUNASIN.ID — MIGRATION: Tambah kolom tanggal di tabel debts
-- ============================================================
-- Jalankan di Supabase SQL Editor SETELAH supabase_schema.sql
-- jika database sudah ada. Untuk instalasi baru, kolom ini
-- sudah ada di supabase_schema.sql versi terbaru.
-- ============================================================

ALTER TABLE public.debts
  ADD COLUMN IF NOT EXISTS tanggal_mulai DATE,
  ADD COLUMN IF NOT EXISTS tanggal_tagihan SMALLINT CHECK (tanggal_tagihan BETWEEN 1 AND 31);

-- ============================================================
-- SELESAI! Kolom tanggal_mulai dan tanggal_tagihan sudah ada.
-- ============================================================
