'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import FloatingCopilot from '@/components/copilot/FloatingCopilot';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [role, setRole] = useState<'Admin' | 'Contractor' | 'Engineer' | 'Client' | 'Worker'>('Client');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthed = localStorage.getItem('isAuthed') === 'true';
      const userRole = (localStorage.getItem('userRole') as any) || 'Client';
      setRole(userRole);
      
      if (!isAuthed) {
        window.location.href = '/';
        return;
      }

      setAuthChecked(true);
    }
  }, [pathname]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#070913] text-slate-100 flex items-center justify-center font-sans font-mono text-xs text-cyan-400">
        VALIDATING CONSOLE ACCESS KEYS...
      </div>
    );
  }

  // If on /dashboard page, dashboard/page.tsx handles its own inner sidebar layout
  if (pathname === '/dashboard') {
    return (
      <>
        {children}
        <FloatingCopilot />
      </>
    );
  }

  // Active Tab identification for subpages
  const activeTabId = pathname.replace('/', '');

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans relative overflow-x-hidden">
      {/* Universal Left Sidebar */}
      <DashboardSidebar
        role={role}
        activeTab={activeTabId}
        setActiveTab={() => {}}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Wrapper */}
      <div className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col ${
        isCollapsed ? 'md:pl-[80px]' : 'md:pl-[280px]'
      }`}>
        {/* Top Header */}
        <DashboardHeader
          role={role}
          onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          onNotificationClick={() => {
            const baseRoute = role === 'Admin' ? '/admin/dashboard' :
                              role === 'Client' ? '/client/dashboard' :
                              role === 'Engineer' ? '/engineer/dashboard' :
                              role === 'Contractor' ? '/contractor/dashboard' : '/worker/dashboard';
            router.push(`${baseRoute}?tab=notifications`);
          }}
        />

        {/* Dynamic Page Content */}
        <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex-1 space-y-6">
          {children}
        </main>
      </div>

      {/* Global Floating AI Copilot */}
      <FloatingCopilot />
    </div>
  );
}
