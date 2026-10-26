'use client';

import React, { useState } from 'react';
import { dbStore } from '@/lib/dbStore';
import { 
  Users, 
  CheckCircle, 
  ShieldCheck, 
  UserX,
  Search,
  Activity,
  Scan,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function WorkersPage() {
  const [workers] = useState(dbStore.getWorkers());
  const [searchQuery, setSearchQuery] = useState('');

  const getAttendanceBadge = (status: string) => {
    switch (status) {
      case 'Present': return <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold">PRESENT</span>;
      case 'On Leave': return <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold">ON LEAVE</span>;
      default: return <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-bold">ABSENT</span>;
    }
  };

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white uppercase">Workforce Directory</h2>
          <p className="text-xs text-white/50 mt-1">Crew registry, qualifications index, and safety certifications database</p>
        </div>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 block uppercase tracking-wider font-semibold font-mono">Present On-Site</span>
            <span className="text-xl font-bold text-emerald-400">{workers.filter(w => w.attendance === 'Present').length} Crew</span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 block uppercase tracking-wider font-semibold font-mono">Unexcused Absences</span>
            <span className="text-xl font-bold text-rose-400">{workers.filter(w => w.attendance === 'Absent').length} Crew</span>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 block uppercase tracking-wider font-semibold font-mono">Safety Compliance</span>
            <span className="text-xl font-bold text-white">98.2%</span>
          </div>
          <div className="p-2.5 bg-white/5 text-white/60 border border-white/10 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 block uppercase tracking-wider font-semibold font-mono">Avg Productivity</span>
            <span className="text-xl font-bold text-cyan-400">91.5%</span>
          </div>
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workers List Left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Workforce Directory</h3>
              <div className="relative w-64">
                <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter personnel..."
                  className="w-full bg-slate-950 border border-white/5 focus:border-cyan-500/50 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/35 focus:outline-none"
                />
              </div>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWorkers.map((w) => (
                <div key={w.id} className="bg-slate-950/40 border border-white/5 hover:border-cyan-500/20 rounded-xl p-4 space-y-3.5 hover:shadow-lg hover:shadow-cyan-500/5 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">{w.name}</h4>
                      <p className="text-[10px] text-white/45 font-mono mt-0.5">{w.role}</p>
                    </div>
                    {getAttendanceBadge(w.attendance)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-white/60">
                    <div className="bg-white/5 rounded p-2">
                      <span className="text-[8px] text-white/35 block uppercase font-mono">Productivity</span>
                      <span className="font-bold text-white">{w.productivity}%</span>
                    </div>
                    <div className="bg-white/5 rounded p-2">
                      <span className="text-[8px] text-white/35 block uppercase font-mono">Check-in Clock</span>
                      <span className="font-bold text-white">{w.checkInTime}</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-1">
                    <span className="text-[8px] text-white/35 block uppercase font-mono font-semibold">Specialized skills</span>
                    <div className="flex flex-wrap gap-1">
                      {w.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="bg-white/5 text-white/70 border border-white/5 rounded-md px-1.5 py-0.5 text-[9px] truncate max-w-[120px]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shortcut to Webcam Face Recognition Center */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-5 space-y-5 border border-cyan-500/10">
            <div className="flex items-center space-x-2 pb-2 border-b border-white/5">
              <Scan className="w-4.5 h-4.5 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Face Biometrics</h3>
            </div>
            
            <p className="text-xs text-white/50 leading-relaxed">
              We have integrated a real-time web camera face recognition scanner inside the attendance panel. Check-in workers, scan facial vector encodings, and audit daily salary logs directly.
            </p>

            <Link 
              href="/attendance"
              className="flex items-center justify-between w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 font-bold text-xs transition-all shadow-md shadow-cyan-500/15"
            >
              <span>Go to Face Attendance</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Compliance & HSE brief cards */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">HSE Training Logs</h3>
            <div className="space-y-3.5">
              {workers.map((w, idx) => (
                <div key={idx} className="space-y-1.5 border-b border-white/5 last:border-b-0 pb-3 last:pb-0 font-medium">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white/90">{w.name}</span>
                    <span className="text-[9px] font-mono text-cyan-400">Certifications</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {w.safetyCertifications.map((cert, cIdx) => (
                      <span key={cIdx} className="bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-[8px] rounded px-1.5 py-0.5">
                        ✓ {cert}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
