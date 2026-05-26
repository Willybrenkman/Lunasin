export const DEBT_TYPES = [
  { value: "lainnya",      label: "Lainnya / Umum",               rateType: "annual",      rateLabel: "Bunga per Tahun (% Efektif)", placeholder: "cth: 12",  hint: "Masukkan bunga tahunan efektif langsung.",                                     convert: r => r },
  { value: "kartu_kredit", label: "Kartu Kredit",                  rateType: "monthly",     rateLabel: "Bunga per Bulan (%)",          placeholder: "cth: 2.5", hint: "Biasanya 2–3% per bulan. Akan dikonversi ke bunga tahunan otomatis.",           convert: r => r * 12 },
  { value: "kpr",          label: "KPR / Kredit Rumah",            rateType: "annual",      rateLabel: "Bunga per Tahun (%)",          placeholder: "cth: 10",  hint: "Masukkan bunga tahunan efektif sesuai kontrak KPR.",                           convert: r => r },
  { value: "kta",          label: "KTA / Kredit Tanpa Agunan",     rateType: "flat_annual", rateLabel: "Bunga Flat per Tahun (%)",     placeholder: "cth: 12",  hint: "Bunga flat akan dikonversi ke bunga efektif (×1.8) sebelum disimpan.",        convert: r => r * 1.8 },
  { value: "leasing",      label: "Leasing / Kredit Kendaraan",    rateType: "flat_annual", rateLabel: "Bunga Flat per Tahun (%)",     placeholder: "cth: 8",   hint: "Bunga flat leasing akan dikonversi ke bunga efektif (×1.8) sebelum disimpan.", convert: r => r * 1.8 },
  { value: "pinjol",       label: "Pinjol / Pinjaman Online",      rateType: "daily",       rateLabel: "Bunga per Hari (%)",           placeholder: "cth: 0.4", hint: "Biasanya 0.1–0.4% per hari. Akan dikonversi ke bunga tahunan otomatis.",       convert: r => r * 365 },
  { value: "paylater",     label: "PayLater (Kredivo, Akulaku…)",  rateType: "monthly",     rateLabel: "Bunga per Bulan (%)",          placeholder: "cth: 2",   hint: "Biasanya 1–3% per bulan. Akan dikonversi ke bunga tahunan otomatis.",         convert: r => r * 12 },
  { value: "keluarga",     label: "Hutang Keluarga / Pribadi",     rateType: "annual",      rateLabel: "Bunga per Tahun (%)",          placeholder: "cth: 0",   hint: "Biasanya 0% untuk pinjaman antar keluarga atau teman.",                        convert: r => r },
];

export function getDebtTypeConfig(value) {
  return DEBT_TYPES.find(t => t.value === value) || DEBT_TYPES[0];
}

export const DEBT_TYPE_COLORS = {
  kartu_kredit: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  kpr:          "bg-purple-500/10 text-purple-400 border-purple-500/20",
  kta:          "bg-orange-500/10 text-orange-400 border-orange-500/20",
  leasing:      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  pinjol:       "bg-red-500/10 text-red-400 border-red-500/20",
  paylater:     "bg-pink-500/10 text-pink-400 border-pink-500/20",
  keluarga:     "bg-green-500/10 text-green-400 border-green-500/20",
  lainnya:      "bg-white/5 text-gray-400 border-white/10",
};
