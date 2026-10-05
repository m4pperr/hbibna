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

  // Enforce plan selection & payment before gaining access to business dashboard
  if (authBusiness?.business?.subscription_status === 'pending_payment') {
    redirect('/choose-plan');
  }

  const businessName = authBusiness?.business.name || data.business.name || 'Hbibna Business';
  const userName = authBusiness?.user.name || 'Owner';
  const businessId = authBusiness?.business.id || data.business.id;

  return (
    <DashboardShell
      businessId={businessId}
      businessName={businessName}
      userName={userName}
      customers={data.customers}
    >
      {children}
    </DashboardShell>
  );
}
