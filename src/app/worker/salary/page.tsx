'use client';

import React from 'react';
import WorkerPageShell from '@/components/worker/WorkerPageShell';
import { DollarSign, TrendingUp, Banknote, Calendar, CheckCircle2 } from 'lucide-react';

const SALARY_HISTORY = [
  { month: 'July 2026',      present: 26, absent: 0, halfDay: 0, overtime: 4, gross: 35000, deductions: 875,  net: 34125, status: 'Pending', paidOn: '—' },
  { month: 'June 2026',     present: 24, absent: 2, halfDay: 1, overtime: 2, gross: 35000, deductions: 1575, net: 33425, status: 'Paid',    paidOn: '30 Jun 2026' },
  { month: 'May 2026',      present: 25, absent: 1, halfDay: 0, overtime: 6, gross: 35000, deductions: 1250, net: 33750, status: 'Paid',    paidOn: '31 May 2026' },
  { month: 'April 2026',    present: 22, absent: 3, halfDay: 2, overtime: 0, gross: 35000, deductions: 2250, net: 32750, status: 'Paid',    paidOn: '30 Apr 2026' },
  { month: 'March 2026',    present: 25, absent: 1, halfDay: 0, overtime: 3, gross: 35000, deductions: 1250, net: 33750, status: 'Paid',    paidOn: '31 Mar 2026' },
  { month: 'February 2026', present: 22, absent: 2, halfDay: 1, overtime: 0, gross: 35000, deductions: 1750, net: 33250, status: 'Paid',    paidOn: '28 Feb 2026' },
];

function formatINR(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default function WorkerSalaryPage() {
  const totalEarned = SALARY_HISTORY.filter(s => s.status === 'Paid').reduce((acc, s) => acc + s.net, 0);

  return (
    <WorkerPageShell activeTabId="salary">
      {(worker) => (
        <>
          <header>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Salary Ledger</span>
            </h1>
            <p className="text-xs text-white/50 mt-1 font-mono">Worker: {worker.name} • Monthly Salary: {formatINR(worker.salary || 35000)}</p>
          </header>

          {/* Top Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900/60 border border-emerald-500/20 rounded-2xl p-5">
              <p className="text-[10px] font-mono text-white/40 uppercase mb-1">Monthly Base Salary</p>
              <p className="text-2xl font-black text-emerald-400">{formatINR(worker.salary || 35000)}</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-900/20 to-slate-900/60 border border-cyan-500/20 rounded-2xl p-5">
              <p className="text-[10px] font-mono text-white/40 uppercase mb-1">YTD Net Earned (2026)</p>
              <p className="text-2xl font-black text-cyan-400">{formatINR(totalEarned)}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-900/20 to-slate-900/60 border border-amber-500/20 rounded-2xl p-5">
              <p className="text-[10px] font-mono text-white/40 uppercase mb-1">Last Paid Month</p>
              <p className="text-2xl font-black text-amber-400">June 2026</p>
            </div>
          </div>

          {/* Salary History Table */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10">
              <h2 className="text-sm font-bold text-white">Monthly Salary Ledger</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Month', 'Present', 'Absent', 'Overtime (hrs)', 'Gross', 'Deductions', 'Net Pay', 'Status', 'Paid On'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-white/40 font-mono uppercase text-[10px] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SALARY_HISTORY.map((row) => (
                    <tr key={row.month} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{row.month}</td>
                      <td className="px-4 py-3 text-emerald-400 font-mono font-bold">{row.present}</td>
                      <td className="px-4 py-3 text-rose-400 font-mono">{row.absent}</td>
                      <td className="px-4 py-3 text-cyan-400 font-mono">{row.overtime}h</td>
                      <td className="px-4 py-3 text-white/80 font-mono">{formatINR(row.gross)}</td>
                      <td className="px-4 py-3 text-rose-300 font-mono">-{formatINR(row.deductions)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400 font-mono text-sm">{formatINR(row.net)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 w-fit ${
                          row.status === 'Paid' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                        }`}>
                          {row.status === 'Paid' && <CheckCircle2 className="w-3 h-3" />}
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/50 font-mono whitespace-nowrap">{row.paidOn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Salary Breakdown Note */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 text-xs text-white/40 font-mono">
            * Deductions include: Absent day deductions (1/26 salary per absent day) + PF (12%) + ESI (0.75%). Overtime calculated at 1.5× daily rate. Contact your Contractor for salary disputes.
          </div>
        </>
      )}
    </WorkerPageShell>
  );
}
