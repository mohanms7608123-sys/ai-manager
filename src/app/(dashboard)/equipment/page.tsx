'use client';

import React, { useState, useEffect, useRef } from 'react';
import { dbStore, formatIndianRupee } from '@/lib/dbStore';
import { 
  Wrench, 
  Cpu, 
  MapPin, 
  Gauge, 
  Fuel, 
  AlertTriangle, 
  TrendingUp, 
  Play,
  RotateCcw,
  Thermometer,
  Droplet,
  Activity,
  Zap,
  Wind,
  Shield,
  RefreshCw,
  Download,
  FileText,
  Clock
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

interface SensorNode {
  id: string;
  name: string;
  type: 'Temperature' | 'Humidity' | 'Structural' | 'Safety' | 'Equipment' | 'Materials' | 'Energy' | 'Water' | 'Air Quality' | 'Gateway';
  value: string;
  status: 'Nominal' | 'Elevated' | 'Deficit' | 'Critical';
  location: string;
  timestamp: string;
}

export default function EquipmentPage() {
  const [nodes, setNodes] = useState<SensorNode[]>([
    { id: 'SEN-T01', name: 'Ambient Temp Sensor', type: 'Temperature', value: '28.4 °C', status: 'Nominal', location: 'Block B Deck', timestamp: '00:27:01' },
    { id: 'SEN-H01', name: 'Core Humidity Gage', type: 'Humidity', value: '54.2 %', status: 'Nominal', location: 'Basement Wall', timestamp: '00:27:02' },
    { id: 'SEN-S01', name: 'Structural Strain Gage 4', type: 'Structural', value: '12 µs', status: 'Nominal', location: 'Column C-14', timestamp: '00:27:03' },
    { id: 'SEN-W01', name: 'Smart Helmet Roster', type: 'Safety', value: '39 Active', status: 'Nominal', location: 'Site Perimeter', timestamp: '00:27:04' },
    { id: 'EQ-C12', name: 'Crane C-12 Telemetry', type: 'Equipment', value: '92 °C Engine Temp', status: 'Elevated', location: 'Gate 2 Scaffold', timestamp: '00:27:05' },
    { id: 'INV-C02', name: 'Cement Inventory Log', type: 'Materials', value: '620 Bags', status: 'Nominal', location: 'Noida Storage A', timestamp: '00:27:06' },
    { id: 'SEN-E01', name: 'Main Power Grid Monitor', type: 'Energy', value: '145 kWh', status: 'Nominal', location: 'Substation 4', timestamp: '00:27:07' },
    { id: 'SEN-WTR01', name: 'Flow Rate Sensor', type: 'Water', value: '12 L/m', status: 'Nominal', location: 'Base Reservoir', timestamp: '00:27:08' },
    { id: 'SEN-AQ01', name: 'Air Particulate Monitor', type: 'Air Quality', value: '45 AQI', status: 'Nominal', location: 'Roof Level', timestamp: '00:27:09' },
    { id: 'GW-109', name: 'Nokia LoRa Gateway', type: 'Gateway', value: 'Online', status: 'Nominal', location: 'Helios Tower A', timestamp: '00:27:10' }
  ]);

  // Telemetry Sweep States
  const [sweepStatus, setSweepStatus] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [sweepProgress, setSweepProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['// System standby. Ready to sweep LoRa IoT Gateways.']);
  const [autoSweep, setAutoSweep] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);

  // Sensor logs history
  const [historyLogs, setHistoryLogs] = useState<{ time: string; name: string; val: string }[]>([
    { time: '00:15:00', name: 'Ambient Temp Sensor', val: '27.9 °C' },
    { time: '00:15:30', name: 'Crane C-12 Telemetry', val: '88 °C Engine Temp' },
    { time: '00:20:00', name: 'Structural Strain Gage 4', val: '11 µs' }
  ]);

  // Auto Sweep simulation loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoSweep) {
      timer = setInterval(() => {
        runSweepSimulated(true);
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [autoSweep]);

  // Run telemetry scan sweep
  const runSweepSimulated = (silent = false) => {
    if (!silent) {
      setSweepStatus('scanning');
      setSweepProgress(0);
      setTerminalLogs(['[00:27:24] CONNECTING TO NOKIA LORA IoT GATEWAY GW-109... SUCCESS']);
    }

    const steps = [
      { progress: 15, log: '[00:27:25] PINGING PM2.5 AND PM10 PARTICULATE CONTROLLERS... AQI: 45 (Nominal)' },
      { progress: 30, log: '[00:27:26] SWEEPING BAS BALANCING WATER SYSTEM FLOW RATE: 12 L/min... SUCCESS' },
      { progress: 50, log: '[00:27:27] ACQUIRING BASEMENT STRAIN SENSORS... S-104: 12 microstrain (Normal)' },
      { progress: 70, log: '[00:27:28] INVENTORY SWEEP: Noida Block-A reports 620 bags cement.' },
      { progress: 85, log: '[00:27:29] SCANNING WEARABLES: 39 active helmets detected. 1 clips warning logged.' },
      { progress: 100, log: '[00:27:30] COMPILING AI COGNITIVE SWEEP REPORT... COMPLETE' }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        if (!silent) {
          setSweepProgress(step.progress);
          setTerminalLogs(prev => [...prev, step.log]);
        }

        if (step.progress === 100) {
          // Update status locally
          const updatedNodes = nodes.map(n => {
            if (n.id === 'SEN-T01') {
              const newVal = (28.0 + Math.random() * 1.5).toFixed(1);
              return { ...n, value: `${newVal} °C`, timestamp: new Date().toLocaleTimeString() };
            }
            if (n.id === 'EQ-C12') {
              const newVal = Math.floor(90 + Math.random() * 5);
              return { ...n, value: `${newVal} °C Engine Temp`, timestamp: new Date().toLocaleTimeString() };
            }
            return n;
          });
          setNodes(updatedNodes);

          // Append to history log
          setHistoryLogs(prev => [
            { time: new Date().toLocaleTimeString(), name: 'Ambient Temp Sensor', val: updatedNodes[0].value },
            ...prev.slice(0, 10)
          ]);

          // AI Report compilation
          setAiReport({
            risks: 'Low concrete M40 stock (deficit alert), 1 missing safety clip alert.',
            warnings: 'Crane C-12 thermal core temperature is 94°C (Elevated). Check cooling ductwork.',
            recommendations: 'Trigger restock purchase order for concrete; schedule maintenance for Crane C-12 hydraulic pump seals.',
            progress: 'Milestone 4 on track (62% project completion).'
          });

          if (!silent) {
            setSweepStatus('done');
          }
        }
      }, (idx + 1) * 350);
    });
  };

  const getStatusColorBadge = (status: string) => {
    switch (status) {
      case 'Nominal': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'Elevated': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'Deficit': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      default: return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
    }
  };

  // --- REPORT EXPORTERS ---
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Construction Site IoT Telemetry Report", 14, 20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 26);
    doc.line(14, 30, 196, 30);

    doc.setFont("helvetica", "bold");
    doc.text("AI Site Health Analysis Summary:", 14, 40);
    doc.setFont("helvetica", "normal");
    doc.text(`• Identified Risks: ${aiReport?.risks || 'None'}`, 14, 48);
    doc.text(`• Warnings Logged: ${aiReport?.warnings || 'None'}`, 14, 56);
    doc.text(`• Recommendations: ${aiReport?.recommendations || 'None'}`, 14, 64);

    let y = 80;
    doc.setFont("helvetica", "bold");
    doc.text("Active Sensor Nodes:", 14, 74);
    nodes.forEach((n, idx) => {
      doc.setFont("helvetica", "normal");
      doc.text(`${idx + 1}. ${n.name} (${n.type}) - Val: ${n.value} | Status: ${n.status} | Location: ${n.location}`, 14, y);
      y += 8;
    });

    doc.save("Construction_Site_IoT_Report.pdf");
  };

  const handleExportExcel = () => {
    const data = nodes.map(n => ({
      NodeID: n.id,
      SensorName: n.name,
      Category: n.type,
      TelemetryValue: n.value,
      Status: n.status,
      Location: n.location,
      Timestamp: n.timestamp
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sensor Registry");
    XLSX.writeFile(wb, "IoT_Telemetry_Logs.xlsx");
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white uppercase">Construction Site IoT Hub</h2>
          <p className="text-xs text-white/50 mt-1">Real-time LoRa Gateway sweeps, structural strain nodes, and equipment telemetry</p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* Auto sweep toggle */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-white/70">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider">Auto Sweep</span>
            <input 
              type="checkbox" 
              checked={autoSweep} 
              onChange={(e) => setAutoSweep(e.target.checked)}
              className="accent-cyan-400 cursor-pointer w-4 h-4"
            />
          </div>

          <button 
            onClick={() => runSweepSimulated(false)}
            disabled={sweepStatus === 'scanning'}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold px-4 py-2.5 rounded-xl transition-all text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${sweepStatus === 'scanning' ? 'animate-spin' : ''}`} />
            <span>{sweepStatus === 'scanning' ? 'Sweeping...' : 'Begin Site Sweep'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Terminal Console Left, Sensors Registry Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Terminal and Live HUD Left */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* LoRa terminal sweep */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">IoT gateway console</h3>
              {sweepStatus === 'scanning' && (
                <span className="text-[10px] text-cyan-400 font-mono font-bold">Progress: {sweepProgress}%</span>
              )}
            </div>

            {/* Sweep progress bar */}
            {sweepStatus === 'scanning' && (
              <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
                <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${sweepProgress}%` }}></div>
              </div>
            )}

            {/* Terminal logs viewport */}
            <div className="bg-[#02050e] border border-white/5 rounded-xl p-4 h-56 font-mono text-[10px] text-cyan-400/90 overflow-y-auto space-y-1.5 scrollbar-thin">
              {terminalLogs.map((log, idx) => (
                <p key={idx}>&gt; {log}</p>
              ))}
              {sweepStatus === 'scanning' && (
                <div className="flex items-center space-x-1">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full animate-ping"></span>
                  <span className="text-white/35 font-mono text-[9px]">Awaiting gateway vectors...</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Executive Summary details */}
          {aiReport && (
            <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Cpu className="w-4.5 h-4.5 text-cyan-400" />
                  <span>AI IoT Diagnostics Summary</span>
                </h3>
                <div className="flex space-x-2">
                  <button onClick={handleDownloadPDF} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/70" title="PDF Report">
                    <Download className="w-4 h-4 text-cyan-400" />
                  </button>
                  <button onClick={handleExportExcel} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/70" title="Excel Sheet">
                    <FileText className="w-4 h-4 text-yellow-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-white/70">
                <div className="bg-cyan-950/15 border border-cyan-500/25 rounded-xl p-3.5 space-y-1 text-cyan-300 font-mono text-[10px]">
                  <strong>DESIGN RECOMMENDATIONS:</strong>
                  <p className="mt-1">{aiReport.recommendations}</p>
                </div>
                <div className="bg-amber-950/15 border border-amber-500/25 rounded-xl p-3.5 space-y-1 text-amber-300 font-mono text-[10px]">
                  <strong>WARNINGS & BREAKDOWN RISKS:</strong>
                  <p className="mt-1">{aiReport.warnings}</p>
                </div>
                <div className="md:col-span-2 bg-slate-950 border border-white/5 rounded-xl p-3.5 font-mono text-[10px]">
                  <p>• Estimated Project Site Risks: <span className="text-white font-bold">{aiReport.risks}</span></p>
                  <p className="mt-1">• Project Milestone: <span className="text-emerald-400 font-bold">{aiReport.progress}</span></p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Active Sensor Nodes on Right */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4.5 h-4.5 text-cyan-400" />
              <span>Telemetry Node Registry</span>
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
              {nodes.map((node) => (
                <div key={node.id} className="bg-white/5 border border-white/5 rounded-xl p-3 text-xs hover:border-cyan-500/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white/95">{node.name}</h4>
                      <span className="text-[10px] text-white/40 font-mono">{node.id} • {node.type}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColorBadge(node.status)}`}>
                      {node.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-white/50 pt-2.5 border-t border-white/5 mt-2">
                    <span>Val: <span className="text-white font-bold">{node.value}</span></span>
                    <span>Loc: {node.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry log history */}
          <div className="glass-panel rounded-2xl p-5 space-y-3.5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4.5 h-4.5 text-cyan-400" />
              <span>Historical Sensor logs</span>
            </h3>
            <div className="space-y-2 text-[10px] font-mono text-white/60">
              {historyLogs.map((log, idx) => (
                <div key={idx} className="flex justify-between border-b border-white/5 pb-1.5 last:pb-0">
                  <div>
                    <span className="text-white font-semibold">{log.name}</span>
                    <span className="text-white/40 block text-[9px]">{log.time}</span>
                  </div>
                  <span className="text-cyan-400 font-bold">{log.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
