// src/lib/models/client.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClient extends Document {
  clientName: string;
  companyName: string;
  profilePhoto?: string; // URL to Cloudinary or stored location
  email: string;
  phoneNumber: string;
  address: string;
  projectType: string;
  projectLocation: string;
  projectBudget: number;
  projectDescription: string;
  projectStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema<IClient> = new Schema(
  {
    clientName: { type: String, required: true },
    companyName: { type: String, required: true },
    profilePhoto: { type: String },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    projectType: { type: String, required: true },
    projectLocation: { type: String, required: true },
    projectBudget: { type: Number, required: true },
    projectDescription: { type: String, required: true },
    projectStatus: { type: String, default: 'Pending' },
  },
  { timestamps: true }
);

const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
export default Client;
