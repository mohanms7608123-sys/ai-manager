// src/lib/models/engineer.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEngineer extends Document {
  profilePhoto?: string;
  fullName: string;
  engineerId: string; // unique identifier
  email: string;
  phoneNumber: string;
  qualification: string;
  specialization: string;
  experience: number; // years of experience
  skills: string[];
  currentProjects: string[]; // project IDs or titles
  availability: string; // e.g., "Available", "Busy"
  location: string;
  rating: number; // average rating 0-5
  languages: string[];
  certificates: string[]; // URLs or names
  portfolioImages: string[]; // URLs
  about: string;
  status: string; // e.g., "Active", "Inactive"
  createdAt: Date;
  updatedAt: Date;
}

const EngineerSchema: Schema<IEngineer> = new Schema(
  {
    profilePhoto: { type: String },
    fullName: { type: String, required: true },
    engineerId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    qualification: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    skills: { type: [String], default: [] },
    currentProjects: { type: [String], default: [] },
    availability: { type: String, default: 'Available' },
    location: { type: String, required: true },
    rating: { type: Number, default: 0 },
    languages: { type: [String], default: [] },
    certificates: { type: [String], default: [] },
    portfolioImages: { type: [String], default: [] },
    about: { type: String, default: '' },
    status: { type: String, default: 'Active' },
  },
  { timestamps: true }
);

const Engineer: Model<IEngineer> = mongoose.models.Engineer || mongoose.model<IEngineer>('Engineer', EngineerSchema);
export default Engineer;
