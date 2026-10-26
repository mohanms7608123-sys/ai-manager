// src/lib/models/appointmentRequest.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAppointmentRequest extends Document {
  clientId: mongoose.Types.ObjectId; // reference to Client
  engineerId: mongoose.Types.ObjectId; // reference to Engineer
  projectName: string;
  projectLocation: string;
  projectType: string;
  estimatedBudget: number;
  expectedStartDate: Date;
  projectDescription: string;
  attachments: string[]; // URLs to stored files
  preferredMeetingDate: Date;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentRequestSchema: Schema<IAppointmentRequest> = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    engineerId: { type: Schema.Types.ObjectId, ref: 'Engineer', required: true },
    projectName: { type: String, required: true },
    projectLocation: { type: String, required: true },
    projectType: { type: String, required: true },
    estimatedBudget: { type: Number, required: true },
    expectedStartDate: { type: Date, required: true },
    projectDescription: { type: String, required: true },
    attachments: { type: [String], default: [] },
    preferredMeetingDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending','Accepted','Rejected'], default: 'Pending' },
  },
  { timestamps: true }
);

const AppointmentRequest: Model<IAppointmentRequest> = mongoose.models.AppointmentRequest || mongoose.model<IAppointmentRequest>('AppointmentRequest', AppointmentRequestSchema);
export default AppointmentRequest;
