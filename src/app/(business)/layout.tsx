import { DashboardShell } from '@/components/business/DashboardShell';
import { fetchBusinessData } from '@/lib/data-service';
import { getAuthenticatedBusiness } from '@/actions/auth';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, authBusiness] = await Promise.all([
    fetchBusinessData(),
    getAuthenticatedBusiness(),
  ]);

  if (isSupabaseConfigured() && !authBusiness) {
    redirect('/login');
  }

  const businessName = authBusiness?.business.name || data.business.name || 'Hbibna Business';
  const userName = authBusiness?.user.name || 'Owner';

  return (
    <DashboardShell
      businessName={businessName}
      userName={userName}
      customers={data.customers}
    >
      {children}
    </DashboardShell>
  );
}
