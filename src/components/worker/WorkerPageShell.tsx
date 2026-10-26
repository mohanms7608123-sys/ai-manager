'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { checkIsAuthenticated, performLogout } from '@/lib/auth';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

interface WorkerPageShellProps {
  /** The sidebar tab id to highlight (e.g. 'tasks', 'attendance') */
  activeTabId: string;
  children: (worker: any) => ReactNode;
}

/**
 * Shared shell for all Worker sub-pages.
 * - Validates Worker session; redirects to /worker/login (NEVER to /client/login) if unauthenticated.
 * - Renders the Worker sidebar + header + main content area.
 * - Passes worker data object to children via render-prop pattern.
 */
export default function WorkerPageShell({ activeTabId, children }: WorkerPageShellProps) {
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(activeTabId);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Requirement 4-7: Verify Worker role. ONLY redirect to /worker/login.
    if (!checkIsAuthenticated('Worker')) {
      performLogout('Worker'); // clears stale session, then routes → /worker/login
      return;
    }

    // Requirement 8-9: Load persisted Worker data from localStorage
    const saved = localStorage.getItem('workerData');
    if (saved) {
      try { setWorker(JSON.parse(saved)); } catch { setWorker(defaultWorker()); }
    } else {
      setWorker(defaultWorker());
    }
  }, [router]);

  if (!worker) return null;

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 font-sans relative overflow-x-hidden">
      <DashboardSidebar
        role="Worker"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        userName={worker?.name}
        userPhotoUrl={worker?.photoUrl}
      />

      <div className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col ${
        isCollapsed ? 'md:pl-[80px]' : 'md:pl-[280px]'
      }`}>
        <DashboardHeader
          role="Worker"
          onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          onNotificationClick={() => {}}
          userName={worker?.name}
          userPhotoUrl={worker?.photoUrl}
        />

        <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex-1 space-y-6">
          {children(worker)}
        </main>
      </div>
    </div>
  );
}

function defaultWorker() {
  return {
    id: 'WRK-1001',
    workerId: 'WRK-1001',
    name: 'Arjun Das',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    trade: 'Master Rebar Mason',
    department: 'Civil Structure',
    salary: 35000,
    joiningDate: '2023-01-15',
    projectName: 'Helios Corporate HQ (Tower A)',
    contractorId: 'CONT-101',
    username: 'arjun.das',
    qrCode: 'WRK-1001'
  };
}
