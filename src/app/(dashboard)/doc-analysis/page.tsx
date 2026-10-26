'use client';

import React, { useState } from 'react';
import { analyzeSiteDocument } from '@/lib/ai';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Table, 
  TrendingUp, 
  Calendar,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';

const DOC_SAMPLES = [
  { id: 'doc-1', name: 'Helios_TowerA_Structural_Blueprint.dwg', size: '24.2 MB', type: 'DWG' },
  { id: 'doc-2', name: 'Phase_1_Concrete_Supply_Contract.pdf', size: '4.8 MB', type: 'PDF' }
];

export default function DocumentAnalysisPage() {
  const [selectedDoc, setSelectedDoc] = useState(DOC_SAMPLES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  const executeExtraction = async () => {
    setIsScanning(true);
    setResult(null);

    try {
      const res = await analyzeSiteDocument(selectedDoc.name);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white uppercase">AI Document Parsing & OCR</h2>
          <p className="text-xs text-white/50 mt-1">Extract AutoCAD measurements, room configurations, and supply contracts using document OCR models</p>
        </div>
      </div>

      {/* Selector sample buttons */}
      <div className="flex items-center space-x-3.5 bg-slate-950/40 border border-white/5 rounded-2xl p-4">
        <span className="text-[10px] text-white/40 font-mono font-semibold uppercase">Project Files:</span>
        {DOC_SAMPLES.map(doc => (
          <button 
            key={doc.id}
            onClick={() => {
              setSelectedDoc(doc);
              setResult(null);
              setIsScanning(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              selectedDoc.id === doc.id 
                ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-400' 
                : 'bg-white/5 border-transparent text-white/50 hover:bg-white/10'
            }`}
          >
            📎 {doc.name}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload and execution block left */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Document Dispatcher</h3>
            
            {/* Upload Area Mock */}
            <div className="border border-dashed border-white/10 hover:border-cyan-500/30 rounded-xl aspect-[16/10] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all bg-slate-950/25">
              <Upload className="w-8 h-8 text-cyan-500/60 animate-pulse mb-3" />
              <span className="text-xs font-semibold text-white/80 block">Upload drawing / PDF / Excel</span>
              <span className="text-[9px] text-white/35 font-mono mt-1 block">Maximum size limit: 50MB</span>
            </div>

            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white/90 truncate max-w-[160px]">{selectedDoc.name}</span>
                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-1.5 py-0.5 rounded scale-90">{selectedDoc.type}</span>
              </div>
              <p className="text-[10px] text-white/45">File Size: {selectedDoc.size}</p>
            </div>

            <button 
              onClick={executeExtraction}
              disabled={isScanning}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-40 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/15"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isScanning ? 'Extracting OCR models...' : 'Run AI Extraction'}</span>
            </button>
          </div>
        </div>

        {/* Extracted Tabular Data cards right */}
        <div className="lg:col-span-2 space-y-6">
          {result && !isScanning ? (
            <div className="space-y-6">
              {/* Meta metrics grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="glass-panel rounded-xl p-3.5">
                  <span className="text-[9px] text-white/45 block uppercase font-mono">Total Slab Area</span>
                  <span className="text-sm font-bold text-white block mt-0.5">{result.metadata.totalSlabArea}</span>
                </div>
                <div className="glass-panel rounded-xl p-3.5">
                  <span className="text-[9px] text-white/45 block uppercase font-mono">Concrete Volume</span>
                  <span className="text-sm font-bold text-white block mt-0.5">{result.metadata.estimatedConcreteVolume}</span>
                </div>
                <div className="glass-panel rounded-xl p-3.5">
                  <span className="text-[9px] text-white/45 block uppercase font-mono">Rebar Steel Weight</span>
                  <span className="text-sm font-bold text-white block mt-0.5">{result.metadata.estimatedSteelWeight}</span>
                </div>
                <div className="glass-panel rounded-xl p-3.5">
                  <span className="text-[9px] text-white/45 block uppercase font-mono">Extracted Rooms</span>
                  <span className="text-sm font-bold text-white block mt-0.5">{result.metadata.extractedRooms} Rooms</span>
                </div>
                <div className="glass-panel rounded-xl p-3.5">
                  <span className="text-[9px] text-white/45 block uppercase font-mono">Planned Budget</span>
                  <span className="text-sm font-bold text-emerald-400 block mt-0.5">{result.metadata.plannedBudget}</span>
                </div>
                <div className="glass-panel rounded-xl p-3.5">
                  <span className="text-[9px] text-white/45 block uppercase font-mono">Timeline window</span>
                  <span className="text-sm font-bold text-white block mt-0.5">{result.metadata.timelineDuration}</span>
                </div>
              </div>

              {/* Schedules Table */}
              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Structural Elements Schedule</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-white/45 font-mono uppercase tracking-wider text-[10px] bg-white/5">
                        <th className="p-2.5">Component Element</th>
                        <th className="p-2.5">Specifications</th>
                        <th className="p-2.5 text-right">Extracted Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      {result.structuralDetails.map((det: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/5">
                          <td className="p-2.5 font-bold text-white">{det.item}</td>
                          <td className="p-2.5 text-white/60">{det.specification}</td>
                          <td className="p-2.5 text-right font-mono text-cyan-400 font-bold">{det.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Budget schedule */}
              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Extracted Cost Allocations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.budgetBreakdown.map((b: any, idx: number) => (
                    <div key={idx} className="bg-slate-950/40 border border-white/5 rounded-xl p-3.5 flex justify-between items-center">
                      <span className="text-xs font-semibold text-white/80">{b.category}</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">{b.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center h-[340px] border-white/5 text-white/40">
              {isScanning ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mx-auto"></div>
                  <p className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Parsing CAD Entities...</p>
                </div>
              ) : (
                <div className="max-w-md space-y-3">
                  <Database className="w-10 h-10 text-cyan-500/50 mx-auto animate-float" />
                  <h4 className="text-xs font-bold text-white uppercase">OCR Analysis Standby</h4>
                  <p className="text-xs leading-relaxed text-white/50">
                    Select a project DWG blueprint or contract PDF from the toolbar above and click **Run AI Extraction** to sync schedules, cost bounds, and floor slab specifications.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
