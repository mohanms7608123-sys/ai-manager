'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Cpu, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setSuccess('Recovery link dispatched. Check your mailbox to reset your encryption credentials.');
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#060813] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans grid-bg">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-md rounded-2xl p-8 relative z-10"
      >
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/25 mb-4 animate-float">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-extrabold uppercase tracking-wider text-white">Reset Key</h2>
          <p className="text-xs text-white/50 mt-1.5">Recover credentials for Construction Console</p>
        </div>

        {success && (
          <div className="mb-5 bg-cyan-500/10 border border-cyan-500/25 rounded-xl p-3 text-xs text-cyan-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono font-semibold block mb-2">Corporate Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-white/35">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="foreman@autodesk-partner.com"
                className="w-full bg-slate-950/80 border border-white/5 focus:border-cyan-500/50 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 disabled:opacity-40"
          >
            <span>{isLoading ? 'Releasing system reset packet...' : 'Dispatch Reset Packet'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-white/45 font-medium">
          Remembered credentials?{' '}
          <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline">Return to Login</Link>
        </div>

        <div className="mt-8 border-t border-white/5 pt-4 flex items-center justify-center space-x-2 text-[10px] text-white/35 font-mono">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>FIPS 140-2 Encrypted Token Dispatch</span>
        </div>
      </motion.div>
    </div>
  );
}
