'use client';

import React, { useMemo, useState } from 'react';
import { TrendingUp, Sparkles, Receipt, Calendar } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Transaction } from '@/types/database';

interface DayActivity {
  date: string;
  labelFr: string;
  labelAr: string;
  pointsEarned: number;
  pointsRedeemed: number;
  txCount: number;
}

export function DashboardActivityChart({
  transactions = [],
}: {
  transactions?: Transaction[];
}) {
  const { language } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Group transactions across the last 7 calendar days
  const dailyData: DayActivity[] = useMemo(() => {
    const days: DayActivity[] = [];
    const now = new Date();

    const dayNamesFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const dayNamesAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayIdx = d.getDay();

      days.push({
        date: dateKey,
        labelFr: `${dayNamesFr[dayIdx]} ${d.getDate()}`,
        labelAr: `${dayNamesAr[dayIdx]} ${d.getDate()}`,
        pointsEarned: 0,
        pointsRedeemed: 0,
        txCount: 0,
      });
    }

    transactions.forEach((tx) => {
      const txDateStr = tx.created_at ? tx.created_at.split('T')[0] : '';
      const day = days.find((d) => d.date === txDateStr);
      if (day) {
        day.txCount += 1;
        if (tx.type === 'earn') {
          day.pointsEarned += tx.points;
        } else if (tx.type === 'redeem') {
          day.pointsRedeemed += tx.points;
        }
      }
    });

    return days;
  }, [transactions]);

  // Compute scale max for relative bar heights
  const maxPoints = useMemo(() => {
    let max = 100;
    dailyData.forEach((d) => {
      if (d.pointsEarned > max) max = d.pointsEarned;
      if (d.pointsRedeemed > max) max = d.pointsRedeemed;
    });
    return max;
  }, [dailyData]);

  const totalWeekEarned = dailyData.reduce((acc, d) => acc + d.pointsEarned, 0);
  const totalWeekRedeemed = dailyData.reduce((acc, d) => acc + d.pointsRedeemed, 0);
  const totalWeekTx = dailyData.reduce((acc, d) => acc + d.txCount, 0);

  const isAr = language === 'ar';

  return (
    <div className="bg-white border-2 border-black rounded-3xl p-5 sm:p-6 shadow-[0_8px_0_#000] space-y-5 text-start font-rounded">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b-2 border-black/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFE600] border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
              <TrendingUp className="w-4 h-4 text-black stroke-[2.5]" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-black">
              {isAr ? 'نشاط النقاط (آخر 7 أيام)' : 'Activité des Points (7 derniers jours)'}
            </h3>
          </div>
          <p className="text-xs text-black/60 font-bold">
            {isAr
              ? 'متابعة يومية للنقاط الممنوحة والمكافآت المستهلكة'
              : 'Flux quotidien des points distribués et des récompenses débloquées'}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-black self-start sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#FFE600] border-2 border-black shadow-[0_1px_0_#000]" />
            <span className="text-black">{isAr ? 'نقاط ممنوحة' : 'Points émis'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-black border-2 border-black shadow-[0_1px_0_#000]" />
            <span className="text-black">{isAr ? 'نقاط مستهلكة' : 'Points utilisés'}</span>
          </div>
        </div>
      </div>

      {/* Week Totals Quick Badges */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="p-3 rounded-2xl bg-[#FFF9D2] border-2 border-black shadow-[0_2px_0_#000]">
          <span className="text-[10px] font-black uppercase text-black/60 block">
            {isAr ? 'المعاملات' : 'Passages caisse'}
          </span>
          <span className="text-lg sm:text-xl font-black text-black font-mono">
            {totalWeekTx}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-[#FFE600] border-2 border-black shadow-[0_2px_0_#000]">
          <span className="text-[10px] font-black uppercase text-black/70 block">
            {isAr ? 'نقاط ممنوحة (+)' : 'Points émis (+)'}
          </span>
          <span className="text-lg sm:text-xl font-black text-black font-mono">
            +{totalWeekEarned.toLocaleString()}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-black text-white border-2 border-black shadow-[0_2px_0_#000]">
          <span className="text-[10px] font-black uppercase text-[#FFE600] block">
            {isAr ? 'نقاط مستهلكة (-)' : 'Points utilisés (-)'}
          </span>
          <span className="text-lg sm:text-xl font-black text-[#FFE600] font-mono">
            -{totalWeekRedeemed.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="pt-4 pb-2">
        <div className="h-44 sm:h-52 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-4 border-b-2 border-black relative">
          {dailyData.map((d, index) => {
            const earnHeightPct = Math.max(8, Math.round((d.pointsEarned / maxPoints) * 100));
            const redeemHeightPct = Math.max(8, Math.round((d.pointsRedeemed / maxPoints) * 100));
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-16 z-30 bg-black text-white px-3 py-1.5 rounded-xl border-2 border-black shadow-[0_4px_0_#000] text-[11px] font-bold whitespace-nowrap pointer-events-none transform -translate-x-1/2 left-1/2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="font-black text-[#FFE600]">{isAr ? d.labelAr : d.labelFr}</div>
                    <div className="text-zinc-200">
                      +{d.pointsEarned} pts / -{d.pointsRedeemed} pts ({d.txCount} tx)
                    </div>
                  </div>
                )}

                {/* Bars Pair */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 pb-1">
                  {/* Earn bar */}
                  <div
                    style={{ height: `${d.pointsEarned > 0 ? earnHeightPct : 6}%` }}
                    className={`w-1/2 max-w-[20px] rounded-t-lg border-2 border-black transition-all duration-300 ${
                      d.pointsEarned > 0
                        ? 'bg-[#FFE600] shadow-[0_2px_0_#000] group-hover:bg-yellow-400'
                        : 'bg-zinc-100 border-dashed border-zinc-300'
                    }`}
                  />
                  {/* Redeem bar */}
                  <div
                    style={{ height: `${d.pointsRedeemed > 0 ? redeemHeightPct : 6}%` }}
                    className={`w-1/2 max-w-[20px] rounded-t-lg border-2 border-black transition-all duration-300 ${
                      d.pointsRedeemed > 0
                        ? 'bg-black shadow-[0_2px_0_#000] group-hover:bg-zinc-800'
                        : 'bg-zinc-100 border-dashed border-zinc-300'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Day Labels */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 px-2 sm:px-4 mt-2">
          {dailyData.map((d) => (
            <div
              key={d.date}
              className="flex-1 text-center text-[10px] sm:text-xs font-black text-black/70 truncate"
            >
              {isAr ? d.labelAr : d.labelFr}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
