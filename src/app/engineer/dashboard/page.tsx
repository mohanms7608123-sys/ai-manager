'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/app/(dashboard)/dashboard/page';

import { performLogout, checkIsAuthenticated } from '@/lib/auth';

export default function EngineerDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!checkIsAuthenticated('Engineer')) {
        performLogout('Engineer');
      } else {
        setAuthorized(true);
      }
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#12141d] flex flex-col items-center justify-center text-slate-100 font-sans p-6 text-center">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-mono tracking-widest uppercase text-yellow-400">Verifying Engineer Portal Authorization...</p>
      </div>
    );
  }

  return <Dashboard initialRole="Engineer" />;
}
