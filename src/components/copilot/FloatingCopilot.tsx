'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Bot, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Settings, 
  ShieldAlert, 
  Activity, 
  Maximize2, 
  Minimize2,
  Brain
} from 'lucide-react';
import { MOCK_COPILOT_CONTEXTS } from '@/lib/mockData';


export default function FloatingCopilot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [context, setContext] = useState({
    role: 'Global AI Assistant',
    intro: 'Select any page to activate specific AI personas.',
    metrics: ['Ready to analyze site operations...'] as string[],
    suggestions: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect path changes and update AI Copilot Persona
  // eslint-disable-next-line react-hooks/set-state-in-effect
useEffect(() => {
    const matchedPath = Object.keys(MOCK_COPILOT_CONTEXTS).find(path => pathname.startsWith(path));
    if (matchedPath) {
      const activeCtx = MOCK_COPILOT_CONTEXTS[matchedPath];
      setContext(activeCtx);
      setChatLog([
        { sender: 'ai', text: activeCtx.intro }
      ]);
    } else {
      setContext({
        role: 'Site General AI',
        intro: 'Welcome to AI Smart Construction Manager. Navigate to see me morph into specific engineering profiles.',
        metrics: [
          '3D Twin: Active',
          'Global Safety Code: 88%',
          'Weather: Stable 34°C'
        ],
        suggestions: [
          'Inspect active projects in Noida.',
          'Review equipment telematic health logs.',
          'Analyze materials waste percentages.'
        ]
      });
      setChatLog([
        { sender: 'ai', text: 'Welcome to AI Smart Construction Manager. Navigate to see me morph into specific engineering profiles.' }
      ]);
    }
  }, [pathname]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setChatLog(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathname, query: userText, role: context.role })
      });
      const data = await response.json();
      if (data.success) {
        setChatLog(prev => [...prev, { sender: 'ai', text: data.content }]);
      } else {
        setChatLog(prev => [...prev, { sender: 'ai', text: "Error fetching AI response: " + data.error }]);
      }
    } catch (err) {
      setChatLog(prev => [...prev, { sender: 'ai', text: "Error syncing with AI engine. Fallback simulator offline." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonaColor = () => {
    if (pathname.includes('budget')) return 'from-amber-500 to-yellow-600 border-amber-500/30';
    if (pathname.includes('safety')) return 'from-rose-500 to-red-600 border-rose-500/30';
    if (pathname.includes('workers')) return 'from-teal-500 to-emerald-600 border-teal-500/30';
    if (pathname.includes('materials')) return 'from-blue-500 to-indigo-600 border-blue-500/30';
    if (pathname.includes('3d-twin')) return 'from-cyan-500 to-blue-600 border-cyan-500/30';
    if (pathname.includes('equipment')) return 'from-purple-500 to-pink-600 border-purple-500/30';
    if (pathname.includes('analytics')) return 'from-emerald-500 to-teal-600 border-emerald-500/30';
    return 'from-cyan-500 to-blue-600 border-cyan-500/30';
  };

  const getPersonaIcon = () => {
    if (pathname.includes('budget')) return <TrendingUp className="w-5 h-5 text-yellow-400" />;
    if (pathname.includes('safety')) return <ShieldAlert className="w-5 h-5 text-red-400" />;
    if (pathname.includes('workers')) return <Settings className="w-5 h-5 text-emerald-400" />;
    if (pathname.includes('materials')) return <Activity className="w-5 h-5 text-blue-400" />;
    if (pathname.includes('3d-twin')) return <Maximize2 className="w-5 h-5 text-cyan-400" />;
    if (pathname.includes('equipment')) return <Bot className="w-5 h-5 text-purple-400" />;
    if (pathname.includes('analytics')) return <Brain className="w-5 h-5 text-teal-400" />;
    return <Bot className="w-5 h-5 text-cyan-400" />;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Copilot Chat Window */}
      {isOpen && (
        <div className={`glass-panel w-96 max-h-[580px] rounded-2xl flex flex-col mb-4 overflow-hidden shadow-2xl transition-all duration-300 ${isExpanded ? 'h-[580px]' : 'h-[440px]'}`}>
          {/* Header */}
          <div className={`p-4 bg-gradient-to-r ${getPersonaColor()} flex items-center justify-between border-b border-white/10`}>
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-black/35 rounded-lg">
                {getPersonaIcon()}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide">{context.role}</h3>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow"></span>
                  <span className="text-[10px] text-white/70">Context Aware</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white/80 hover:text-white transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors font-bold text-sm bg-black/20 hover:bg-black/30 rounded-md px-2 py-0.5"
              >
                ×
              </button>
            </div>
          </div>

          {/* Persona Insights Panel */}
          <div className="bg-black/30 p-3.5 border-b border-white/5 text-xs">
            <div className="flex items-center space-x-1.5 mb-1.5 font-semibold text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Realtime Diagnostic Diagnostic Diagnostics</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2 text-white/80">
              {context.metrics.map((metric, i) => (
                <div key={i} className="bg-white/5 border border-white/5 rounded-md px-2 py-1.5 flex items-center space-x-1.5">
                  <span className="w-1 h-1.5 bg-cyan-400 rounded-full"></span>
                  <span className="truncate">{metric}</span>
                </div>
              ))}
            </div>
            {context.suggestions.length > 0 && (
              <div className="space-y-1 mt-2">
                <span className="text-[10px] text-white/40 block uppercase tracking-wider font-semibold">Recommended Operations</span>
                {context.suggestions.map((sug, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setInput(sug);
                    }}
                    className="text-left w-full truncate text-[11px] text-white/70 hover:text-cyan-300 block hover:underline transition-all"
                  >
                    💡 {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/10">
            {chatLog.map((chat, idx) => (
              <div 
                key={idx} 
                className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                  chat.sender === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-none' 
                    : 'bg-white/10 text-white/90 border border-white/5 rounded-tl-none font-mono whitespace-pre-line'
                }`}>
                  {chat.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-center space-x-2 bg-white/5 border border-white/5 rounded-xl rounded-tl-none p-3 max-w-[50%]">
                <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce"></span>
                <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-slate-950/80 flex items-center space-x-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${context.role}...`}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 disabled:opacity-40 hover:from-cyan-400 hover:to-blue-400 rounded-xl text-white transition-all shadow-md shadow-cyan-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 border border-cyan-400/20 text-white shadow-lg hover:shadow-cyan-500/35 hover:scale-105 transition-all duration-300"
      >
        <span className="absolute inset-0 rounded-full bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity animate-ping"></span>
        <Bot className="w-6 h-6 animate-pulse" />
        <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
        </span>
      </button>
    </div>
  );
}
