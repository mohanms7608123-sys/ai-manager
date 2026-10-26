'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wrench, Lock, Mail, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';

import { setAuthSession } from '@/lib/auth';

export default function ContractorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('skyline@construction.com');
  const [password, setPassword] = useState('Skyline@123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (email.includes('@') && password.length >= 4) {
        setAuthSession('Contractor', email);
        router.push('/contractor/dashboard');
      } else {
        setError('Invalid contractor credentials.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#12131a] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans grid-bg">
      {/* Construction Orange Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#f97316]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[140px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-panel w-full max-w-md rounded-2xl p-8 relative z-10 border border-[#f97316]/20 shadow-2xl shadow-[#f97316]/5 space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-[#f97316]/10 border border-[#f97316]/20 rounded-2xl mb-4">
            <Wrench className="w-6 h-6 text-[#f97316]" />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-[#f97316]">Contractor Portal</h1>
          <p className="text-[10px] text-white/50 uppercase mt-1 font-mono tracking-wider">Prime Contractor Site Operations Login</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Company Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                <Mail className="w-4 h-4 text-[#f97316]/60" />
              </span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="apex.contractor@build.com"
                className="w-full bg-[#080910] border border-white/5 focus:border-[#f97316]/40 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#f97316]/10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-bold block">Password</label>
              <Link href="/forgot-password" className="text-[9px] text-[#f97316] font-bold hover:underline">Forgot Password?</Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                <Lock className="w-4 h-4 text-[#f97316]/60" />
              </span>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#080910] border border-white/5 focus:border-[#f97316]/40 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#f97316]/10"
              />
            </div>
          </div>

          {/* BUTTON 1: LOGIN */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg uppercase tracking-wider disabled:opacity-40"
          >
            <span>{isLoading ? 'Connecting Contractor Operations...' : 'Login'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* BUTTON 2: REGISTER CONTRACTOR */}
        <div className="pt-2">
          <Link 
            href="/contractor/register"
            className="w-full flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[#f97316] font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-wider"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Contractor</span>
          </Link>
        </div>

        {/* Security Stamp */}
        <div className="border-t border-white/5 pt-4 flex items-center justify-center space-x-2 text-[9px] text-white/30 font-mono">
          <ShieldCheck className="w-4 h-4 text-[#f97316]/60" />
          <span>LICENSED PRIME CONTRACTOR OPERATIONS GATEWAY</span>
        </div>
      </motion.div>
    </div>
  );
}
