import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { ContractorProfile } from '@/lib/models/schemas';

export const DUMMY_CONTRACTORS = [
  {
    _id: 'con-001',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    companyName: 'Skyline Construction Pvt Ltd',
    ownerName: 'Skyline Operations',
    contractorId: 'CON001',
    username: 'skyline',
    email: 'skyline@construction.com',
    licenseNumber: 'IND-CON-001-CLASS-A',
    experience: 12,
    projectsCompleted: 28,
    rating: 4.9,
    currentWorkload: 2,
    availability: 'Available',
    isOnline: true,
    status: 'Approved'
  },
  {
    _id: 'con-002',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    companyName: 'MS Builders',
    ownerName: 'MS Management',
    contractorId: 'CON002',
    username: 'msbuilders',
    email: 'msbuilders@construction.com',
    licenseNumber: 'IND-CON-002-CLASS-A',
    experience: 10,
    projectsCompleted: 22,
    rating: 4.8,
    currentWorkload: 1,
    availability: 'Available',
    isOnline: true,
    status: 'Approved'
  }
];

export async function GET() {
  try {
    const isConnected = await connectDB();
    if (isConnected) {
      const contractors = await ContractorProfile.find({
        status: 'Approved',
        availability: 'Available'
      }).sort({ rating: -1 });

      if (contractors && contractors.length > 0) {
        return NextResponse.json({ success: true, contractors });
      }
    }
  } catch (error: any) {
    console.error('Error fetching contractors from MongoDB:', error);
  }

  return NextResponse.json({ success: true, contractors: DUMMY_CONTRACTORS });
}
