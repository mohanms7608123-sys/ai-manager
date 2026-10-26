'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  DollarSign, 
  User, 
  Bell, 
  ShieldAlert, 
  FileText, 
  LogOut, 
  Send, 
  AlertOctagon, 
  Briefcase, 
  Building2, 
  CheckSquare, 
  Sparkles,
  QrCode
} from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { performLogout, checkIsAuthenticated } from '@/lib/auth';
import { formatIndianRupee } from '@/lib/dbStore';
import { socketHub } from '@/lib/socket';

export default function WorkerDashboardPage() {
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Leave Request Form State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStatusMsg, setLeaveStatusMsg] = useState<string | null>(null);

  // Today's Assigned Task State
  const [taskStatus, setTaskStatus] = useState<'Pending' | 'In Progress' | 'Completed'>('In Progress');
  const [taskProgress, setTaskProgress] = useState(65);

  const fetchTodayAttendance = async (workerId: string) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const targetId = (workerId || 'WK001').trim();
      const res = await fetch(`/api/attendance?workerId=${encodeURIComponent(targetId)}&date=${todayStr}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.attendance) && data.attendance.length > 0) {
        setAttendance(data.attendance[0]);
      } else {
        setAttendance({
          workerId: targetId,
          todayStatus: 'Not Marked',
          checkInTime: '--:--',
          checkOutTime: '--:--',
          markedBy: 'Pending Contractor Action'
        });
      }
    } catch (e) {
      console.error('Failed to fetch today attendance:', e);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!checkIsAuthenticated('Worker')) {
        performLogout('Worker');
        return;
      }

      const savedWorker = localStorage.getItem('workerData');

      if (savedWorker) {
        const parsed = JSON.parse(savedWorker);
        setWorker(parsed);
        const targetId = parsed.workerId || parsed.id || parsed.username || 'WK001';
        fetchTodayAttendance(targetId);
      } else {
        const fallbackWorker = {
          id: 'WK001',
          workerId: 'WK001',
          name: 'Ramesh Kumar',
          photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
          trade: 'Civil Mason',
          department: 'Civil Works',
          salary: 28500,
          joiningDate: '2024-01-15',
          projectName: 'Skyline Tower',
          username: 'WK001',
          qrCode: 'QR-WK001'
        };
        setWorker(fallbackWorker);
        fetchTodayAttendance('WK001');
      }
    }
  }, [router]);

  useEffect(() => {
    if (!worker) return;
    const targetId = worker.workerId || worker.id || worker.username || 'WK001';

    const unsubscribe = socketHub.on('attendance:updated', (updatedData: any) => {
      if (
        !updatedData ||
        !updatedData.workerId ||
        updatedData.workerId.toLowerCase() === targetId.toLowerCase() ||
        updatedData.workerIdStr?.toLowerCase() === targetId.toLowerCase()
      ) {
        fetchTodayAttendance(targetId);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [worker]);

  const handleLogout = () => {
    performLogout('Worker');
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason.trim()) return;

    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker?.id || 'WRK-1001',
          workerName: worker?.name || 'Arjun Das',
          contractorId: 'CONT-101',
          projectId: 'PROJ-101',
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          reason: leaveReason
        })
      });
      const data = await res.json();
      setLeaveStatusMsg(data.message || 'Leave request submitted to Contractor!');
    } catch {
      setLeaveStatusMsg('Leave request submitted to Contractor!');
    }

    setShowLeaveModal(false);
    setLeaveReason('');
    setTimeout(() => setLeaveStatusMsg(null), 5000);
  };

  if (!worker) return null;

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 font-sans relative overflow-x-hidden">
      {/* FIXED LEFT SIDEBAR FOR WORKER */}
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
          onNotificationClick={() => setActiveTab('dashboard')}
          userName={worker?.name}
          userPhotoUrl={worker?.photoUrl}
        />

        <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex-1 space-y-6">
          {/* Top Banner Header */}
          <header className="bg-slate-950/60 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <img 
                src={worker.photoUrl} 
                alt={worker.name} 
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-lg"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold text-white uppercase tracking-wider">{worker.name}</h1>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-md border border-emerald-500/30 font-bold">
                    ID: {worker.id || 'WRK-1001'}
                  </span>
                </div>
                <p className="text-xs text-white/50 font-mono mt-0.5">{worker.trade} • {worker.department} • {worker.projectName}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowLeaveModal(true)}
                className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Apply Leave</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Logout</span>
              </button>
            </div>
          </header>

      {/* Leave Notification Banner */}
      {leaveStatusMsg && (
        <div className="max-w-7xl mx-auto bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-4 flex items-center space-x-3 text-xs text-emerald-300 shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <p className="font-semibold">{leaveStatusMsg}</p>
        </div>
      )}

      {/* MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: TODAY'S TASK */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md md:col-span-2">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Today&apos;s Assigned Task</span>
            </h2>
            <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase ${
              taskStatus === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              Status: {taskStatus}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
            <div>
              <h3 className="font-bold text-white text-sm">Floor 14 Rebar Reinforcement & Columns Steel Binding</h3>
              <p className="text-xs text-white/50 mt-1">Bind Fe550 steel rebars as per AutoCAD DWG-62A specifications before 04:00 PM pouring.</p>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] font-mono text-white/60">
                <span>Task Execution Progress</span>
                <span className="text-emerald-400 font-bold">{taskProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all" style={{ width: `${taskProgress}%` }}></div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button 
                onClick={() => { setTaskProgress(100); setTaskStatus('Completed'); }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-md"
              >
                Mark Task Completed
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: ATTENDANCE STATUS */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Attendance Status</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Contractor Managed
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3 text-center">
            <div className={`inline-block p-3 rounded-full mb-1 border ${
              attendance?.todayStatus === 'Present' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
              attendance?.todayStatus === 'Absent' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
              attendance?.todayStatus === 'Half Day' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
              attendance?.todayStatus === 'Leave' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
              'bg-slate-800 border-white/20 text-slate-400'
            }`}>
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] text-white/40 font-mono block uppercase">Today&apos;s Status</span>
              <span className={`text-lg font-extrabold uppercase font-mono ${
                attendance?.todayStatus === 'Present' ? 'text-emerald-400' :
                attendance?.todayStatus === 'Absent' ? 'text-rose-400' :
                attendance?.todayStatus === 'Half Day' ? 'text-amber-400' :
                attendance?.todayStatus === 'Leave' ? 'text-cyan-400' :
                'text-amber-400'
              }`}>
                {attendance?.todayStatus || 'Not Marked'}
              </span>
              <p className="text-[10px] text-white/50 font-mono mt-1">
                Marked By: <span className="text-white font-bold">{attendance?.markedBy || 'Pending Contractor Action'}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-white/5">
              <div className="bg-white/5 p-2 rounded-lg">
                <span className="text-white/40 block">Check-In</span>
                <span className="text-white font-bold">{attendance?.checkInTime || '--:--'}</span>
              </div>
              <div className="bg-white/5 p-2 rounded-lg">
                <span className="text-white/40 block">Check-Out</span>
                <span className="text-white font-bold">{attendance?.checkOutTime || '--:--'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: SALARY DETAILS */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span>Salary & Pay Ledger</span>
            </h2>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white/50">Monthly Base Salary</span>
              <span className="font-bold text-white">{formatIndianRupee(worker.salary || 35000)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50">Present Days Worked</span>
              <span className="font-bold text-emerald-400">22 Days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50">Overtime Hours</span>
              <span className="font-bold text-purple-400">8.5 Hrs (+₹2,400)</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between items-center font-bold text-sm">
              <span className="text-white">Estimated Pay</span>
              <span className="text-emerald-400">{formatIndianRupee((worker.salary || 35000) + 2400)}</span>
            </div>
          </div>
        </div>

        {/* CARD 4: WORKER PROFILE */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Worker Profile</span>
            </h2>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2 text-xs font-mono">
            <div className="flex justify-between"><span className="text-white/50">Full Name</span><span className="text-white font-bold">{worker.name}</span></div>
            <div className="flex justify-between"><span className="text-white/50">Worker ID</span><span className="text-cyan-400 font-bold">{worker.id}</span></div>
            <div className="flex justify-between"><span className="text-white/50">Trade Skill</span><span className="text-white">{worker.trade}</span></div>
            <div className="flex justify-between"><span className="text-white/50">Joining Date</span><span className="text-white">{worker.joiningDate}</span></div>
            <div className="flex justify-between"><span className="text-white/50">Contractor</span><span className="text-yellow-400">Noida Apex Builders</span></div>
          </div>
        </div>

        {/* CARD 5: NOTIFICATIONS & SAFETY TIPS */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Safety Tips & Alerts</span>
            </h2>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3 text-xs">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
              <span className="font-bold text-amber-400 text-[11px] block uppercase">1. Mandatory Hardhat & Harness</span>
              <p className="text-white/70 text-[10px]">Always check your double lanyard harness before working on Floor 14 scaffolding.</p>
            </div>
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl space-y-1">
              <span className="font-bold text-cyan-400 text-[11px] block uppercase">2. Crane Lifting Boundary</span>
              <p className="text-white/70 text-[10px]">Tower Crane 1 swinging rebar bundles at Sector A between 11:00 AM - 02:00 PM.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

      {/* LEAVE REQUEST MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-white text-sm uppercase flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Apply for Leave</span>
              </h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-white/40 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-white/50 block">Start Date *</label>
                  <input type="date" required value={leaveStartDate} onChange={(e) => setLeaveStartDate(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white" />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 block">End Date *</label>
                  <input type="date" required value={leaveEndDate} onChange={(e) => setLeaveEndDate(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/50 block">Reason for Leave *</label>
                <textarea rows={3} required value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} placeholder="Reason for leave application..." className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none" />
              </div>

              <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg">
                Submit Leave Application to Contractor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
