'use client';

import React, { useState, useEffect } from 'react';
import WorkerPageShell from '@/components/worker/WorkerPageShell';
import { CalendarCheck, CheckCircle2, XCircle, Clock, Minus } from 'lucide-react';
import { socketHub } from '@/lib/socket';

const DUMMY_MONTH_RECORDS = [
  { date: '2026-07-01', day: 'Tue', status: 'Present', checkIn: '08:15 AM', checkOut: '05:30 PM', hours: '9h 15m', markedBy: 'Contractor' },
  { date: '2026-07-02', day: 'Wed', status: 'Present', checkIn: '08:22 AM', checkOut: '05:28 PM', hours: '9h 06m', markedBy: 'Contractor' },
  { date: '2026-07-03', day: 'Thu', status: 'Present', checkIn: '08:10 AM', checkOut: '06:00 PM', hours: '9h 50m', markedBy: 'Contractor' },
  { date: '2026-07-04', day: 'Fri', status: 'Present', checkIn: '08:30 AM', checkOut: '05:30 PM', hours: '9h 00m', markedBy: 'Contractor' },
  { date: '2026-07-05', day: 'Sat', status: 'Half Day', checkIn: '08:45 AM', checkOut: '01:00 PM', hours: '4h 15m', markedBy: 'Contractor' },
  { date: '2026-07-06', day: 'Sun', status: 'Absent', checkIn: '--:--', checkOut: '--:--', hours: '—', markedBy: 'Contractor' },
  { date: '2026-07-07', day: 'Mon', status: 'Present', checkIn: '08:05 AM', checkOut: '05:30 PM', hours: '9h 25m', markedBy: 'Contractor' },
  { date: '2026-07-08', day: 'Tue', status: 'Present', checkIn: '08:00 AM', checkOut: '05:45 PM', hours: '9h 45m', markedBy: 'Contractor' },
  { date: '2026-07-09', day: 'Wed', status: 'Leave', checkIn: '--:--', checkOut: '--:--', hours: '—', markedBy: 'Contractor' },
  { date: '2026-07-10', day: 'Thu', status: 'Present', checkIn: '08:18 AM', checkOut: '05:30 PM', hours: '9h 12m', markedBy: 'Contractor' },
  { date: '2026-07-11', day: 'Fri', status: 'Present', checkIn: '08:20 AM', checkOut: '05:25 PM', hours: '9h 05m', markedBy: 'Contractor' },
  { date: '2026-07-12', day: 'Sat', status: 'Present', checkIn: '08:30 AM', checkOut: '01:30 PM', hours: '5h 00m', markedBy: 'Contractor' },
  { date: '2026-07-13', day: 'Sun', status: 'Absent', checkIn: '--:--', checkOut: '--:--', hours: '—', markedBy: 'Contractor' },
  { date: '2026-07-14', day: 'Mon', status: 'Present', checkIn: '08:12 AM', checkOut: '05:30 PM', hours: '9h 18m', markedBy: 'Contractor' },
  { date: '2026-07-15', day: 'Tue', status: 'Present', checkIn: '08:08 AM', checkOut: '05:30 PM', hours: '9h 22m', markedBy: 'Contractor' },
  { date: '2026-07-16', day: 'Wed', status: 'Present', checkIn: '08:25 AM', checkOut: '05:30 PM', hours: '9h 05m', markedBy: 'Contractor' },
  { date: '2026-07-17', day: 'Thu', status: 'Present', checkIn: '08:30 AM', checkOut: '05:30 PM', hours: '9h 00m', markedBy: 'Contractor' },
  { date: '2026-07-18', day: 'Fri', status: 'Present', checkIn: '08:10 AM', checkOut: '06:10 PM', hours: '10h 00m', markedBy: 'Contractor' },
  { date: '2026-07-19', day: 'Sat', status: 'Present', checkIn: '08:35 AM', checkOut: '01:15 PM', hours: '4h 40m', markedBy: 'Contractor' },
  { date: '2026-07-20', day: 'Sun', status: 'Absent', checkIn: '--:--', checkOut: '--:--', hours: '—', markedBy: 'Contractor' },
  { date: '2026-07-21', day: 'Mon', status: 'Present', checkIn: '08:05 AM', checkOut: '05:30 PM', hours: '9h 25m', markedBy: 'Contractor' },
  { date: '2026-07-22', day: 'Tue', status: 'Present', checkIn: '08:15 AM', checkOut: '05:30 PM', hours: '9h 15m', markedBy: 'Contractor' },
  { date: '2026-07-23', day: 'Wed', status: 'Present', checkIn: '08:28 AM', checkOut: '05:30 PM', hours: '9h 02m', markedBy: 'Contractor' },
  { date: '2026-07-24', day: 'Thu', status: 'Present', checkIn: '08:20 AM', checkOut: '05:45 PM', hours: '9h 25m', markedBy: 'Contractor' },
  { date: '2026-07-25', day: 'Fri', status: 'Present', checkIn: '08:30 AM', checkOut: '05:30 PM', hours: '9h 00m', markedBy: 'Contractor' },
];

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  'Present':     { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  'Absent':      { icon: XCircle,      color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/30' },
  'Half Day':    { icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30' },
  'Leave':       { icon: Minus,        color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/30' },
  'Not Marked':  { icon: Clock,        color: 'text-slate-400',   bg: 'bg-slate-800 border-white/20' }
};

function WorkerAttendanceContent({ worker }: { worker: any }) {
  const [dbRecords, setDbRecords] = useState<any[]>([]);

  const fetchAttendanceRecords = async (workerId: string) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/attendance?workerId=${encodeURIComponent(workerId)}&date=${todayStr}`);
      const data = await res.json();
      if (data.success && data.attendance) {
        setDbRecords(data.attendance);
      }
    } catch (e) {
      console.error('Failed to fetch attendance history:', e);
    }
  };

  useEffect(() => {
    const targetId = worker?.workerId || worker?.id || worker?.username;
    if (targetId) {
      fetchAttendanceRecords(targetId);
      const unsub = socketHub.on('attendance:updated', (updatedData: any) => {
        if (!updatedData || !updatedData.workerId || updatedData.workerId.toLowerCase() === targetId.toLowerCase() || updatedData.workerIdStr?.toLowerCase() === targetId.toLowerCase()) {
          fetchAttendanceRecords(targetId);
        }
      });
      return () => unsub();
    }
  }, [worker?.workerId, worker?.id]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRec = dbRecords.length > 0 ? dbRecords[0] : null;

  let combinedRecords = [...DUMMY_MONTH_RECORDS];
  const todayFormatted = {
    date: todayStr,
    day: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
    status: todayRec ? (todayRec.todayStatus || 'Not Marked') : 'Not Marked',
    checkIn: todayRec?.checkInTime || '--:--',
    checkOut: todayRec?.checkOutTime || '--:--',
    hours: todayRec?.todayStatus === 'Present' ? '8h 30m' : '—',
    markedBy: todayRec ? (todayRec.markedBy || 'Contractor') : 'Pending Contractor Action'
  };
  combinedRecords = [todayFormatted, ...combinedRecords.filter(r => r.date !== todayStr)];

  const present = combinedRecords.filter(r => r.status === 'Present').length;
  const absent  = combinedRecords.filter(r => r.status === 'Absent').length;
  const halfDay = combinedRecords.filter(r => r.status === 'Half Day').length;
  const leave   = combinedRecords.filter(r => r.status === 'Leave').length;
  const rate    = combinedRecords.length > 0 ? Math.round((present / combinedRecords.length) * 100) : 0;

  return (
    <>
      <header>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <CalendarCheck className="w-5 h-5 text-emerald-400" />
          <span>Attendance History</span>
        </h1>
        <p className="text-xs text-white/50 mt-1 font-mono">
          Worker: {worker.name} • {worker.trade} • Centralized Database Ledger
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Present Days', value: present, color: 'text-emerald-400', bg: 'from-emerald-900/20' },
          { label: 'Absent Days',  value: absent,  color: 'text-rose-400',    bg: 'from-rose-900/20' },
          { label: 'Half Days',    value: halfDay, color: 'text-amber-400',   bg: 'from-amber-900/20' },
          { label: 'Leave Days',   value: leave,   color: 'text-cyan-400',    bg: 'from-cyan-900/20' }
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.bg} to-slate-900/60 border border-white/10 rounded-2xl p-4 text-center`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-white/50 font-mono mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance Rate Bar */}
      <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4 space-y-2">
        <div className="flex justify-between text-xs text-white/60 font-mono">
          <span>Attendance Rate</span>
          <span className="text-emerald-400 font-bold">{rate}%</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all" style={{ width: `${rate}%` }} />
        </div>
      </div>

      {/* Daily Records Table */}
      <div className="bg-slate-900/70 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Daily Attendance Log — Centralized Database</h2>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
            Marked by Contractor Only
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-white/40 font-mono uppercase text-[10px]">Date</th>
                <th className="text-left px-4 py-3 text-white/40 font-mono uppercase text-[10px]">Status</th>
                <th className="text-left px-4 py-3 text-white/40 font-mono uppercase text-[10px]">Check In</th>
                <th className="text-left px-4 py-3 text-white/40 font-mono uppercase text-[10px]">Check Out</th>
                <th className="text-left px-4 py-3 text-white/40 font-mono uppercase text-[10px]">Hours</th>
                <th className="text-left px-4 py-3 text-white/40 font-mono uppercase text-[10px]">Marked By</th>
              </tr>
            </thead>
            <tbody>
              {combinedRecords.map((rec) => {
                const sc = STATUS_CONFIG[rec.status] || STATUS_CONFIG['Not Marked'];
                const Icon = sc.icon;
                return (
                  <tr key={rec.date} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-2.5 font-mono text-white/80">{rec.date} <span className="text-white/30">({rec.day})</span></td>
                    <td className="px-4 py-2.5">
                      <span className={`flex items-center gap-1 w-fit px-2 py-0.5 rounded-lg border text-[10px] font-bold ${sc.bg} ${sc.color}`}>
                        <Icon className="w-3 h-3" />
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-white/70">{rec.checkIn}</td>
                    <td className="px-4 py-2.5 font-mono text-white/70">{rec.checkOut}</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-400 font-bold">{rec.hours}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-white/60">
                      <span className="bg-white/5 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono text-[10px]">
                        {rec.markedBy || 'Contractor'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default function WorkerAttendancePage() {
  return (
    <WorkerPageShell activeTabId="attendance">
      {(worker) => <WorkerAttendanceContent worker={worker} />}
    </WorkerPageShell>
  );
}
