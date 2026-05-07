"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { usePrivacy } from "@/components/privacy/PrivacyContext";

export default function DebtChart({ data, strategy = "Smart Priority", onStrategyChange }) {
  const { theme } = useTheme();
  const { formatMoney, isPrivate } = usePrivacy();
  const isLight = theme === "light";

  // Fallback dummy data kalau tidak ada data
  const chartData = (data && data.length > 0) ? data : [
    { month: 1, total: 8200000, baseline: 8200000 },
    { month: 3, total: 7000000, baseline: 7800000 },
    { month: 6, total: 5200000, baseline: 7000000 },
    { month: 9, total: 3500000, baseline: 6000000 },
    { month: 12, total: 1800000, baseline: 4800000 },
    { month: 14, total: 0, baseline: 3500000 },
  ];

  const [open, setOpen] = useState(false);
  const strategies = ["Smart Priority", "Snowball", "Avalanche"];

  const gridStroke = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";
  const tickColor = isLight ? "#94A3B8" : "#64748B";
  const tooltipBg = isLight ? "#FFFFFF" : "#0F1319";
  const tooltipBorder = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const tooltipText = isLight ? "#0B0F14" : "#FFFFFF";
  const tooltipLabelColor = isLight ? "#475569" : "#94A3B8";

  return (
    <div className="w-full h-full">
      {/* Chart Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h3 className="font-black text-lg leading-tight theme-text-primary">
          Grafik Pelunasan (Estimasi)
        </h3>

        <div className="flex items-center gap-6 ml-auto flex-wrap">
          {/* Custom Legend */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#22C55E] rounded-full"></div>
              <span className="text-[10px] font-black theme-text-secondary leading-none uppercase tracking-widest">
                Sisa Hutang
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-[2px] border-t-2 border-dashed border-[#EF4444]"></div>
              <span className="text-[10px] font-black theme-text-secondary leading-none uppercase tracking-widest">
                Tanpa Extra Payment
              </span>
            </div>
          </div>

          {/* Strategy Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-2 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <span className="text-xs font-bold theme-text-primary">{strategy}</span>
              <ChevronDown size={14} className="theme-text-secondary" />
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-2 luxury-card rounded-xl overflow-hidden z-10 min-w-[160px] shadow-2xl">
                {strategies.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onStrategyChange?.(s);
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold theme-text-primary hover:bg-white/5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: tickColor, fontSize: 10, fontWeight: 700 }}
              tickFormatter={(v) => `Bln ${v}`}
              dy={10}
            />
            <YAxis
              fontSize={11}
              fontWeight={700}
              tickLine={false}
              axisLine={false}
              tick={{ fill: tickColor }}
              width={45}
              tickFormatter={(value) => isPrivate ? "•••" : `${(value / 1000000).toFixed(0)}jt`}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '12px',
                boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.08)' : '0 10px 30px rgba(0,0,0,0.5)',
                padding: '12px',
                zIndex: 50
              }}
              labelStyle={{ color: tooltipLabelColor, fontWeight: 700, fontSize: '11px' }}
              itemStyle={{ fontWeight: 900, fontSize: '12px', color: tooltipText }}
              formatter={(value) => [formatMoney(value)]}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#22C55E"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#22C55E' }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="baseline"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
