'use client';

import React, { useState } from 'react';
import { dbStore } from '@/lib/dbStore';
import { 
  ShieldAlert, 
  AlertOctagon, 
  CheckCircle, 
  Megaphone, 
  Map, 
  AlertTriangle,
  Plus
} from 'lucide-react';

export default function SafetyPage() {
  const [incidents, setIncidents] = useState(dbStore.getSafetyIncidents());
  const [hazardZones, setHazardZones] = useState([
    { name: 'Crane Swing Sector (Sector C)', risk: 'High', status: 'Blocked' },
    { name: 'Tower Floor 12 Scaffold Edge', risk: 'Medium', status: 'Attention' },
    { name: 'Basement Excavation Zone', risk: 'High', status: 'Blocked' }
  ]);

  // Emergency drill trigger state
  const [emergencyAlert, setEmergencyAlert] = useState<'idle' | 'triggered'>('idle');

  const triggerEmergencyAlarm = () => {
    setEmergencyAlert('triggered');
    
    // Add incident
    const newIncident = {
      id: `saf-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleString(),
      type: 'Other' as const,
      severity: 'High' as const,
      status: 'Open' as const,
      description: 'EMERGENCY SITE EVACUATION DRILL DISPATCHED. HORN SIGNALS COMMENCED.'
    };
    dbStore.addSafetyIncident(newIncident);
    setIncidents([...dbStore.getSafetyIncidents()]);

    setTimeout(() => {
      setEmergencyAlert('idle');
    }, 5000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'High': return <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold font-mono">HIGH RISK</span>;
      case 'Medium': return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold font-mono">MODERATE</span>;
      default: return <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold font-mono">LOW RISK</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white uppercase">HSE Compliance & Safety</h2>
          <p className="text-xs text-white/50 mt-1">Real-time incident reporting, hazard exclusions, and alarm drills</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 block uppercase tracking-wider font-semibold font-mono">PPE Conformance</span>
            <span className="text-xl font-bold text-emerald-400">97.4%</span>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 block uppercase tracking-wider font-semibold font-mono">Open Infractions</span>
            <span className="text-xl font-bold text-white">0 Active</span>
          </div>
          <div className="p-2.5 bg-white/5 text-white/60 border border-white/10 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 block uppercase tracking-wider font-semibold font-mono">Exclusion Zones</span>
            <span className="text-xl font-bold text-amber-400">2 Blocked</span>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-white/40 block uppercase tracking-wider font-semibold font-mono">Evacuation System</span>
            <span className="text-xl font-bold text-cyan-400">Armed</span>
          </div>
          <div className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incidents Table Left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Safety Incident Registry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-white/45 font-mono uppercase tracking-wider text-[10px] bg-white/5">
                    <th className="p-3">Alert Date</th>
                    <th className="p-3">Infraction Type</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Target Personnel</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {incidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-[10px]">{inc.date}</td>
                      <td className="p-3">
                        <div className="font-semibold text-white">{inc.type}</div>
                        <div className="text-[10px] text-white/45 truncate max-w-[200px]">{inc.description}</div>
                      </td>
                      <td className="p-3">{getSeverityBadge(inc.severity)}</td>
                      <td className="p-3 text-white/60">{inc.workerName || 'Exclusion Audit'}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          inc.status === 'Resolved' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400 animate-pulse'
                        }`}>
                          {inc.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Emergency Simulator panel Right */}
        <div className="space-y-6">
          {/* Emergency Alert drill console */}
          <div className="glass-panel rounded-2xl p-5 space-y-4 relative overflow-hidden">
            {emergencyAlert === 'triggered' && (
              <div className="absolute inset-0 bg-red-600/10 border border-red-500/50 animate-pulse pointer-events-none"></div>
            )}
            
            <div className="flex items-center space-x-2 pb-2 border-b border-white/5">
              <AlertOctagon className="w-4.5 h-4.5 text-rose-500" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-rose-400">Emergency dispatch console</h3>
            </div>

            <p className="text-[10px] text-white/50 leading-relaxed">
              Dispatches real-time broadcast emergency sound signals and messages to workforce mobile terminals during drills or structural hazard alerts.
            </p>

            <button 
              onClick={triggerEmergencyAlarm}
              className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider transition-all text-xs flex items-center justify-center space-x-2 shadow-lg ${
                emergencyAlert === 'triggered' 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>{emergencyAlert === 'triggered' ? 'ALARM ACTIVE - EVACUATING' : 'Trigger Site Alarm Drill'}</span>
            </button>
          </div>

          {/* Site Exclusion Map Zones */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-white/5">
              <Map className="w-4.5 h-4.5 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hazard Exclusions</h3>
            </div>

            <div className="space-y-2.5">
              {hazardZones.map((zone, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                  <div>
                    <h4 className="text-xs font-semibold text-white/90">{zone.name}</h4>
                    <span className={`text-[8px] font-mono font-bold ${zone.risk === 'High' ? 'text-rose-400' : 'text-amber-400'}`}>
                      {zone.risk} HAZARD
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    zone.status === 'Blocked' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {zone.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
