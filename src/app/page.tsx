'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Bot, 
  ArrowRight, 
  Cpu, 
  Box, 
  LineChart, 
  ShieldAlert, 
  Sparkles, 
  Wrench,
  CheckCircle,
  Building2,
  Hammer,
  QrCode,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-[#050711] text-slate-100 relative overflow-hidden font-sans grid-bg">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[180px] pointer-events-none"></div>

      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-white/5 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-md shadow-cyan-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-wider text-white uppercase">AI Smart Construction</span>
            <span className="text-[10px] text-cyan-400 font-mono tracking-widest block uppercase">Manager</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-xs font-semibold tracking-wide text-white/70">
          <a href="#portals" className="hover:text-cyan-400 transition-colors">Portals Select</a>
          <a href="#features" className="hover:text-cyan-400 transition-colors">AI Core</a>
          <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing Plans</a>
          <a href="#faq" className="hover:text-cyan-400 transition-colors">Platform FAQ</a>
        </div>

        <div className="flex items-center space-x-3 text-xs font-semibold">
          <Link href="/client/login" className="text-white/80 hover:text-white px-3 py-2 transition-colors">
            Client Login
          </Link>
          <Link href="/contractor/login" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-cyan-500/10">
            Contractor Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/25 rounded-full px-4 py-1.5 mb-6"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-cyan-300 uppercase tracking-widest font-mono">Enterprise Role-Based Access Control (RBAC) System</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight"
        >
          AI-Smart Construction Manager <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">Connected Workflows & Role Portals</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/60 text-sm max-w-2xl mx-auto mt-4 leading-relaxed"
        >
          Select your designated portal below. Every role operates through an independent, secure terminal with dedicated permissions, workflow notifications, approvals, and persistent data.
        </motion.p>

        {/* 5 DEDICATED PORTAL CARDS (ADMIN, CLIENT, ENGINEER, CONTRACTOR, WORKER) */}
        <div id="portals" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl mx-auto mt-12 text-left">
          
          {/* Card 1: Admin Portal */}
          <div className="bg-[#0b1329] border border-[#fbbf24]/30 hover:border-[#fbbf24]/60 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-[#fbbf24]/5 transition-all group hover:scale-[1.02]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#fbbf24]/10 flex items-center justify-center mb-3 border border-[#fbbf24]/30">
                <Cpu className="w-5 h-5 text-[#fbbf24]" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-[#fbbf24] transition-colors">Admin Portal</h2>
              <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
                Super Admin terminal. Global master control over Clients, Engineers, Contractors, Workers, and PDF/Excel report exports.
              </p>
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1 text-[9px] text-white/40 font-mono">
                <p>• Full Platform CRUD Control</p>
                <p>• Manage All User Roles</p>
                <p>• PDF & Excel Reports</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/admin/login" className="w-full flex items-center justify-center space-x-1.5 bg-[#fbbf24] hover:bg-[#d97706] text-black font-bold py-2.5 rounded-xl transition-all shadow-md text-xs uppercase tracking-wider">
                <span>Admin Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Client Portal */}
          <div className="bg-slate-50 border border-slate-200 hover:border-[#1e3a8a]/50 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all group hover:scale-[1.02] text-slate-800">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#1e3a8a]/10 flex items-center justify-center mb-3 border border-[#1e3a8a]/20">
                <Building2 className="w-5 h-5 text-[#1e3a8a]" />
              </div>
              <h2 className="text-sm font-bold text-[#1e3a8a] uppercase tracking-wider transition-colors">Client Portal</h2>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                Create new construction projects, request approved engineers, track budget forecasts in ₹, and audit milestone progress.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200 space-y-1 text-[9px] text-slate-500 font-mono">
                <p>• Create Construction Projects</p>
                <p>• Request Approved Engineers</p>
                <p>• Track ₹ Budget & Milestones</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/client/login" className="w-full flex items-center justify-center space-x-1.5 bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold py-2.5 rounded-xl transition-all shadow-md text-xs uppercase tracking-wider">
                <span>Client Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Engineer Portal */}
          <div className="bg-[#191b24] border border-[#eab308]/30 hover:border-[#eab308]/60 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-[#eab308]/5 transition-all group hover:scale-[1.02]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#eab308]/10 flex items-center justify-center mb-3 border border-[#eab308]/30">
                <Hammer className="w-5 h-5 text-[#eab308]" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-[#eab308] transition-colors">Engineer Portal</h2>
              <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
                Review client requests, approve/reject technical specs, assign approved contractors, and submit structural site logs.
              </p>
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1 text-[9px] text-white/40 font-mono">
                <p>• Technical Project Reviews</p>
                <p>• Assign Approved Contractors</p>
                <p>• Structural Site Audit Logs</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/engineer/login" className="w-full flex items-center justify-center space-x-1.5 bg-[#eab308] hover:bg-[#ca8a04] text-black font-bold py-2.5 rounded-xl transition-all shadow-md text-xs uppercase tracking-wider">
                <span>Engineer Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Contractor Portal */}
          <div className="bg-[#12131a] border border-[#f97316]/30 hover:border-[#f97316]/60 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-[#f97316]/5 transition-all group hover:scale-[1.02]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#f97316]/10 flex items-center justify-center mb-3 border border-[#f97316]/30">
                <Wrench className="w-5 h-5 text-[#f97316]" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-[#f97316] transition-colors">Contractor Portal</h2>
              <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
                Accept project assignments, mobilize site crews, register workers with auto QR codes, manage salary ledgers & attendance.
              </p>
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1 text-[9px] text-white/40 font-mono">
                <p>• Accept/Mobilize Projects</p>
                <p>• Register Workers & Issue QRs</p>
                <p>• Attendance & Salary Ledger</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/contractor/login" className="w-full flex items-center justify-center space-x-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-2.5 rounded-xl transition-all shadow-md text-xs uppercase tracking-wider">
                <span>Contractor Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 5: Worker Portal */}
          <div className="bg-[#05110d] border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-emerald-500/5 transition-all group hover:scale-[1.02]">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 border border-emerald-500/30">
                <QrCode className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Worker Portal</h2>
              <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
                Worker access terminal. Displays contractor-marked attendance status, daily assigned tasks & salary ledger.
              </p>
              <div className="mt-4 pt-3 border-t border-white/5 space-y-1 text-[9px] text-white/40 font-mono">
                <p>• QR Code Authentication</p>
                <p>• Contractor-Marked Attendance</p>
                <p>• View Tasks & Apply Leave</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/worker/login" className="w-full flex items-center justify-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md text-xs uppercase tracking-wider">
                <span>Worker Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16 relative z-10 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-wider">Connected Enterprise Workflows</h2>
          <p className="text-white/50 text-xs sm:text-sm mt-3">Every role interacts with the others seamlessly through real notifications, approvals, and permissions.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants} className="glass-panel glass-panel-hover rounded-2xl p-6">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl w-12 h-12 flex items-center justify-center text-cyan-400 mb-5">
              <Box className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">3D BIM Digital Twin</h3>
            <p className="text-white/60 text-xs mt-3 leading-relaxed">
              Interact with procedural structures. Inspect electrical loops, piping channels, and structural alignment offsets via customizable layer controllers.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel glass-panel-hover rounded-2xl p-6">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl w-12 h-12 flex items-center justify-center text-blue-400 mb-5">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Role-Aware AI Assistant</h3>
            <p className="text-white/60 text-xs mt-3 leading-relaxed">
              Our bot mutates depending on the active user role. Instantly access material logistics warnings, telemetry alerts, budget summaries, and site incident logs.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel glass-panel-hover rounded-2xl p-6">
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl w-12 h-12 flex items-center justify-center text-teal-400 mb-5">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">HSE Safety Scanning AI</h3>
            <p className="text-white/60 text-xs mt-3 leading-relaxed">
              Upload job-site cameras. AI automatically analyzes PPE conformance (hardhat tags), structural cement crack alerts, and zone boundary violations.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Pricing Plans */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 relative z-10 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-wider">Enterprise Pricing</h2>
          <p className="text-white/50 text-xs sm:text-sm mt-3">SaaS plans tailored to subcontractors, developers, and global infrastructure companies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel rounded-2xl p-6 bg-slate-900/25 flex flex-col justify-between border-white/5">
            <div>
              <span className="text-[10px] text-cyan-400 font-mono tracking-widest font-semibold uppercase">Starter Team</span>
              <p className="text-3xl font-extrabold text-white mt-4">$1,200<span className="text-xs text-white/50 font-normal"> / month</span></p>
              <p className="text-white/60 text-xs mt-3">Perfect for local sub-contractors managing up to 2 active projects.</p>
              <ul className="space-y-2.5 mt-6 text-xs text-white/80">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>2 Active Projects</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Standard 3D Twin Viewer</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Materials & Workers tracking</span>
                </li>
              </ul>
            </div>
            <Link href="/client/login" className="mt-8 w-full text-center py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold transition-colors block border border-white/5">
              Select Starter Plan
            </Link>
          </div>

          <div className="glass-panel rounded-2xl p-6 bg-cyan-950/15 flex flex-col justify-between border-cyan-500/25 relative scale-105 shadow-xl shadow-cyan-500/5">
            <span className="absolute -top-3.5 right-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-mono text-[9px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md shadow-md">
              Most Popular
            </span>
            <div>
              <span className="text-[10px] text-cyan-400 font-mono tracking-widest font-semibold uppercase">Builder Pro</span>
              <p className="text-3xl font-extrabold text-white mt-4">$3,500<span className="text-xs text-white/50 font-normal"> / month</span></p>
              <p className="text-white/60 text-xs mt-3">Tailored for medium contracting firms handling civil & MEP works.</p>
              <ul className="space-y-2.5 mt-6 text-xs text-white/80">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>10 Active Projects</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Fully interactive 3D Twins</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>AI Copilot Active Personas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>AI Crack & PPE Photo Scan (1,000/mo)</span>
                </li>
              </ul>
            </div>
            <Link href="/contractor/login" className="mt-8 w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-xs font-semibold text-white transition-all shadow-md shadow-cyan-500/10 block">
              Start Builder Pro Trial
            </Link>
          </div>

          <div className="glass-panel rounded-2xl p-6 bg-slate-900/25 flex flex-col justify-between border-white/5">
            <div>
              <span className="text-[10px] text-cyan-400 font-mono tracking-widest font-semibold uppercase">Enterprise System</span>
              <p className="text-3xl font-extrabold text-white mt-4">Contact Sales</p>
              <p className="text-white/60 text-xs mt-3">For national builders, metro systems, and corporate portfolio planners.</p>
              <ul className="space-y-2.5 mt-6 text-xs text-white/80">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Unlimited Projects</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Custom BIM API integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Unlimited Photo & Blueprint OCR</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>SLA Guarantee & Dedicated Architect</span>
                </li>
              </ul>
            </div>
            <Link href="/admin/login" className="mt-8 w-full text-center py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold transition-colors block border border-white/5">
              Enquire Corporate
            </Link>
          </div>
        </div>
      </section>

      {/* Platform FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 relative z-10 border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wider">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-5">
          <div className="glass-panel rounded-xl p-5 bg-slate-900/10 border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">How does the connected workflow system work?</h3>
            <p className="text-white/60 text-xs mt-2 leading-relaxed">
              When a Client submits a project and selects an engineer, the status shifts to Waiting for Engineer Approval and notifies the Engineer. Once the Engineer approves, they assign a Contractor. Once the Contractor accepts, construction begins.
            </p>
          </div>
          <div className="glass-panel rounded-xl p-5 bg-slate-900/10 border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">How are workers authenticated?</h3>
            <p className="text-white/60 text-xs mt-2 leading-relaxed">
              Contractors register workers and issue QR codes & credentials. Workers log in via the dedicated Worker Portal (/worker/login). Attendance is controlled and marked manually by the Contractor.
            </p>
          </div>
          <div className="glass-panel rounded-xl p-5 bg-slate-900/10 border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">What happens after 5 failed login attempts for a worker?</h3>
            <p className="text-white/60 text-xs mt-2 leading-relaxed">
              If a worker enters the wrong password 5 times, the account is automatically locked (isLocked: true) and a critical alert is sent to the Contractor. The Contractor can click Unlock Account in Contractor Worker Management to restore access.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/85 pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-white/5">
          <div>
            <div className="flex items-center space-x-2.5 mb-4">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">AI Construction Manager</span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed max-w-xs">
              Enterprise Digital Twins, Role-Based Access Control, Predictive BIM Modeling, and Personnel Safety Auditing Systems.
            </p>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Role Portals</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-white/50 font-semibold font-mono">
              <Link href="/admin/login" className="hover:text-yellow-400">• Admin Portal</Link>
              <Link href="/client/login" className="hover:text-blue-400">• Client Portal</Link>
              <Link href="/engineer/login" className="hover:text-yellow-400">• Engineer Portal</Link>
              <Link href="/contractor/login" className="hover:text-orange-400">• Contractor Portal</Link>
              <Link href="/worker/login" className="hover:text-emerald-400">• Worker Portal</Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">System Digest</h3>
            <p className="text-white/55 text-xs mb-3">Enterprise multi-role construction management system.</p>
            <div className="flex space-x-2">
              <input type="email" placeholder="work@corporate.com" className="bg-white/5 border border-white/5 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500 flex-1 text-white" />
              <button className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">Join</button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40">
          <span>© {new Date().getFullYear()} AI Smart Construction Manager. All rights reserved.</span>
          <div className="flex space-x-6 mt-4 sm:mt-0 font-medium">
            <a href="#" className="hover:text-white">Privacy Clause</a>
            <a href="#" className="hover:text-white">Terms of Use</a>
            <a href="#" className="hover:text-white">Enterprise Compliance Info</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
