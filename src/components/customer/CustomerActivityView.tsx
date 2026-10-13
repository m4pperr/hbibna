'use client';

import { ArrowUpRight, ArrowDownRight, Clock, Store, Hash, ShoppingBag, Gift, Award } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type {
  Customer,
  CustomerBusinessMembership,
  Transaction,
  Business,
} from '@/types/database';

interface CustomerActivityViewProps {
  customer: Customer | null;
  activeMembership: CustomerBusinessMembership | null;
  transactions: Transaction[];
  business?: Business | null;
}

export function CustomerActivityView({
  customer,
  activeMembership,
  transactions,
  business,
}: CustomerActivityViewProps) {
  const { t, isRtl, language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const isEnrolled = !!activeMembership && activeMembership.business_id !== 'default';
  const activeBusinessName =
    business?.name ||
    activeMembership?.business?.name ||
    (isAr ? 'بطاقة حبيبنا العامة' : 'Pass Hbibna Universel');
  const pointsBalance = activeMembership?.points_balance ?? 0;

  const displayTransactions = transactions;

  // Visit & Point Metrics Calculations
  const totalVisits = displayTransactions.length;
  const totalEarnedPoints = displayTransactions
    .filter((tx) => tx.points > 0)
    .reduce((sum, tx) => sum + tx.points, 0);
  const totalRedeemedPoints = Math.abs(
    displayTransactions
      .filter((tx) => tx.points < 0)
      .reduce((sum, tx) => sum + tx.points, 0)
  );

  return (
    <div className="space-y-5 sm:space-y-6 font-rounded max-w-4xl mx-auto pb-12">
      {/* 1. Page Header */}
      <div className="space-y-1 pb-4 border-b-2 border-black/15">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
            {t('customer.activityLedger')}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFE600] text-black border-2 border-black shadow-[0_2px_0_#000] flex items-center gap-1">
            <Store className="w-3 h-3 stroke-[2.5]" />
            <span>{activeBusinessName}</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          {t('customer.recentActivity')}
        </h1>
        <p className="text-sm text-black/70 font-bold">
          {t('customer.allTransactions')} • <span className="font-black text-black">{activeBusinessName}</span>
        </p>
      </div>

      {/* 2. Visit Counter & Summary Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Visits Counter */}
        <div className="p-5 rounded-3xl bg-[#FFE600] border-2 border-black shadow-[0_6px_0_#000] space-y-2 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
              {isAr ? 'إجمالي الزيارات' : isFr ? 'Total des visites' : 'Total Store Visits'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-black text-[#FFE600] flex items-center justify-center border border-black shadow-[0_2px_0_#000]">
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-black font-mono">
              {totalVisits}
            </span>
            <span className="text-xs font-black text-black uppercase">
              {isAr ? 'زيارة' : isFr ? 'visites' : 'visits'}
            </span>
          </div>
          <p className="text-[11px] text-black/70 font-bold">
            {isAr ? 'مسجلة في الكاونتر' : isFr ? 'Enregistrées en caisse' : 'Recorded at store checkout'}
          </p>
        </div>

        {/* Total Points Earned */}
        <div className="p-5 rounded-3xl bg-emerald-200 border-2 border-black shadow-[0_6px_0_#000] space-y-2 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950/70">
              {isAr ? 'مجموع النقاط المكتسبة' : isFr ? 'Points cumulés' : 'Total Points Earned'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-400 text-black flex items-center justify-center border-2 border-black shadow-[0_2px_0_#000]">
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-emerald-950 font-mono">
              +{totalEarnedPoints.toLocaleString()}
            </span>
            <span className="text-xs font-black text-emerald-950 uppercase">{t('common.pts')}</span>
          </div>
          <p className="text-[11px] text-emerald-900 font-bold">
            {isAr ? 'من المشتريات والإحالة' : isFr ? 'Via achats & parrainages' : 'From purchases & referrals'}
          </p>
        </div>

        {/* Current Active Balance */}
        <div className="p-5 rounded-3xl bg-white border-2 border-black shadow-[0_6px_0_#000] space-y-2 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
              {isAr ? 'الرصيد المتاح' : isFr ? 'Solde disponible' : 'Available Balance'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF9D2] text-black flex items-center justify-center border-2 border-black shadow-[0_2px_0_#000]">
              <Award className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-black font-mono">
              {pointsBalance.toLocaleString()}
            </span>
            <span className="text-xs font-black text-black uppercase">{t('common.pts')}</span>
          </div>
          <p className="text-[11px] text-black/60 font-bold">
            {isAr ? `المستخدم: ${totalRedeemedPoints} نقطة` : isFr ? `Utilisés : ${totalRedeemedPoints} pts` : `Redeemed: ${totalRedeemedPoints} pts`}
          </p>
        </div>
      </div>

      {/* 3. Transaction Feed */}
      <div className="bg-white border-2 border-black rounded-3xl overflow-hidden shadow-[0_8px_0_#000] divide-y-2 divide-black/10 font-bold">
        {displayTransactions.length === 0 ? (
          <div className="p-10 sm:p-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF9D2] border-2 border-black flex items-center justify-center mx-auto shadow-[0_2px_0_#000]">
              <Clock className="w-6 h-6 text-black stroke-[2.5]" />
            </div>
            <p className="font-black text-sm text-black">
              {t('customer.noActivity')}
            </p>
            <p className="text-xs text-black/60 font-semibold max-w-sm mx-auto">
              {!isEnrolled
                ? isAr
                  ? 'لم تقم بأي معاملة بعد. أظهر رمز الاستجابة السريعة (QR) الخاص بك في المتجر لكسب أولى نقاطك!'
                  : isFr
                  ? "Vous n'avez pas encore de transactions enregistrées. Présentez votre QR code en caisse pour cumuler vos premiers points !"
                  : "You haven't made any transactions yet. Present your QR code at the counter to start earning points!"
                : isAr
                ? 'ستظهر هنا جميع المشتريات والنقاط المستبدلة فور تسجيلها.'
                : isFr
                ? 'Toutes vos opérations et vos gains de points chez ce commerçant apparaîtront ici.'
                : 'All your purchases and rewards at this merchant will appear here.'}
            </p>
          </div>
        ) : (
          displayTransactions.map((tx) => {
            const isEarn = tx.points > 0;
            const txIdFormatted = `HB-TX-${tx.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;

            return (
              <div
                key={tx.id}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#FFF9D2]/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border-2 border-black shadow-[0_2px_0_#000] ${
                      isEarn
                        ? 'bg-emerald-300 text-black'
                        : 'bg-rose-300 text-black'
                    }`}
                  >
                    {isEarn ? (
                      <ArrowUpRight className="w-5 h-5 stroke-[3]" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 stroke-[3]" />
                    )}
                  </div>
                  <div className="text-start">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-black">
                        {tx.description || (isEarn ? t('business.purchase') : t('customer.spentPts'))}
                      </h3>
                      <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.2 rounded-md bg-neutral-100 border border-black/30 text-[10px] font-mono text-black/70">
                        <Hash className="w-2.5 h-2.5" />
                        <span>{txIdFormatted}</span>
                      </span>
                    </div>

                    <p className="text-xs text-black/60 font-semibold mt-0.5 flex flex-wrap items-center gap-1.5">
                      {tx.amount && tx.amount > 0 ? (
                        <span className="font-black text-black">
                          {tx.amount.toLocaleString()} {t('common.da')} •{' '}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1">
                        <Store className="w-3 h-3 text-black/50" />
                        <span className="font-bold text-black/80">{activeBusinessName}</span>
                      </span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 inline text-black/50" />
                        {new Date(tx.created_at).toLocaleDateString(
                          language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                    </p>
                  </div>
                </div>

                <div className={isRtl ? 'text-left' : 'text-right'}>
                  <span
                    className={`text-sm font-black font-mono px-3 py-1 rounded-xl border-2 border-black shadow-xs ${
                      isEarn ? 'bg-emerald-300 text-black' : 'bg-rose-200 text-rose-950'
                    }`}
                  >
                    {isEarn ? `+${tx.points}` : tx.points}
                  </span>
                  <span className="text-[10px] uppercase font-black text-black/60 block mt-1">
                    {t('business.points')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
