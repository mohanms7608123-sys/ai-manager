import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { EngineerProfile } from '@/lib/models/schemas';

export const DUMMY_ENGINEERS = [
  {
    _id: 'eng-1001',
    fullName: 'Rahul Sharma',
    username: 'rahul.engineer',
    passwordHash: 'Rahul@123',
    engineerId: 'ENG-1001',
    specialization: 'Structural Engineer',
    experience: 8,
    qualification: 'B.Tech Civil',
    phone: '+91 9876543210',
    email: 'rahul@smartbuild.ai',
    location: 'Bengaluru',
    isOnline: true,
    availability: 'Available',
    approvedByAdmin: true,
    status: 'Approved',
    currentProjects: ['Helios Tower A', 'Central Plaza'],
    completedProjects: 14,
    currentProjectsCount: 2,
    rating: 4.9,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    currentCompany: 'SmartBuild Structural Consultants'
  },
  {
    _id: 'eng-1002',
    fullName: 'Priya Nair',
    username: 'priya.engineer',
    passwordHash: 'Priya@123',
    engineerId: 'ENG-1002',
    specialization: 'Electrical Engineer',
    experience: 6,
    qualification: 'M.Tech Electrical',
    phone: '+91 9123456780',
    email: 'priya@smartbuild.ai',
    location: 'Hyderabad',
    isOnline: true,
    availability: 'Available',
    approvedByAdmin: true,
    status: 'Approved',
    currentProjects: ['AeroCity Complex'],
    completedProjects: 11,
    currentProjectsCount: 1,
    rating: 4.8,
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    currentCompany: 'Apex Electrical Systems'
  }
];

export async function GET() {
  try {
    const isConnected = await connectDB();
    if (isConnected) {
      const engineers = await EngineerProfile.find({
        status: 'Approved',
        availability: 'Available'
      }).sort({ rating: -1 });

      if (engineers && engineers.length > 0) {
        return NextResponse.json({ success: true, engineers });
      }
    }
  } catch (error: any) {
    console.error('Error fetching engineers from MongoDB:', error);
  }

  return NextResponse.json({ success: true, engineers: DUMMY_ENGINEERS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const isConnected = await connectDB();
    if (isConnected) {
      const newEng = await EngineerProfile.create({
        fullName: body.fullName,
        engineerId: body.engineerId || `ENG-${Math.floor(1000 + Math.random() * 9000)}`,
        specialization: body.specialization || 'Structural & Civil Engineer',
        experience: Number(body.experience) || 5,
        qualification: body.qualification || 'B.Tech Civil',
        phone: body.phone,
        email: body.email,
        location: body.location || 'Noida, India',
        isOnline: true,
        availability: 'Available',
        approvedByAdmin: true,
        status: 'Approved',
        rating: 5.0,
        photoUrl: body.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        currentCompany: body.currentCompany || 'SmartBuild Structural Consultants'
      } as any);
      return NextResponse.json({ success: true, engineer: newEng });
    }
  } catch (error: any) {
    console.error('Error saving engineer to MongoDB:', error);
  }

  return NextResponse.json({ success: true, message: 'Engineer registered dynamically' });
}
