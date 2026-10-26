import mongoose, { Schema, Document, Model } from 'mongoose';

// --- 1. User Schema ---
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: 'Admin' | 'Contractor' | 'Engineer' | 'Client' | 'Worker';
  company?: string;
  status: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  role: { 
    type: String, 
    required: true, 
    enum: ['Admin', 'Contractor', 'Engineer', 'Client', 'Worker'],
    default: 'Client'
  },
  company: { type: String, default: 'Enterprise Construction Co.' },
  status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

// --- 2. Engineer Profile Schema ---
export interface IEngineerProfile extends Document {
  photoUrl: string;
  fullName: string;
  engineerId: string;
  specialization: string;
  experience: number; // years
  qualification: string;
  currentCompany: string;
  currentProjects: string[];
  availability: 'Available' | 'Busy';
  isOnline: boolean;
  languages: string[];
  skills: string[];
  rating: number; // 0-5
  location: string;
  completedProjects: number;
  about: string;
  status: 'Approved' | 'Pending' | 'Suspended';
}

const EngineerProfileSchema = new Schema<IEngineerProfile>({
  photoUrl: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  fullName: { type: String, required: true },
  engineerId: { type: String, required: true, unique: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  qualification: { type: String, required: true },
  currentCompany: { type: String, required: true },
  currentProjects: [{ type: String }],
  availability: { type: String, enum: ['Available', 'Busy'], default: 'Available' },
  isOnline: { type: Boolean, default: true },
  languages: [{ type: String }],
  skills: [{ type: String }],
  rating: { type: Number, default: 4.8 },
  location: { type: String, required: true },
  completedProjects: { type: Number, default: 12 },
  about: { type: String },
  status: { type: String, enum: ['Approved', 'Pending', 'Suspended'], default: 'Approved' }
});

// --- 3. Contractor Profile Schema ---
export interface IContractorProfile extends Document {
  photoUrl: string;
  companyName: string;
  ownerName: string;
  contractorId: string;
  licenseNumber: string;
  experience: number;
  projectsCompleted: number;
  rating: number;
  currentWorkload: number; // e.g. active projects
  availability: 'Available' | 'Busy';
  isOnline: boolean;
  status: 'Approved' | 'Pending' | 'Suspended';
}

const ContractorProfileSchema = new Schema<IContractorProfile>({
  photoUrl: { type: String, default: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80' },
  companyName: { type: String, required: true },
  ownerName: { type: String, required: true },
  contractorId: { type: String, required: true, unique: true },
  licenseNumber: { type: String, required: true },
  experience: { type: Number, default: 10 },
  projectsCompleted: { type: Number, default: 24 },
  rating: { type: Number, default: 4.9 },
  currentWorkload: { type: Number, default: 2 },
  availability: { type: String, enum: ['Available', 'Busy'], default: 'Available' },
  isOnline: { type: Boolean, default: true },
  status: { type: String, enum: ['Approved', 'Pending', 'Suspended'], default: 'Approved' }
});

// --- 4. Worker Schema ---
export interface IWorker extends Document {
  workerId: string;
  name: string;
  photoUrl: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  emergencyContact: string;
  joiningDate: string;
  department: string;
  trade: string;
  salary: number;
  projectId?: string;
  projectName?: string;
  contractorId: string;
  username: string;
  passwordHash: string;
  qrCode: string; // SVG / Data-URL
  isLocked: boolean;
  failedAttempts: number;
  status: 'Active' | 'Suspended' | 'Transferred';
  createdAt: Date;
}

const WorkerSchema = new Schema<IWorker>({
  workerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  photoUrl: { type: String, default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  joiningDate: { type: String, required: true },
  department: { type: String, default: 'Civil Works' },
  trade: { type: String, default: 'Mason' },
  salary: { type: Number, required: true },
  projectId: { type: String },
  projectName: { type: String },
  contractorId: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  qrCode: { type: String, required: true },
  isLocked: { type: Boolean, default: false },
  failedAttempts: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Suspended', 'Transferred'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

// --- 5. Attendance Schema ---
export interface IAttendance extends Document {
  workerId: string;
  workerName: string;
  workerIdStr: string;
  joiningDate?: string;
  projectId?: string;
  projectName?: string;
  contractorId?: string;
  salary?: number;
  date: string; // YYYY-MM-DD
  todayStatus: 'Present' | 'Absent' | 'Half Day' | 'Leave' | 'Not Marked';
  checkInTime: string;
  checkOutTime: string;
  device: string;
  location: string;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  overtimeHours: number;
  lastLogin: string;
  markedBy?: string; // e.g. "Contractor"
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  workerId: { type: String, required: true },
  workerName: { type: String, required: true },
  workerIdStr: { type: String, required: true },
  joiningDate: { type: String },
  projectId: { type: String },
  projectName: { type: String },
  contractorId: { type: String },
  salary: { type: Number },
  date: { type: String, required: true },
  todayStatus: { type: String, enum: ['Present', 'Absent', 'Half Day', 'Leave', 'Not Marked'], default: 'Not Marked' },
  checkInTime: { type: String, default: '--:--' },
  checkOutTime: { type: String, default: '--:--' },
  device: { type: String, default: 'Manual Contractor Action' },
  location: { type: String, default: 'Sector 62 Site, Noida' },
  presentDays: { type: Number, default: 0 },
  absentDays: { type: Number, default: 0 },
  halfDays: { type: Number, default: 0 },
  leaveDays: { type: Number, default: 0 },
  overtimeHours: { type: Number, default: 0 },
  lastLogin: { type: String },
  markedBy: { type: String, default: 'Contractor' },
  createdAt: { type: Date, default: Date.now }
});

AttendanceSchema.index({ workerIdStr: 1, date: 1 }, { unique: true });

// --- 6. Leave Request Schema ---
export interface ILeaveRequest extends Document {
  workerId: string;
  workerName: string;
  contractorId: string;
  projectId?: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>({
  workerId: { type: String, required: true },
  workerName: { type: String, required: true },
  contractorId: { type: String, required: true },
  projectId: { type: String },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

// --- 7. Project Schema ---
export type ProjectStatus = 
  | 'Pending Admin Approval'
  | 'Approved by Admin'
  | 'Waiting for Engineer Approval'
  | 'Engineer Approved'
  | 'Engineer Rejected'
  | 'Waiting Contractor Approval'
  | 'Construction Ready'
  | 'In Progress'
  | 'Completed'
  | 'Rejected'
  | 'On Hold';

export interface IProject extends Document {
  name: string;
  type: string;
  description: string;
  location: string;
  budget: number;
  spent: number;
  startDate: Date;
  expectedCompletionDate: Date;
  blueprintUrl?: string;
  images: { url: string; caption?: string; category?: string; date?: Date }[];
  documents: { name: string; url: string; fileType?: string }[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: ProjectStatus;
  health: 'Healthy' | 'Risk' | 'Critical';
  completion: number;
  clientEmail: string;
  clientName: string;
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
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  type: { type: String, required: true, default: 'Commercial Building' },
  description: { type: String, required: true },
  location: { type: String, required: true },
  budget: { type: Number, required: true, min: 0 },
  spent: { type: Number, default: 0, min: 0 },
  startDate: { type: Date, required: true },
  expectedCompletionDate: { type: Date, required: true },
  blueprintUrl: { type: String },
  images: [{
    url: { type: String, required: true },
    caption: { type: String },
    category: { type: String, default: 'Site' },
    date: { type: Date, default: Date.now }
  }],
  documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    fileType: { type: String, default: 'PDF' }
  }],
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { 
    type: String, 
    required: true, 
    enum: [
      'Pending Admin Approval',
      'Approved by Admin',
      'Waiting for Engineer Approval',
      'Engineer Approved',
      'Engineer Rejected',
      'Waiting Contractor Approval',
      'Construction Ready',
      'In Progress',
      'Completed',
      'Rejected',
      'On Hold'
    ], 
    default: 'Waiting for Engineer Approval' 
  },
  health: { type: String, enum: ['Healthy', 'Risk', 'Critical'], default: 'Healthy' },
  completion: { type: Number, default: 0, min: 0, max: 100 },
  clientEmail: { type: String, required: true },
  clientName: { type: String, required: true },
  assignedContractorId: { type: String },
  assignedContractorName: { type: String },
  assignedEngineerId: { type: String },
  assignedEngineerName: { type: String },
  assignedWorkers: [{ type: String }],
  assignedEquipment: [{ type: String }],
  technicalComments: { type: String },
  estimatedTimeline: { type: String },
  estimatedMaterials: { type: String },
  estimatedCost: { type: Number },
  scheduleGenerated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// --- 8. Notification Schema ---
export interface INotification extends Document {
  recipientRole: 'Admin' | 'Contractor' | 'Engineer' | 'Client' | 'Worker' | 'All';
  recipientId?: string;
  title: string;
  message: string;
  projectId?: string;
  isRead: boolean;
  type: 'workflow' | 'chat' | 'task' | 'meeting' | 'alert' | 'lockout';
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipientRole: { type: String, required: true },
  recipientId: { type: String },
  title: { type: String, required: true },
  message: { type: String, required: true },
  projectId: { type: String },
  isRead: { type: Boolean, default: false },
  type: { type: String, enum: ['workflow', 'chat', 'task', 'meeting', 'alert', 'lockout'], default: 'workflow' },
  createdAt: { type: Date, default: Date.now }
});

// --- 9. Message Schema ---
export interface IMessage extends Document {
  projectId: string;
  senderRole: 'Admin' | 'Contractor' | 'Engineer' | 'Client' | 'Worker';
  senderName: string;
  senderId?: string;
  messageText: string;
  attachments?: { name: string; url: string; fileType: string }[];
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  projectId: { type: String, required: true },
  senderRole: { type: String, required: true },
  senderName: { type: String, required: true },
  senderId: { type: String },
  messageText: { type: String, required: true },
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    fileType: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

// --- 10. Task Schema ---
export interface ITask extends Document {
  projectId: string;
  title: string;
  description: string;
  assignedWorker?: string;
  assignedWorkerId?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  progress: number;
  createdBy: string;
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>({
  projectId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedWorker: { type: String },
  assignedWorkerId: { type: String },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// --- 11. Approval Schema ---
export interface IApproval extends Document {
  projectId: string;
  approverRole: 'Admin' | 'Engineer' | 'Contractor';
  approverName: string;
  action: 'Approve' | 'Reject' | 'Request Changes';
  comments?: string;
  estimatedTimeline?: string;
  estimatedMaterials?: string;
  estimatedCost?: number;
  createdAt: Date;
}

const ApprovalSchema = new Schema<IApproval>({
  projectId: { type: String, required: true },
  approverRole: { type: String, required: true },
  approverName: { type: String, required: true },
  action: { type: String, enum: ['Approve', 'Reject', 'Request Changes'], required: true },
  comments: { type: String },
  estimatedTimeline: { type: String },
  estimatedMaterials: { type: String },
  estimatedCost: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

// --- 12. Meeting Schema ---
export interface IMeeting extends Document {
  projectId: string;
  title: string;
  scheduledTime: Date;
  meetingLink: string;
  attendees: string[];
  createdBy: string;
  createdAt: Date;
}

const MeetingSchema = new Schema<IMeeting>({
  projectId: { type: String, required: true },
  title: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  meetingLink: { type: String, required: true },
  attendees: [{ type: String }],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// --- 13. ProjectRequest Schema ---
export interface IProjectRequest extends Document {
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
  createdAt: Date;
  notification: boolean;
}

const ProjectRequestSchema = new Schema<IProjectRequest>({
  requestId: { type: String, required: true, unique: true },
  projectId: { type: String, required: true },
  projectName: { type: String, required: true },
  clientId: { type: String, required: true },
  clientName: { type: String, required: true },
  engineerId: { type: String, required: true },
  engineerUsername: { type: String, default: 'rahul.engineer' },
  engineerName: { type: String, required: true },
  budget: { type: Number, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, default: 'High' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  notification: { type: Boolean, default: true }
});

// --- Model Exports ---
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const EngineerProfile: Model<IEngineerProfile> = mongoose.models.EngineerProfile || mongoose.model<IEngineerProfile>('EngineerProfile', EngineerProfileSchema);
export const ContractorProfile: Model<IContractorProfile> = mongoose.models.ContractorProfile || mongoose.model<IContractorProfile>('ContractorProfile', ContractorProfileSchema);
export const Worker: Model<IWorker> = mongoose.models.Worker || mongoose.model<IWorker>('Worker', WorkerSchema);
export const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
export const LeaveRequest: Model<ILeaveRequest> = mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
export const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
export const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
export const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
export const Approval: Model<IApproval> = mongoose.models.Approval || mongoose.model<IApproval>('Approval', ApprovalSchema);
export const Meeting: Model<IMeeting> = mongoose.models.Meeting || mongoose.model<IMeeting>('Meeting', MeetingSchema);
export const ProjectRequest: Model<IProjectRequest> = mongoose.models.ProjectRequest || mongoose.model<IProjectRequest>('ProjectRequest', ProjectRequestSchema);

