'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/app/(dashboard)/dashboard/page';

import { performLogout, checkIsAuthenticated } from '@/lib/auth';

export default function ContractorDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!checkIsAuthenticated('Contractor')) {
        performLogout('Contractor');
      } else {
        setAuthorized(true);
      }
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#12131a] flex flex-col items-center justify-center text-slate-100 font-sans p-6 text-center">
        <div className="w-10 h-10 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-mono tracking-widest uppercase text-[#f97316]">Verifying Contractor Operations Authorization...</p>
      </div>
    );
  }

  return <Dashboard initialRole="Contractor" />;
}
