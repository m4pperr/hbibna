import { RewardList } from '@/components/business/RewardList';
import { fetchBusinessData } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

export default async function RewardsPage() {
  const { rewards, customers } = await fetchBusinessData();

  return <RewardList initialRewards={rewards} customers={customers} />;
}
