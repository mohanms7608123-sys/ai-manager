'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Battery, 
  Navigation, 
  Camera, 
  Upload, 
  FileCheck, 
  Download, 
  MapPin, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  Zap, 
  Plus, 
  CheckCircle, 
  Video 
} from 'lucide-react';
import { formatIndianRupee } from '@/lib/dbStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

interface Drone {
  id: string;
  name: string;
  serial: string;
  status: 'Idle' | 'Flying' | 'Charging';
  battery: number;
  altitude: number;
  speed: number;
}

export default function DroneInspectionPage() {
  const [drones, setDrones] = useState<Drone[]>([
    { id: 'dr-1', name: 'DJI Matrice 300 RTK (Drone Alpha)', serial: 'M300-9942A', status: 'Flying', battery: 82, altitude: 45, speed: 15 },
    { id: 'dr-2', name: 'Phantom 4 Pro V2.0 (Drone Beta)', serial: 'P4P-8821B', status: 'Idle', battery: 100, altitude: 0, speed: 0 },
    { id: 'dr-3', name: 'DJI Mavic 3 Enterprise (Drone Gamma)', serial: 'M3E-1123C', status: 'Charging', battery: 42, altitude: 0, speed: 0 }
  ]);

  const [activeDroneId, setActiveDroneId] = useState('dr-1');
  const activeDrone = drones.find(d => d.id === activeDroneId) || drones[0];

  // Registry Form State
  const [showReg, setShowReg] = useState(false);
  const [newDroneName, setNewDroneName] = useState('');
  const [newDroneSerial, setNewDroneSerial] = useState('');

  // Live Stream Feed State
  const [isStreaming, setIsStreaming] = useState(true);
  const [feedLogs, setFeedLogs] = useState<string[]>(['Stabilizing camera gimbal...', 'LIDAR sensors online.']);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<any>(null);
  const [selectedFrame, setSelectedFrame] = useState('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80');

  // simulated telemetry logs
  const [telemetryHistory, setTelemetryHistory] = useState([
    { time: '10:00', altitude: 38, speed: 12, battery: 95 },
    { time: '10:05', altitude: 42, speed: 14, battery: 89 },
    { time: '10:10', altitude: 45, speed: 15, battery: 82 }
  ]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDroneName.trim() || !newDroneSerial.trim()) return;

    const newDrone: Drone = {
      id: `dr-${Date.now()}`,
      name: newDroneName,
      serial: newDroneSerial,
      status: 'Idle',
      battery: 100,
      altitude: 0,
      speed: 0
    };
    setDrones([...drones, newDrone]);
    setNewDroneName('');
    setNewDroneSerial('');
    setShowReg(false);
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisReport(null);

    setTimeout(() => {
      setAnalysisReport({
        completionRate: 64,
        cracksDetected: 1,
        steelAlignment: '99.4% Accurate',
        waterLeaks: 0,
        smokeDetected: false,
        helmetConform: '96.2% Compliant',
        safetyHarness: '100% Compliant',
        workerCount: 14,
        vehicles: 3,
        unauthorizedPersons: 0,
        severityRisk: 'Low'
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  // Real report exporter routines
  const exportInspectionPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("AI Drone Intelligence Inspection Report", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
    doc.text(`Active Drone: ${activeDrone.name} (S/N: ${activeDrone.serial})`, 14, 32);
    
    doc.line(14, 36, 196, 36);
    
    doc.setFont("helvetica", "bold");
    doc.text("Telemetry Overview:", 14, 46);
    doc.setFont("helvetica", "normal");
    doc.text(`• Current Battery: ${activeDrone.battery}%`, 14, 52);
    doc.text(`• Altitude: ${activeDrone.altitude}m | Speed: ${activeDrone.speed} m/s`, 14, 58);
    
    if (analysisReport) {
      doc.setFont("helvetica", "bold");
      doc.text("AI Computer Vision Findings:", 14, 70);
      doc.setFont("helvetica", "normal");
      doc.text(`• Construction Progress: ${analysisReport.completionRate}%`, 14, 76);
      doc.text(`• Concrete Cracks Detected: ${analysisReport.cracksDetected}`, 14, 82);
      doc.text(`• Worker Count: ${analysisReport.workerCount} | PPE Conformity: ${analysisReport.helmetConform}`, 14, 88);
      doc.text(`• Unauthorized Persons: ${analysisReport.unauthorizedPersons}`, 14, 94);
    }
    
    doc.save(`Drone_Inspection_Report_${activeDrone.serial}.pdf`);
  };

  const exportInspectionExcel = () => {
    const data = [
      {
        DroneName: activeDrone.name,
        Serial: activeDrone.serial,
        Altitude_m: activeDrone.altitude,
        Speed_ms: activeDrone.speed,
        BatteryPct: activeDrone.battery,
        ProgressPct: analysisReport ? `${analysisReport.completionRate}%` : 'N/A',
        Cracks: analysisReport ? analysisReport.cracksDetected : 'N/A',
        Workers: analysisReport ? analysisReport.workerCount : 'N/A',
        PPE_Status: analysisReport ? analysisReport.helmetConform : 'N/A'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Drone Inspection Data");
    XLSX.writeFile(wb, `Drone_Telemetry_Log_${activeDrone.serial}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white uppercase">AI Drone Intelligence Platform</h2>
          <p className="text-xs text-white/50 mt-1">Real-time drone telematics mapping, live camera grids, and visual safety scans</p>
        </div>
        
        <button 
          onClick={() => setShowReg(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-cyan-500/10"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Register New Drone</span>
        </button>
      </div>

      {/* Register Dialog */}
      {showReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Register UAV System</h3>
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/50 uppercase font-mono font-semibold">Drone Name / Model</label>
                <input 
                  type="text" 
                  value={newDroneName}
                  onChange={(e) => setNewDroneName(e.target.value)}
                  placeholder="e.g. DJI Inspire 3"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/50 uppercase font-mono font-semibold">Serial Number</label>
                <input 
                  type="text" 
                  value={newDroneSerial}
                  onChange={(e) => setNewDroneSerial(e.target.value)}
                  placeholder="e.g. D3-8842A"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowReg(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl"
                >
                  Save Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Drone fleet listing and telemetry */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active UAV Fleet</h3>
            <div className="space-y-2.5">
              {drones.map(dr => (
                <button
                  key={dr.id}
                  onClick={() => setActiveDroneId(dr.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeDroneId === dr.id 
                      ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/5 border-cyan-500/35 shadow-md' 
                      : 'bg-white/5 border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[170px]">{dr.name}</h4>
                      <p className="text-[10px] text-white/45 font-mono">{dr.serial}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                      dr.status === 'Flying' ? 'bg-cyan-500/15 text-cyan-400 animate-pulse' :
                      dr.status === 'Charging' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-white/5 text-white/50'
                    }`}>
                      {dr.status.toUpperCase()}
                    </span>
                  </div>
                  {dr.status === 'Flying' && (
                    <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] font-mono text-white/70">
                      <div className="flex items-center space-x-1">
                        <Battery className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{dr.battery}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Navigation className="w-3.5 h-3.5 text-blue-400" />
                        <span>{dr.altitude}m</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Compass className="w-3.5 h-3.5 text-purple-400" />
                        <span>{dr.speed}m/s</span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Telemetry charts */}
          {activeDrone.status === 'Flying' && (
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Flight Altitude Stream</h3>
              <div className="h-44 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" />
                    <YAxis stroke="rgba(255,255,255,0.3)" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Area type="monotone" dataKey="altitude" stroke="#06b6d4" fill="rgba(6, 182, 212, 0.1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Center: Live stream mock and frame analyzer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">UAV Camera feed</h3>
              </div>
              <span className="flex items-center space-x-2 text-[10px] font-mono text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>STREAM ACTIVE</span>
              </span>
            </div>

            {/* Video Feed Screen */}
            <div className="relative aspect-[16/9] bg-black rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
              {isStreaming ? (
                <img 
                  src={selectedFrame} 
                  alt="Drone camera feed" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-xs font-mono text-white/40">CAMERA STANDBY</div>
              )}

              {/* Graphical overlay HUD */}
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between font-mono text-[9px] text-cyan-400">
                <div className="flex justify-between">
                  <span>ALT: {activeDrone.altitude}m</span>
                  <span>BAT: {activeDrone.battery}%</span>
                </div>
                <div className="w-10 h-10 border border-cyan-500/30 rounded-full mx-auto flex items-center justify-center">
                  <span className="scale-75 text-cyan-500/60">+</span>
                </div>
                <div className="flex justify-between">
                  <span>GPS: 28.6273°N, 77.3724°E</span>
                  <span>SPEED: {activeDrone.speed}m/s</span>
                </div>
              </div>

              {/* Bounding box simulation overlays */}
              {!isAnalyzing && analysisReport && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* crack box */}
                  <div className="absolute border border-rose-500 bg-rose-500/10" style={{ top: '35%', left: '40%', width: '15%', height: '10%' }}>
                    <span className="absolute top-[-14px] left-0 bg-rose-600 text-white text-[7px] px-1 font-mono">Crack Detected</span>
                  </div>
                  {/* helmet check */}
                  <div className="absolute border border-emerald-500 bg-emerald-500/10" style={{ top: '55%', left: '20%', width: '10%', height: '15%' }}>
                    <span className="absolute top-[-14px] left-0 bg-emerald-600 text-white text-[7px] px-1 font-mono">Worker (PPE OK)</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={startAnalysis}
                disabled={isAnalyzing || !isStreaming}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                {isAnalyzing ? 'Scanning Frame details...' : 'Analyze Feed Frame'}
              </button>
              
              <button 
                onClick={() => setIsStreaming(!isStreaming)}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-xs text-white"
              >
                {isStreaming ? 'Standby Gimbal' : 'Connect Camera'}
              </button>
            </div>
          </div>

          {/* AI Inspection Findings and Reports Exporter */}
          {analysisReport && (
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Computer Vision Logs</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={exportInspectionPDF}
                    className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1 rounded-xl text-[10px] text-cyan-400 font-bold transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PDF</span>
                  </button>
                  <button 
                    onClick={exportInspectionExcel}
                    className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-white/5 px-3 py-1 rounded-xl text-[10px] text-cyan-400 font-bold transition-all"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Export Excel</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5">
                  <span className="text-[8px] text-white/40 block uppercase font-mono">Progress Metric</span>
                  <span className="text-sm font-bold text-white block mt-0.5">{analysisReport.completionRate}%</span>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5">
                  <span className="text-[8px] text-white/40 block uppercase font-mono">Hardhat Compliance</span>
                  <span className="text-sm font-bold text-emerald-400 block mt-0.5">{analysisReport.helmetConform}</span>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5">
                  <span className="text-[8px] text-white/40 block uppercase font-mono">Structural Cracks</span>
                  <span className="text-sm font-bold text-rose-400 block mt-0.5">{analysisReport.cracksDetected} Found</span>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-3 border border-white/5">
                  <span className="text-[8px] text-white/40 block uppercase font-mono">Crew on sight</span>
                  <span className="text-sm font-bold text-white block mt-0.5">{analysisReport.workerCount} Workers</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
