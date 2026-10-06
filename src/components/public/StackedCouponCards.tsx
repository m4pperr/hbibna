'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, QrCode, Wifi, CheckCircle2, Star, Zap, ShieldCheck, Gift } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function StackedCouponCards() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const cards = [
    {
      id: 'gold',
      tier: isAr ? 'بطاقة Hbibna الذهبية' : isFr ? 'Pass Hbibna Or VIP' : 'Hbibna Gold VIP Pass',
      category: isAr ? 'الأزياء والأناقة' : isFr ? 'Mode & Prêt-à-Porter' : 'Fashion & Apparel',
      badge: 'VIP GOLD',
      business: 'Boutique Prestige Alger',
      member: isAr ? 'سارة بن علي' : 'Sarah Benali',
      memberId: 'HB-8821-DZ',
      points: '1,240',
      progress: 82,
      reward: isAr ? 'قسيمة شراء 1,000 دج' : isFr ? 'Bon d’achat 1 000 DA' : '1,000 DA Store Voucher',
      // Holder bumper color (Outer frame from photo)
      frameBg: '#EEC044',
      frameBorder: '#111111',
      frameShadow: 'rgba(238, 192, 68, 0.4)',
      // Holographic accent
      accentGrad: 'from-[#4ADE80] via-[#F472B6] to-[#EEC044]',
      glowColor: '#EEC044',
      themeHue: '#FFE600',
    },
    {
      id: 'rose',
      tier: isAr ? 'بطاقة بريفيليدج الوردية' : isFr ? 'Pass Privilège Framboise' : 'Privilege Club Pass',
      category: isAr ? 'المخابز والحلويات' : isFr ? 'Boulangerie & Pâtisserie' : 'Artisan Bakery',
      badge: 'PRIVILÈGE',
      business: 'Artisan Bakery Oran',
      member: isAr ? 'ياسين بلخير' : 'Yassine Belkheir',
      memberId: 'HB-5514-DZ',
      points: '850',
      progress: 68,
      reward: isAr ? 'خصم 20% على الفاتورة' : isFr ? 'Remise 20% en caisse' : '20% Counter Discount',
      frameBg: '#E25B6C',
      frameBorder: '#111111',
      frameShadow: 'rgba(226, 91, 108, 0.4)',
      accentGrad: 'from-[#F43F5E] via-[#FB7185] to-[#FBBF24]',
      glowColor: '#E25B6C',
      themeHue: '#E25B6C',
    },
    {
      id: 'dark',
      tier: isAr ? 'بطاقة النخبة السوداء' : isFr ? 'Pass Elite Anthracite' : 'Elite Black Pass',
      category: isAr ? 'الصحة والجمال' : isFr ? 'Beauty Studio & Spa' : 'Beauty & Wellness',
      badge: 'ELITE 001',
      business: 'Beauty Studio & Spa',
      member: isAr ? 'كريم منصوري' : 'Karim Mansouri',
      memberId: 'HB-9901-DZ',
      points: '2,400',
      progress: 94,
      reward: isAr ? 'جلسة عناية ممتازة VIP' : isFr ? 'Soin Signature VIP' : 'VIP Signature Treatment',
      frameBg: '#1A1A1A',
      frameBorder: '#111111',
      frameShadow: 'rgba(0, 0, 0, 0.6)',
      accentGrad: 'from-[#38BDF8] via-[#818CF8] to-[#C084FC]',
      glowColor: '#FFE600',
      themeHue: '#111111',
    },
  ];

  // Mouse move tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: (y / rect.height) * -16,
      y: (x / rect.width) * 16,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* SELECTEUR DE TIERS / TICKET BUTTONS */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {cards.map((c, idx) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCardIndex(idx)}
            className={`px-4 sm:px-5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border-[2.5px] border-[#111111] ${
              activeCardIndex === idx
                ? 'bg-[#111111] text-white shadow-[0_5px_0_#111111] -translate-y-0.5'
                : 'bg-[#FAF8F5] text-zinc-700 hover:bg-zinc-200/60 shadow-[0_2px_0_#111111]'
            }`}
          >
            <span
              className="w-3 h-3 rounded-full border border-black/30 shadow-xs"
              style={{ backgroundColor: c.frameBg }}
            />
            <span>{c.tier}</span>
          </button>
        ))}
      </div>

      {/* 3D STACKED "PHYGITAL" PASS CONTAINER */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-[560px] h-[370px] sm:h-[350px] flex items-center justify-center select-none cursor-pointer perspective-[1400px]"
      >
        {cards.map((c, idx) => {
          const offset = (idx - activeCardIndex + cards.length) % cards.length;

          // 3D positioning matching the stacked photo
          let zIndex = 30;
          let translateY = 0;
          let translateX = 0;
          let scale = 1;
          let rotateX = tilt.x;
          let rotateY = tilt.y;
          let rotateZ = 0;
          let opacity = 1;

          if (offset === 0) {
            zIndex = 30;
            translateY = 0;
            translateX = 0;
            scale = 1;
            rotateZ = isAr ? -1.5 : 1.5;
            opacity = 1;
          } else if (offset === 1) {
            zIndex = 20;
            translateY = 22;
            translateX = isAr ? -16 : 16;
            scale = 0.96;
            rotateZ = isAr ? 3 : -3;
            opacity = 0.94;
          } else {
            zIndex = 10;
            translateY = 44;
            translateX = isAr ? -32 : 32;
            scale = 0.92;
            rotateZ = isAr ? 6 : -6;
            opacity = 0.88;
          }

          return (
            <div
              key={c.id}
              onClick={() => setActiveCardIndex(idx)}
              style={{
                zIndex,
                transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
                transition: isHovered
                  ? 'transform 0.12s ease-out, box-shadow 0.3s'
                  : 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className="absolute top-0 w-full max-w-[510px] h-[310px] rounded-[2.5rem] p-3 sm:p-3.5 transition-shadow group"
            >
              {/* ==============================================================
                  1. OUTER TACTILE BUMPER / CARD HOLDER FRAME (Like the photo)
                  ============================================================== */}
              <div
                className="relative w-full h-full rounded-[2.2rem] border-[3px] border-[#111111] shadow-[0_12px_0_#111111] flex items-center justify-center p-2 sm:p-2.5 overflow-hidden transition-transform"
                style={{ backgroundColor: c.frameBg }}
              >
                {/* TOP & BOTTOM THUMB NOTCHES (Authentic card-holder cutouts from photo) */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 rounded-b-full border-b-[3px] border-x-[3px] border-[#111111] z-20 pointer-events-none"
                  style={{ backgroundColor: '#FAF8F5' }}
                />
                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-28 h-6 rounded-t-full border-t-[3px] border-x-[3px] border-[#111111] z-20 pointer-events-none"
                  style={{ backgroundColor: '#FAF8F5' }}
                />

                {/* LATERAL NOTCHES (Left & Right finger grips) */}
                <div
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-14 rounded-r-full border-r-[3px] border-y-[3px] border-[#111111] z-20 pointer-events-none"
                  style={{ backgroundColor: '#FAF8F5' }}
                />
                <div
                  className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-14 rounded-l-full border-l-[3px] border-y-[3px] border-[#111111] z-20 pointer-events-none"
                  style={{ backgroundColor: '#FAF8F5' }}
                />

                {/* ==============================================================
                    2. INNER HIGH-END DIGITAL OLED / SMARTPASS INSERT
                    ============================================================== */}
                <div className="relative w-full h-full rounded-[1.6rem] bg-[#FAF8F5] border-[2.5px] border-[#111111] p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-inner">
                  {/* Ambient Subtle Iridescent Aura on Card Surface */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-200/40 via-amber-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-100/30 via-sky-100/20 to-transparent rounded-full blur-2xl pointer-events-none" />

                  {/* Shimmer glare ray across surface */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform pointer-events-none" />

                  {/* 4 CORNER RETENTION BRACKETS (Black tactile clips from photo) */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-black rounded-tl-sm pointer-events-none" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-black rounded-tr-sm pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-black rounded-bl-sm pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-black rounded-br-sm pointer-events-none" />

                  {/* PASS HEADER: Business Name, Member & NFC / Badge (Exact Mobile Layout) */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/hbibna-icon-trimmed.png"
                        alt=""
                        className="w-6 h-6 object-contain"
                      />
                      <div className="text-start">
                        <div className="text-sm sm:text-base font-black text-[#111111] leading-tight">
                          {c.business}
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-bold text-zinc-500">
                          {c.member}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-[#111111] text-[#FFE600] text-[9px] font-black font-mono">
                        NFC
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#FFE600] text-[#111111] border border-black/20 text-[9px] sm:text-[10px] font-black uppercase font-mono shadow-xs">
                        {c.badge}
                      </span>
                    </div>
                  </div>

                  {/* PASS CENTER: HOLOGRAPHIC TICKET + REWARD & VISIBLE PROGRESS GAUGE (Exact Mobile Design) */}
                  <div className="relative z-10 my-1.5 py-2.5 px-3.5 rounded-2xl bg-white/95 border-2 border-[#111111] shadow-[0_2.5px_0_#111111] space-y-2">
                    {/* Row 1: Mini ticket pastel & reward on left, points balance on right */}
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`relative w-14 h-9 rounded-md p-0.5 border border-[#111111] flex items-center justify-center bg-gradient-to-r ${c.accentGrad} shadow-2xs overflow-hidden shrink-0`}
                        >
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border-r border-[#111111]" />
                          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border-l border-[#111111]" />
                          <div className="text-[7px] font-mono font-black text-[#111111]">|||||||</div>
                        </div>
                        <div className="min-w-0 text-start">
                          <span className="text-[8px] sm:text-[8.5px] uppercase font-black tracking-widest text-[#E25B6C] block leading-none">
                            {isAr ? 'المكافأة القادمة' : isFr ? 'NEXT REWARD' : 'NEXT REWARD'}
                          </span>
                          <div className="text-xs font-black text-[#111111] truncate leading-tight mt-0.5 flex items-center gap-1">
                            <Gift className="w-3 h-3 text-[#E25B6C] shrink-0" />
                            <span className="truncate">{c.reward}</span>
                          </div>
                          <div className="text-[8px] sm:text-[8.5px] font-mono text-zinc-400 mt-0.5">
                            ID: {c.memberId}
                          </div>
                        </div>
                      </div>

                      <div className="text-end shrink-0 pl-1">
                        <div className="text-[8px] sm:text-[8.5px] font-mono font-bold text-zinc-400 uppercase leading-none mb-0.5">
                          {isAr ? 'الرصيد' : isFr ? 'BALANCE' : 'BALANCE'}
                        </div>
                        <div className="text-lg sm:text-2xl font-black text-[#111111] tracking-tight leading-none">
                          {c.points} <span className="text-[10px] sm:text-xs text-[#E25B6C]">PTS</span>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Visible Progress Bar inside Card (Matching client portal & mobile) */}
                    <div className="space-y-0.5 pt-0.5">
                      <div className="w-full h-2.5 rounded-full bg-zinc-200 border border-[#111111] p-0.5 overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${c.progress}%`,
                            backgroundColor: c.frameBg === '#1A1A1A' ? '#111111' : c.frameBg,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono font-bold text-zinc-600">
                        <span>
                          {c.progress}% {isAr ? 'نحو المكافأة القادمة' : isFr ? 'to next reward' : 'to next reward'}
                        </span>
                        <span className="font-black text-[#111111] px-1 rounded bg-black/5">
                          {c.progress}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PASS FOOTER: QR Scan & Stars + Verified Status (Exact Mobile Layout) */}
                  <div className="relative z-10 flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#111111] p-1.5 shadow-2xs shrink-0 flex items-center justify-center">
                        <QrCode className="w-full h-full text-white" />
                      </div>
                      <div className="text-start">
                        <div className="text-[9px] font-mono font-bold text-zinc-600 leading-none">
                          Scan 1.2s
                        </div>
                        <div className="text-[8px] font-mono text-zinc-400 font-bold mt-0.5">
                          {isAr ? 'في الكاشير' : isFr ? 'At counter' : 'At counter'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-0.5 text-[#EEC044]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-[8.5px] font-mono font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {isAr ? 'Pass verified' : isFr ? 'Pass verified' : 'Pass verified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* HELPER HINT */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-[#111111]/70 bg-white/70 backdrop-blur-sm px-4 py-1.5 rounded-full border border-black/10 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
        <span>
          {isAr
            ? 'المس أو انقر على أي بطاقة لتفعيلها ورؤية تأثير العمق ثلاثي الأبعاد'
            : isFr
            ? 'Cliquez sur une carte pour la hisser au sommet du holder 3D'
            : 'Click on any card to bring it to the top of the 3D holder'}
        </span>
      </div>
    </div>
  );
}
