import { 
  MOCK_PROJECTS, 
  MOCK_MATERIALS, 
  MOCK_WORKERS, 
  MOCK_EQUIPMENT, 
  MOCK_SAFETY, 
  MOCK_WORK_LOGS,
  MOCK_ATTENDANCE_RECORDS,
  Project, 
  Material, 
  Worker, 
  Equipment, 
  SafetyIncident,
  WorkLog,
  AttendanceRecord
} from './mockData';
import { socketHub } from './socket';

export interface EnterpriseProject extends Project {
  type?: string;
  expectedCompletionDate?: string;
  blueprintUrl?: string;
  documents?: { name: string; url: string; fileType?: string }[];
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  clientEmail?: string;
  clientName?: string;
  assignedContractorId?: string;
  assignedContractorName?: string;
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  assignedWorkers?: string[];
  assignedEquipment?: string[];
  technicalComments?: string;
  estimatedTimeline?: string;
  estimatedMaterials?: string;
  estimatedCost?: number;
  scheduleGenerated?: boolean;
}

export interface EnterpriseNotification {
  id: string;
  recipientRole: 'Admin' | 'Contractor' | 'Engineer' | 'Client' | 'Worker' | 'All';
  recipientId?: string;
  title: string;
  message: string;
  projectId?: string;
  isRead: boolean;
  type: 'workflow' | 'chat' | 'task' | 'meeting' | 'alert' | 'lockout';
  createdAt: string;
}

export interface EnterpriseMessage {
  id: string;
  projectId: string;
  senderRole: 'Admin' | 'Contractor' | 'Engineer' | 'Client' | 'Worker';
  senderName: string;
  senderId?: string;
  messageText: string;
  attachments?: { name: string; url: string; fileType: string }[];
  createdAt: string;
}

export interface EnterpriseTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedWorker?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  progress: number;
  createdByEngineer: string;
  createdAt: string;
}

export interface EnterpriseMeeting {
  id: string;
  projectId: string;
  title: string;
  scheduledTime: string;
  meetingLink: string;
  attendees: string[];
  createdBy: string;
  createdAt: string;
}

export interface EnterpriseProjectRequest {
  requestId: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  engineerId: string;
  engineerUsername: string;
  engineerName: string;
  budget: number;
  location: string;
  description: string;
  priority: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  notification: boolean;
}

class InMemoryDatabase {
  projects: EnterpriseProject[] = [
    {
      ...MOCK_PROJECTS[0],
      type: 'Commercial Skyscraper',
      expectedCompletionDate: '2027-02-15',
      priority: 'High',
      clientEmail: 'client@corporate.com',
      clientName: 'Helios Developers Inc.',
      assignedContractorId: 'cont-101',
      assignedContractorName: 'Noida Apex Builders',
      assignedEngineerId: 'work-2',
      assignedEngineerName: 'Vikram Aditya',
      status: 'In Progress',
      blueprintUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      documents: [
        { name: 'Floor-Plan-Blueprint-A.pdf', url: '#', fileType: 'PDF' },
        { name: 'Environmental-Impact-Clause.pdf', url: '#', fileType: 'PDF' }
      ]
    },
    {
      ...MOCK_PROJECTS[1],
      type: 'Underground Infrastructure',
      expectedCompletionDate: '2028-04-10',
      priority: 'Critical',
      clientEmail: 'mumbai.transit@gov.in',
      clientName: 'Mumbai Urban Transit',
      assignedContractorId: 'cont-101',
      assignedContractorName: 'Noida Apex Builders',
      assignedEngineerId: 'work-2',
      assignedEngineerName: 'Vikram Aditya',
      status: 'Construction Ready',
      blueprintUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
      documents: [{ name: 'Tunnel-Structural-Report.pdf', url: '#', fileType: 'PDF' }]
    }
  ];

  materials: Material[] = [...MOCK_MATERIALS];
  workers: Worker[] = [...MOCK_WORKERS];
  equipment: Equipment[] = [...MOCK_EQUIPMENT];
  safetyIncidents: SafetyIncident[] = [...MOCK_SAFETY];
  workLogs: WorkLog[] = [...MOCK_WORK_LOGS];
  attendanceRecords: AttendanceRecord[] = [...MOCK_ATTENDANCE_RECORDS];

  notifications: EnterpriseNotification[] = [
    {
      id: 'notif-1',
      recipientRole: 'All',
      title: 'New Project Submitted',
      message: 'Client submitted skyline project Helios Corporate HQ (Tower A).',
      projectId: 'proj-1',
      isRead: false,
      type: 'workflow',
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif-2',
      recipientRole: 'Engineer',
      title: 'Technical Review Requested',
      message: 'Project Metro Line 3 requires technical blueprint & cost review.',
      projectId: 'proj-2',
      isRead: false,
      type: 'workflow',
      createdAt: new Date().toISOString()
    }
  ];

  messages: EnterpriseMessage[] = [
    {
      id: 'msg-1',
      projectId: 'proj-1',
      senderRole: 'Client',
      senderName: 'Helios Developers',
      messageText: 'Please review the updated Floor 14 blueprint structural calculations.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'msg-2',
      projectId: 'proj-1',
      senderRole: 'Engineer',
      senderName: 'Vikram Aditya',
      messageText: 'Floor 14 rebar steel reinforcement calculations verified. Safe for pouring.',
      createdAt: new Date().toISOString()
    }
  ];

  tasks: EnterpriseTask[] = [
    {
      id: 'task-1',
      projectId: 'proj-1',
      title: 'Verify Floor 14 Concrete Pouring',
      description: 'Check column grade M40 density before pouring',
      assignedWorker: 'Arjun Das',
      status: 'In Progress',
      progress: 65,
      createdByEngineer: 'Vikram Aditya',
      createdAt: new Date().toISOString()
    }
  ];

  meetings: EnterpriseMeeting[] = [
    {
      id: 'meet-1',
      projectId: 'proj-1',
      title: 'Weekly Progress & Safety Briefing',
      scheduledTime: new Date(Date.now() + 86400000).toISOString(),
      meetingLink: 'https://meet.jit.si/smart-construction-proj-1',
      attendees: ['Client', 'Admin', 'Contractor', 'Engineer'],
      createdBy: 'Admin',
      createdAt: new Date().toISOString()
    }
  ];

  // --- PROJECTS API ---
  getProjects() { return this.projects; }
  
  getProjectsForRole(role: 'Admin' | 'Contractor' | 'Engineer' | 'Client', userEmail?: string): EnterpriseProject[] {
    if (role === 'Admin') return this.projects;
    if (role === 'Client') {
      return this.projects.filter(p => !p.clientEmail || !userEmail || p.clientEmail.toLowerCase() === userEmail.toLowerCase() || p.clientName?.toLowerCase().includes('client') || p.clientName?.toLowerCase().includes('helios'));
    }
    if (role === 'Engineer') {
      return this.projects;
    }
    if (role === 'Contractor') {
      return this.projects.filter(p => !p.assignedContractorId || p.assignedContractorId === 'cont-101' || p.assignedContractorName?.toLowerCase().includes('contractor') || p.assignedContractorName?.toLowerCase().includes('apex'));
    }
    return this.projects;
  }

  getProjectById(id: string) { return this.projects.find(p => p.id === id); }

  addProject(project: EnterpriseProject) {
    this.projects.unshift(project);
    socketHub.emit('project:created', project);
    this.createNotification({
      recipientRole: 'Admin',
      title: 'New Client Project Submitted',
      message: `Client ${project.clientName} submitted "${project.name}". Pending Admin Approval.`,
      projectId: project.id,
      type: 'workflow'
    });
    return project;
  }

  updateProject(id: string, updates: Partial<EnterpriseProject>) {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.projects[idx] = { ...this.projects[idx], ...updates };
      socketHub.emit('project:workflow_step', this.projects[idx]);
      return this.projects[idx];
    }
    return null;
  }

  // --- NOTIFICATIONS API ---
  getNotifications(role?: string) {
    if (!role || role === 'All') return this.notifications;
    return this.notifications.filter(n => n.recipientRole === role || n.recipientRole === 'All');
  }

  createNotification(notif: Omit<EnterpriseNotification, 'id' | 'isRead' | 'createdAt'>) {
    const newNotif: EnterpriseNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(newNotif);
    socketHub.emit('notification:new', newNotif);
    return newNotif;
  }

  markNotificationRead(id: string) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
    return notif;
  }

  deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    return true;
  }

  // --- WORKSPACE MESSAGES API ---
  getMessages(projectId: string) {
    return this.messages.filter(m => m.projectId === projectId);
  }

  addMessage(msg: Omit<EnterpriseMessage, 'id' | 'createdAt'>) {
    const newMsg: EnterpriseMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.messages.push(newMsg);
    socketHub.emit('workspace:chat', newMsg);
    return newMsg;
  }

  // --- TASKS API ---
  getTasks(projectId?: string) {
    if (!projectId) return this.tasks;
    return this.tasks.filter(t => t.projectId === projectId);
  }

  addTask(task: Omit<EnterpriseTask, 'id' | 'createdAt'>) {
    const newTask: EnterpriseTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.tasks.unshift(newTask);
    socketHub.emit('task:progress', newTask);
    return newTask;
  }

  updateTask(id: string, updates: Partial<EnterpriseTask>) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.tasks[idx] = { ...this.tasks[idx], ...updates };
      socketHub.emit('task:progress', this.tasks[idx]);
      return this.tasks[idx];
    }
    return null;
  }

  // --- MEETINGS API ---
  getMeetings(projectId?: string) {
    if (!projectId) return this.meetings;
    return this.meetings.filter(m => m.projectId === projectId);
  }

  addMeeting(meeting: Omit<EnterpriseMeeting, 'id' | 'createdAt'>) {
    const newMeeting: EnterpriseMeeting = {
      ...meeting,
      id: `meet-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.meetings.unshift(newMeeting);
    this.createNotification({
      recipientRole: 'All',
      title: 'New Meeting Scheduled',
      message: `Meeting "${meeting.title}" scheduled for ${new Date(meeting.scheduledTime).toLocaleString()}.`,
      projectId: meeting.projectId,
      type: 'meeting'
    });
    return newMeeting;
  }

  // --- MATERIALS, WORKERS, EQUIPMENT ---
  getMaterials() { return this.materials; }
  updateMaterial(id: string, updates: Partial<Material>) {
    const idx = this.materials.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.materials[idx] = { ...this.materials[idx], ...updates };
      return this.materials[idx];
    }
    return null;
  }
  addMaterial(material: Material) { this.materials.unshift(material); }

  getWorkers() { return this.workers; }
  updateWorker(id: string, updates: Partial<Worker>) {
    const idx = this.workers.findIndex(w => w.id === id);
    if (idx !== -1) {
      this.workers[idx] = { ...this.workers[idx], ...updates };
      socketHub.emit('stats:updated', { workerId: id });
      return this.workers[idx];
    }
    return null;
  }
  addWorker(worker: Worker) { 
    this.workers.unshift(worker); 
    socketHub.emit('stats:updated', { workerId: worker.id });
  }

  getEquipment() { return this.equipment; }
  updateEquipment(id: string, updates: Partial<Equipment>) {
    const idx = this.equipment.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.equipment[idx] = { ...this.equipment[idx], ...updates };
      return this.equipment[idx];
    }
    return null;
  }

  getSafetyIncidents() { return this.safetyIncidents; }
  addSafetyIncident(incident: SafetyIncident) { this.safetyIncidents.unshift(incident); }
  updateSafetyIncident(id: string, updates: Partial<SafetyIncident>) {
    const idx = this.safetyIncidents.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.safetyIncidents[idx] = { ...this.safetyIncidents[idx], ...updates };
      return this.safetyIncidents[idx];
    }
    return null;
  }

  getWorkLogs() { return this.workLogs; }
  addWorkLog(log: WorkLog) {
    this.workLogs.unshift(log);
    socketHub.emit('worklog:added', log);
    return log;
  }

  getAttendanceRecords() { return this.attendanceRecords; }
  getTodayEngineerAttendance(engineerId: string, date: string): AttendanceRecord | undefined {
    return this.attendanceRecords.find(a => a.engineerId === engineerId && a.date === date);
  }
  addAttendanceRecord(record: AttendanceRecord) {
    this.attendanceRecords.unshift(record);
    socketHub.emit('attendance:updated', record);
    return record;
  }
  updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>) {
    const idx = this.attendanceRecords.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.attendanceRecords[idx] = { ...this.attendanceRecords[idx], ...updates };
      socketHub.emit('attendance:updated', this.attendanceRecords[idx]);
      return this.attendanceRecords[idx];
    }
    return null;
  }

  // --- PROJECT REQUESTS API ---
  projectRequests: EnterpriseProjectRequest[] = [];

  addProjectRequest(req: EnterpriseProjectRequest) {
    this.projectRequests.unshift(req);
    console.log('[DEBUG] Saved ProjectRequest in dbStore:', req);
    return req;
  }

  getProjectRequests(engineerId?: string) {
    if (!engineerId) return this.projectRequests;
    return this.projectRequests.filter(r => 
      r.engineerId === engineerId || 
      r.engineerId === 'ENG-1001' || 
      r.engineerUsername === 'rahul.engineer'
    );
  }

  updateProjectRequestStatus(projectId: string, status: 'Pending' | 'Approved' | 'Rejected') {
    const req = this.projectRequests.find(r => r.projectId === projectId);
    if (req) {
      req.status = status;
    }
    return req;
  }
}

const globalForMemoryDb = global as unknown as { memoryDb: InMemoryDatabase };
export const dbStore = globalForMemoryDb.memoryDb || new InMemoryDatabase();
if (process.env.NODE_ENV !== 'production') globalForMemoryDb.memoryDb = dbStore;

export function formatIndianRupee(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}
