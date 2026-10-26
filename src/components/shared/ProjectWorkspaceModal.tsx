'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Paperclip, 
  Image as ImageIcon, 
  Calendar, 
  Bot, 
  Send, 
  FileText, 
  Users, 
  Plus, 
  CheckCircle, 
  Clock, 
  Video,
  Sparkles
} from 'lucide-react';
import { dbStore, EnterpriseMessage, EnterpriseTask, EnterpriseMeeting, EnterpriseProject } from '@/lib/dbStore';
import { socketHub } from '@/lib/socket';

interface ProjectWorkspaceModalProps {
  project: EnterpriseProject;
  currentRole: 'Admin' | 'Contractor' | 'Engineer' | 'Client';
  onClose: () => void;
}

export default function ProjectWorkspaceModal({ project, currentRole, onClose }: ProjectWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'tasks' | 'meetings' | 'ai'>('chat');
  
  // State for Messages
  const [messages, setMessages] = useState<EnterpriseMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachmentType, setAttachmentType] = useState<'Image' | 'Blueprint' | 'PDF' | 'None'>('None');
  const [attachmentName, setAttachmentName] = useState('');

  // State for Tasks
  const [tasks, setTasks] = useState<EnterpriseTask[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assignedWorker, setAssignedWorker] = useState('Arjun Das');

  // State for Meetings
  const [meetings, setMeetings] = useState<EnterpriseMeeting[]>([]);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');

  // State for AI Assistant Tab
  const [aiQuery, setAiQuery] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<{ query: string; reply: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchWorkspaceData();

    // Subscribe to Socket.IO real-time updates for workspace
    const unsubChat = socketHub.on('workspace:chat', (msg: EnterpriseMessage) => {
      if (msg.projectId === project.id) {
        setMessages(prev => [...prev.filter(m => m.id !== msg.id), msg]);
      }
    });

    const unsubTask = socketHub.on('task:progress', () => {
      setTasks([...dbStore.getTasks(project.id)]);
    });

    return () => {
      unsubChat();
      unsubTask();
    };
  }, [project.id]);

  const fetchWorkspaceData = async () => {
    try {
      const res = await fetch(`/api/workspace?projectId=${project.id}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || dbStore.getMessages(project.id));
        setTasks(data.tasks || dbStore.getTasks(project.id));
        setMeetings(data.meetings || dbStore.getMeetings(project.id));
      }
    } catch {
      setMessages(dbStore.getMessages(project.id));
      setTasks(dbStore.getTasks(project.id));
      setMeetings(dbStore.getMeetings(project.id));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const attachmentList = attachmentType !== 'None' && attachmentName.trim() ? [
      { name: attachmentName, url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', fileType: attachmentType }
    ] : [];

    const msgPayload = {
      action: 'chat',
      projectId: project.id,
      senderRole: currentRole,
      senderName: `${currentRole} Representative`,
      messageText: newMessage,
      attachments: attachmentList
    };

    setNewMessage('');
    setAttachmentType('None');
    setAttachmentName('');

    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgPayload)
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.messageItem]);
      }
    } catch {
      const localMsg = dbStore.addMessage(msgPayload as any);
      setMessages(prev => [...prev, localMsg]);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const payload = {
      action: 'task',
      projectId: project.id,
      taskTitle,
      taskDesc,
      assignedWorker,
      senderName: `${currentRole} Representative`
    };

    setTaskTitle('');
    setTaskDesc('');

    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setTasks(prev => [data.taskItem, ...prev]);
      }
    } catch {
      const localTask = dbStore.addTask(payload as any);
      setTasks(prev => [localTask, ...prev]);
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;

    const payload = {
      action: 'meeting',
      projectId: project.id,
      meetingTitle,
      scheduledTime: meetingDate || new Date(Date.now() + 86400000).toISOString(),
      meetingLink: `https://meet.jit.si/smart-construction-${project.id}`,
      senderName: `${currentRole}`
    };

    setMeetingTitle('');
    setMeetingDate('');

    try {
      const res = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMeetings(prev => [data.meetingItem, ...prev]);
      }
    } catch {
      const localMeeting = dbStore.addMeeting(payload as any);
      setMeetings(prev => [localMeeting, ...prev]);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const userQ = aiQuery;
    setAiQuery('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQ, role: currentRole, pathname: `/workspace/${project.id}` })
      });
      const data = await res.json();
      setAiChatHistory(prev => [...prev, { query: userQ, reply: data.content || 'Database response returned.' }]);
    } catch {
      setAiChatHistory(prev => [...prev, { query: userQ, reply: `Live Database state for ${project.name}: Status is ${project.status}, Budget is ₹${project.budget.toLocaleString()}.` }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl h-[620px] flex flex-col overflow-hidden shadow-2xl">
        {/* Workspace Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">{project.name}</h3>
              <p className="text-[10px] text-white/50 font-mono">Enterprise Workspace • Status: <span className="text-cyan-400 font-bold">{project.status}</span></p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex bg-white/5 p-1 rounded-xl text-xs space-x-1 font-semibold">
              <button 
                onClick={() => setActiveTab('chat')} 
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'chat' ? 'bg-cyan-500 text-black font-bold' : 'text-white/60 hover:text-white'}`}
              >
                Group Chat
              </button>
              <button 
                onClick={() => setActiveTab('tasks')} 
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'tasks' ? 'bg-cyan-500 text-black font-bold' : 'text-white/60 hover:text-white'}`}
              >
                Tasks & Comments
              </button>
              <button 
                onClick={() => setActiveTab('meetings')} 
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'meetings' ? 'bg-cyan-500 text-black font-bold' : 'text-white/60 hover:text-white'}`}
              >
                Meetings
              </button>
              <button 
                onClick={() => setActiveTab('ai')} 
                className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'ai' ? 'bg-cyan-500 text-black font-bold' : 'text-white/60 hover:text-white'}`}
              >
                AI Assistant
              </button>
            </div>

            <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex sm:hidden bg-slate-950 p-2 border-b border-white/5 text-xs justify-around">
          <button onClick={() => setActiveTab('chat')} className={activeTab === 'chat' ? 'text-cyan-400 font-bold' : 'text-white/50'}>Chat</button>
          <button onClick={() => setActiveTab('tasks')} className={activeTab === 'tasks' ? 'text-cyan-400 font-bold' : 'text-white/50'}>Tasks</button>
          <button onClick={() => setActiveTab('meetings')} className={activeTab === 'meetings' ? 'text-cyan-400 font-bold' : 'text-white/50'}>Meetings</button>
          <button onClick={() => setActiveTab('ai')} className={activeTab === 'ai' ? 'text-cyan-400 font-bold' : 'text-white/50'}>AI</button>
        </div>

        {/* TAB 1: GROUP CHAT & FILE ATTACHMENTS */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col justify-between p-4 space-y-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col space-y-1 ${m.senderRole === currentRole ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center space-x-2 text-[9px] text-white/40 font-mono">
                    <span className="font-bold text-white/80">{m.senderName} ({m.senderRole})</span>
                    <span>• {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed ${
                    m.senderRole === currentRole 
                      ? 'bg-cyan-500 text-black font-medium rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                  }`}>
                    <p>{m.messageText}</p>
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10 space-y-1 font-mono text-[10px]">
                        {m.attachments.map((att, i) => (
                          <div key={i} className="flex items-center space-x-1.5 font-bold">
                            <Paperclip className="w-3 h-3" />
                            <span>[{att.fileType}] {att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="space-y-2 pt-2 border-t border-white/5">
              {attachmentType !== 'None' && (
                <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-xl text-xs">
                  <span className="text-cyan-400 font-mono text-[10px] font-bold">Attaching {attachmentType}:</span>
                  <input 
                    type="text" 
                    placeholder="Enter file name (e.g. Floor14-Blueprint.pdf)..."
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs focus:outline-none"
                  />
                  <button type="button" onClick={() => setAttachmentType('None')} className="text-white/40 hover:text-white text-xs">✕</button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <button 
                    type="button" 
                    onClick={() => { setAttachmentType('Blueprint'); setAttachmentName('Blueprint-Draft.dwg'); }}
                    className="p-2 bg-white/5 hover:bg-white/10 text-cyan-400 rounded-xl text-xs" 
                    title="Attach Blueprint"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setAttachmentType('Image'); setAttachmentName('Site-Inspection-Photo.png'); }}
                    className="p-2 bg-white/5 hover:bg-white/10 text-emerald-400 rounded-xl text-xs" 
                    title="Attach Image"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>

                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Type workspace message as ${currentRole}...`}
                  className="flex-1 bg-slate-950 border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />

                <button type="submit" className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: TASKS & COMMENTS */}
        {activeTab === 'tasks' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {/* Create Task Form (Engineer / Contractor) */}
            {(currentRole === 'Engineer' || currentRole === 'Contractor' || currentRole === 'Admin') && (
              <form onSubmit={handleCreateTask} className="bg-slate-950 p-4 border border-white/5 rounded-2xl space-y-3 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Create Project Execution Task</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input 
                    type="text" 
                    required
                    placeholder="Task Title..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Task Description..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                  <select 
                    value={assignedWorker}
                    onChange={(e) => setAssignedWorker(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Rajesh Kumar">Assign: Rajesh Kumar (Mason)</option>
                    <option value="Vikram Singh">Assign: Vikram Singh (Electrician)</option>
                    <option value="Arjun Das">Assign: Arjun Das (Steel Worker)</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl">
                  Add Task to Project Ledger
                </button>
              </form>
            )}

            {/* Task List */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">Project Tasks & Completion Tracker</h4>
              {tasks.map((t) => (
                <div key={t.id} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{t.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      t.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'
                    }`}>
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white/60 text-xs">{t.description}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-1">
                    <span>Assigned Worker: <strong className="text-cyan-400">{t.assignedWorker || 'General Crew'}</strong></span>
                    <span>Created by: {t.createdByEngineer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MEETINGS SCHEDULER */}
        {activeTab === 'meetings' && (
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            <form onSubmit={handleScheduleMeeting} className="bg-slate-950 p-4 border border-white/5 rounded-2xl space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Schedule Enterprise Alignment Meeting</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  required
                  placeholder="Meeting Topic (e.g. Budget & Timeline Audit)..."
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
                <input 
                  type="datetime-local" 
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <button type="submit" className="w-full py-2 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl">
                Schedule Meeting & Notify All Stakeholders
              </button>
            </form>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">Scheduled Project Meetings</h4>
              {meetings.map((m) => (
                <div key={m.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-white">{m.title}</h5>
                    <p className="text-[10px] text-white/45 font-mono mt-0.5">Time: {new Date(m.scheduledTime).toLocaleString()}</p>
                  </div>
                  <a 
                    href={m.meetingLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-xs font-bold"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Meeting</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LIVE AI ASSISTANT */}
        {activeTab === 'ai' && (
          <div className="flex-1 flex flex-col justify-between p-4 space-y-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              <div className="bg-cyan-950/20 border border-cyan-500/30 p-3.5 rounded-2xl text-xs text-white/80 space-y-1">
                <span className="font-bold text-cyan-400 flex items-center space-x-1.5 font-mono text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>Live Project AI Assistant Active</span>
                </span>
                <p className="text-[11px] text-white/60">Ask questions using live project data (e.g. "What projects are waiting for approval?", "Which engineer approved this project?", "Show delayed projects").</p>
              </div>

              {aiChatHistory.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-right text-xs font-bold text-white/80 bg-white/5 p-2.5 rounded-xl ml-12">
                    {item.query}
                  </div>
                  <div className="text-left text-xs text-cyan-100 bg-cyan-950/40 border border-cyan-500/20 p-3.5 rounded-2xl mr-12 leading-relaxed">
                    {item.reply}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="p-3 bg-slate-950 rounded-xl text-xs font-mono text-cyan-400 animate-pulse">
                  Querying live MongoDB records...
                </div>
              )}
            </div>

            <form onSubmit={handleAskAI} className="flex space-x-2 pt-2 border-t border-white/5">
              <input 
                type="text" 
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask AI about approvals, engineers, delayed tasks, or budget variance..."
                className="flex-1 bg-slate-950 border border-white/10 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
              <button type="submit" className="px-5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-xs flex items-center space-x-1">
                <Bot className="w-4 h-4" />
                <span>Ask AI</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
