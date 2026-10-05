'use client';

import { useState } from 'react';
import { Receipt, Gift } from 'lucide-react';
import { RecordPurchaseModal } from './RecordPurchaseModal';
import { RedeemRewardModal } from './RedeemRewardModal';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Customer, Reward, LoyaltyProgram } from '@/types/database';

interface CustomerActionsProps {
  customer: Customer;
  customers: Customer[];
  rewards: Reward[];
  loyaltyRule?: LoyaltyProgram | null;
}

export function CustomerActions({
  customer,
  customers,
  rewards,
  loyaltyRule,
}: CustomerActionsProps) {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setShowRedeemModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black text-black bg-white border-2 border-black shadow-[0_4px_0_#000] hover:bg-[#FFF9D2] active:translate-y-0.5 active:shadow-[0_2px_0_#000] transition-all cursor-pointer"
        >
          <Gift className="w-4 h-4 text-black stroke-[2.5]" />
          <span>{t('business.redeem')}</span>
        </button>

        <button
          onClick={() => setShowPurchaseModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black text-[#FFE600] bg-black border-2 border-black shadow-[0_4px_0_#000] hover:bg-neutral-900 active:translate-y-0.5 active:shadow-[0_2px_0_#000] transition-all cursor-pointer"
        >
          <Receipt className="w-4 h-4 text-[#FFE600] stroke-[2.5]" />
          <span>{t('business.addPurchase')}</span>
        </button>
      </div>

      {showPurchaseModal && (
        <RecordPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          customers={customers}
          defaultCustomerId={customer.id}
          loyaltyRule={loyaltyRule}
        />
      )}

      {showRedeemModal && (
        <RedeemRewardModal
          isOpen={showRedeemModal}
          onClose={() => setShowRedeemModal(false)}
          customer={customer}
          rewards={rewards}
        />
      )}
    </>
  );
}
