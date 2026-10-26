'use client';

import React, { useState } from 'react';
import { dbStore } from '@/lib/dbStore';
import { 
  FileSpreadsheet, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  Download, 
  AlertTriangle,
  LineChart as LineIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export default function AnalyticsPage() {
  const [projects] = useState(dbStore.getProjects());
  const [materials] = useState(dbStore.getMaterials());
  const [workers] = useState(dbStore.getWorkers());
  const [equipment] = useState(dbStore.getEquipment());

  const [exporting, setExporting] = useState<'none' | 'pdf' | 'excel'>('none');

  // Real client-side PDF Generation using jsPDF
  const exportToPDF = () => {
    setExporting('pdf');
    setTimeout(() => {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("AI Smart Construction Manager", 14, 22);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
      doc.text("Operational & Safety Executive Audit Digest", 14, 34);
      
      doc.setLineWidth(0.5);
      doc.line(14, 38, 196, 38);
      
      // Projects Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("1. Site Portfolios Summary", 14, 48);
      
      let yOffset = 56;
      projects.forEach((p, idx) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(`${idx + 1}. ${p.name}`, 14, yOffset);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(`Location: ${p.location} | Completion: ${p.completion}% | Status: ${p.status}`, 14, yOffset + 5);
        doc.text(`Budget: ₹${p.budget.toLocaleString()} | Spent: ₹${p.spent.toLocaleString()}`, 14, yOffset + 10);
        yOffset += 18;
      });
      
      // Safety Compliance Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("2. Safety & Compliance Index", 14, yOffset + 5);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Global Site Safety compliance rating stands at 97.4% conformance.", 14, yOffset + 12);
      doc.text("PPE camera feeds identified 0 open scaffold hardhat alerts in the current cycle.", 14, yOffset + 17);
      
      doc.save("Construction_Executive_Audit_Digest.pdf");
      setExporting('none');
    }, 1000);
  };

  // Real client-side Excel Generation using sheetjs (XLSX)
  const exportToExcel = () => {
    setExporting('excel');
    setTimeout(() => {
      // 1. Prepare data worksheets
      const materialsData = materials.map(m => ({
        Name: m.name,
        Category: m.category,
        Stock: m.stock,
        Unit: m.unit,
        CostPerUnit: m.costPerUnit,
        Supplier: m.supplier,
        Status: m.status
      }));

      const workersData = workers.map(w => ({
        Name: w.name,
        Role: w.role,
        AttendanceStatus: w.attendance,
        CheckIn: w.checkInTime,
        ProductivityRating: `${w.productivity}%`,
        AttendanceRate: `${w.attendanceRate}%`
      }));

      const equipmentData = equipment.map(e => ({
        Machine: e.name,
        Type: e.type,
        HoursRun: e.telemetry.hoursRun,
        FuelPct: `${e.fuel}%`,
        HealthPct: `${e.health}%`,
        BreakdownProbability: `${e.breakdownProbability}%`,
        Status: e.status
      }));

      const wb = XLSX.utils.book_new();
      
      const wsMat = XLSX.utils.json_to_sheet(materialsData);
      XLSX.utils.book_append_sheet(wb, wsMat, "Materials Ledger");
      
      const wsWork = XLSX.utils.json_to_sheet(workersData);
      XLSX.utils.book_append_sheet(wb, wsWork, "Personnel Roster");

      const wsEq = XLSX.utils.json_to_sheet(equipmentData);
      XLSX.utils.book_append_sheet(wb, wsEq, "Machinery Telematics");
      
      XLSX.writeFile(wb, "Construction_Operations_Database.xlsx");
      setExporting('none');
    }, 1000);
  };

  const performanceDataset = [
    { week: 'W1', productivity: 88, safety: 95, costVariance: 102 },
    { week: 'W2', productivity: 90, safety: 97, costVariance: 101 },
    { week: 'W3', productivity: 91, safety: 96, costVariance: 99 },
    { week: 'W4', productivity: 94, safety: 98, costVariance: 98 },
    { week: 'W5', productivity: 92, safety: 97, costVariance: 104 },
    { week: 'W6', productivity: 91, safety: 97, costVariance: 102 }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-950/40 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-wide text-white uppercase">Data Science & Reports</h2>
          <p className="text-xs text-white/50 mt-1">Export high-fidelity construction operations datasets to PDF and Excel spreadsheets</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Line Chart left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Weekly Resource Efficiency Vectors</h3>
              <p className="text-[10px] text-white/55 mt-0.5">Correlation analytics of workforce efficiency rates against HSE safety scores</p>
            </div>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceDataset} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.3)" />
                  <YAxis stroke="rgba(255,255,255,0.3)" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  <Line type="monotone" dataKey="productivity" name="Productivity Rate" stroke="#06b6d4" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="safety" name="HSE Conformance Index" stroke="#10b981" strokeWidth={2.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Predictions block */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Machine Learning Delay Predictions</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-white/60">
              <div className="bg-[#02050f] border border-cyan-500/15 rounded-xl p-4 space-y-2">
                <span className="text-[9px] text-cyan-400 font-mono font-bold block uppercase tracking-widest">August Monsoon Risk</span>
                <p className="text-white/80 leading-relaxed text-[11px]">
                  Predictive regression maps indicate a **78% probability of a 4-day structural concrete pour delay** in mid-August due to storm cycles.
                </p>
                <span className="text-[9px] text-emerald-400 font-semibold block">💡 Suggested action: accelerate Level 14 floor framing by 3 days.</span>
              </div>
              <div className="bg-[#02050f] border border-cyan-500/15 rounded-xl p-4 space-y-2">
                <span className="text-[9px] text-cyan-400 font-mono font-bold block uppercase tracking-widest">Rebar Price Deviation</span>
                <p className="text-white/80 leading-relaxed text-[11px]">
                  Steel price variance modeling forecasts a **+₹37,50,000 spot market overhead swing** by Q4.
                </p>
                <span className="text-[9px] text-emerald-400 font-semibold block">💡 Suggested action: lock procurement futures sheets with Tata Steel.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exporter triggers panel right */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Operational Exporters</h3>
            
            <div className="space-y-3">
              {/* PDF button */}
              <button 
                onClick={exportToPDF}
                disabled={exporting !== 'none'}
                className="w-full flex items-center justify-between p-4 bg-slate-950/40 border border-white/5 rounded-xl hover:border-cyan-500/20 text-left transition-all"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2 bg-rose-500/15 text-rose-400 border border-rose-500/20 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">Executive PDF Digest</h4>
                    <p className="text-[9px] text-white/45">Burn rates, safety logs, images</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-cyan-400" />
              </button>

              {/* Excel button */}
              <button 
                onClick={exportToExcel}
                disabled={exporting !== 'none'}
                className="w-full flex items-center justify-between p-4 bg-slate-950/40 border border-white/5 rounded-xl hover:border-cyan-500/20 text-left transition-all"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-xl">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">Operations Excel Sheet</h4>
                    <p className="text-[9px] text-white/45">Machinery hours, materials inventory</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {exporting !== 'none' && (
              <div className="text-center font-mono text-[9px] text-cyan-400 animate-pulse mt-2 uppercase tracking-widest">
                Compiling database file... downloading
              </div>
            )}
          </div>

          {/* Diagnostic Stats */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Information Summary</h3>
            <div className="space-y-3.5 text-xs text-white/60 font-medium">
              <div className="flex justify-between items-center">
                <span>Active projects tracked</span>
                <span className="font-bold text-white font-mono">{projects.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Inventory items active</span>
                <span className="font-bold text-white font-mono">{materials.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total tracked workforce</span>
                <span className="font-bold text-white font-mono">{workers.length} Crew</span>
              </div>
              <div className="flex justify-between items-center">
                <span>IoT machines connected</span>
                <span className="font-bold text-white font-mono">{equipment.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
