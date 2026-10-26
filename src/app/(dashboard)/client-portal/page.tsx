'use client';

import React, { useState, useEffect } from 'react';
import { dbStore } from '@/lib/dbStore';
import { socketHub } from '@/lib/socket';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  MapPin, 
  Download 
} from 'lucide-react';

export default function ClientPortalPage() {
  const [projects, setProjects] = useState(dbStore.getProjects());
  const selectedProj = projects[0];

  useEffect(() => {
    const loadProjs = () => {
      fetch('/api/projects?role=Client')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
            setProjects(data.projects);
          } else {
            setProjects([...dbStore.getProjects()]);
          }
        })
        .catch(() => setProjects([...dbStore.getProjects()]));
    };

    loadProjs();
    const unsub = socketHub.on('project:updated', loadProjs);
    return () => unsub();
  }, []);

  const clientInvoices = [
    { id: 'INV-10024', date: '2026-07-01', amount: 1250000, status: 'Paid', type: 'Foundation Phase Milestone' },
    { id: 'INV-10038', date: '2026-07-15', amount: 850000, status: 'Under Review', type: 'Floor 10 Slab Framework Completion' }
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white uppercase">Client Portal</h2>
          <p className="text-xs text-white/50 mt-1">Transparency panel for corporate project sponsors, land developers, and financing entities</p>
        </div>
      </div>

      {selectedProj && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">{selectedProj.name}</h3>
                  <div className="flex items-center space-x-1.5 text-xs text-white/50">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedProj.location}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold font-mono uppercase">
                  Audited by BIM
                </span>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-white/50 uppercase tracking-wider">Project Completion Progress</span>
                  <span className="text-cyan-400 font-mono text-sm">{selectedProj.completion}%</span>
                </div>
                <div className="w-full bg-slate-900 border border-white/5 h-3.5 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 shadow-lg shadow-cyan-500/35"
                    style={{ width: `${selectedProj.completion}%` }}
                  ></div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="bg-white/5 border border-white/5 rounded-xl p-3.5">
                  <span className="text-[9px] text-white/40 block uppercase font-semibold">Authorized Contract Budget</span>
                  <span className="text-sm font-bold text-white block mt-1">{formatCurrency(selectedProj.budget)}</span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-xl p-3.5">
                  <span className="text-[9px] text-white/40 block uppercase font-semibold">Disbursed Submissions</span>
                  <span className="text-sm font-bold text-white block mt-1">{formatCurrency(selectedProj.spent)}</span>
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Corporate Billings Ledger</h3>
              <div className="space-y-3.5">
                {clientInvoices.map((inv, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-950/40 border border-white/5 rounded-xl gap-4 hover:border-cyan-500/10 transition-colors text-xs">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-white/5 border border-white/5 rounded-xl">
                        <FileText className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white uppercase">{inv.id}</h4>
                        <p className="text-[10px] text-white/50">{inv.type}</p>
                        <span className="text-[9px] text-white/35 font-mono">{inv.date}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-5">
                      <div className="text-right">
                        <p className="font-bold text-white font-mono">{formatCurrency(inv.amount)}</p>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                          inv.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400 animate-pulse'
                        }`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </div>
                      <button className="p-1.5 bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 rounded-lg text-white/70 transition-colors">
                        <Download className="w-4 h-4 text-cyan-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar right */}
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Milestone Verification</h3>
              <div className="space-y-3">
                {selectedProj.milestones.map((m, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/5 last:border-b-0 pb-2.5 last:pb-0 text-xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {m.status === 'Completed' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-cyan-500 shrink-0 animate-pulse" />
                      )}
                      <span className="font-medium text-white/80 truncate">{m.name}</span>
                    </div>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                      m.status === 'Completed' ? 'bg-emerald-950/20 text-emerald-400' : 'bg-cyan-950/20 text-cyan-400'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
