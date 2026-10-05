'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Star, QrCode, Coffee, Cake, Scissors, UtensilsCrossed, ShoppingBag, Sparkles, Store, Wifi, CheckCircle2, Gift } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/* -------------------------------------------------------------------------
   Social proof figures — PLACEHOLDERS, replace with real numbers before launch
   ------------------------------------------------------------------------- */
const HERO_PROOF = {
  rating: '4.9',
  merchants: '+120',
  scanSpeed: '1,2 s',
  visitsLift: '+38%',
};

type Lang = 'fr' | 'en' | 'ar';
const tr = (lang: Lang, fr: string, en: string, ar: string) => (lang === 'ar' ? ar : lang === 'fr' ? fr : en);

/* Small bordered ticket with punched side notches (works on the yellow background) */
function NotchedTicket({
  children,
  className = '',
  notchBg = 'bg-[#EEC044]',
}: {
  children: React.ReactNode;
  className?: string;
  notchBg?: string;
}) {
  return (
    <div className={`relative border-[2.5px] border-[#111111] ${className}`}>
      <span
        className={`absolute -left-[9px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full ${notchBg} border-r-[2.5px] border-[#111111]`}
        aria-hidden="true"
      />
      <span
        className={`absolute -right-[9px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full ${notchBg} border-l-[2.5px] border-[#111111]`}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

/* =========================================================================
   3D STACKED TICKETS — the brand logo turned into the hero visual
   ========================================================================= */
function TicketStack({ lang }: { lang: Lang }) {
  const [hover, setHover] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((e.clientY - r.top) / r.height - 0.5) * -8,
      y: ((e.clientX - r.left) / r.width - 0.5) * 8,
    });
  };

  const gap = hover ? 78 : 56;
  const layers = [
    { face: '#1A1A1A', edge: '#000000', z: 0 },
    { face: '#E25B6C', edge: '#B8434F', z: gap },
    { face: '#EEC044', edge: '#C69A2C', z: gap * 2 },
  ];

  return (
    <div
      className="relative w-[440px] h-[300px]"
      style={{ perspective: '1600px' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setTilt({ x: 0, y: 0 });
      }}
      onMouseMove={handleMove}
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${50 + tilt.x}deg) rotateZ(${-30 + tilt.y}deg)`,
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Ground shadow */}
        <div
          className="absolute inset-6 rounded-[40px] bg-black/35 blur-2xl"
          style={{ transform: 'translateZ(-40px)' }}
          aria-hidden="true"
        />

        {layers.map((l, i) => (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${l.z}px)`,
              transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Thickness */}
            <div
              className="hb-ticket absolute inset-0 rounded-[30px]"
              style={{ background: l.edge, transform: 'translateZ(-10px)' }}
            />
            {/* Face */}
            <div className="hb-ticket absolute inset-0 rounded-[30px]" style={{ background: l.face }}>
              {i === 2 && <PassFace lang={lang} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Digital loyalty pass printed on the top (yellow) ticket */
function PassFace({ lang }: { lang: Lang }) {
  return (
    <div className="absolute inset-y-3.5 inset-x-7 rounded-[18px] bg-[#FAF8F5] flex overflow-hidden text-[#111111] text-start border border-black/10 shadow-xs">
      {/* Main body */}
      <div className="flex-1 p-3 sm:p-3.5 flex flex-col justify-between min-w-0">
        <div className="flex items-center gap-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/hbibna-icon-trimmed.png" alt="" className="w-5 h-5 object-contain" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/hbibna-wordmark-screen.png" alt="Hbibna" className="h-3.5 w-auto object-contain" />
        </div>

        <div>
          <div className="text-[13px] font-black leading-tight text-[#111111]">Café Roastery 44</div>
          <div className="text-[10px] font-bold text-zinc-500">Sarah Benali</div>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-1">
            <div className="text-[28px] font-black leading-none tracking-tight text-[#111111]">
              1 240 <span className="text-[13px] text-[#E25B6C]">PTS</span>
            </div>
            <span className="text-[9px] font-black font-mono text-zinc-600">82%</span>
          </div>
          <div className="h-2 rounded-full bg-zinc-200 overflow-hidden">
            <div className="h-full w-[82%] rounded-full bg-[#111111]" />
          </div>
          <div className="mt-1 text-[8.5px] font-bold text-zinc-500 truncate">
            {tr(lang, '82% vers la prochaine récompense (260 pts restants)', '82% to next reward (260 pts to go)', '82% نحو المكافأة القادمة (باقي 260 نقطة)')}
          </div>
        </div>
      </div>

      {/* Tear-off stub */}
      <div className="w-[84px] shrink-0 border-s-2 border-dashed border-[#111111]/25 flex flex-col items-center justify-center gap-1.5 p-2 bg-amber-50/40">
        <div className="w-13 h-13 rounded-lg bg-[#111111] p-1.5 shadow-xs">
          <QrCode className="w-full h-full text-white" />
        </div>
        <span className="text-[7.5px] font-black font-mono tracking-widest text-[#111111]/60">HB-8821</span>
      </div>
    </div>
  );
}

/* Floating mini-ticket notification */
function FloatingNote({
  children,
  className = '',
  delay = '0s',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: string;
}) {
  return (
    <div className={`absolute z-20 hb-pop-in ${className}`} style={{ animationDelay: delay }}>
      <div className="hb-float-slow" style={{ animationDelay: delay }}>
        <NotchedTicket
          notchBg="bg-[#F3CD62]"
          className="bg-[#FAF8F5] rounded-xl px-4 py-2 shadow-[0_4px_0_#111111] text-[13px] font-black text-[#111111] whitespace-nowrap"
        >
          {children}
        </NotchedTicket>
      </div>
    </div>
  );
}

/* =========================================================================
   MOBILE-OPTIMIZED 3D CUTOUT STACKED PASS (Le Pass Phygital Découpé)
   ========================================================================= */
function MobileStackedCutoutPass({ lang }: { lang: Lang }) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'pass3d' | 'appleWallet'>('pass3d');

  const cards = [
    {
      id: 'gold',
      tier: tr(lang, 'Pass Or VIP', 'Gold VIP Pass', 'بطاقة ذهبية VIP'),
      badge: 'VIP GOLD',
      business: 'Café Roastery 44',
      member: tr(lang, 'Sarah Benali', 'Sarah Benali', 'سارة بن علي'),
      memberId: 'HB-8821',
      points: '1 240',
      progress: 82,
      reward: tr(lang, 'Café Roastery offert', 'Free signature coffee', 'قهوة مجانية مميزة'),
      frameBg: '#EEC044',
      accentGrad: 'from-[#4ADE80] via-[#F472B6] to-[#EEC044]',
      barcode: 'HB-8821',
    },
    {
      id: 'rose',
      tier: tr(lang, 'Pass Privilège', 'Privilege Pass', 'بطاقة بريفيليدج'),
      badge: 'PRIVILÈGE',
      business: 'Artisan Bakery Oran',
      member: tr(lang, 'Yassine Belkheir', 'Yassine Belkheir', 'ياسين بلخير'),
      memberId: 'HB-5514',
      points: '850',
      progress: 68,
      reward: tr(lang, 'Remise 20% en caisse', '20% counter discount', 'خصم 20% في الكاشير'),
      frameBg: '#E25B6C',
      accentGrad: 'from-[#F43F5E] via-[#FB7185] to-[#FBBF24]',
      barcode: 'HB-5514',
    },
    {
      id: 'dark',
      tier: tr(lang, 'Pass Élite', 'Elite Pass', 'بطاقة النخبة'),
      badge: 'ELITE 001',
      business: 'Beauty Studio & Spa',
      member: tr(lang, 'Karim Mansouri', 'Karim Mansouri', 'كريم منصوري'),
      memberId: 'HB-9901',
      points: '2 400',
      progress: 94,
      reward: tr(lang, 'Soin VIP Signature', 'VIP treatment session', 'جلسة عناية VIP'),
      frameBg: '#1A1A1A',
      accentGrad: 'from-[#38BDF8] via-[#818CF8] to-[#C084FC]',
      barcode: 'HB-9901',
    },
  ];

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[370px] mx-auto mt-6 mb-4 px-1 lg:hidden flex flex-col items-center select-none font-rounded">
      {/* Switcher Mode: Pass Web 3D vs Apple Wallet iOS */}
      <div className="inline-flex items-center p-1 rounded-full bg-[#111111] text-white border-2 border-[#111111] shadow-[0_3px_0_#000] mb-3.5 text-[11px] font-black z-20">
        <button
          type="button"
          onClick={() => setViewMode('pass3d')}
          className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'pass3d'
              ? 'bg-[#FFE600] text-black shadow-xs'
              : 'text-zinc-300 hover:text-white'
          }`}
        >
          <span>🎟️ Pass Web 3D</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('appleWallet')}
          className={`px-3 py-1 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
            viewMode === 'appleWallet'
              ? 'bg-[#FFE600] text-black shadow-xs'
              : 'text-zinc-300 hover:text-white'
          }`}
        >
          <span>🍏 Apple Wallet</span>
        </button>
      </div>

      {viewMode === 'appleWallet' ? (
        /* =========================================================================
           APPLE WALLET (iOS PassKit) SIMULATION
           ========================================================================= */
        <div className="w-full max-w-[325px] sm:max-w-[340px] bg-black text-white rounded-[2.2rem] p-3.5 border-2 border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden text-start font-sans animate-in fade-in zoom-in-95 duration-200">
          {/* iOS Status Bar */}
          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 px-2 pt-0.5 pb-2">
            <span>09:41</span>
            <div className="w-16 h-3.5 bg-zinc-900 rounded-full border border-zinc-800/80 mx-auto" />
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3" />
              <div className="w-4 h-2 rounded-xs border border-zinc-400 p-0.5 flex items-center">
                <div className="w-full h-full bg-zinc-200 rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Apple Wallet Header */}
          <div className="flex items-center justify-between px-1 mb-2.5">
            <span className="text-base font-black tracking-tight text-white">Wallet</span>
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 text-xs font-bold">
              •••
            </div>
          </div>

          {/* MAIN APPLE WALLET PASS CARD (.pkpass) */}
          <div className="relative rounded-2xl bg-[#EEC044] text-[#111111] p-3.5 shadow-xl border border-black/15 overflow-hidden">
            {/* Header: Logo & Store */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/hbibna-icon-trimmed.png" alt="" className="w-5 h-5 object-contain" />
                <span className="text-xs font-black tracking-tight">Café Roastery 44</span>
              </div>
              <span className="text-[8.5px] font-black uppercase font-mono bg-black/10 px-2 py-0.5 rounded">
                VIP GOLD
              </span>
            </div>

            {/* Central 3D Trompe-l'œil Strip (Bandeau strip.png d'Apple Wallet) */}
            <div className="relative my-2 py-2 px-2.5 rounded-xl bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 border border-black/20 shadow-inner overflow-hidden flex items-center justify-between">
              {/* Trompe-l'œil 3D Embossed Ticket */}
              <div className="relative w-20 h-9 rounded-md bg-gradient-to-r from-yellow-300 via-amber-200 to-rose-200 border border-black/30 shadow-[0_2px_4px_rgba(0,0,0,0.15)] flex items-center justify-center">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-100 border-r border-black/30" />
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-100 border-l border-black/30" />
                <span className="text-[7.5px] font-black tracking-wider text-black/80 font-mono">🎟️ HBIBNA</span>
              </div>
              <div className="text-end">
                <span className="text-[7.5px] font-bold text-black/60 uppercase block">Points Fidélité</span>
                <span className="text-lg font-black tracking-tight leading-none text-[#111111]">
                  1 240 <span className="text-[10px] text-[#E25B6C]">PTS</span>
                </span>
              </div>
            </div>

            {/* Secondary Fields */}
            <div className="flex items-end justify-between my-2 text-[10px]">
              <div>
                <span className="text-[8px] font-bold text-black/60 uppercase block">Titulaire</span>
                <span className="font-black text-xs text-[#111111]">Sarah Benali</span>
              </div>
              <div className="text-end">
                <span className="text-[8px] font-bold text-black/60 uppercase block">Prochaine récompense</span>
                <span className="font-black text-[11px] text-amber-950">Café offert à 1 500 pts</span>
              </div>
            </div>

            {/* Official Apple Wallet Barcode Section */}
            <div className="mt-2.5 pt-2 border-t border-dashed border-black/20 bg-white rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-xs">
              <div className="w-14 h-14 bg-black p-1 rounded-md mb-1 flex items-center justify-center">
                <QrCode className="w-full h-full text-white" />
              </div>
              <span className="text-[8px] font-mono font-bold tracking-widest text-zinc-700">HB-8821-DZ</span>
              <span className="text-[7.5px] font-bold text-zinc-400 mt-0.5">Scannez lors du paiement</span>
            </div>
          </div>

          {/* Native Apple Wallet Stacked Cards underneath */}
          <div className="mt-2.5 space-y-1.5 opacity-90">
            <div className="h-6 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 border border-blue-600/40 px-3 py-1 flex items-center justify-between text-[9px] font-bold text-white shadow-md">
              <span>Apple Card</span>
              <span className="font-mono">•••• 4242</span>
            </div>
            <div className="h-4 rounded-t-xl bg-gradient-to-r from-zinc-700 to-zinc-900 border-t border-zinc-600/30 px-3 py-0.5 flex items-center justify-between text-[8px] font-bold text-zinc-300 opacity-60">
              <span>Air Algérie • Vol AH1000</span>
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           PASS WEB 3D DÉCOUPÉ (PHYGITAL PASS)
           ========================================================================= */
        <>
          {/* Tiers Switch Pills */}
          <div className="flex items-center justify-center gap-1.5 mb-3.5 z-20">
            {cards.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCardIndex(idx)}
                className={`px-3 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer flex items-center gap-1.5 border-2 border-[#111111] ${
                  activeCardIndex === idx
                    ? 'bg-[#111111] text-white shadow-[0_3px_0_#111111] -translate-y-0.5'
                    : 'bg-[#FAF8F5] text-zinc-700 hover:bg-zinc-100 shadow-[0_1.5px_0_#111111]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full border border-black/30"
                  style={{ backgroundColor: c.frameBg }}
                />
                <span>{c.tier}</span>
              </button>
            ))}
          </div>

          {/* 3D Stacked Container */}
          <div className="relative w-full max-w-[330px] sm:max-w-[350px] h-[280px] sm:h-[295px] flex items-center justify-center">
            {cards.map((c, idx) => {
              const offset = (idx - activeCardIndex + cards.length) % cards.length;

              let zIndex = 30;
              let translateY = 0;
              let translateX = 0;
              let scale = 1;
              let rotateZ = -1.5;
              let opacity = 1;

              if (offset === 0) {
                zIndex = 30;
                translateY = 0;
                translateX = 0;
                scale = 1;
                rotateZ = -1.5;
                opacity = 1;
              } else if (offset === 1) {
                zIndex = 20;
                translateY = 16;
                translateX = 12;
                scale = 0.95;
                rotateZ = 2.5;
                opacity = 0.95;
              } else {
                zIndex = 10;
                translateY = 30;
                translateX = 22;
                scale = 0.90;
                rotateZ = 5;
                opacity = 0.90;
              }

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveCardIndex(idx)}
                  style={{
                    zIndex,
                    transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotateZ(${rotateZ}deg)`,
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  className="absolute top-0 w-full h-[250px] sm:h-[260px] cursor-pointer"
                >
                  {/* OUTER BUMPER / CUTOUT FRAME (Avec vraies encoches découpées) */}
                  <div
                    className="relative w-full h-full rounded-[1.8rem] border-[2.5px] border-[#111111] shadow-[0_6px_0_#111111] flex items-center justify-center p-2 overflow-hidden transition-transform"
                    style={{ backgroundColor: c.frameBg }}
                  >
                    {/* TOP & BOTTOM THUMB NOTCHES */}
                    <div
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 rounded-b-full border-b-[2.5px] border-x-[2.5px] border-[#111111] z-20 pointer-events-none"
                      style={{ backgroundColor: '#FAF8F5' }}
                    />
                    <div
                      className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-20 h-4 rounded-t-full border-t-[2.5px] border-x-[2.5px] border-[#111111] z-20 pointer-events-none"
                      style={{ backgroundColor: '#FAF8F5' }}
                    />

                    {/* LATERAL NOTCHES */}
                    <div
                      className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-10 rounded-r-full border-r-[2.5px] border-y-[2.5px] border-[#111111] z-20 pointer-events-none"
                      style={{ backgroundColor: '#FAF8F5' }}
                    />
                    <div
                      className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-4 h-10 rounded-l-full border-l-[2.5px] border-y-[2.5px] border-[#111111] z-20 pointer-events-none"
                      style={{ backgroundColor: '#FAF8F5' }}
                    />

                    {/* INNER SMARTPASS INSERT */}
                    <div className="relative w-full h-full rounded-[1.3rem] bg-[#FAF8F5] border-[2px] border-[#111111] p-3 flex flex-col justify-between overflow-hidden shadow-inner text-[#111111] text-start">
                      {/* 4 Corner retention brackets */}
                      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-black pointer-events-none" />
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-black pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-black pointer-events-none" />
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-black pointer-events-none" />

                      {/* Pass Header */}
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/assets/hbibna-icon-trimmed.png" alt="" className="w-5 h-5 object-contain" />
                          <div>
                            <div className="text-[12px] font-black text-[#111111] leading-tight">{c.business}</div>
                            <div className="text-[9px] font-bold text-zinc-500">{c.member}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded-full bg-[#111111] text-[#FFE600] text-[8px] font-black font-mono">
                            NFC
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-[#FFE600] text-[#111111] border border-black/20 text-[8px] font-black uppercase font-mono">
                            {c.badge}
                          </span>
                        </div>
                      </div>

                      {/* Pass Center: Hologram Ticket, Next Reward & High-Visibility Progress Bar */}
                      <div className="relative z-10 my-0.5 py-2 px-2.5 rounded-xl bg-white/95 border border-[#111111] shadow-[0_2px_0_#111111] space-y-1.5">
                        {/* Row 1: Mini ticket pastel & reward on left, points balance on right */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`relative w-11 h-7 rounded p-0.5 border border-[#111111] flex items-center justify-center bg-gradient-to-r ${c.accentGrad} shadow-2xs overflow-hidden shrink-0`}
                            >
                              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border-r border-[#111111]" />
                              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border-l border-[#111111]" />
                              <div className="text-[6px] font-mono font-black text-[#111111]">|||||||</div>
                            </div>
                            <div className="min-w-0 text-start">
                              <span className="text-[7.5px] uppercase font-black tracking-widest text-[#E25B6C] block leading-none">
                                {tr(lang, 'Prochaine récompense', 'Next Reward', 'المكافأة القادمة')}
                              </span>
                              <div className="text-[9.5px] font-black text-[#111111] truncate leading-tight mt-0.5 flex items-center gap-1">
                                <Gift className="w-2.5 h-2.5 text-[#E25B6C] shrink-0" />
                                <span className="truncate">{c.reward}</span>
                              </div>
                              <div className="text-[7.5px] font-mono text-zinc-400 mt-0.5">ID: {c.barcode}</div>
                            </div>
                          </div>
                          <div className="text-end shrink-0 pl-1">
                            <div className="text-[7.5px] font-mono font-bold text-zinc-400 uppercase leading-none mb-0.5">
                              {tr(lang, 'Solde', 'Balance', 'الرصيد')}
                            </div>
                            <div className="text-base sm:text-lg font-black text-[#111111] tracking-tight leading-none">
                              {c.points} <span className="text-[9px] text-[#E25B6C]">PTS</span>
                            </div>
                          </div>
                        </div>

                        {/* Row 2: Visible Progress Bar inside Card (Matching client portal) */}
                        <div className="space-y-0.5 pt-0.5">
                          <div className="w-full h-2 rounded-full bg-zinc-200 border border-[#111111] p-0.5 overflow-hidden shadow-inner">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${c.progress}%`,
                                backgroundColor: c.frameBg === '#1A1A1A' ? '#111111' : c.frameBg,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[8px] font-mono font-bold text-zinc-600">
                            <span>
                              {c.progress}% {tr(lang, 'vers la prochaine récompense', 'to next reward', 'نحو المكافأة القادمة')}
                            </span>
                            <span className="font-black text-[#111111] px-1 rounded bg-black/5">
                              {c.progress}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pass Footer: QR Scan & Stars + Verified Status */}
                      <div className="relative z-10 flex items-center justify-between pt-0.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-md bg-[#111111] p-1 shadow-2xs shrink-0 flex items-center justify-center">
                            <QrCode className="w-full h-full text-white" />
                          </div>
                          <div className="text-start">
                            <div className="text-[8px] font-mono font-bold text-zinc-500 leading-none">
                              Scan 1.2s
                            </div>
                            <div className="text-[7px] font-mono text-zinc-400 font-bold mt-0.5">
                              {tr(lang, 'En caisse', 'At counter', 'في الكاشير')}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-0.5 text-[#EEC044]">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 fill-current" />
                            ))}
                          </div>
                          <span className="text-[7.5px] font-mono font-bold text-emerald-700 mt-0.5 flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {tr(lang, 'Pass vérifié', 'Pass verified', 'بطاقة مؤكدة')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================================
   HERO SECTION
   ========================================================================= */
export function HeroSection() {
  const { language } = useLanguage();
  const lang = language as Lang;
  const isAr = lang === 'ar';
  const isFr = lang === 'fr';

  const categories = [
    {
      icon: Coffee,
      label: tr(lang, 'Cafés & Torréfacteurs', 'Cafés & Roasteries', 'المقاهي ومحامص القهوة'),
      perk: tr(lang, '1 café offert après 8 scans', 'Free coffee after 8 scans', 'قهوة مجانية بعد 8 زيارات'),
      color: 'bg-amber-500/15 text-[#EEC044] border-amber-500/30',
    },
    {
      icon: Cake,
      label: tr(lang, 'Boulangeries & Pâtisseries', 'Bakeries & Pastries', 'المخابز والحلويات'),
      perk: tr(lang, 'Pâtisserie ou baguette offerte', 'Free pastry or baguette', 'قطعة حلوى مجانية'),
      color: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    },
    {
      icon: Scissors,
      label: tr(lang, 'Salons & Barbiers', 'Salons & Barbershops', 'صالونات الحلاقة والتجميل'),
      perk: tr(lang, '10e coupe ou soin VIP offert', '10th cut or VIP styling free', 'حلاقة عاشرة مجانية'),
      color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    },
    {
      icon: UtensilsCrossed,
      label: tr(lang, 'Restaurants & Fast-Foods', 'Restaurants & Diners', 'المطاعم والوجبات السريعة'),
      perk: tr(lang, 'Dessert ou boisson offerte', 'Free dessert or signature drink', 'تحلية أو مشروب مجاني'),
      color: 'bg-rose-500/15 text-[#E25B6C] border-rose-500/30',
    },
    {
      icon: ShoppingBag,
      label: tr(lang, 'Boutiques & Prêt-à-porter', 'Boutiques & Apparel', 'متاجر الملابس والأزياء'),
      perk: tr(lang, 'Bon de -15% & accès VIP', '15% voucher & VIP early access', 'قسيمة خصم 15%'),
      color: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    },
    {
      icon: Sparkles,
      label: tr(lang, 'Instituts de Beauté & Spas', 'Spas & Wellness Centers', 'مراكز العناية والسبا'),
      perk: tr(lang, 'Soin rituel offert aux habitués', 'Complimentary ritual treatment', 'جلسة عناية مجانية'),
      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    {
      icon: Store,
      label: tr(lang, 'Concept Stores & Épiceries', 'Concept Stores & Delis', 'المحلات المتخصصة والبقالة'),
      perk: tr(lang, 'Points doublés & cadeaux', 'Double points & loyalty gift', 'نقاط مضاعفة وهدايا'),
      color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    },
  ];

  const avatars = [
    { i: 'K', bg: 'bg-[#111111] text-[#FFE600]' },
    { i: 'S', bg: 'bg-[#E25B6C] text-white' },
    { i: 'Y', bg: 'bg-[#FAF8F5] text-[#111111]' },
    { i: 'A', bg: 'bg-[#FFE600] text-[#111111]' },
    { i: 'M', bg: 'bg-[#111111] text-white' },
  ];

  const stats = [
    { value: HERO_PROOF.scanSpeed, label: tr(lang, 'pour scanner', 'to scan', 'للمسح') },
    { value: HERO_PROOF.visitsLift, label: tr(lang, 'de visites', 'more visits', 'زيارات إضافية') },
    { value: '0', label: tr(lang, 'appli à installer', 'app to install', 'تطبيق للتثبيت') },
  ];

  return (
    <section className="relative w-full overflow-hidden" aria-labelledby="hero-title">
      {/* ---------- Background: grain, glow, faint ticket silhouettes ---------- */}
      <div className="hb-grain absolute inset-0 opacity-[0.18] mix-blend-multiply pointer-events-none" aria-hidden="true" />
      <div
        className="absolute top-1/2 end-[8%] -translate-y-1/2 w-[620px] h-[620px] rounded-full bg-[#FFF3B0]/70 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="hb-ticket absolute top-28 -end-10 w-56 h-28 rounded-3xl bg-white/20 rotate-[-18deg] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="hb-ticket absolute bottom-32 -start-12 w-48 h-24 rounded-3xl bg-white/20 rotate-[14deg] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-8 pt-24 sm:pt-28 lg:pt-28 pb-6 lg:pb-10 grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-6 items-center">
        {/* =================================================================
            LEFT — COPY & ACTIONS
            ================================================================= */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-start w-full">
          {/* Badge */}
          <NotchedTicket className="bg-[#FAF8F5] rounded-lg px-4 sm:px-5 py-1.5 mb-4 sm:mb-5 hb-pop-in">
            <span className="flex items-center gap-2 text-xs sm:text-[13px] font-black text-[#111111]">
              <span>🎟️</span>
              <span className="hidden sm:inline">
                {tr(lang, 'La fidélisation réinventée', 'Loyalty, reinvented', 'الولاء بشكل جديد')}
                <span className="text-[#E25B6C] mx-1.5">•</span>
              </span>
              <span>{tr(lang, '100% sans application', '100% app-free', '100% بدون تطبيق')}</span>
            </span>
          </NotchedTicket>

          {/* Headline */}
          <h1
            id="hero-title"
            className="text-[30px] sm:text-5xl lg:text-[54px] xl:text-[62px] font-black text-[#111111] tracking-tight mb-3 sm:mb-5 leading-[1.14]"
          >
            {isAr ? 'حوّل كل زيارة إلى' : isFr ? 'Transformez chaque visite en une' : 'Turn every single visit into a'}{' '}
            <span className="block sm:inline-block mt-2 sm:mt-1 -rotate-1 bg-[#111111] text-white px-4 sm:px-6 py-1 rounded-2xl shadow-[0_4px_0_#E25B6C,0_8px_0_#000] w-fit mx-auto sm:mx-0">
              {isAr ? 'سبب دائم للعودة.' : isFr ? 'raison de revenir.' : 'reason to return.'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg lg:text-xl font-semibold text-[#111111]/80 max-w-xl leading-relaxed mb-6 lg:mb-7 px-1 sm:px-0">
            {tr(
              lang,
              'Pass mobile sans appli, points crédités en 1 seconde et récompenses que vos clients adorent.',
              'App-free mobile pass, points credited in 1 second and rewards your customers love.',
              'بطاقة رقمية بدون تطبيق، نقاط تُضاف في ثانية واحدة، ومكافآت يحبها زبائنك.'
            )}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 w-full sm:w-auto max-w-sm sm:max-w-none mb-6 lg:mb-7">
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 sm:py-4 rounded-full bg-[#111111] hover:bg-[#E25B6C] text-[#FFE600] hover:text-white text-sm sm:text-base font-black border-2 border-[#111111] shadow-[0_5px_0_#000] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#000] transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#111111]/30"
            >
              <span>{tr(lang, 'Démarrer avec Hbibna', 'Start with Hbibna', 'ابدأ مع Hbibna')}</span>
              <ArrowRight className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              {/* Coral stamp */}
              <span className="absolute -top-3.5 right-4 sm:-end-3 rotate-6 sm:rotate-12 px-2.5 py-0.5 sm:py-1 rounded-md bg-[#E25B6C] text-white text-[10px] sm:text-[11px] leading-tight font-black border-2 border-[#111111] shadow-[0_2px_0_#111111] group-hover:rotate-6 transition-transform">
                {tr(lang, '14 jours offerts', '14 days free', '14 يومًا مجانًا')}
              </span>
            </Link>

            <a
              href="#demo-simulator"
              className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 rounded-full bg-[#FAF8F5] hover:bg-white text-[#111111] text-sm sm:text-base font-black border-[2.5px] border-[#111111] shadow-[0_4px_0_#111111] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#111111]/30"
            >
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#111111] flex items-center justify-center">
                <Play className="w-3 h-3 fill-[#FFE600] text-[#FFE600] rtl:rotate-180" />
              </span>
              <span>{tr(lang, 'Voir la démo', 'Watch the demo', 'شاهد العرض')}</span>
            </a>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-2 mb-5 text-sm font-bold text-[#111111]">
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {avatars.map((a) => (
                <span
                  key={a.i}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#111111] flex items-center justify-center text-xs font-black ${a.bg}`}
                  aria-hidden="true"
                >
                  {a.i}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-1 font-black text-xs sm:text-sm">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#111111]" /> {HERO_PROOF.rating}
            </span>
            <span className="h-4 w-px bg-[#111111]/25" aria-hidden="true" />
            <span className="text-xs sm:text-sm text-[#111111]/80">
              {tr(
                lang,
                `${HERO_PROOF.merchants} commerces à Alger, Oran, Constantine`,
                `${HERO_PROOF.merchants} businesses in Algiers, Oran, Constantine`,
                `${HERO_PROOF.merchants} متجر في الجزائر، وهران، قسنطينة`
              )}
            </span>
          </div>

          {/* Tear-off stat stubs (Unified Voucher Card - No Overflow on Mobile) */}
          <div className="w-full max-w-md bg-[#FAF8F5] rounded-2xl border-[2.5px] border-[#111111] shadow-[0_4px_0_#111111] grid grid-cols-3 p-1.5 sm:p-2 relative overflow-hidden">
            {stats.map((s, idx) => (
              <div
                key={s.label}
                className={`text-center py-1 sm:py-1.5 px-1 flex flex-col justify-center ${
                  idx < stats.length - 1 ? 'border-e-2 border-dashed border-[#111111]/25' : ''
                }`}
              >
                <div className="text-lg sm:text-2xl font-black text-[#111111] leading-tight">{s.value}</div>
                <div className="text-[10px] sm:text-[11px] font-bold text-[#111111]/70 leading-tight mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Mobile-Only 3D Stacked Cutout Pass (Le Pass Phygital Découpé) */}
          <MobileStackedCutoutPass lang={lang} />
        </div>

        {/* =================================================================
            RIGHT — 3D TICKET STACK VISUAL (DESKTOP)
            ================================================================= */}
        <div className="hidden lg:flex relative h-[440px] xl:h-[480px] items-center justify-center">
          <div className="hb-drop-in">
            <div className="hb-float scale-90 xl:scale-100">
              <TicketStack lang={lang} />
            </div>
          </div>

          <FloatingNote className="top-[6%] start-[2%] sm:start-[6%]" delay="0.6s">
            <span className="text-[#E25B6C]">+150 pts</span> · Sarah
          </FloatingNote>
          <FloatingNote className="hidden sm:block top-[46%] -end-2 lg:end-[-4%]" delay="0.9s">
            🎉 {tr(lang, 'Café offert débloqué', 'Free coffee unlocked', 'تم فتح قهوة مجانية')}
          </FloatingNote>
          <FloatingNote className="hidden sm:block bottom-[6%] end-[8%]" delay="1.2s">
            {tr(lang, 'Yassine est revenu après 12 jours', 'Yassine came back after 12 days', 'ياسين عاد بعد 12 يومًا')}
          </FloatingNote>
        </div>
      </div>

      {/* =================================================================
          BOTTOM — BUSINESS CATEGORIES MARQUEE
          ================================================================= */}
      <div className="relative bg-[#0F0F12] py-4 sm:py-5 overflow-hidden border-y-[2px] border-[#111111]" dir="ltr">
        {/* Soft edge lateral fades for a seamless, continuous flow */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-36 bg-gradient-to-r from-[#0F0F12] via-[#0F0F12]/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-36 bg-gradient-to-l from-[#0F0F12] via-[#0F0F12]/80 to-transparent z-10" />

        <div className="animate-marquee gap-3.5 sm:gap-4 pe-3.5 sm:pe-4 items-center">
          {[...categories, ...categories].map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="inline-flex items-center gap-3.5 bg-[#18181C] hover:bg-[#202026] border border-white/10 hover:border-[#EEC044]/60 rounded-2xl px-4 py-2.5 transition-all duration-200 shadow-sm cursor-default group"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${c.color} transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-start">
                  <span className="text-[13px] sm:text-sm font-black text-white group-hover:text-[#FFE600] transition-colors whitespace-nowrap leading-snug">
                    {c.label}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors whitespace-nowrap leading-tight">
                    {c.perk}
                  </span>
                </div>
                <div className="h-5 w-px bg-white/10 ms-1 shrink-0" aria-hidden="true" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
