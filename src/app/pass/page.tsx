import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PassPageProps {
  searchParams: Promise<{ phone?: string; c?: string; b?: string }>;
}

export default async function PassRedirectPage({ searchParams }: PassPageProps) {
  const params = await searchParams;
  const sp = new URLSearchParams();
  if (params.phone) sp.set('phone', params.phone);
  if (params.c) sp.set('c', params.c);
  if (params.b) sp.set('b', params.b);
  const qs = sp.toString();
  redirect(`/customer/pass${qs ? `?${qs}` : ''}`);
}
