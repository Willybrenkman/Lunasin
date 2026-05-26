-- Migration: add debt_type column to debts table
-- Run this in Supabase SQL Editor

ALTER TABLE debts
  ADD COLUMN IF NOT EXISTS debt_type TEXT NOT NULL DEFAULT 'lainnya';
