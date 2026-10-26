'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  Wrench, 
  CheckCircle2, 
  Download,
  Info,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Send,
  Eye,
  RefreshCw,
  Search,
  FileText,
  Activity,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  ShieldCheck,
  Clock,
  AlertOctagon
} from 'lucide-react';
import { formatIndianRupee } from '@/lib/dbStore';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

interface DetectedIssue {
  id: string;
  title: string;
  confidence: number; // e.g. 98.7
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  damagePct: number; // 0-100%
  box: { x: number; y: number; w: number; h: number };
}

interface DamageReport {
  id: string;
  projectName: string;
  inspectorName: string;
  inspectionDate: string;
  imageStatus: string; // "Analyzed Successfully"
  overallHealth: number; // e.g. 91
  overallDamage: number; // e.g. 9
  detectedIssues: DetectedIssue[];
  riskScore: {
    low: number; // 12%
    medium: number; // 34%
    high: number; // 54%
  };
  structuralCondition: {
    foundation: number; // 96%
    columns: number; // 93%
    beams: number; // 91%
    roof: number; // 95%
    walls: number; // 88%
    floor: number; // 97%
    roadSurface: number; // 72%
    drainage: number; // 89%
  };
  safetyCompliance: {
    workerSafety: number; // 94%
    scaffoldingSafety: number; // 91%
    electricalSafety: number; // 87%
    fireSafety: number; // 96%
    ppeCompliance: number; // 98%
  };
  repairPriority: {
    immediate: number; // 96%
    repair7Days: number; // 84%
    monitorOnly: number; // 65%
  };
  estimatedCost: number; // e.g. 185000
  aiRecommendation: string;
  imageUrl: string;
}

// Color Utility for Bounding Boxes & Severity
const getDamageColor = (pct: number) => {
  if (pct <= 25) return { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.2)', bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/40' };
  if (pct <= 50) return { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.2)', bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/40' };
  if (pct <= 75) return { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.2)', bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/40' };
  return { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.2)', bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/40' };
};

// Circular Progress Gauge Component
function CircularGauge({ value, label, color, icon: Icon }: { value: number; label: string; color: string; icon?: any }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center space-y-2 p-4 bg-slate-950/80 rounded-2xl border border-white/10 shadow-lg">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {Icon && <Icon className="w-4 h-4 mb-0.5" style={{ color }} />}
          <span className="text-xl font-extrabold text-white font-mono">{value}%</span>
        </div>
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider text-white/70 font-mono">{label}</span>
    </div>
  );
}

export default function DamageInspectionPage() {
  const [activeTab, setActiveTab] = useState<'visual' | 'report' | 'analytics' | 'chat'>('visual');
  const [history, setHistory] = useState<DamageReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentInspection, setCurrentInspection] = useState<DamageReport | null>(null);

  const [zoomScale, setZoomScale] = useState(1);
  const [viewMode, setViewMode] = useState<'annotated' | 'original'>('annotated');
  const [isScanning, setIsScanning] = useState(false);

  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Damage Inspection AI active. Upload an image to analyze defects, confidence scores, risk metrics, and repair cost estimates.' }
  ]);

  // Seed sample inspection matching user mandate
  useEffect(() => {
    const defaultReport: DamageReport = {
      id: 'dmg-1001',
      projectName: 'Signature Tower Noida',
      inspectorName: 'Rahul Sharma',
      inspectionDate: new Date().toISOString().split('T')[0],
      imageStatus: 'Analyzed Successfully',
      overallHealth: 91,
      overallDamage: 9,
      detectedIssues: [
        { id: 'iss-1', title: 'Concrete Crack', confidence: 98.7, severity: 'High', damagePct: 78, box: { x: 25, y: 20, w: 42, h: 48 } },
        { id: 'iss-2', title: 'Steel Corrosion', confidence: 92.4, severity: 'Medium', damagePct: 48, box: { x: 15, y: 62, w: 35, h: 30 } },
        { id: 'iss-3', title: 'Water Leakage', confidence: 88.3, severity: 'Medium', damagePct: 36, box: { x: 62, y: 18, w: 30, h: 40 } },
        { id: 'iss-4', title: 'Surface Spalling', confidence: 76.5, severity: 'Low', damagePct: 22, box: { x: 58, y: 64, w: 32, h: 28 } }
      ],
      riskScore: {
        low: 12,
        medium: 34,
        high: 54
      },
      structuralCondition: {
        foundation: 96,
        columns: 93,
        beams: 91,
        roof: 95,
        walls: 88,
        floor: 97,
        roadSurface: 72,
        drainage: 89
      },
      safetyCompliance: {
        workerSafety: 94,
        scaffoldingSafety: 91,
        electricalSafety: 87,
        fireSafety: 96,
        ppeCompliance: 98
      },
      repairPriority: {
        immediate: 96,
        repair7Days: 84,
        monitorOnly: 65
      },
      estimatedCost: 185000,
      aiRecommendation: 'High confidence structural defects detected. Concrete Crack (98.7% confidence, High severity) requires immediate high-pressure epoxy resin injection seal. Steel Corrosion (92.4% confidence) requires sandblast rust removal and zinc primer coating. Water leakage points should be sealed with polyurethane waterproofing membranes.',
      imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'
    };

    setHistory([defaultReport]);
    setCurrentInspection(defaultReport);
  }, []);

  // Handle Dynamic Image Upload with Randomised Dynamic Metrics
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('File size exceeds 20MB limit.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setIsScanning(true);
        const dataUrl = reader.result as string;

        setTimeout(() => {
          const overallDmg = Math.floor(Math.random() * 15) + 5; // 5-20%
          const overallHlth = 100 - overallDmg;

          const newReport: DamageReport = {
            id: `dmg-${Date.now().toString().slice(-4)}`,
            projectName: 'Signature Tower Noida',
            inspectorName: 'Rahul Sharma',
            inspectionDate: new Date().toISOString().split('T')[0],
            imageStatus: 'Analyzed Successfully',
            overallHealth: overallHlth,
            overallDamage: overallDmg,
            detectedIssues: [
              { id: 'iss-1', title: 'Concrete Crack', confidence: +(95 + Math.random() * 4.5).toFixed(1), severity: 'High', damagePct: 76 + Math.floor(Math.random() * 20), box: { x: 22, y: 18, w: 45, h: 45 } },
              { id: 'iss-2', title: 'Steel Corrosion', confidence: +(90 + Math.random() * 5).toFixed(1), severity: 'Medium', damagePct: 35 + Math.floor(Math.random() * 20), box: { x: 18, y: 60, w: 38, h: 32 } },
              { id: 'iss-3', title: 'Road Damage', confidence: +(85 + Math.random() * 8).toFixed(1), severity: 'Medium', damagePct: 28 + Math.floor(Math.random() * 20), box: { x: 60, y: 22, w: 32, h: 38 } },
              { id: 'iss-4', title: 'Water Leakage', confidence: +(75 + Math.random() * 10).toFixed(1), severity: 'Low', damagePct: 15 + Math.floor(Math.random() * 15), box: { x: 55, y: 62, w: 35, h: 30 } }
            ],
            riskScore: {
              low: Math.floor(Math.random() * 20) + 10,
              medium: Math.floor(Math.random() * 25) + 25,
              high: Math.floor(Math.random() * 25) + 45
            },
            structuralCondition: {
              foundation: Math.floor(Math.random() * 8) + 92,
              columns: Math.floor(Math.random() * 10) + 90,
              beams: Math.floor(Math.random() * 10) + 88,
              roof: Math.floor(Math.random() * 10) + 90,
              walls: Math.floor(Math.random() * 12) + 85,
              floor: Math.floor(Math.random() * 6) + 94,
              roadSurface: Math.floor(Math.random() * 20) + 68,
              drainage: Math.floor(Math.random() * 15) + 82
            },
            safetyCompliance: {
              workerSafety: Math.floor(Math.random() * 8) + 90,
              scaffoldingSafety: Math.floor(Math.random() * 10) + 88,
              electricalSafety: Math.floor(Math.random() * 12) + 85,
              fireSafety: Math.floor(Math.random() * 8) + 92,
              ppeCompliance: Math.floor(Math.random() * 5) + 95
            },
            repairPriority: {
              immediate: Math.floor(Math.random() * 10) + 88,
              repair7Days: Math.floor(Math.random() * 15) + 78,
              monitorOnly: Math.floor(Math.random() * 20) + 55
            },
            estimatedCost: 150000 + Math.floor(Math.random() * 95000),
            aiRecommendation: 'Computer vision analysis completed. Critical concrete crack and structural rust areas identified. High pressure epoxy stitching recommended immediately for main beam section.',
            imageUrl: dataUrl
          };

          setHistory(prev => [newReport, ...prev]);
          setCurrentInspection(newReport);
          setIsScanning(false);

          setChatHistory([
            { role: 'assistant', text: `Image analyzed successfully! Overall Structural Health: ${newReport.overallHealth}%. Overall Damage: ${newReport.overallDamage}%. Detected ${newReport.detectedIssues.length} issues with estimated repair cost of ${formatIndianRupee(newReport.estimatedCost)}.` }
          ]);
        }, 1600);
      };
      reader.readAsDataURL(file);
    }
  };

  // PDF Exporter
  const handleExportPDF = () => {
    if (!currentInspection) return;
    const doc = new jsPDF();
    doc.setFillColor(7, 11, 25);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setTextColor(251, 191, 36);
    doc.setFontSize(18);
    doc.text("AI SMART CONSTRUCTION MANAGER", 15, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("AI DAMAGE INSPECTION & DIAGNOSTIC REPORT", 15, 30);

    doc.setDrawColor(56, 189, 248);
    doc.line(15, 35, 195, 35);

    doc.setFontSize(10);
    doc.setTextColor(203, 213, 225);
    doc.text(`Report ID: ${currentInspection.id}`, 15, 45);
    doc.text(`Image Status: ${currentInspection.imageStatus}`, 15, 52);
    doc.text(`Overall Structural Health: ${currentInspection.overallHealth}%`, 15, 59);
    doc.text(`Overall Damage Level: ${currentInspection.overallDamage}%`, 15, 66);
    doc.text(`Estimated Repair Cost: ${formatIndianRupee(currentInspection.estimatedCost)}`, 15, 73);

    doc.setTextColor(251, 191, 36);
    doc.setFontSize(12);
    doc.text("DETECTED ISSUES & CONFIDENCE:", 15, 88);

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    currentInspection.detectedIssues.forEach((iss, idx) => {
      doc.text(`${idx + 1}. ${iss.title} - Confidence: ${iss.confidence}% | Severity: ${iss.severity} (${iss.damagePct}% Damage)`, 20, 98 + idx * 8);
    });

    doc.setTextColor(251, 191, 36);
    doc.setFontSize(12);
    doc.text("AI RECOMMENDATION:", 15, 145);

    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    const splitRec = doc.splitTextToSize(currentInspection.aiRecommendation, 175);
    doc.text(splitRec, 15, 155);

    doc.save(`AI_Damage_Report_${currentInspection.id}.pdf`);
  };

  const handleExportExcel = () => {
    if (!currentInspection) return;
    const data = currentInspection.detectedIssues.map(iss => ({
      ReportID: currentInspection.id,
      Date: currentInspection.inspectionDate,
      Issue: iss.title,
      Confidence: `${iss.confidence}%`,
      Severity: iss.severity,
      DamagePct: `${iss.damagePct}%`,
      EstimatedCost: currentInspection.estimatedCost
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Damage Issues");
    XLSX.writeFile(wb, `Damage_Audit_${currentInspection.id}.xlsx`);
  };

  // Copilot Chat Handler
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim() || !currentInspection) return;

    const userText = chatMsg;
    setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
    setChatMsg('');

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply = `The AI detected ${currentInspection.detectedIssues.length} primary defects. Concrete Crack has highest confidence (${currentInspection.detectedIssues[0]?.confidence}%). Overall Structural Health is at ${currentInspection.overallHealth}%.`;

      if (lower.includes('cost') || lower.includes('estimate') || lower.includes('rupee')) {
        reply = `The estimated damage repair cost is ${formatIndianRupee(currentInspection.estimatedCost)}. Immediate repairs account for ${currentInspection.repairPriority.immediate}% priority.`;
      } else if (lower.includes('risk') || lower.includes('safety')) {
        reply = `Risk Breakdown: Low Risk ${currentInspection.riskScore.low}%, Medium Risk ${currentInspection.riskScore.medium}%, High Risk ${currentInspection.riskScore.high}%. Worker Safety compliance is currently at ${currentInspection.safetyCompliance.workerSafety}%.`;
      } else if (lower.includes('repair') || lower.includes('action')) {
        reply = `AI Recommendation: ${currentInspection.aiRecommendation}`;
      }

      setChatHistory(prev => [...prev, { role: 'assistant', text: reply }]);
    }, 800);
  };

  if (!currentInspection) return null;

  // Chart Data Formatting
  const damageDistData = currentInspection.detectedIssues.map(iss => ({
    name: iss.title,
    confidence: iss.confidence,
    damage: iss.damagePct
  }));

  const structCondData = [
    { subject: 'Foundation', score: currentInspection.structuralCondition.foundation },
    { subject: 'Columns', score: currentInspection.structuralCondition.columns },
    { subject: 'Beams', score: currentInspection.structuralCondition.beams },
    { subject: 'Roof', score: currentInspection.structuralCondition.roof },
    { subject: 'Walls', score: currentInspection.structuralCondition.walls },
    { subject: 'Floor', score: currentInspection.structuralCondition.floor },
    { subject: 'Road', score: currentInspection.structuralCondition.roadSurface },
    { subject: 'Drainage', score: currentInspection.structuralCondition.drainage }
  ];

  const safetyData = [
    { name: 'Worker Safety', score: currentInspection.safetyCompliance.workerSafety },
    { name: 'Scaffolding', score: currentInspection.safetyCompliance.scaffoldingSafety },
    { name: 'Electrical', score: currentInspection.safetyCompliance.electricalSafety },
    { name: 'Fire Safety', score: currentInspection.safetyCompliance.fireSafety },
    { name: 'PPE Compliance', score: currentInspection.safetyCompliance.ppeCompliance }
  ];

  const repairPriorityData = [
    { name: 'Immediate Repair', value: currentInspection.repairPriority.immediate, color: '#ef4444' },
    { name: 'Within 7 Days', value: currentInspection.repairPriority.repair7Days, color: '#f59e0b' },
    { name: 'Monitor Only', value: currentInspection.repairPriority.monitorOnly, color: '#10b981' }
  ];

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* 1. EXECUTIVE HEADER BANNER */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider text-white">AI Damage Detection & Structural Diagnostic</h1>
              <p className="text-xs text-white/60 mt-0.5">
                Computer vision defect detection, confidence scoring, color-coded bounding boxes, and repair estimates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="relative border border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-xl px-5 py-2.5 bg-cyan-500/10 text-center cursor-pointer transition-all shadow-md">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <span className="flex items-center space-x-2 text-cyan-300 font-bold">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Upload New Inspection Image</span>
            </span>
          </div>

          <button onClick={handleExportPDF} className="flex items-center space-x-1.5 px-4 py-2.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 rounded-xl font-bold font-mono transition-all">
            <Download className="w-4 h-4" />
            <span>PDF Report</span>
          </button>

          <button onClick={handleExportExcel} className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold font-mono transition-all">
            <FileText className="w-4 h-4" />
            <span>Excel Audit</span>
          </button>
        </div>
      </div>

      {/* 2. TOP SUMMARY METRICS & DAMAGE GAUGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Image Status & Report Badge */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-2">
          <span className="text-[10px] text-white/40 font-mono uppercase block font-bold">Inspection Status</span>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-base font-extrabold text-emerald-400 font-mono uppercase">{currentInspection.imageStatus}</span>
          </div>
          <span className="text-[10px] text-white/50 font-mono block">ID: {currentInspection.id} • {currentInspection.inspectionDate}</span>
        </div>

        {/* Circular Gauge: Structural Health */}
        <CircularGauge value={currentInspection.overallHealth} label="Overall Health" color="#10b981" icon={ShieldCheck} />

        {/* Circular Gauge: Overall Damage */}
        <CircularGauge value={currentInspection.overallDamage} label="Overall Damage" color="#ef4444" icon={AlertOctagon} />

        {/* Estimated Cost */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-2 border-yellow-500/20">
          <span className="text-[10px] text-yellow-400/80 font-mono uppercase block font-bold">Estimated Damage Cost</span>
          <p className="text-2xl font-extrabold text-yellow-400 font-mono">{formatIndianRupee(currentInspection.estimatedCost)}</p>
          <span className="text-[10px] text-white/50 font-mono block">Turnkey Material & Repair Labor</span>
        </div>
      </div>

      {/* 3. MAIN NAVIGATION TABS FOR INSPECTION WORKSPACE */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-white/10 text-xs font-mono font-bold">
        {[
          { id: 'visual', label: '📷 Computer Vision Bounding Boxes', icon: Eye },
          { id: 'report', label: '📋 Comprehensive AI Inspection Report', icon: FileText },
          { id: 'analytics', label: '📊 Visual Analytics Dashboard', icon: BarChart3 },
          { id: 'chat', label: '🤖 Defect Copilot Chat', icon: Sparkles }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-lg shadow-cyan-500/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: VISUAL COMPUTER VISION OVERLAY WITH BOUNDING BOXES */}
      {activeTab === 'visual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Image Canvas with Bounding Boxes (Cols 7) */}
          <div className="lg:col-span-7 glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3 text-xs">
              <div className="flex space-x-2 font-mono">
                <button 
                  onClick={() => setViewMode(viewMode === 'annotated' ? 'original' : 'annotated')}
                  className={`px-3.5 py-1.5 rounded-xl border transition-colors ${
                    viewMode === 'annotated' ? 'bg-cyan-500 text-black border-cyan-500 font-bold' : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  {viewMode === 'annotated' ? 'Color Overlay Active ✓' : 'Original Feed'}
                </button>
              </div>

              <div className="flex items-center space-x-2 text-white/60">
                <button onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))} className="p-2 hover:bg-white/5 rounded-lg"><ZoomOut className="w-4 h-4" /></button>
                <span className="font-mono text-[11px] font-bold text-cyan-400">{Math.round(zoomScale * 100)}%</span>
                <button onClick={() => setZoomScale(prev => Math.min(2.5, prev + 0.25))} className="p-2 hover:bg-white/5 rounded-lg"><ZoomIn className="w-4 h-4" /></button>
                <button onClick={() => setZoomScale(1)} className="p-2 hover:bg-white/5 rounded-lg text-[10px] font-mono text-white/70">Reset</button>
              </div>
            </div>

            {/* Bounding Box Image Container */}
            <div className="relative aspect-[4/3] w-full bg-[#02040b] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
              <div 
                className="relative w-full h-full transition-transform duration-200"
                style={{ transform: `scale(${zoomScale})` }}
              >
                <img 
                  src={currentInspection.imageUrl} 
                  alt="Defect Target" 
                  className="w-full h-full object-cover select-none"
                />

                {/* Laser Scan animation */}
                {isScanning && (
                  <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400/80 top-0 animate-[bounce_2s_infinite]"></div>
                )}

                {/* COLOR-CODED BOUNDING BOXES WITH CONFIDENCE % */}
                {!isScanning && viewMode === 'annotated' && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {currentInspection.detectedIssues.map((iss, idx) => {
                      const colorScheme = getDamageColor(iss.damagePct);
                      return (
                        <g key={idx}>
                          <rect 
                            x={iss.box.x} 
                            y={iss.box.y} 
                            width={iss.box.w} 
                            height={iss.box.h} 
                            fill={colorScheme.fill} 
                            stroke={colorScheme.stroke} 
                            strokeWidth="1.8" 
                            strokeDasharray="2,2"
                          />
                          <foreignObject x={iss.box.x} y={Math.max(2, iss.box.y - 8)} width="90" height="24">
                            <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-white/20 text-white shadow-lg whitespace-nowrap">
                              <span className={`w-2 h-2 rounded-full ${colorScheme.bg}`}></span>
                              <span className="text-[6px] font-mono font-extrabold uppercase text-white">
                                {iss.title} • <strong className="text-cyan-300">{iss.confidence}%</strong>
                              </span>
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>

            {/* Bounding Box Legend */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono">
              <span className="text-white/50 font-bold uppercase">Damage Severity Scale:</span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span className="text-white/80">0–25% (Low)</span></span>
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span className="text-white/80">26–50% (Moderate)</span></span>
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span><span className="text-white/80">51–75% (Substantial)</span></span>
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span className="text-white/80">76–100% (Critical)</span></span>
              </div>
            </div>
          </div>

          {/* Right Column: Detected Issues List with Confidence Scores (Cols 5) */}
          <div className="lg:col-span-5 glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-mono border-b border-white/5 pb-3">
              <AlertTriangle className="w-4 h-4 text-cyan-400" />
              <span>Detected Issues ({currentInspection.detectedIssues.length} Identified)</span>
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {currentInspection.detectedIssues.map((iss, idx) => {
                const colors = getDamageColor(iss.damagePct);
                return (
                  <div key={iss.id} className="bg-slate-950 p-4 rounded-xl border border-white/10 space-y-2 hover:border-cyan-500/40 transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm font-sans flex items-center space-x-2">
                        <span className="text-cyan-400">{idx + 1}.</span>
                        <span>{iss.title}</span>
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${colors.border} ${colors.text} bg-white/5`}>
                        {iss.severity} Severity
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-white/5 p-2 rounded-lg">
                        <span className="text-[9px] text-white/40 block">Confidence Score</span>
                        <span className="text-cyan-300 font-extrabold">{iss.confidence}%</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-lg">
                        <span className="text-[9px] text-white/40 block">Damage Severity</span>
                        <span className={`font-extrabold ${colors.text}`}>{iss.damagePct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPREHENSIVE MANDATED REPORT LEDGER */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* CARD 1: OVERALL RISK SCORE BREAKDOWN */}
            <div className="glass-panel p-5 rounded-2xl space-y-3 border-white/10">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-mono border-b border-white/5 pb-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Overall Risk Score</span>
              </h3>

              <div className="space-y-3 font-mono text-xs pt-1">
                <div className="bg-slate-950 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-emerald-400 font-bold">Low Risk</span>
                  <span className="font-extrabold text-white text-base">{currentInspection.riskScore.low}%</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-amber-400 font-bold">Medium Risk</span>
                  <span className="font-extrabold text-white text-base">{currentInspection.riskScore.medium}%</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                  <span className="text-rose-400 font-bold">High Risk</span>
                  <span className="font-extrabold text-white text-base">{currentInspection.riskScore.high}%</span>
                </div>
              </div>
            </div>

            {/* CARD 2: STRUCTURAL CONDITION BREAKDOWN */}
            <div className="glass-panel p-5 rounded-2xl space-y-3 border-white/10">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-mono border-b border-white/5 pb-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Structural Condition Ratings</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-1">
                {Object.entries(currentInspection.structuralCondition).map(([key, val]) => (
                  <div key={key} className="bg-slate-950 p-2.5 rounded-xl border border-white/5 flex justify-between items-center">
                    <span className="text-white/60 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-extrabold text-cyan-300">{val}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 3: SAFETY COMPLIANCE & REPAIR PRIORITY */}
            <div className="glass-panel p-5 rounded-2xl space-y-3 border-white/10">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-mono border-b border-white/5 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Safety Compliance & Repair Priority</span>
              </h3>

              <div className="space-y-3 font-mono text-xs pt-1">
                <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[10px] text-white/40 block font-bold uppercase">Safety Compliance Metrics</span>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/70">Worker Safety: <strong className="text-emerald-400">{currentInspection.safetyCompliance.workerSafety}%</strong></span>
                    <span className="text-white/70">PPE: <strong className="text-emerald-400">{currentInspection.safetyCompliance.ppeCompliance}%</strong></span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[10px] text-white/40 block font-bold uppercase">Repair Priority Ledger</span>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between"><span className="text-rose-400">Immediate Repair:</span><strong className="text-white">{currentInspection.repairPriority.immediate}%</strong></div>
                    <div className="flex justify-between"><span className="text-amber-400">Within 7 Days:</span><strong className="text-white">{currentInspection.repairPriority.repair7Days}%</strong></div>
                    <div className="flex justify-between"><span className="text-emerald-400">Monitor Only:</span><strong className="text-white">{currentInspection.repairPriority.monitorOnly}%</strong></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* AI RECOMMENDATION BOX */}
          <div className="glass-panel p-6 rounded-2xl border-cyan-500/30 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-mono text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span>AI Expert Repair Recommendation</span>
            </h3>
            <p className="text-xs text-white/80 leading-relaxed font-mono bg-slate-950 p-4 rounded-xl border border-white/10">
              {currentInspection.aiRecommendation}
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: RECHARTS VISUAL ANALYTICS DASHBOARD */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CHART 1: DAMAGE DISTRIBUTION */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Damage Distribution & Confidence (%)</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={damageDistData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d1a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="confidence" fill="#38bdf8" name="Confidence %" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="damage" fill="#ef4444" name="Damage Severity %" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 2: STRUCTURAL CONDITION RADAR */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Structural Condition Radar (%)</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={structCondData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" stroke="#cbd5e1" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={8} />
                  <Radar name="Condition" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d1a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 3: SAFETY COMPLIANCE BAR */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
              <span>Safety Compliance Ratings (%)</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safetyData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d1a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="score" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 4: REPAIR PRIORITY DONUT PIE */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Repair Priority Ledger (%)</span>
            </h3>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={repairPriorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {repairPriorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#090d1a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: DEFECT COPILOT CHAT */}
      {activeTab === 'chat' && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Damage Inspection AI Copilot</h3>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-white/10 space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto font-mono text-xs">
            {chatHistory.map((chat, idx) => (
              <div key={idx} className={`p-3 rounded-xl ${chat.role === 'assistant' ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/20' : 'bg-white/5 text-white'}`}>
                <span className="font-bold block text-[9px] uppercase tracking-wider mb-1 text-white/50">{chat.role === 'assistant' ? 'AI Damage Assistant' : 'Inspector'}</span>
                <p className="leading-relaxed">{chat.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="flex space-x-2">
            <input 
              type="text" 
              value={chatMsg} 
              onChange={(e) => setChatMsg(e.target.value)} 
              placeholder="Ask about defect severity, repair steps, cost breakdown, or safety code compliance..." 
              className="flex-1 bg-slate-950 border border-white/10 focus:border-cyan-500/60 rounded-xl px-4 py-3 text-xs text-white focus:outline-none font-mono" 
            />
            <button type="submit" className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 4. HISTORY LEDGER */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Inspection Audit Ledger</h3>
          
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-white/35" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by defect, project..."
              className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-white/5 text-white/45 uppercase text-[10px] bg-white/5">
                <th className="p-3">ID / Date</th>
                <th className="p-3">Project Site</th>
                <th className="p-3">Health / Damage</th>
                <th className="p-3">Primary Issue</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Estimated Cost</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {history.filter(h => h.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || h.id.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-bold text-cyan-400">{item.id}<br/><span className="text-[10px] font-normal text-white/40">{item.inspectionDate}</span></td>
                  <td className="p-3 font-semibold text-white font-sans">{item.projectName}</td>
                  <td className="p-3">
                    <span className="text-emerald-400 font-bold">{item.overallHealth}% Health</span> / <span className="text-rose-400 font-bold">{item.overallDamage}% Dmg</span>
                  </td>
                  <td className="p-3 font-sans font-bold text-white">{item.detectedIssues[0]?.title || 'Concrete Crack'}</td>
                  <td className="p-3 text-cyan-300 font-bold">{item.detectedIssues[0]?.confidence || 98.7}%</td>
                  <td className="p-3 text-yellow-400 font-bold">{formatIndianRupee(item.estimatedCost)}</td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => {
                        setCurrentInspection(item);
                        setActiveTab('visual');
                        setZoomScale(1);
                      }}
                      className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold text-xs inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
