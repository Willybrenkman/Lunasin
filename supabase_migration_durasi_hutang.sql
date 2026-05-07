-- ============================================================
-- LUNASIN.ID — MIGRATION: TAMBAH DURASI HUTANG
-- ============================================================
-- Menambahkan kolom tanggal_mulai agar hutang punya durasi:
--   tanggal_mulai = kapan hutang dimulai
--   jatuh_tempo   = kapan hutang berakhir / target lunas
--
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- Tambah kolom tanggal_mulai
ALTER TABLE public.debts
  ADD COLUMN IF NOT EXISTS tanggal_mulai DATE;

-- ============================================================
-- SELESAI! Kolom tanggal_mulai sudah ditambahkan.
-- jatuh_tempo tetap dipakai sebagai tanggal berakhir hutang.
-- ============================================================
