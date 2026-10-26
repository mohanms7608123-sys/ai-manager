'use client';

import React, { useState } from 'react';
import WorkerPageShell from '@/components/worker/WorkerPageShell';
import { CheckSquare, Clock, AlertCircle, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';

const MOCK_TASKS = [
  { id: 'TSK-001', title: 'Install Rebar Framework - Block C Level 3', project: 'Helios Corporate HQ (Tower A)', dueDate: '2026-07-27', priority: 'High', status: 'In Progress', progress: 65, description: 'Complete rebar installation for columns 12–18 on Level 3, Block C. Follow IS-456 standards.' },
  { id: 'TSK-002', title: 'Concrete Pouring - Foundation Columns Row D', project: 'Helios Corporate HQ (Tower A)', dueDate: '2026-07-28', priority: 'High', status: 'Pending', progress: 0, description: 'Assist concrete team with M30 concrete pour for Row D foundation columns. Safety helmet mandatory.' },
  { id: 'TSK-003', title: 'Steel Shuttering Removal - Block B Level 2', project: 'Helios Corporate HQ (Tower A)', dueDate: '2026-07-29', priority: 'Medium', status: 'Pending', progress: 0, description: 'Remove shuttering from Level 2 slab, Block B, after curing confirmation from Site Engineer.' },
  { id: 'TSK-004', title: 'Site Cleanup - Material Storage Area', project: 'Helios Corporate HQ (Tower A)', dueDate: '2026-07-26', priority: 'Low', status: 'Completed', progress: 100, description: 'Clear and organize material storage area near Gate 2. Dispose of waste material per SOP.' }
];

const PRIORITY_COLORS: Record<string, string> = {
  High: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
};

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  'In Progress': { icon: Loader2, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  'Pending': { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  'Completed': { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' }
};

export default function WorkerTasksPage() {
  const [filter, setFilter] = useState<string>('All');

  const filtered = filter === 'All' ? MOCK_TASKS : MOCK_TASKS.filter(t => t.status === filter);

  return (
    <WorkerPageShell activeTabId="tasks">
      {(worker) => (
        <>
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <span>My Assigned Tasks</span>
              </h1>
              <p className="text-xs text-white/50 mt-1 font-mono">Worker: {worker.name} • {worker.trade}</p>
            </div>
            <div className="flex gap-2">
              {['All', 'In Progress', 'Pending', 'Completed'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${filter === f ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-white/10 text-white/60 hover:text-white'}`}>
                  {f}
                </button>
              ))}
            </div>
          </header>

          <div className="grid gap-4">
            {filtered.map(task => {
              const status = STATUS_CONFIG[task.status] || STATUS_CONFIG['Pending'];
              const StatusIcon = status.icon;
              return (
                <div key={task.id} className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 space-y-3 hover:border-emerald-500/30 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono text-white/40">{task.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${status.bg} ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {task.status}
                        </span>
                      </div>
                      <h2 className="text-sm font-bold text-white">{task.title}</h2>
                      <p className="text-xs text-white/50">{task.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[10px] text-white/40 font-mono block">Due Date</span>
                      <span className="text-xs font-bold text-amber-300 font-mono">{task.dueDate}</span>
                    </div>
                  </div>
                  {task.status !== 'Pending' && (
                    <div>
                      <div className="flex justify-between text-[10px] text-white/40 font-mono mb-1">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-10 text-center text-white/40 text-sm">
                No tasks found for <strong>{filter}</strong> filter.
              </div>
            )}
          </div>
        </>
      )}
    </WorkerPageShell>
  );
}
