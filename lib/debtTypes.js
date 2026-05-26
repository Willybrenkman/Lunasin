export const DEBT_TYPES = [
  { value: "lainnya",      label: "Lainnya / Umum",               rateType: "annual",      rateLabel: "Bunga per Tahun (% Efektif)", placeholder: "cth: 12",  defaultRate: 12,  hint: "Masukkan bunga tahunan efektif langsung.",                                                               convert: r => r,        reverseConvert: r => r },
  { value: "kartu_kredit", label: "Kartu Kredit",                  rateType: "monthly",     rateLabel: "Bunga per Bulan (%)",          placeholder: "cth: 2.5", defaultRate: 2.5, hint: "Default 2.5%/bulan (umum). Cek tagihan kartu kreditmu untuk angka pastinya.",                           convert: r => r * 12,   reverseConvert: r => r / 12 },
  { value: "kpr",          label: "KPR / Kredit Rumah",            rateType: "annual",      rateLabel: "Bunga per Tahun (%)",          placeholder: "cth: 10",  defaultRate: 10,  hint: "Default 10%/tahun. Cek akad KPR atau aplikasi bank untuk angka pastinya.",                            convert: r => r,        reverseConvert: r => r },
  { value: "kta",          label: "KTA / Kredit Tanpa Agunan",     rateType: "flat_annual", rateLabel: "Bunga Flat per Tahun (%)",     placeholder: "cth: 12",  defaultRate: 12,  hint: "Default 12% flat/tahun (≈ aproksimasi, faktor ×1.8). Cek kontrak pinjaman untuk angka pastinya.",     convert: r => r * 1.8,  reverseConvert: r => +(r / 1.8).toFixed(4) },
  { value: "leasing",      label: "Leasing / Kredit Kendaraan",    rateType: "flat_annual", rateLabel: "Bunga Flat per Tahun (%)",     placeholder: "cth: 8",   defaultRate: 8,   hint: "Default 8% flat/tahun (≈ aproksimasi, faktor ×1.8). Cek BPKB atau kontrak leasing untuk angka pastinya.", convert: r => r * 1.8,  reverseConvert: r => +(r / 1.8).toFixed(4) },
  { value: "pinjol",       label: "Pinjol / Pinjaman Online",      rateType: "daily",       rateLabel: "Bunga per Hari (%)",           placeholder: "cth: 0.4", defaultRate: 0.4, hint: "Default 0.4%/hari. Cek aplikasi pinjolmu untuk angka pastinya.",                                       convert: r => r * 365,  reverseConvert: r => +(r / 365).toFixed(4) },
  { value: "paylater",     label: "PayLater (Kredivo, Akulaku…)",  rateType: "monthly",     rateLabel: "Bunga per Bulan (%)",          placeholder: "cth: 2",   defaultRate: 2,   hint: "Default 2%/bulan. Cek aplikasi PayLater-mu untuk angka pastinya.",                                    convert: r => r * 12,   reverseConvert: r => +(r / 12).toFixed(4) },
  { value: "keluarga",     label: "Hutang Keluarga / Pribadi",     rateType: "annual",      rateLabel: "Bunga per Tahun (%)",          placeholder: "cth: 0",   defaultRate: 0,   hint: "Default 0% untuk pinjaman antar keluarga/teman. Ubah kalau ada bunga.",                                convert: r => r,        reverseConvert: r => r },
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
