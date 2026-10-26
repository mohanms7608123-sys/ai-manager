'use client';

import React, { useState } from 'react';
import { analyzeSiteImage } from '@/lib/ai';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  ShieldAlert, 
  Download 
} from 'lucide-react';

const SAMPLES = [
  {
    id: 'sample-1',
    name: 'Sector Scaffolding (PPE Scan)',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    category: 'Safety' as const
  },
  {
    id: 'sample-2',
    name: 'Foundation Column (Crack Audit)',
    url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80',
    category: 'Site' as const
  }
];

export default function ImageAnalysisPage() {
  const [selectedImg, setSelectedImg] = useState(SAMPLES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<any>(null);

  const executeAnalysis = async () => {
    setIsScanning(true);
    setReport(null);

    try {
      const res = await analyzeSiteImage(selectedImg.url, selectedImg.category);
      setReport(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  // Convert bounding box coordinate percentages to CSS positions
  const getBoxStyle = (box: number[]) => {
    const [top, left, bottom, right] = box;
    return {
      top: `${top}%`,
      left: `${left}%`,
      height: `${bottom - top}%`,
      width: `${right - left}%`
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white uppercase">AI Smart Image Analysis</h2>
          <p className="text-xs text-white/50 mt-1">Computer vision scanner for PPE Hardhat compliance and concrete micro-crack inspections</p>
        </div>
      </div>

      {/* Selector sample buttons */}
      <div className="flex items-center space-x-3.5 bg-slate-950/40 border border-white/5 rounded-2xl p-4">
        <span className="text-[10px] text-white/40 font-mono font-semibold uppercase">Feed Scans:</span>
        {SAMPLES.map(sample => (
          <button 
            key={sample.id}
            onClick={() => {
              setSelectedImg(sample);
              setReport(null);
              setIsScanning(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              selectedImg.id === sample.id 
                ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-400' 
                : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'
            }`}
          >
            {sample.name}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Analysis Panel Left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center">
            {/* Image Canvas Box */}
            <div className="relative w-full max-w-2xl aspect-[16/10] bg-slate-950 rounded-xl overflow-hidden border border-white/10 group">
              <img 
                src={selectedImg.url} 
                alt={selectedImg.name} 
                className="w-full h-full object-cover select-none"
              />

              {/* Laser Scan line effect */}
              {isScanning && (
                <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/80 top-0 animate-[bounce_2.5s_infinite]"></div>
              )}

              {/* Bounding Boxes */}
              {report && !isScanning && report.detections.map((det: any, idx: number) => {
                const isViolation = det.label.includes('Violation') || det.label.includes('Crack') || det.label.includes('Hazard');
                return (
                  <div 
                    key={idx} 
                    className={`absolute border-2 border-dashed flex flex-col justify-start p-1 pointer-events-none ${
                      isViolation ? 'border-rose-500 bg-rose-500/10' : 'border-emerald-500 bg-emerald-500/10'
                    }`}
                    style={getBoxStyle(det.box)}
                  >
                    <span className={`text-[8px] font-bold font-mono text-white px-1 py-0.5 rounded w-max select-none ${
                      isViolation ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}>
                      {det.label} ({(det.confidence * 100).toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={executeAnalysis}
              disabled={isScanning}
              className="mt-6 flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-40 text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/15"
            >
              <Sparkles className="w-4.5 h-4.5 animate-pulse" />
              <span>{isScanning ? 'Syncing Computer Vision Models...' : 'Execute AI Visual Scan'}</span>
            </button>
          </div>
        </div>

        {/* Report Panel Right */}
        <div className="space-y-6">
          {report && !isScanning ? (
            <div className="glass-panel rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Inspection Summary</h3>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${
                  report.overallStatus === 'VIOLATION DETECTED' 
                    ? 'bg-rose-500/15 border-rose-500/35 text-rose-400 animate-pulse' 
                    : 'bg-amber-500/15 border-amber-500/35 text-amber-400'
                }`}>
                  {report.overallStatus}
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="text-[9px] text-white/40 block uppercase tracking-wider font-mono">Incident Score</span>
                  <p className="text-lg font-bold text-white mt-0.5">{report.score} / 100</p>
                </div>
                
                <div>
                  <span className="text-[9px] text-white/40 block uppercase tracking-wider font-mono">Detections Log</span>
                  <div className="space-y-2 mt-1.5">
                    {report.detections.map((det: any, dIdx: number) => (
                      <div key={dIdx} className="bg-slate-950/40 border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white/90">{det.label}</p>
                          <span className="text-[9px] text-white/45">Target: {det.worker || det.status}</span>
                        </div>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          det.severity === 'High' ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-white/60'
                        }`}>
                          {det.severity || 'OK'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-white/40 block uppercase tracking-wider font-mono">HSE Suggestion</span>
                  <p className="text-xs text-white/60 leading-relaxed mt-1">{report.recommendation}</p>
                </div>
              </div>

              <button className="w-full flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white font-bold text-xs py-2.5 rounded-xl transition-all">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Export Compliance Report</span>
              </button>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-5 flex items-start space-x-3 text-xs">
              <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white uppercase mb-1">Inspections Standby</h4>
                <p className="text-white/50 leading-relaxed">
                  Select a camera feed sample from the toolbar and click **Execute AI Visual Scan** to extract hardhat PPE bounds, concrete alignment logs, and incident records.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
