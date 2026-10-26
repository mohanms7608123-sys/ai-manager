'use client';

import React from 'react';
import { dbStore, formatIndianRupee } from '@/lib/dbStore';
import { 
  CircleDollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  Receipt,
  FileCheck,
  Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MOCK_BUDGET } from '@/lib/mockData';

export default function BudgetPage() {
  const projects = dbStore.getProjects();
  const mainProj = (projects && projects.length > 0) ? projects[0] : { budget: 450000000, spent: 182000000 };

  const totalBudget = mainProj.budget || 450000000;
  const totalSpent = mainProj.spent || 182000000;
  const remaining = totalBudget - totalSpent;
  const burnRate = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const costSavingsIdeas = [
    { title: 'Spot Cement Bulk-Buy', savings: '₹7,75,000', category: 'Procurement', desc: 'Ambuja cement pricing down 4.2% on bulk order sheets.' },
    { title: 'Rebar Machine Offsets Calibration', savings: '₹11,80,000', category: 'Operational', desc: 'Recalibrating Fe550 cutting alignment drops waste percentage by 1.8%.' },
    { title: 'Concrete Mixer Idle Shutdown', savings: '₹3,15,000', category: 'Equipment', desc: 'Enable automatic telemetry sleep modes after 15 mins of idle standing.' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white uppercase">Financial Ledger & Costs</h2>
          <p className="text-xs text-white/50 mt-1">Real-time expenditure tracking, contract burn rates, and predictive overhead estimates</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between h-28">
          <span className="text-[10px] text-white/45 uppercase tracking-wider font-semibold font-mono">Assigned Capital</span>
          <p className="text-xl font-bold text-white">{formatIndianRupee(totalBudget)}</p>
          <span className="text-[9px] text-white/35">Helios Tower A project bounds</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between h-28">
          <span className="text-[10px] text-white/45 uppercase tracking-wider font-semibold font-mono">Total Liquid Disbursed</span>
          <p className="text-xl font-bold text-white">{formatIndianRupee(totalSpent)}</p>
          <span className="text-[9px] text-amber-400 font-mono">{burnRate.toFixed(1)}% cash burn index</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between h-28">
          <span className="text-[10px] text-white/45 uppercase tracking-wider font-semibold font-mono">Liquid Reserve Left</span>
          <p className="text-xl font-bold text-emerald-400">{formatIndianRupee(remaining)}</p>
          <span className="text-[9px] text-white/35">Sufficient for next 6 milestone grids</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between h-28">
          <span className="text-[10px] text-white/45 uppercase tracking-wider font-semibold font-mono">Forecast Deviation</span>
          <p className="text-xl font-bold text-rose-400">+₹68,20,000</p>
          <span className="text-[9px] text-rose-400/80">Rebar procurement over-costs</span>
        </div>
      </div>

      {/* Cost charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenditure category bar charts left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Budget Allocation Breakdown</h3>
              <p className="text-[10px] text-white/55 mt-0.5">Category-specific materials, labor, and machine operation costs</p>
            </div>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_BUDGET} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" />
                  <YAxis stroke="rgba(255,255,255,0.3)" tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip formatter={(value: any) => formatIndianRupee(Number(value))} contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="materials" name="Material cost" fill="#06b6d4" stackId="a" />
                  <Bar dataKey="labor" name="Labor cost" fill="#10b981" stackId="a" />
                  <Bar dataKey="equipment" name="Machine operations" fill="#8b5cf6" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Cash Flow Runway</h3>
              <p className="text-[10px] text-white/55 mt-0.5">Planned forecast trajectories vs actual cash outlays</p>
            </div>
            <div className="h-60 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_BUDGET} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" />
                  <YAxis stroke="rgba(255,255,255,0.3)" tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                  <Tooltip formatter={(value: any) => formatIndianRupee(Number(value))} contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="forecast" name="AI Cost Projection" stroke="#eab308" strokeWidth={2} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="actual" name="Actual Cost Burn" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Cost Savings Ideas panel right */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-white/5">
              <TrendingUp className="w-4.5 h-4.5 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Cost Optimization Ideas</h3>
            </div>
            <div className="space-y-3.5">
              {costSavingsIdeas.map((idea, idx) => (
                <div key={idx} className="bg-slate-950/40 border border-white/5 rounded-xl p-3.5 space-y-2 hover:border-cyan-500/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono scale-90">
                      {idea.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      Save {idea.savings}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white/90">{idea.title}</h4>
                  <p className="text-[10px] text-white/50 leading-relaxed">{idea.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Subcontractor Contracts */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Subcontractor Billings</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-white/90">Ultratech Concrete Services</p>
                  <p className="text-[10px] text-white/45">Foundation Concrete pours</p>
                </div>
                <span className="font-bold text-white font-mono">{formatIndianRupee(185000)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div>
                  <p className="font-semibold text-white/90">Polycab Cable Installers</p>
                  <p className="text-[10px] text-white/45">Floor 10 wiring conduit feeds</p>
                </div>
                <span className="font-bold text-white font-mono">{formatIndianRupee(42500)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
