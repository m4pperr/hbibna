'use client';

import { useState } from 'react';
import { Receipt, Gift } from 'lucide-react';
import { RecordPurchaseModal } from './RecordPurchaseModal';
import { RedeemRewardModal } from './RedeemRewardModal';
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

  return (
    <>
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setShowRedeemModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#191817] bg-[#FAF8F5] border border-[#E6DDCF] hover:bg-[#F3ECE2] transition-colors cursor-pointer"
        >
          <Gift className="w-3.5 h-3.5 text-[#B88E3E]" />
          <span>Redeem Reward</span>
        </button>

        <button
          onClick={() => setShowPurchaseModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#B88E3E] hover:bg-[#A37B30] shadow-soft transition-all cursor-pointer"
        >
          <Receipt className="w-3.5 h-3.5 text-white" />
          <span>Add Purchase</span>
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
