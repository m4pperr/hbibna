import { fetchBusinessData } from '@/lib/data-service';
import { SettingsView } from '@/components/business/SettingsView';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { business } = await fetchBusinessData();

  return <SettingsView business={business} />;
}
