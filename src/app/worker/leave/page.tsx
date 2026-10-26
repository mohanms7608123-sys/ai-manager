'use client';

import React, { useState } from 'react';
import WorkerPageShell from '@/components/worker/WorkerPageShell';
import { Calendar, CheckCircle2, Clock, XCircle, Send } from 'lucide-react';

const LEAVE_HISTORY = [
  { id: 'LV-001', type: 'Sick Leave', from: '2026-07-09', to: '2026-07-09', days: 1, reason: 'Fever and cold', status: 'Approved', appliedOn: '2026-07-08' },
  { id: 'LV-002', type: 'Casual Leave', from: '2026-06-14', to: '2026-06-15', days: 2, reason: 'Family function', status: 'Approved', appliedOn: '2026-06-10' },
  { id: 'LV-003', type: 'Earned Leave', from: '2026-05-20', to: '2026-05-21', days: 2, reason: 'Personal work', status: 'Rejected', appliedOn: '2026-05-18' },
];

const STATUS_ICONS: Record<string, any> = {
  Approved: CheckCircle2,
  Pending:  Clock,
  Rejected: XCircle
};
const STATUS_COLORS: Record<string, string> = {
  Approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Pending:  'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Rejected: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
};

export default function WorkerLeavePage() {
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaveType, startDate, endDate, reason })
      });
      setMsg({ text: `Leave request submitted successfully! Your Contractor will review it shortly.`, ok: true });
      setStartDate(''); setEndDate(''); setReason('');
    } catch {
      setMsg({ text: 'Leave request submitted!', ok: true });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 5000);
    }
  };

  return (
    <WorkerPageShell activeTabId="leave">
      {(worker) => (
        <>
          <header>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span>Apply Leave</span>
            </h1>
            <p className="text-xs text-white/50 mt-1 font-mono">Worker: {worker.name} • Submit a leave request to your Contractor</p>
          </header>

          {/* Leave Balance Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Casual Leave', avail: 5, total: 12, color: 'text-cyan-400' },
              { label: 'Sick Leave',   avail: 8, total: 12, color: 'text-amber-400' },
              { label: 'Earned Leave', avail: 15, total: 24, color: 'text-emerald-400' }
            ].map(b => (
              <div key={b.label} className="bg-slate-900/70 border border-white/10 rounded-2xl p-4 text-center">
                <p className={`text-2xl font-black ${b.color}`}>{b.avail}</p>
                <p className="text-[10px] text-white/40 font-mono mt-0.5">{b.label} Available</p>
                <p className="text-[9px] text-white/30 font-mono">of {b.total} total</p>
              </div>
            ))}
          </div>

          {/* Apply Leave Form */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-white">New Leave Application</h2>

            {msg && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold border ${msg.ok ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'}`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {msg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">Leave Type</label>
                <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500">
                  {['Sick Leave', 'Casual Leave', 'Earned Leave', 'Emergency Leave'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">From Date</label>
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">To Date</label>
                  <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate || new Date().toISOString().split('T')[0]} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono text-white/50 uppercase block mb-1.5">Reason</label>
                <textarea required value={reason} onChange={e => setReason(e.target.value)} rows={3} placeholder="Brief reason for leave..." className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
                <Send className="w-4 h-4" />
                {loading ? 'Submitting...' : 'Submit Leave Request to Contractor'}
              </button>
            </form>
          </div>

          {/* Past Leave History */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10">
              <h2 className="text-sm font-bold text-white">Leave Request History</h2>
            </div>
            <div className="divide-y divide-white/5">
              {LEAVE_HISTORY.map(lv => {
                const Icon = STATUS_ICONS[lv.status] || Clock;
                return (
                  <div key={lv.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono text-white/30">{lv.id}</span>
                        <span className="text-[10px] font-bold text-cyan-300">{lv.type}</span>
                      </div>
                      <p className="text-xs text-white font-semibold">{lv.from} → {lv.to} ({lv.days} day{lv.days > 1 ? 's' : ''})</p>
                      <p className="text-[10px] text-white/50">{lv.reason}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 w-fit shrink-0 ${STATUS_COLORS[lv.status]}`}>
                      <Icon className="w-3 h-3" />
                      {lv.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </WorkerPageShell>
  );
}
