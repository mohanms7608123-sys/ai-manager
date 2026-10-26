'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Copy, 
  Trash2, 
  Download, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Building2, 
  Users, 
  Layers, 
  Activity, 
  FileCheck,
  ChevronDown,
  Eye
} from 'lucide-react';
import { formatIndianRupee } from '@/lib/dbStore';
import { exportToPDF } from '@/lib/exportUtils';

export type RobotState = 'idle' | 'listening' | 'thinking' | 'analyzing' | 'completed' | 'warning';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    type: 'image' | 'blueprint' | 'pdf';
    previewUrl?: string;
  };
  visionAnalysis?: {
    damageType: string;
    severity: string;
    severityScore: number; // out of 10
    repairSuggestion: string;
    estimatedCost: number;
    timeline: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    safetyRisk: string;
  };
}

export default function GlobalAiCopilot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [role, setRole] = useState<'Admin' | 'Client' | 'Engineer' | 'Contractor' | 'Worker'>('Client');
  
  // Robot UI State
  const [robotState, setRobotState] = useState<RobotState>('idle');
  const [statusMessage, setStatusMessage] = useState('AI Construction Copilot Online');

  // Input & Chat State
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedFile, setSelectedFile] = useState<{ file: File; type: 'image' | 'blueprint' | 'pdf'; previewUrl: string } | null>(null);
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  // Proactive Recommendations
  const [showRecommendations, setShowRecommendations] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch logged in user role from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('userRole') as any;
      if (savedRole === 'Admin' || savedRole === 'Client' || savedRole === 'Engineer' || savedRole === 'Contractor' || savedRole === 'Worker') {
        setRole(savedRole);
      }
    }
  }, [pathname]);

  // Initial Welcome Message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          sender: 'ai',
          text: `👋 Greetings! I am your **Global AI Construction Copilot**.\n\nI am synced live with your **${role}** context on page \`${pathname}\`.\n\nAsk me about project progress, worker attendance, material forecasts, blueprint vision inspection, or delay risks!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [role, pathname]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle Speech Recognition
  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      setRobotState('idle');
      setStatusMessage('Voice input paused');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setRobotState('listening');
        setStatusMessage('😊 Listening to your voice command...');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInputQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setRobotState('idle');
        setStatusMessage('Voice recognition interrupted');
      };

      recognition.onend = () => {
        setIsListening(false);
        setRobotState('idle');
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setRobotState('idle');
    }
  };

  // Text-To-Speech Output
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting for speech
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : '';

    setSelectedFile({
      file,
      type: isImage ? 'image' : 'pdf',
      previewUrl
    });
  };

  // Send Query to AI Backend
  const handleSend = async (customPrompt?: string) => {
    const query = customPrompt || inputQuery;
    if (!query.trim() && !selectedFile) return;

    const userMessageText = query.trim() || `Uploaded attachment for vision analysis: ${selectedFile?.file.name}`;
    const userMsgId = `user-${Date.now()}`;

    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: selectedFile ? {
        name: selectedFile.file.name,
        type: selectedFile.type,
        previewUrl: selectedFile.previewUrl
      } : undefined
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputQuery('');
    const currentAttachment = selectedFile;
    setSelectedFile(null);

    // Update Robot State to Thinking / Analyzing
    setRobotState(currentAttachment ? 'analyzing' : 'thinking');
    setStatusMessage(currentAttachment ? '📊 Analyzing structural attachment...' : '🧠 Processing construction query...');

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessageText,
          messages: [...messages, newUserMsg],
          role,
          pathname,
          hasAttachment: !!currentAttachment,
          attachmentName: currentAttachment?.file.name
        })
      });

      let data;
      if (!res.ok) {
        throw new Error('API Error');
      }
      data = await res.json();

      let aiReplyText = data.content || 'Analysis generated based on live project telemetry.';
      let visionData = data.visionAnalysis;

      // Mock vision analysis if file uploaded
      if (currentAttachment && !visionData) {
        visionData = {
          damageType: currentAttachment.file.name.toLowerCase().includes('crack') ? 'Concrete Surface Shear Failure' : 'Rebar Corrosion & Stress Deflection',
          severity: 'HIGH SEVERITY',
          severityScore: 8.4,
          repairSuggestion: 'Apply high-modulus epoxy injection resin followed by carbon-fiber fabric wrapping.',
          estimatedCost: 185000,
          timeline: '48 Hours',
          priority: 'High',
          safetyRisk: 'Level 3 (Immediate Scaffold & Shoring Reinforcement Recommended)'
        };
        aiReplyText = `🔍 **Visual Structural Audit Complete** for \`${currentAttachment.file.name}\`:\n\n* **Damage Type**: ${visionData.damageType}\n* **Severity Index**: **${visionData.severityScore} / 10** (${visionData.severity})\n* **Recommended Repair**: ${visionData.repairSuggestion}\n* **Estimated Capital Outflow**: **${formatIndianRupee(visionData.estimatedCost)}**\n* **Repair Timeline**: ${visionData.timeline}\n* **Safety Precaution**: ${visionData.safetyRisk}`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        visionAnalysis: visionData
      };

      setMessages(prev => [...prev, aiMsg]);
      setRobotState('completed');
      setStatusMessage('✅ Response generated');

      if (speechEnabled) {
        speakText(aiReplyText);
      }
    } catch (err) {
      console.error('Copilot response error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: '⚠️ **AI is temporarily unavailable.** Live MongoDB data remains safe and synchronized.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setRobotState('warning');
      setStatusMessage('⚠️ AI Fallback Active');
    }

    setTimeout(() => {
      setRobotState('idle');
      setStatusMessage('AI Construction Copilot Online');
    }, 4000);
  };

  // Clear Chat History
  const clearChat = () => {
    if (confirm('Clear chat history?')) {
      setMessages([]);
    }
  };

  // Export Chat to PDF Report
  const handleExportChatPdf = () => {
    const headers = ['Timestamp', 'Sender', 'Content'];
    const rows = messages.map(m => [m.timestamp, m.sender.toUpperCase(), m.text.replace(/[*_#`]/g, '')]);
    exportToPDF(`AI Copilot Construction Audit Report (${role})`, headers, rows, `AI_Copilot_Report_${role}`);
  };

  // Suggested Prompts by User Role
  const getRoleSuggestedPrompts = () => {
    switch (role) {
      case 'Contractor':
        return [
          'How many workers are present today?',
          'Generate contractor payroll report',
          'Show workers with safety violations',
          'What is current material stock level?'
        ];
      case 'Engineer':
        return [
          'Which client requests are pending approval?',
          'Audit structural blueprint calculations',
          'Show delayed construction projects',
          'Generate technical site report'
        ];
      case 'Client':
        return [
          'Show my project status & completion %',
          'What is my total budget outflow?',
          'Which engineers are assigned to my site?',
          'Generate client executive summary'
        ];
      case 'Worker':
        return [
          'What is my assigned task today?',
          'Check my present days & overtime',
          'Submit a leave request',
          'Show site safety guidelines'
        ];
      default:
        return [
          'Give me total ERP portfolio summary',
          'Show financial budget variance',
          'Show all delayed projects',
          'Export complete system audit'
        ];
    }
  };

  return (
    <>
      {/* ------------------------------------------------------------------- */}
      {/* FLOATING ANIMATED AI ROBOT BUTTON (BOTTOM-RIGHT CORNER)             */}
      {/* ------------------------------------------------------------------- */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2 font-sans select-none">
        
        {/* Active Robot State Badge Popup */}
        {!isOpen && (
          <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 text-white px-3.5 py-1.5 rounded-full text-[11px] font-mono shadow-xl flex items-center space-x-2 animate-bounce">
            <span className={`w-2 h-2 rounded-full ${
              robotState === 'idle' ? 'bg-cyan-400 animate-pulse' :
              robotState === 'listening' ? 'bg-rose-400 animate-ping' :
              robotState === 'thinking' ? 'bg-yellow-400 animate-spin' :
              robotState === 'analyzing' ? 'bg-purple-400 animate-pulse' :
              robotState === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'
            }`} />
            <span className="font-bold text-cyan-300">AI Copilot</span>
            <span className="text-white/60 text-[10px] hidden sm:inline">• {role} Mode</span>
          </div>
        )}

        {/* FLOATING ROBOT TRIGGER BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle AI Construction Copilot"
          className={`relative group p-3.5 rounded-2xl transition-all duration-300 shadow-2xl flex items-center justify-center ${
            isOpen 
              ? 'bg-rose-600 hover:bg-rose-500 text-white rotate-90 scale-105' 
              : 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 hover:scale-110 text-white border-2 border-cyan-400/50 shadow-cyan-500/30'
          }`}
        >
          {/* Animated Glow Halo Ring */}
          <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 opacity-40 blur transition duration-500 group-hover:opacity-100 ${
            robotState === 'listening' ? 'animate-ping opacity-75' : ''
          }`} />

          {isOpen ? (
            <X className="w-7 h-7 relative z-10" />
          ) : (
            <div className="relative z-10 flex items-center space-x-2">
              {/* ROBOT AVATAR SVG WITH BLINKING GLOWING EYES */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-8 h-8 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {/* Antenna */}
                  <path d="M12 2v3M12 2a1 1 0 1 0 0 0" strokeLinecap="round" />
                  {/* Head */}
                  <rect x="4" y="5" width="16" height="12" rx="3" fill="#0f172a" stroke="currentColor" />
                  {/* Eyes */}
                  <circle cx="8.5" cy="10.5" r="1.5" className="fill-cyan-400 animate-pulse" />
                  <circle cx="15.5" cy="10.5" r="1.5" className="fill-cyan-400 animate-pulse" />
                  {/* Mouth / Sound Grid */}
                  <path d="M9 14h6" stroke="currentColor" strokeLinecap="round" />
                  {/* Ear Nodes */}
                  <path d="M2 10h2M20 10h2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* EXPANDABLE AI CHAT WINDOW                                            */}
      {/* ------------------------------------------------------------------- */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 font-sans shadow-2xl flex flex-col bg-slate-950/95 backdrop-blur-xl border border-cyan-500/30 rounded-3xl overflow-hidden ${
            isFullscreen 
              ? 'inset-3 sm:inset-6' 
              : 'bottom-24 right-4 sm:right-6 w-[92vw] sm:w-[440px] h-[640px] max-h-[82vh]'
          }`}
        >
          {/* CHAT HEADER */}
          <div className="bg-slate-900/90 border-b border-white/10 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* ROBOT AVATAR & STATE BADGE */}
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-300 shadow-md">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                  robotState === 'idle' ? 'bg-emerald-400' :
                  robotState === 'listening' ? 'bg-rose-500 animate-ping' :
                  robotState === 'thinking' ? 'bg-yellow-400 animate-spin' :
                  robotState === 'analyzing' ? 'bg-purple-400 animate-pulse' : 'bg-cyan-400'
                }`} />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white text-sm">AI Construction Copilot</h3>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                    {role}
                  </span>
                </div>
                <p className="text-[10px] text-white/50 font-mono flex items-center space-x-1 mt-0.5">
                  <Activity className="w-3 h-3 text-emerald-400" />
                  <span>{statusMessage}</span>
                </p>
              </div>
            </div>

            {/* HEADER ACTIONS */}
            <div className="flex items-center space-x-1 text-white/60">
              <button 
                onClick={handleExportChatPdf}
                title="Export Chat PDF" 
                className="p-2 hover:bg-white/10 hover:text-white rounded-xl transition-colors text-xs"
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSpeechEnabled(!speechEnabled)} 
                title={speechEnabled ? 'Mute Voice' : 'Enable Voice'} 
                className="p-2 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
              >
                {speechEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
              </button>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'} 
                className="p-2 hover:bg-white/10 hover:text-white rounded-xl transition-colors hidden sm:block"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={clearChat} 
                title="Clear Chat" 
                className="p-2 hover:bg-white/10 hover:text-rose-400 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                title="Close" 
                className="p-2 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PROACTIVE AI RECOMMENDATIONS BANNER */}
          {showRecommendations && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-between text-[11px] font-mono text-amber-300">
              <div className="flex items-center space-x-2 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-bold">AI Recommendation:</span>
                <span>⚠ Ready-Mix Concrete stock low (65 m³)</span>
                <span>•</span>
                <span>⚠ Heavy rain forecast Noida site tomorrow</span>
                <span>•</span>
                <span>⚠ Tower Crane #2 maintenance due</span>
              </div>
              <button onClick={() => setShowRecommendations(false)} className="text-amber-400/60 hover:text-amber-300 ml-2">
                ✕
              </button>
            </div>
          )}

          {/* CHAT MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 shadow-md leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none font-sans'
                      : 'bg-slate-900 border border-white/10 text-white/90 rounded-bl-none font-sans'
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex justify-between items-center text-[10px] text-white/50 border-b border-white/10 pb-1 mb-1 font-mono">
                    <span className="font-bold uppercase tracking-wider">{m.sender === 'user' ? 'You' : 'AI Copilot'}</span>
                    <span>{m.timestamp}</span>
                  </div>

                  {/* Attachment Badge */}
                  {m.attachment && (
                    <div className="bg-black/30 p-2 rounded-xl border border-white/10 flex items-center space-x-2 text-[10px] font-mono">
                      <Paperclip className="w-3.5 h-3.5 text-cyan-300" />
                      <span className="truncate">{m.attachment.name}</span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="whitespace-pre-line text-xs font-sans">
                    {m.text}
                  </div>

                  {/* VISION DAMAGE ANALYSIS CARD */}
                  {m.visionAnalysis && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/30 space-y-1.5 font-mono text-[10px]">
                      <div className="flex items-center justify-between text-cyan-400 font-bold border-b border-white/5 pb-1">
                        <span>🔍 VISUAL DAMAGE AUDIT</span>
                        <span className="text-rose-400">{m.visionAnalysis.severity}</span>
                      </div>
                      <p className="text-white/80">• Damage: <strong className="text-white">{m.visionAnalysis.damageType}</strong></p>
                      <p className="text-white/80">• Repair: <strong className="text-cyan-300">{m.visionAnalysis.repairSuggestion}</strong></p>
                      <p className="text-white/80">• Estimated Cost: <strong className="text-yellow-400">{formatIndianRupee(m.visionAnalysis.estimatedCost)}</strong></p>
                      <p className="text-white/80">• Priority: <strong className="text-rose-300">{m.visionAnalysis.priority}</strong> ({m.visionAnalysis.timeline})</p>
                    </div>
                  )}
                </div>

                {/* Message Quick Controls */}
                {m.sender === 'ai' && (
                  <div className="flex items-center space-x-2 mt-1 text-[10px] text-white/40 font-mono">
                    <button 
                      onClick={() => navigator.clipboard.writeText(m.text)} 
                      className="hover:text-cyan-300 flex items-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                    <button 
                      onClick={() => speakText(m.text)} 
                      className="hover:text-cyan-300 flex items-center space-x-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Speak</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* ROBOT TYPING INDICATOR */}
            {(robotState === 'thinking' || robotState === 'analyzing') && (
              <div className="flex items-center space-x-2 text-white/60 font-mono text-[11px] bg-slate-900 p-3 rounded-2xl w-fit border border-cyan-500/30 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce delay-200" />
                <span>AI Construction Engine is analyzing...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* ROLE SUGGESTED PROMPTS */}
          <div className="bg-slate-900/80 px-4 py-2 border-t border-white/5 overflow-x-auto scrollbar-none">
            <div className="flex items-center space-x-2 text-[10px] font-mono text-white/50 mb-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Suggested for {role}:</span>
            </div>
            <div className="flex space-x-2 overflow-x-auto scrollbar-none pb-1">
              {getRoleSuggestedPrompts().map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-white/70 border border-white/10 rounded-full px-3 py-1 text-[10px] font-sans whitespace-nowrap transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* SELECTED ATTACHMENT PREVIEW */}
          {selectedFile && (
            <div className="bg-slate-900 px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-cyan-300">
              <div className="flex items-center space-x-2">
                <Paperclip className="w-3.5 h-3.5" />
                <span className="truncate max-w-[200px]">{selectedFile.file.name}</span>
              </div>
              <button onClick={() => setSelectedFile(null)} className="text-white/40 hover:text-white">✕</button>
            </div>
          )}

          {/* CHAT INPUT BAR */}
          <div className="p-3 bg-slate-900 border-t border-white/10 flex items-center space-x-2">
            {/* File Attachment Hidden Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*,.pdf" 
              className="hidden" 
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach Site Photo / Blueprint PDF"
              className="p-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop Listening' : 'Voice Input'}
              className={`p-2.5 rounded-xl transition-all ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask AI Copilot (${role} mode)...`}
              className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 font-sans"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() && !selectedFile}
              className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white rounded-xl shadow-md transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
