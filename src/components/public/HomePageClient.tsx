'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/public/Navbar';
import { PublicFooter } from '@/components/public/Footer';
import { FaqSection } from '@/components/public/FaqSection';
import { PricingCards } from '@/components/public/PricingCards';
import { OfflineFeatureSection } from '@/components/public/OfflineFeatureSection';
import { FeatureCarousel } from '@/components/public/FeatureCarousel';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  ArrowRight,
  Play,
  Star,
  Zap,
  TrendingUp,
  Gift,
  QrCode,
  Wifi,
  Store,
  Clock,
  Sparkles,
  RefreshCw,
  Heart,
  Smartphone,
  PartyPopper,
  CheckCircle,
  Coffee,
  ShoppingBag,
  Scissors,
  UtensilsCrossed,
  Sparkle,
  Smile,
  Users,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { HeroSection } from '@/components/public/HeroSection';

export function HomePageClient() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  // 1. Loyalty Loop 5-stage interactive state
  const [activeLoopStage, setActiveLoopStage] = useState(0);

  // 2. How it works tabs
  const [activeHowToTab, setActiveHowToTab] = useState(0);

  // 3. Real-time Simulator interactive state
  const [demoPoints, setDemoPoints] = useState(1240);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [rewardUnlocked, setRewardUnlocked] = useState(false);
  const [simulatedFeed, setSimulatedFeed] = useState<
    Array<{ id: number; title: string; subtitle: string; time: string; highlight?: boolean }>
  >([]);

  // Simulation handler
  const handleSimulatePurchase = () => {
    const nextPoints = demoPoints + 150;
    const nextCount = purchaseCount + 1;
    setDemoPoints(nextPoints);
    setPurchaseCount(nextCount);
    setRewardUnlocked(true);

    const newEvent = {
      id: Date.now(),
      title: isAr
        ? 'سارة بن علي فتحت مكافأة: مشروب وحلوى مجانية!'
        : isFr
        ? 'Sarah J. a débloqué : Café & Pâtisserie offerts !'
        : 'Sarah J. unlocked: Free Specialty Coffee & Pastry!',
      subtitle: isAr
        ? 'تذكرة #182 • تم تطبيق الرصيد التلقائي'
        : isFr
        ? 'Ticket #182 • Crédit automatique appliqué'
        : 'Ticket #182 • POS Auto-credit applied',
      time: isAr ? 'الآن' : isFr ? 'À l’instant' : 'Just now',
      highlight: true,
    };

    setSimulatedFeed((prev) => [newEvent, ...prev]);
  };

  // Loop Stages Data for 3 languages
  const loopStages = [
    {
      badge: isAr
        ? 'المرحلة 1: وصول سلس وبدون عوائق'
        : isFr
        ? 'Étape 1 : Entrée fluide & sans friction'
        : 'Stage 1: Core Frictionless Entrance',
      title: isAr
        ? 'اللقاء السلس الذي يبدأ العلاقة الحقيقية.'
        : isFr
        ? 'La rencontre fluide qui initie la relation.'
        : 'The frictionless encounter that begins the relationship.',
      desc: isAr
        ? 'يمرر العميل هاتفه مرة واحدة عند الكاونتر. لا استمارات تسجيل طويلة، ولا تنزيل تطبيقات ثقيلة. تعرف فوري في أقل من 1.2 ثانية.'
        : isFr
        ? 'Les clients scannent leur pass en 1 seconde en caisse. Aucun formulaire fastidieux, aucune application à installer. Reconnaissance instantanée.'
        : 'Customers tap their phone once at checkout. No 12-question signup forms, no clunky native app downloads. Instant recognition in under 1.5 seconds.',
      stat1: '1.2 sec',
      stat1Label: isAr ? 'سرعة المسح عند الكاونتر' : isFr ? 'Vitesse moyenne de scan' : 'Average checkout scan speed',
      stat2: '94%',
      stat2Label: isAr ? 'معدل إتمام الانضمام' : isFr ? 'Taux d’adhésion instantané' : 'Opt-in completion rate',
      heading: isAr ? 'محفظة رقمية بلمسة واحدة' : isFr ? 'Portefeuille Digital Tap & Go' : 'Digital Wallet Tap & Go',
      caption: isAr
        ? 'توافق كامل مع بطاقات Apple و Google ومتصفحات الهواتف.'
        : isFr
        ? 'Compatibilité Apple & Google Wallet et navigateur mobile instantané.'
        : 'NFC & Dynamic QR compatibility with standard POS counters.',
    },
    {
      badge: isAr
        ? 'المرحلة 2: كسب فوري وشفاف'
        : isFr
        ? 'Étape 2 : Cumul transparent & immédiat'
        : 'Stage 2: Instant Transparent Earning',
      title: isAr
        ? 'تقدم متراكم وواضح مع كل عملية شراء.'
        : isFr
        ? 'Une progression claire visible sur chaque ticket.'
        : 'Compounding progress visible on every single ticket.',
      desc: isAr
        ? 'كل عملية شراء تودع نقاطاً فورية مباشرة في بطاقة العميل الرقمية مع شريط تقدم حي ومحفز للوصول للمستوى التالي.'
        : isFr
        ? 'Chaque montant dépensé crédite immédiatement des points sur le pass mobile du client, avec une jauge de progression en temps réel.'
        : 'Each dollar or Dinar spent deposits instant points directly into the customer’s live wallet pass with clear tier-progress bars.',
      stat1: '+150 pts',
      stat1Label: isAr ? 'متوسط النقاط لكل طلب' : isFr ? 'Points moyens par commande' : 'Average point yield per order',
      stat2: '100%',
      stat2Label: isAr ? 'تسجيل دقيق وتلقائي' : isFr ? 'Précision d’attribution en direct' : 'Transparent real-time accrual',
      heading: isAr ? 'رصيد ولاء متنامٍ' : isFr ? 'Capital Fidélité Évolutif' : 'Compounding Micro-Equity',
      caption: isAr
        ? 'احتساب تلقائي وفق قواعد برنامجك دون أي جهد إضافي على الكاشير.'
        : isFr
        ? 'Calculs automatiques configurés selon vos marges sans surcharge pour l’équipe.'
        : 'Automated calculations mapped to order totals without cashier burden.',
    },
    {
      badge: isAr
        ? 'المرحلة 3: مكافأة ملموسة ومرغوبة'
        : isFr
        ? 'Étape 3 : Gratification concrète & valorisante'
        : 'Stage 3: Tangible Gratification',
      title: isAr
        ? 'مكافآت تبني الحماس دون استنزاف أرباحك.'
        : isFr
        ? 'Des récompenses désirables qui protègent votre marge.'
        : 'Rewards that build excitement, not margin loss.',
      desc: isAr
        ? 'امتيازات مصممة بناءً على أذواق العملاء الحقيقية. فتح المكافأة يمنح العميل شعوراً بالإنجاز ورغبة فورية في استبدالها والزيارة مجدداً.'
        : isFr
        ? 'Des récompenses attrayantes qui motivent le retour en boutique. L’obtention du palier déclenche une notification valorisante.'
        : 'Curated perks tailored to the customer’s actual purchasing affinities. Unlocking a reward triggers celebration and an urge to redeem.',
      stat1: '81%',
      stat1Label: isAr ? 'معدل استبدال المكافآت' : isFr ? 'Fréquence d’utilisation des gains' : 'Perk redemption frequency',
      stat2: '+32%',
      stat2Label: isAr ? 'زيادة في الإنفاق الإضافي' : isFr ? 'Panier additionnel moyen' : 'Incremental upsell on visit',
      heading: isAr ? 'مكافآت عالية القيمة التقديرية' : isFr ? 'Récompenses à Forte Valeur Perçue' : 'High-Perceived Value Rewards',
      caption: isAr
        ? 'مشروبات أو خدمات مجانية تحفز الزيارة الموالية في المتجر.'
        : isFr
        ? 'Produits signature offerts qui motivent la prochaine visite physique.'
        : 'Free specialty item unlocks that motivate the subsequent physical visit.',
    },
    {
      badge: isAr
        ? 'المرحلة 4: عودة تلقائية مدروسة'
        : isFr
        ? 'Étape 4 : Retour naturel & automatisé'
        : 'Stage 4: Automated Gravitational Return',
      title: isAr
        ? 'تذكيرات ذكية في التوقيت المناسب تماماً.'
        : isFr
        ? 'Des relances ciblées au moment précis où le client hésite.'
        : 'Timely contextual nudges that pull guests back.',
      desc: isAr
        ? 'عندما يقترب موعد الزيارة المعتادة للعميل، يتلقى إشعاراً ذكياً بتوفر مكافأة خاصة تحثه على العودة دون إزعاج أو رسائل سبام.'
        : isFr
        ? 'Hbibna identifie le cycle naturel de visite de chaque client et lui propose un rappel contextuel pour revenir au bon moment.'
        : 'When a customer’s typical return interval approaches, Hbibna gently pings their lock screen pass with an expiring perk bonus.',
      stat1: '3.2x',
      stat1Label: isAr ? 'نسبة العودة مقارنة بغير المشتركين' : isFr ? 'Taux de retour comparé' : 'Return rate vs unprompted customers',
      stat2: '0 Spam',
      stat2Label: isAr ? 'صفر إزعاج أو رسائل تسويقية متكررة' : isFr ? 'Zéro SMS intrusif ni newsletter' : 'Zero SMS nuisance or email noise',
      heading: isAr ? 'محرك التردد التنبؤي' : isFr ? 'Moteur de Récidive Intelligent' : 'Predictive Recurrence Nudge',
      caption: isAr
        ? 'تنبيهات تلقائية مدفوعة بأنماط تردد العملاء السلوكية.'
        : isFr
        ? 'Alertes douces déclenchées par les cycles d’achat réels.'
        : 'Smart alerts triggered by custom individual frequency curves.',
    },
    {
      badge: isAr
        ? 'المرحلة 5: ولاء دائم وقيمة مضاعفة'
        : isFr
        ? 'Étape 5 : Fidélité durable & valeur décuplée'
        : 'Stage 5: Infinite Lifetime Devotion',
      title: isAr
        ? 'الحلقة الدائمة التي تضاعف القيمة الإجمالية للعميل.'
        : isFr
        ? 'La boucle vertueuse d’une relation client pérenne.'
        : 'The perpetual loop of compounded customer value.',
      desc: isAr
        ? 'كل دورة تكتمل تغذي الدورة التالية. ترتفع القيمة الإجمالية للعميل بينما تنخفض تكلفة اكتساب الزبائن الجدد نحو الصفر.'
        : isFr
        ? 'Chaque cycle renforce l’attachement à votre marque. Le chiffre d’affaires par client progresse sans dépense publicitaire supplémentaire.'
        : 'One completed loop fuels the next. Customer lifetime value compounds while marketing acquisition costs plummet toward zero.',
      stat1: '+44%',
      stat1Label: isAr ? 'ارتفاع القيمة السنوية للعميل' : isFr ? 'Hausse de valeur client annuelle' : 'Average 12-month LTV uplift',
      stat2: '+38%',
      stat2Label: isAr ? 'زيادة في تكرار الزيارات الأسبوعية' : isFr ? 'Hausse des passages hebdomadaires' : 'Increase in weekly visits',
      heading: isAr ? 'رأس مال ولاء متين' : isFr ? 'Fidélité de Marque Durable' : 'Compounded Brand Equity',
      caption: isAr
        ? 'تحويل الزبائن العابرين إلى سفراء أوفياء لعلامتك التجارية.'
        : isFr
        ? 'Transformer les visiteurs d’un jour en habitués fidèles pour des années.'
        : 'Turning casual walk-ins into proud brand advocates for years.',
    },
  ];

  const howToTabs = [
    {
      title: isAr ? 'مسح سريع 1-Tap' : isFr ? 'Scan 1-Tap' : '1-Tap Scan',
      tag: isAr ? 'الخطوة الأولى' : isFr ? 'Étape 1 : Sans Friction' : 'Step 1: Seamless Tap',
      headline: isAr
        ? 'سجّل عميلك في أقل من ثانية واحدة'
        : isFr
        ? 'Enregistrez votre client en 1 seconde chrono'
        : 'Enroll customers in 1 second flat',
      desc: isAr
        ? 'لا استمارات ورقية، ولا تطبيقات تتطلب تحميلاً ثقيلاً. يمسح العميل رمز QR أو يقرّب هاتفه، فيفتح جواز الولاء فوراً على Apple أو Google Wallet.'
        : isFr
        ? 'Aucun formulaire papier, aucune application à télécharger. Le client présente son pass sur Apple ou Google Wallet, et le tour est joué.'
        : 'Zero paper forms, zero clunky app installs. Customers scan or tap their digital pass directly into Apple or Google Wallet.',
      points: [
        isAr ? '100% بدون تطبيق' : isFr ? '100% sans application' : '100% no app needed',
        isAr ? 'سرعة قياسية: 1.2 ثانية' : isFr ? '1.2 seconde en caisse' : '1.2 seconds at counter',
        isAr ? 'متوافق مع كل الهواتف' : isFr ? 'Compatible tous smartphones' : 'Works with any smartphone',
      ],
    },
    {
      title: isAr ? 'نقاط فورية' : isFr ? 'Points Automatiques' : 'Auto Points',
      tag: isAr ? 'الخطوة الثانية' : isFr ? 'Étape 2 : Crédit Immédiat' : 'Step 2: Instant Credit',
      headline: isAr
        ? 'كل عملية شراء تودع نقاطاً في الحين'
        : isFr
        ? 'Chaque passage crédite des points instantanés'
        : 'Every purchase credits points in real time',
      desc: isAr
        ? 'حدّد معادلتك الخاصة (مثل نقطة لكل 100 د.ج). يتلقى العميل إشعاراً مرئياً ومحفزاً يوضح تقدمه نحو المكافأة القادمة.'
        : isFr
        ? 'Fixez vos règles (ex: 1 point par 100 DA). Le client voit sa jauge grimper en direct et prend plaisir à accumuler.'
        : 'Set your margin rules (e.g. 1 pt per 100 DA). Customers see their live progress bar surge toward the next unlock.',
      points: [
        isAr ? 'تزامن فوري سحابي' : isFr ? 'Synchronisation Cloud live' : 'Real-time cloud sync',
        isAr ? 'شريط تقدم تحفيزي' : isFr ? 'Jauge de progression engageante' : 'Engaging progress bar',
        isAr ? 'صفر تعقيد للكاشير' : isFr ? 'Zéro surcharge pour le staff' : 'Zero cashier friction',
      ],
    },
    {
      title: isAr ? 'مكافآت محفزة' : isFr ? 'Récompenses Clés' : 'High-Value Perks',
      tag: isAr ? 'الخطوة الثالثة' : isFr ? 'Étape 3 : Gratification' : 'Step 3: Gratification',
      headline: isAr
        ? 'مكافآت ملموسة تضاعف رغبة العودة'
        : isFr
        ? 'Des récompenses désirables qui font revenir'
        : 'Desirable rewards that trigger return visits',
      desc: isAr
        ? 'قهوة مجانية، حلوى طازجة، أو رصيد تسوق. أنت تختار ما يسعد زبائنك ويحافظ على هوامش ربحك دون الدخول في حرب أسعار.'
        : isFr
        ? 'Un café de spécialité, une pâtisserie, ou un bon d’achat. Choisissez ce qui motive vos habitués sans détruire vos marges.'
        : 'Specialty coffee, artisanal pastries, or gift credits. Delight regulars without resorting to margin-killing discounts.',
      points: [
        isAr ? 'حماية هوامش الربح' : isFr ? 'Marge commerciale protégée' : 'Protected margins',
        isAr ? 'رفع قيمة سلة الشراء' : isFr ? '+32% sur le panier additionnel' : '+32% upsell basket',
        isAr ? 'بهجة فورية عند الكاونتر' : isFr ? 'Satisfaction immédiate en caisse' : 'Instant counter delight',
      ],
    },
    {
      title: isAr ? 'ذكاء الاستبقاء' : isFr ? 'Récidive & Analytics' : 'Retention Engine',
      tag: isAr ? 'الخطوة الرابعة' : isFr ? 'Étape 4 : Rétention' : 'Step 4: Smart Loyalty',
      headline: isAr
        ? 'تذكيرات ذكية تعيد العملاء تلقائياً'
        : isFr
        ? 'Des alertes douces pour faire revenir vos habitués'
        : 'Automated nudges that bring regulars back',
      desc: isAr
        ? 'Hbibna تراقب دورات تردد العملاء. إذا انقطع زبون عن زيارته المعتادة، يتلقى إشعاراً لطيفاً بمكافأة حصرية تجذبه للعودة.'
        : isFr
        ? 'Hbibna détecte les cycles d’inactivité et envoie des rappels bienveillants au moment opportun, sans aucun spam.'
        : 'Hbibna monitors frequency curves. If a guest lapses, gentle native pass reminders draw them back without spam.',
      points: [
        isAr ? 'تنبؤ ذكي بفترات الغياب' : isFr ? 'Détection prédictive de churn' : 'Predictive churn alerts',
        isAr ? 'صفر سبام SMS أو إزعاج' : isFr ? 'Zéro spam ni SMS intrusif' : 'Zero spam or noisy SMS',
        isAr ? '+38% تردد أسبوعي' : isFr ? '+38% de retours réguliers' : '+38% weekly visit bump',
      ],
    },
  ];

  const currentStage = loopStages[activeLoopStage];
  const currentHowTo = howToTabs[activeHowToTab];

  return (
    <div className="min-h-screen flex flex-col bg-[#EEC044] text-[#111111] selection:bg-black selection:text-[#FFE600] relative overflow-x-hidden font-rounded">
      {/* Friendly Black/White Navbar */}
      <PublicNavbar variant="friendly" />

      {/* AMBIENT SUNNY & GLOW PATTERNS */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-gradient-to-b from-[#FFF577]/80 via-[#FACC15]/25 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[1600px] -left-64 w-[500px] h-[500px] bg-[#FACC15]/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[3400px] -right-64 w-[600px] h-[600px] bg-[#FFE033]/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] pointer-events-none -z-10" />

      {/* =========================================================================
          SECTION 1: HERO — 3D TICKET STACK (see HeroSection.tsx)
         ========================================================================= */}
      <HeroSection />

      {/* =========================================================================
          SECTION 2: "FINI..." (PAIN-POINTS TO GAIN - ALTERNATING BLACK & WHITE CARDS)
         ========================================================================= */}
      <section className="w-full bg-[#FFFDF0] py-20 lg:py-28 border-y-2 border-black/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase font-black tracking-widest text-white bg-black px-4 py-1.5 rounded-full inline-block mb-3 shadow-md">
            {isAr ? 'ودّع المتاعب القديمة' : isFr ? 'La fin des frictions' : 'No more friction'}
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight mb-12">
            {isAr ? (
              <>
                انتهى زمن...{' '}
                <span className="bg-black text-[#FFE600] px-3 py-1 rounded-xl inline-block -rotate-1">
                  البطاقات المفقودة والإحباط.
                </span>
              </>
            ) : isFr ? (
              <>
                Fini...{' '}
                <span className="bg-black text-white px-3 py-1 rounded-xl inline-block -rotate-1">
                  les cartes en carton perdues
                </span>{' '}
                et les clients oubliés.
              </>
            ) : (
              <>
                Gone are...{' '}
                <span className="bg-black text-white px-3 py-1 rounded-xl inline-block -rotate-1">
                  lost paper punchcards
                </span>{' '}
                and forgotten regulars.
              </>
            )}
          </h2>

          {/* Friction Cards Grid (Alternating: White / Black / White!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14 text-start">
            {/* Card 1: White with Black text */}
            <div className="p-7 rounded-3xl bg-white text-black border-2 border-black shadow-[0_6px_0_#000] hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-2xl bg-black text-[#FFE600] flex items-center justify-center font-black text-lg mb-4">
                ✕
              </div>
              <h3 className="text-lg font-black text-black mb-2">
                {isAr ? 'البطاقات الورقية الضائعة' : isFr ? 'Les cartes papier perdues' : 'Lost paper punchcards'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                {isAr
                  ? 'الزبون ينساها في المنزل، ولا يعرف رصيده، وتتلف في المحفظة دون أثر.'
                  : isFr
                  ? 'Oubliées au fond du portefeuille, lavées par erreur, aucun moyen de savoir où en sont les points.'
                  : 'Lost at home, washed in the laundry, zero live visibility for the customer.'}
              </p>
            </div>

            {/* Card 2: Deep Black with Crisp White text (Alternating!) */}
            <div className="p-7 rounded-3xl bg-black text-white border-2 border-black shadow-[0_6px_0_#000] hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-2xl bg-[#FFE600] text-black flex items-center justify-center font-black text-lg mb-4">
                ✕
              </div>
              <h3 className="text-lg font-black text-white mb-2">
                {isAr ? 'استمارات التسجيل المعقدة' : isFr ? 'Les formulaires interminables' : '10-question signup forms'}
              </h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                {isAr
                  ? 'طابور الانتظار يتعطل بطلب الاسم واللقب والبريد. 73% يرفضون التسجيل.'
                  : isFr
                  ? 'Bloquer la file en demandant nom, prénom et email. 73% des clients abandonnent sur place.'
                  : 'Slowing down counter lines asking for names and emails. 73% of walk-ins refuse.'}
              </p>
            </div>

            {/* Card 3: White with Black text */}
            <div className="p-7 rounded-3xl bg-white text-black border-2 border-black shadow-[0_6px_0_#000] hover:-translate-y-1 transition-transform">
              <div className="w-10 h-10 rounded-2xl bg-black text-[#FFE600] flex items-center justify-center font-black text-lg mb-4">
                ✕
              </div>
              <h3 className="text-lg font-black text-black mb-2">
                {isAr ? 'رسائل الـ SMS المزعجة والمكلفة' : isFr ? 'Le spam SMS intrusif' : 'Annoying & costly SMS blasts'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
                {isAr
                  ? 'رسائل عشوائية تُزعج الزبون وتكلف المتجر مبالغ باهظة دون عائد مضمون.'
                  : isFr
                  ? 'Campagnes agressives qui lassent les clients et coûtent cher au commerçant sans retour mesuré.'
                  : 'Aggressive blast texts that irritate customers and cost money without verified returns.'}
              </p>
            </div>
          </div>

          {/* Central Statement Gauge Box */}
          <div className="max-w-2xl mx-auto p-8 rounded-[2.5rem] bg-white border-2 border-black shadow-[0_8px_0_#000] text-center relative overflow-hidden">
            <div className="w-14 h-14 rounded-full bg-black text-[#FFE600] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <TrendingUp className="w-7 h-7" />
            </div>

            <h3 className="text-xl sm:text-3xl font-black text-black tracking-tight mb-3">
              {isAr ? (
                <>
                  اليوم، مع Hbibna :{' '}
                  <span className="bg-black text-[#FFE600] px-3 py-1 rounded-xl">
                    اكسب راحة البال وزد زياراتك حتى +44%
                  </span>
                </>
              ) : isFr ? (
                <>
                  Désormais, gagnez en fidélité et{' '}
                  <span className="bg-black text-white px-3 py-0.5 rounded-xl">
                    augmentez vos passages de +44%
                  </span>{' '}
                  grâce à Hbibna.
                </>
              ) : (
                <>
                  Now, gain total retention and{' '}
                  <span className="bg-black text-white px-3 py-0.5 rounded-xl">boost repeat visits by +44%</span> with Hbibna.
                </>
              )}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 font-semibold max-w-lg mx-auto">
              {isAr
                ? 'منظومة آلية تعيد العميل إلى كاونترك بشكل طبيعي وسلس دون أي مجهود إضافي.'
                : isFr
                ? 'Une boucle fluide qui valorise chaque achat et déclenche le réflexe naturel de revenir.'
                : 'An organic loop that celebrates every order and builds enduring store loyalty.'}
            </p>
          </div>

          {/* Interactive Core Platform Features Carousel */}
          <div className="mt-14 max-w-xl mx-auto" id="fonctionnalites">
            <FeatureCarousel />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: HOW IT WORKS STEP TABS (ALTERNATING BLACK & WHITE)
         ========================================================================= */}
      <section className="w-full bg-[#FEF08A] py-20 lg:py-28 border-b-2 border-black/10" id="comment-ca-marche">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-black tracking-widest text-white bg-black px-4 py-1.5 rounded-full inline-block mb-3 shadow-md">
              {isAr ? 'طريقة العمل' : isFr ? 'Comment ça marche ?' : 'How it works'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
              {isAr
                ? 'رحلة بسيطة للعميل ونتائج استثنائية لمتجرك'
                : isFr
                ? 'Découvrez comment Hbibna accompagne chaque étape'
                : 'Simple for customers, transformative for your business'}
            </h2>
          </div>

          {/* Segmented Pill Tabs */}
          <div className="flex justify-center mb-10 sm:mb-12">
            <div className="inline-flex flex-wrap items-center justify-center p-1.5 rounded-2xl sm:rounded-full bg-white border-2 border-black gap-1 shadow-[0_4px_0_#000]">
              {howToTabs.map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveHowToTab(idx)}
                  className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    activeHowToTab === idx
                      ? 'bg-black text-white shadow-md'
                      : 'text-zinc-600 hover:text-black hover:bg-black/5'
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Panel (Two Column: Device Mockup Black + Info Card White) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Phone Card Visual (Black Container with White Accents) */}
            <div className="lg:col-span-6 p-8 rounded-[2.5rem] bg-black text-white border-2 border-black shadow-2xl relative flex items-center justify-center min-h-[420px]">
              {/* Floating Benefit Badges */}
              <div className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full bg-white text-black font-black border-2 border-black shadow-md text-[11px] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-black" />
                <span>{currentHowTo.points[0]}</span>
              </div>
              <div className="absolute bottom-4 right-4 z-10 px-3.5 py-1.5 rounded-full bg-[#FFE600] text-black font-black border-2 border-black shadow-md text-[11px] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-black" />
                <span>{currentHowTo.points[1]}</span>
              </div>

              {/* Core Visual */}
              <div className="w-60 rounded-3xl bg-[#18181B] p-5 border border-white/20 shadow-xl text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#FFE600] text-black flex items-center justify-center mx-auto mb-3 shadow-md font-black text-lg">
                  {activeHowToTab + 1}
                </div>
                <div className="text-sm font-black text-white mb-1">{currentHowTo.title}</div>
                <div className="text-xs text-white/60 mb-4 font-medium">
                  {isAr ? 'نظام Hbibna الحي' : isFr ? 'Système Hbibna Live Engine' : 'Hbibna Live Engine System'}
                </div>
                <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-xs font-mono text-[#FFE600] font-black">
                  {activeHowToTab === 0 && (isAr ? 'مسح NFC و QR • 1.2 ثانية' : isFr ? 'Scan NFC & QR • 1.2s' : 'NFC & QR Tap • 1.2s')}
                  {activeHowToTab === 1 && (isAr ? '+150 نقطة مضافة' : isFr ? '+150 Points crédités' : '+150 Points Credited')}
                  {activeHowToTab === 2 && (isAr ? 'مكافأة مفتوحة عند الكاونتر' : isFr ? 'Cadeau débloqué en caisse' : 'Reward unlocked at checkout')}
                  {activeHowToTab === 3 && (isAr ? 'تنبيه استبقاء الزبائن' : isFr ? 'Alerte inactivité évitée' : 'Retention nudge triggered')}
                </div>
              </div>
            </div>

            {/* Info Card (White Background with Black Text) */}
            <div className="lg:col-span-6 p-8 sm:p-10 rounded-[2.5rem] bg-white text-black border-2 border-black shadow-[0_8px_0_#000] text-start flex flex-col justify-between">
              <div>
                <span className="px-3.5 py-1 rounded-full bg-black text-[#FFE600] text-xs font-black uppercase tracking-wider mb-4 inline-block">
                  {currentHowTo.tag}
                </span>

                <h3 className="text-2xl sm:text-3xl font-black text-black tracking-tight mb-4">
                  {currentHowTo.headline}
                </h3>

                <p className="text-sm sm:text-base text-zinc-700 leading-relaxed mb-6 font-medium">
                  {currentHowTo.desc}
                </p>

                <div className="space-y-3 mb-8">
                  {currentHowTo.points.map((pt, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-black">
                      <div className="w-5 h-5 rounded-full bg-black text-[#FFE600] flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-full bg-black hover:bg-zinc-800 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <span>{isAr ? 'ابدأ تفعيل برنامجك مجاناً' : isFr ? 'Tester gratuitement' : 'Start free trial'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURE SECTION: OFFLINE MODE (FONCTIONNE MÊME SANS INTERNET)
         ========================================================================= */}
      <OfflineFeatureSection />

      {/* =========================================================================
          SECTION 4: THE 5-STAGE LOYALTY LOOP
         ========================================================================= */}
      <section className="w-full bg-[#FFFDF0] py-20 lg:py-28 border-b-2 border-black/10" id="loyalty-loop">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-14">
            <div className="max-w-xl text-start">
              <span className="px-4 py-1.5 rounded-full bg-black text-white text-xs font-black uppercase tracking-wider mb-3 inline-block shadow-md">
                {isAr ? 'هندسة الاستبقاء' : isFr ? 'L’Architecture de Rétention' : 'Architecture of Retention'}
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
                {isAr ? 'الزيارة الواحدة تصبح عادة.' : isFr ? 'Une seule visite devient une habitude.' : 'One visit becomes a habit.'}
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 font-semibold mt-2">
                {isAr
                  ? 'اضغط على مراحل الحلقة لاكتشاف كيف يتشكل تردد الزبائن الطبيعي دون الحاجة لخصومات عشوائية تستنزف أرباحك.'
                  : isFr
                  ? 'Cliquez sur chaque étape du cycle Hbibna pour voir comment la fidélité se construit sans remises destructrices.'
                  : 'Click through each phase of the continuous Hbibna loop to discover how natural frequency forms without aggressive discounting.'}
              </p>
            </div>

            {/* Interactive Loop Stage Selectors */}
            <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl sm:rounded-full bg-white border-2 border-black shadow-[0_4px_0_#000]">
              {loopStages.map((stage, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveLoopStage(idx)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    activeLoopStage === idx
                      ? 'bg-black text-white shadow-md'
                      : 'text-zinc-600 hover:text-black hover:bg-black/5'
                  }`}
                >
                  {idx + 1}.{' '}
                  {idx === 0
                    ? isAr ? 'زيارة' : isFr ? 'Visite' : 'Visit'
                    : idx === 1
                    ? isAr ? 'كسب' : isFr ? 'Cumul' : 'Earn'
                    : idx === 2
                    ? isAr ? 'مكافأة' : isFr ? 'Cadeau' : 'Reward'
                    : idx === 3
                    ? isAr ? 'عودة' : isFr ? 'Retour' : 'Return'
                    : isAr ? 'تكرار' : isFr ? 'Fidélité' : 'Repeat'}
                </button>
              ))}
            </div>
          </div>

          {/* Stage Detail Display Card (White Box with Black/Yellow Visual) */}
          <div className="w-full bg-white text-black rounded-[2.5rem] p-8 sm:p-12 shadow-[0_8px_0_#000] border-2 border-black relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="w-full lg:w-1/2 flex flex-col items-start z-10 text-start">
              <div className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3 bg-black text-[#FFE600]">
                {currentStage.badge}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-black mb-3">
                {currentStage.title}
              </h3>
              <p className="text-sm sm:text-base text-zinc-600 mb-8 leading-relaxed font-medium">
                {currentStage.desc}
              </p>
              <div className="grid grid-cols-2 gap-6 w-full pt-4 border-t border-black/10">
                <div>
                  <div className="text-3xl font-black text-black">{currentStage.stat1}</div>
                  <div className="text-xs text-zinc-500 font-bold mt-1">{currentStage.stat1Label}</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-black">{currentStage.stat2}</div>
                  <div className="text-xs text-zinc-500 font-bold mt-1">{currentStage.stat2Label}</div>
                </div>
              </div>
            </div>

            {/* Stage Graphic Visualizer (Black Card with Crisp White Text) */}
            <div className="w-full lg:w-1/2 h-[300px] sm:h-[340px] bg-black text-white rounded-3xl p-8 flex items-center justify-center relative shadow-2xl border-2 border-black">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg bg-[#FFE600] text-black">
                  <Sparkles className="w-10 h-10" />
                </div>
                <div className="text-lg font-black text-white">{currentStage.heading}</div>
                <div className="text-xs text-white/70 max-w-xs mt-1.5 font-medium">{currentStage.caption}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: LIVE INTERACTIVE PRODUCT SIMULATOR (HIGH CONTRAST DUAL PANEL)
         ========================================================================= */}
      <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28" id="demo-simulator">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="px-4 py-1.5 rounded-full bg-black text-white text-xs font-black uppercase tracking-wider mb-3 inline-block shadow-md">
            {isAr ? 'محاكي تفاعلي حي' : isFr ? 'Simulateur Interactif en Direct' : 'Real-Time Simulator'}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
            {isAr
              ? 'جرّب المعاملة من منظور العميل والمتجر معاً'
              : isFr
              ? 'Vivez l’expérience des deux côtés : Client & Commerçant'
              : 'Experience both sides of the transaction'}
          </h2>
          <p className="text-base text-black/80 font-bold mt-2">
            {isAr
              ? 'اختبر كيف ترتبط كل عملية شراء فورياً ببهجة العميل ورضا المتجر ولوحة الإحصاءات.'
              : isFr
              ? 'Découvrez comment un achat unique se synchronise immédiatement entre le mobile du client et le tableau de bord commerçant.'
              : 'Test how a single customer purchase instantly connects to customer delight and merchant analytics.'}
          </p>
        </div>

        {/* Simulator Grid (Left White with Black Text / Right Deep Black with White Text!) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Customer Mobile View (Left 6 Cols - White Card with Black Text) */}
          <div className="lg:col-span-6 bg-white text-black rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_0_#000] border-2 border-black flex flex-col justify-between text-start">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-black/10 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-black">
                    {isAr ? 'تجربة العميل على الهاتف' : isFr ? 'Vue Mobile Client' : 'Customer Experience Mobile View'}
                  </span>
                </div>
                <span className="text-xs text-black font-black bg-[#FFE600] px-2.5 py-0.5 rounded-full">
                  {isAr ? 'جلسة مباشرة' : isFr ? 'Session Live' : 'Live Session'}
                </span>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs text-zinc-500 font-bold block">
                    {isAr ? 'مرحباً بعودتك،' : isFr ? 'Bienvenue,' : 'Welcome back,'}
                  </span>
                  <h4 className="text-xl font-black text-black">
                    {isAr ? 'سارة بن علي' : 'Sarah Benali'}
                  </h4>
                </div>
                <span className="px-3 py-1 rounded-full bg-black text-[#FFE600] text-xs font-black">
                  {isAr ? 'عضو ذهبي' : isFr ? 'Membre Gold' : 'Gold Member'}
                </span>
              </div>

              {/* Points Display Card */}
              <div className="p-6 rounded-2xl bg-zinc-50 border-2 border-black/10 mb-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-600">
                    {isAr ? 'رصيد النقاط' : isFr ? 'Solde de Points' : 'Points Balance'}
                  </span>
                  <span className="text-xs text-black font-black">
                    {isAr ? '+10 نقاط لكل 100 د.ج' : isFr ? '+10 pts par 100 DA' : '+10 pts per 100 DA spent'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl sm:text-5xl font-black text-black tracking-tight">
                    {demoPoints.toLocaleString()}
                  </span>
                  <span className="text-lg font-black text-black">
                    {isAr ? 'نقطة' : 'PTS'}
                  </span>
                </div>

                {/* Dynamic Progress Track */}
                <div className="w-full">
                  <div className="flex justify-between text-xs text-zinc-600 mb-2 font-bold">
                    <span>
                      {rewardUnlocked
                        ? isAr ? 'تم الوصول للهدف!' : isFr ? 'Palier atteint !' : 'Milestone Achieved!'
                        : isAr ? '260 نقطة حتى قهوة وحلوى مجانية' : isFr ? '260 pts pour un café offert' : '260 points until Free Specialty Coffee'}
                    </span>
                    <span className="font-black text-black">{rewardUnlocked ? '100%' : '82%'}</span>
                  </div>
                  <div className="w-full h-3.5 rounded-full bg-zinc-200 overflow-hidden p-0.5 border border-black/10">
                    <div
                      className="h-full rounded-full bg-black transition-all duration-700 ease-out"
                      style={{ width: rewardUnlocked ? '100%' : '82%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Celebratory Reward Unlock Banner */}
              {rewardUnlocked && (
                <div className="p-4 rounded-2xl bg-[#FFE600] border-2 border-black mb-6 animate-fade-in shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-black text-[#FFE600] flex items-center justify-center shrink-0 shadow-xs animate-bounce">
                      <PartyPopper className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="text-sm font-black text-black">
                        {isAr ? 'تم فتح المكافأة بنجاح!' : isFr ? 'Récompense Débloquée !' : 'Reward Unlocked!'}
                      </div>
                      <div className="text-xs text-black/80 font-bold">
                        {isAr
                          ? 'قهوة فاخرة وحلوى طازجة جاهزة للاستبدال على بطاقتك.'
                          : isFr
                          ? 'Café & Pâtisserie ajoutés à votre pass fidélité.'
                          : 'Free Artisanal Pour-Over & Pastry added to your pass.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Simulation Trigger Button */}
            <div className="pt-4 border-t border-black/10">
              <button
                onClick={handleSimulatePurchase}
                className="group w-full py-4 rounded-full bg-black hover:bg-zinc-800 active:scale-[0.98] text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#FFE600]" />
                <span className="btn-roll-text">
                  <span>
                    {isAr
                      ? '+ محاكاة عملية شراء عند الكاونتر (+2,500 د.ج)'
                      : isFr
                      ? '+ Simuler un Achat en Caisse (+2 500 DA)'
                      : '+ Simulate In-Store Purchase (+2,500 DA)'}
                  </span>
                </span>
              </button>
              <p className="text-xs text-center text-zinc-500 font-bold mt-2">
                {isAr
                  ? 'اضغط لمشاهدة التزامن الفوري في الرصيد وفتح المكافأة.'
                  : isFr
                  ? 'Cliquez pour constater la synchronisation immédiate et le déblocage du cadeau.'
                  : 'Click to see real-time balance sync and automatic reward unlocking.'}
              </p>
            </div>
          </div>

          {/* Merchant Tablet / Terminal Feed (Right 6 Cols - Deep Black with White Text) */}
          <div className="lg:col-span-6 bg-[#0F0F12] text-white rounded-[2.5rem] p-6 sm:p-8 shadow-[0_8px_0_#000] border-2 border-black flex flex-col justify-between text-start">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600]" />
                  <span className="text-xs font-black uppercase tracking-wider text-white/80">
                    {isAr ? 'شاشة الكاشير والنشاط السحابي' : isFr ? 'Terminal Caissier & Flux Cloud' : 'Merchant Terminal & Cloud Feed'}
                  </span>
                </div>
                <span className="text-xs text-[#FFE600] font-black">● {isAr ? 'متصل' : isFr ? 'Connecté' : 'Connected'}</span>
              </div>

              {/* Feed Items Container */}
              <div className="space-y-3">
                {simulatedFeed.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white/10 border border-white/20 shadow-xs flex items-center justify-between animate-fade-in"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FFE600] text-black flex items-center justify-center font-black text-xs shrink-0">
                        <PartyPopper className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#FFE600]">{item.title}</div>
                        <div className="text-[11px] text-white/70 font-medium">{item.subtitle}</div>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#FFE600] font-black shrink-0">{item.time}</span>
                  </div>
                ))}

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 text-[#FFE600] flex items-center justify-center font-black text-xs shrink-0">
                      SB
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">
                        {isAr ? 'سارة بن علي سجّلت الحضور' : isFr ? 'Sarah B. s’est enregistrée' : 'Sarah B. checked in'}
                      </div>
                      <div className="text-[11px] text-white/60">
                        {isAr ? 'مسح الكاونتر • فرع وسط المدينة' : isFr ? 'Scan en caisse • Roastery Centre' : 'Counter Scan • Roastery Main'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-white/60 shrink-0 font-medium">
                    {isAr ? 'منذ دقيقة' : isFr ? 'Il y a 1 min' : '1m ago'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 text-[#FFE600] flex items-center justify-center font-black text-xs shrink-0">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">
                        {isAr ? 'ربط تلقائي بالنقاط' : isFr ? 'Synchronisation Automatique' : 'Automatic Points Pairing'}
                      </div>
                      <div className="text-[11px] text-white/60">
                        {isAr ? 'تحديث فوري للرصيد والمستويات' : isFr ? 'Mise à jour immédiate du solde' : 'Instant balance & ledger update'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#FFE600] font-black shrink-0">
                    {isAr ? 'نشط' : isFr ? 'Actif' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/15">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[11px] text-white/60 font-medium">
                    {isAr ? 'عودات اليوم' : isFr ? 'Retours du Jour' : 'Today’s Returns'}
                  </div>
                  <div className="text-xl font-black text-white mt-0.5">38</div>
                </div>
                <div>
                  <div className="text-[11px] text-white/60 font-medium">
                    {isAr ? 'النقاط الممنوحة' : isFr ? 'Points Accordés' : 'Points Awarded'}
                  </div>
                  <div className="text-xl font-black text-[#FFE600] mt-0.5">+4,850</div>
                </div>
                <div>
                  <div className="text-[11px] text-white/60 font-medium">
                    {isAr ? 'معدل التردد' : isFr ? 'Taux Récidive' : 'Retention Rate'}
                  </div>
                  <div className="text-xl font-black text-emerald-400 mt-0.5">88%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: AMBASSADOR TESTIMONIALS (ALTERNATING WHITE & BLACK CARDS)
         ========================================================================= */}
      <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="w-full bg-black text-white rounded-[3rem] p-8 sm:p-14 border-4 border-black relative overflow-hidden shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-4 py-1.5 rounded-full bg-[#FFE600] text-black text-xs font-black uppercase tracking-wider mb-3 inline-block shadow-md">
              {isAr ? 'شهادات التجار' : isFr ? 'Témoignages Commerçants' : 'Merchant Testimonials'}
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {isAr ? (
                <>
                  تجارنا هم{' '}
                  <span className="text-[#FFE600] underline decoration-[#FFE600] decoration-wavy decoration-2">
                    أفضل سفرائنا
                  </span>
                </>
              ) : isFr ? (
                <>
                  Nos commerçants sont nos{' '}
                  <span className="text-[#FFE600] underline decoration-[#FFE600] decoration-wavy decoration-2">
                    meilleurs ambassadeurs
                  </span>
                </>
              ) : (
                <>
                  Our merchants are our{' '}
                  <span className="text-[#FFE600] underline decoration-[#FFE600] decoration-wavy decoration-2">
                    best ambassadors
                  </span>
                </>
              )}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-start">
            {/* Review 1: White Card with Black Text */}
            <div className="p-7 rounded-3xl bg-white text-black border-2 border-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#FACC15] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FACC15]" />
                  ))}
                </div>
                <h4 className="text-base font-black text-black mb-2">
                  {isAr ? 'رائع جداً !' : isFr ? 'Fantastique !' : 'Fantastic!'}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-6 font-medium">
                  {isAr
                    ? '« في 90 يوماً، قفزت زيارات عملائنا المنتظمين بنسبة 38% دون خفض أسعارنا. حوّلت Hbibna زوار الصدفة إلى زبائن أوفياء يومياً. »'
                    : isFr
                    ? '« En 90 jours, nos passages réguliers ont bondi de 38% sans brader nos prix. Hbibna a transformé les amateurs de passage en habitués quotidiens fidèles. »'
                    : '“In 90 days, our repeat visits jumped by 38% without slashing prices. Hbibna turned one-off passersby into loyal daily regulars.”'}
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-black/10">
                <div className="w-9 h-9 rounded-full bg-black text-[#FFE600] flex items-center justify-center font-black text-xs">
                  AM
                </div>
                <div>
                  <div className="text-xs font-black text-black">
                    {isAr ? 'أمين مقراني' : 'Amine Mokrani'}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-semibold">
                    {isAr ? 'محمصة 44 • الجزائر' : isFr ? 'Roastery 44 • Alger' : 'Roastery 44 • Algiers'}
                  </div>
                </div>
              </div>
            </div>

            {/* Review 2: Deep Dark Card with Crisp White Text (Alternating!) */}
            <div className="p-7 rounded-3xl bg-[#18181B] text-white border-2 border-white/20 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#FFE600] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FFE600]" />
                  ))}
                </div>
                <h4 className="text-base font-black text-white mb-2">
                  {isAr ? 'سلاسة استثنائية' : isFr ? 'Incroyable fluidité' : 'Incredible Simplicity'}
                </h4>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-6 font-medium">
                  {isAr
                    ? '« يعشق الزبائن عدم حاجتهم لتثبيت أي تطبيق. يفتحون بطاقتهم في Apple Wallet أو يمسحون الرمز عند الصندوق في ثانية واحدة. »'
                    : isFr
                    ? '« Les clients adorent le fait de ne rien avoir à installer. Ils ouvrent leur pass Apple Wallet ou scannent le QR en caisse en 1 seconde. »'
                    : '“Customers love not having to install an app. They simply tap their Apple Wallet pass or scan the QR code at checkout in 1 second.”'}
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-white/15">
                <div className="w-9 h-9 rounded-full bg-[#FFE600] text-black flex items-center justify-center font-black text-xs">
                  SB
                </div>
                <div>
                  <div className="text-xs font-black text-white">
                    {isAr ? 'سامية بوزيد' : 'Samia Bouzid'}
                  </div>
                  <div className="text-[11px] text-white/60 font-medium">
                    {isAr ? 'ورشة الذواقة • وهران' : isFr ? 'L’Atelier Gourmand • Oran' : 'L’Atelier Gourmand • Oran'}
                  </div>
                </div>
              </div>
            </div>

            {/* Review 3: White Card with Black Text */}
            <div className="p-7 rounded-3xl bg-white text-black border-2 border-white shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#FACC15] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FACC15]" />
                  ))}
                </div>
                <h4 className="text-base font-black text-black mb-2">
                  {isAr ? 'عائد استثماري فوري' : isFr ? 'Rentabilité immédiate' : 'Immediate ROI'}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-6 font-medium">
                  {isAr
                    ? '« بسعر 9,800 دج شهرياً وبدون أي عمولات على المبيعات، تحقق العائد على الاستثمار من الأسبوع الأول مباشرة. »'
                    : isFr
                    ? '« À 9 800 DA par mois sans commissions sur nos ventes, le retour sur investissement a été atteint dès la première semaine. »'
                    : '“At 9,800 DZD/month with zero transaction fees, our return on investment was achieved within the very first week.”'}
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-black/10">
                <div className="w-9 h-9 rounded-full bg-black text-[#FFE600] flex items-center justify-center font-black text-xs">
                  KD
                </div>
                <div>
                  <div className="text-xs font-black text-black">
                    {isAr ? 'كريم داود' : 'Karim Daoud'}
                  </div>
                  <div className="text-[11px] text-zinc-500 font-semibold">
                    {isAr ? 'صالون الحلاقة • قسنطينة' : isFr ? 'Barber Lounge • Constantine' : 'Barber Lounge • Constantine'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6.5: VIRAL AFFILIATION & REFERRAL SHOWCASE
         ========================================================================= */}
      <section className="w-full bg-[#FFE600] py-20 lg:py-28 border-y-2 border-black" id="referrals-showcase">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="px-4 py-1.5 rounded-full bg-black text-[#FFE600] text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-[0_3px_0_#000]">
              <Sparkles className="w-3.5 h-3.5 fill-[#FFE600]" />
              <span>{isAr ? 'نظام الإحالة والأفلييت الفيروسي' : isFr ? 'Système d’Affiliation & Parrainage Viral' : 'Viral Referral & Affiliate Engine'}</span>
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-tight">
              {isAr
                ? 'عملاؤك يجلبون لك عملاء جدد تلقائياً.'
                : isFr
                ? 'Vos clients deviennent vos meilleurs ambassadeurs.'
                : 'Turn your customers into your top brand advocates.'}
            </h2>
            <p className="text-base sm:text-lg text-black/85 font-bold">
              {isAr
                ? 'كل عميل يملك رابط إحالة خاص به. يشاركه مع أصدقائه على واتساب، فيحصل الصديق على نقاط ترحيبية فورية ويكسب عميلك نقاطاً إضافية، ليتضاعف عدد زوارك دون إنفاق دينار واحد على الإعلانات الممولة.'
                : isFr
                ? 'Chaque client dispose de son lien personnel à partager sur WhatsApp. Le filleul reçoit des points de bienvenue, le parrain gagne des points bonus : votre clientèle grandit organiquement sans budget publicitaire.'
                : 'Every customer gets their own WhatsApp shareable invite link. The friend gets welcome points, the customer earns bonus points—growing your foot traffic without paid ads.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-[2rem] bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-3 text-start">
              <div className="w-12 h-12 rounded-2xl bg-black text-[#FFE600] border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
                <Share2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-black text-lg text-black">
                {isAr ? 'مشاركة بنقرة واحدة عبر واتساب' : isFr ? 'Partage 1-clic sur WhatsApp' : '1-Click WhatsApp Sharing'}
              </h3>
              <p className="text-xs sm:text-sm text-black/70 font-semibold leading-relaxed">
                {isAr
                  ? 'رسالة دعوة مخصصة وجاهزة للإرسال مباشرة إلى العائلة والأصدقاء دون أي تعقيد تقني.'
                  : isFr
                  ? 'Une invitation personnalisée préremplie envoyée directement aux proches en quelques secondes.'
                  : 'Pre-formatted invitation messages sent directly to friends and family in seconds.'}
              </p>
            </div>

            <div className="p-7 rounded-[2rem] bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-3 text-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-black border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
                <Gift className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-black text-lg text-black">
                {isAr ? 'مكافأة عادلة للطرفين (Win-Win)' : isFr ? 'Points Gagnant-Gagnant' : 'Win-Win Point Rewards'}
              </h3>
              <p className="text-xs sm:text-sm text-black/70 font-semibold leading-relaxed">
                {isAr
                  ? 'الراعي يكسب +50 نقطة والصديق يحصل على +25 نقطة فورية عند أول تسجيل، مما يحفز التجربة الفورية.'
                  : isFr
                  ? 'Le parrain empoche +50 pts et son ami reçoit +25 pts dès son inscription : motivation immédiate.'
                  : 'Referrers pocket bonus points and friends receive instant welcome points upon signing up.'}
              </p>
            </div>

            <div className="p-7 rounded-[2rem] bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-3 text-start">
              <div className="w-12 h-12 rounded-2xl bg-[#FFE600] text-black border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
                <Users className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-black text-lg text-black">
                {isAr ? 'صفر تكلفة إعلانية (0 DA)' : isFr ? '0 DA de frais d’acquisition' : 'Zero Advertising Expense'}
              </h3>
              <p className="text-xs sm:text-sm text-black/70 font-semibold leading-relaxed">
                {isAr
                  ? 'توصيات العملاء الشفهية الموثوقة تحقق أعلى نسبة تردد ومبيعات مقارنة بأي حملة إعلانية تقليدية.'
                  : isFr
                  ? 'Le bouche-à-oreille digital génère le meilleur taux de conversion sans payer de publicité Meta ou Google.'
                  : 'Organic word-of-mouth conversion far outpaces paid advertising at a fraction of the cost.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: PRICING SECTION (WITH FRIENDLY VARIANT)
         ========================================================================= */}
      <section className="w-full py-20 lg:py-28" id="pricing">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="text-center max-w-xl mb-14">
            <span className="px-4 py-1.5 rounded-full bg-black text-white text-xs font-black uppercase tracking-wider mb-3 inline-block shadow-md">
              {isAr ? 'تسعير واضح وشفاف' : isFr ? 'Tarification Prévisible' : 'Predictable Pricing'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
              {isAr ? 'منظومة واحدة بسيطة. نمو غير محدود.' : isFr ? 'Un moteur unique. Croissance illimitée.' : 'One simple engine. Unlimited growth.'}
            </h2>
            <p className="text-sm sm:text-base text-black/80 font-bold mt-2">
              {isAr
                ? 'صفر عمولات على المعاملات. كل ما تحتاجه لتحويل الزوار العاديين إلى سفراء أوفياء لعلامتك.'
                : isFr
                ? 'Aucune commission sur vos ventes. Tout ce qu’il vous faut pour transformer chaque visiteur en client régulier.'
                : 'Zero per-transaction penalization. Everything you need to turn visitors into repeat brand advocates.'}
            </p>
          </div>

          <PricingCards variant="friendly" />
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: FAQ SECTION (WITH FRIENDLY VARIANT)
         ========================================================================= */}
      <FaqSection variant="friendly" />

      {/* =========================================================================
          SECTION 9: FINAL CTA STATEMENT SECTION
         ========================================================================= */}
      <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="w-full rounded-[3rem] bg-black p-10 sm:p-16 text-white relative overflow-hidden shadow-[0_14px_0_#000] border-4 border-black flex flex-col items-center text-center">
          <span className="px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-black uppercase tracking-wider mb-6 z-10 backdrop-blur-md border border-white/20">
            {isAr
              ? 'انضم إلى مئات المتاجر المزدهرة مع Hbibna'
              : isFr
              ? 'Rejoignez des centaines de commerçants qui grandissent avec Hbibna'
              : 'Join Hundreds of Flourishing Merchants'}
          </span>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-3xl mb-6 z-10 leading-tight">
            {isAr ? (
              <>
                بل هي الزيارة{' '}
                <span className="text-[#FFE600]">
                  التالية دائماً.
                </span>
              </>
            ) : isFr ? (
              <>
                {"C'est d'assurer la"}{' '}
                <span className="text-[#FFE600]">
                  suivante.
                </span>
              </>
            ) : (
              <>
                {"It's the"}{' '}
                <span className="text-[#FFE600]">
                  next one.
                </span>
              </>
            )}
          </h2>

          <p className="text-base sm:text-lg text-white/85 max-w-xl mb-10 z-10 leading-relaxed font-semibold">
            {isAr
              ? 'لا تدع الزبائن يغادرون متجرك إلى غير رجعة. حوّل الزيارات اليومية إلى نمو متكرر ومضمون ابتداءً من اليوم.'
              : isFr
              ? 'Ne laissez plus vos nouveaux clients partir sans raison de revenir. Transformez chaque passage en chiffre d’affaires récurrent dès aujourd’hui.'
              : 'Stop letting valuable first-time visitors walk out the door forever. Turn everyday visits into automatic, predictable revenue today.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 z-10">
            <Link
              href="/signup"
              className="group px-9 py-4 rounded-full bg-[#FFE600] hover:bg-[#FACC15] text-black font-black text-sm shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="btn-roll-text">
                <span>{isAr ? 'ابدأ مع Hbibna الآن' : isFr ? 'Démarrer avec Hbibna' : 'Start with Hbibna Now'}</span>
              </span>
            </Link>

            <Link
              href="/pricing"
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all backdrop-blur-md border-2 border-white/20"
            >
              {isAr ? 'عرض خطط الأسعار' : isFr ? 'Voir les Tarifs' : 'View Pricing Plans'}
            </Link>
          </div>
        </div>
      </section>

      {/* Friendly Footer */}
      <PublicFooter variant="friendly" />
    </div>
  );
}
