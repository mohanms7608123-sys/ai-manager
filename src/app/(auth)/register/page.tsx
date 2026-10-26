'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyRegisterPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#060813] text-slate-100 flex items-center justify-center font-sans font-mono text-xs text-cyan-400">
      REDIRECTING TO PORTAL ACCESS HUB...
    </div>
  );
}
