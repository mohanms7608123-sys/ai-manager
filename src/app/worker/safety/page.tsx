'use client';

import React from 'react';
import WorkerPageShell from '@/components/worker/WorkerPageShell';
import { ShieldCheck, AlertTriangle, HardHat, Flame, Zap, Droplet, Wind, Eye } from 'lucide-react';

const PROTOCOLS = [
  {
    icon: HardHat,
    title: 'Personal Protective Equipment (PPE)',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    rules: [
      'Wear ANSI Z89.1 certified hard hat at all times on site.',
      'High-visibility vest must be worn when working near vehicle movement zones.',
      'Steel-toed boots are mandatory on all construction floors.',
      'Safety goggles required when cutting, grinding, or welding.',
      'Gloves must be worn when handling rebar, sharp edges, or chemical materials.'
    ]
  },
  {
    icon: Flame,
    title: 'Fire Safety & Emergency Evacuation',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    rules: [
      'Know the location of all fire extinguishers and muster points.',
      'Do not block emergency exit routes or fire assembly areas.',
      'In case of fire: Alert → Evacuate → Call emergency (112).',
      'Fire extinguisher training is mandatory every 6 months.',
      'No open flames near fuel storage or chemical areas.'
    ]
  },
  {
    icon: Zap,
    title: 'Electrical Safety',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    rules: [
      'Do not touch electrical panels without a licensed electrician present.',
      'Always assume all electrical wires are live and energized.',
      'Use insulated tools when working near electrical equipment.',
      'Lockout/Tagout (LOTO) procedures must be followed before maintenance work.',
      'Report exposed wiring or electrical hazards to site supervisor immediately.'
    ]
  },
  {
    icon: Droplet,
    title: 'Chemical & Hazardous Materials',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    rules: [
      'Read Material Safety Data Sheet (MSDS) before handling chemicals.',
      'Store chemicals in designated labelled areas only.',
      'Use N95 masks when handling cement, silica dust, or paints.',
      'Wash hands and face after handling any chemical substances.',
      'Dispose of chemical waste per site SOP — never pour into drains.'
    ]
  },
  {
    icon: Wind,
    title: 'Working at Heights',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    rules: [
      'Full body harness must be worn when working above 6 feet (2m) height.',
      'Harness must be anchored to a certified anchor point at all times.',
      'Inspect ladders before use — never use damaged ladders.',
      'Scaffolding must be inspected by Site Engineer before use.',
      'Do not lean over or reach beyond the safety rail.'
    ]
  },
  {
    icon: Eye,
    title: 'Incident Reporting',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    rules: [
      'All accidents, near-misses, and unsafe conditions must be reported within 1 hour.',
      'Report to your immediate supervisor or Site Safety Officer.',
      'Do not attempt to hide, minimize, or ignore any safety incident.',
      'Workers are protected from retaliation for reporting safety concerns.',
      'First Aid Kit location: Site Office, Gate 1, and Level 3 Equipment Room.'
    ]
  }
];

export default function WorkerSafetyPage() {
  return (
    <WorkerPageShell activeTabId="safety">
      {(worker) => (
        <>
          <header className="space-y-1">
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Safety Protocols</span>
            </h1>
            <p className="text-xs text-white/50 font-mono">Worker: {worker.name} • Mandatory site safety guidelines for {worker.projectName || 'Helios Corporate HQ (Tower A)'}</p>
          </header>

          {/* Emergency Banner */}
          <div className="bg-gradient-to-r from-rose-950/80 to-slate-900/80 border-2 border-rose-500/50 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7 text-rose-400 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-black text-rose-300 uppercase tracking-widest">Emergency Contact Numbers</p>
              <p className="text-sm font-bold text-white mt-0.5">Site Emergency: <span className="text-rose-300 font-mono">+91 98765 00001</span> &nbsp;|&nbsp; National Emergency: <span className="text-rose-300 font-mono">112</span> &nbsp;|&nbsp; Ambulance: <span className="text-rose-300 font-mono">108</span></p>
            </div>
          </div>

          {/* Safety Protocol Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {PROTOCOLS.map((proto) => {
              const Icon = proto.icon;
              return (
                <div key={proto.title} className={`${proto.bg} border rounded-2xl p-5 space-y-3`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center ${proto.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className={`text-sm font-bold ${proto.color}`}>{proto.title}</h2>
                  </div>
                  <ul className="space-y-1.5">
                    {proto.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-white/70">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${proto.color.replace('text-', 'bg-')}`} />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Compliance Acknowledgment */}
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 text-xs text-white/40 font-mono text-center">
            By accessing this portal, you acknowledge that you have read and understood all site safety protocols. Non-compliance may result in disciplinary action.
          </div>
        </>
      )}
    </WorkerPageShell>
  );
}
