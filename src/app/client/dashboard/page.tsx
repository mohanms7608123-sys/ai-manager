'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/app/(dashboard)/dashboard/page';

import { performLogout, checkIsAuthenticated } from '@/lib/auth';

export default function ClientDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!checkIsAuthenticated('Client')) {
        performLogout('Client');
      } else {
        setAuthorized(true);
      }
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 font-sans p-6 text-center">
        <div className="w-10 h-10 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-mono tracking-widest uppercase text-[#1e3a8a]">Verifying Client Portal Authorization...</p>
      </div>
    );
  }

  return <Dashboard initialRole="Client" />;
}
