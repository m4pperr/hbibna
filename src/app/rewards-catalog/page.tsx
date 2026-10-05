import React from 'react';
import type { Metadata } from 'next';
import { PublicNavbar } from '@/components/public/Navbar';
import { PublicFooter } from '@/components/public/Footer';
import { getPublicRewardsCatalog } from '@/lib/data-service';
import { RewardsCatalogView } from '@/components/public/RewardsCatalogView';

export const metadata: Metadata = {
  title: 'Public Rewards Catalog — Hbibna',
  description:
    'Discover partner businesses and exclusive loyalty rewards available across the Hbibna customer loyalty network.',
};

export default async function RewardsCatalogPage() {
  const catalogItems = await getPublicRewardsCatalog();

  return (
    <div className="min-h-screen bg-[#FFDE59] text-black flex flex-col font-rounded selection:bg-black selection:text-[#FFDE59]">
      <PublicNavbar />
      <RewardsCatalogView catalogItems={catalogItems} />
      <PublicFooter />
    </div>
  );
}
