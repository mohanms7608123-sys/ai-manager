import mongoose, { Schema, Document } from 'mongoose';

export interface EngineerProfile extends Document {
  photoUrl: string;
  fullName: string;
  engineerId: string;
  specialization: string;
  experience: number; // years
  qualification: string;
  currentCompany: string;
  currentProjects: string[];
  availability: string; // e.g., 'Available', 'Busy'
  languages: string[];
  skills: string[];
  rating: number; // 0-5
  location: string;
  completedProjects: number;
  about: string;
  status: string; // e.g., 'Active'
}

const EngineerProfileSchema: Schema = new Schema({
  photoUrl: { type: String, required: false },
  fullName: { type: String, required: true },
  engineerId: { type: String, required: true, unique: true },
  specialization: { type: String, required: true },
  experience: { type: Number, required: true },
  qualification: { type: String, required: true },
  currentCompany: { type: String, required: true },
  currentProjects: [{ type: String }],
  availability: { type: String, required: true },
  languages: [{ type: String }],
  skills: [{ type: String }],
  rating: { type: Number, required: true },
  location: { type: String, required: true },
  completedProjects: { type: Number, required: true },
  about: { type: String, required: false },
  status: { type: String, required: true }
});

export default mongoose.models.EngineerProfile || mongoose.model<EngineerProfile>('EngineerProfile', EngineerProfileSchema);
