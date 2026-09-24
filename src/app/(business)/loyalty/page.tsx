import { LoyaltyRuleForm } from '@/components/business/LoyaltyRuleForm';
import { fetchBusinessData } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

export default async function LoyaltyPage() {
  const { loyalty } = await fetchBusinessData();

  return <LoyaltyRuleForm initialLoyalty={loyalty} />;
}
