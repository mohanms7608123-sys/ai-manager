import mongoose from 'mongoose';
import { 
  User, 
  EngineerProfile, 
  ContractorProfile, 
  Worker, 
  Attendance, 
  Project, 
  Notification 
} from './models/schemas';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_construction';

// Disable Mongoose command buffering globally to eliminate 10,000ms buffering timeouts
mongoose.set('bufferCommands', false);

// Global connection state interface for Next.js hot-reloading & serverless caching
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
  var mongoListenersAdded: boolean | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

// Global Connection Event Listeners
if (!global.mongoListenersAdded) {
  global.mongoListenersAdded = true;
  mongoose.connection.on('connected', () => {
    console.log('🟢 [MongoDB] Connection established successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('🔴 [MongoDB] Connection error event:', err?.message || err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('🟡 [MongoDB] Connection disconnected. Reconnect logic active.');
    cached.conn = null;
    cached.promise = null;
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🟢 [MongoDB] Reconnected successfully.');
  });
}

export async function seedDatabase() {
  try {
    // 1. Seed Users if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create([
        { name: 'Super Admin', email: 'admin@construction.com', role: 'Admin', company: 'Global Admin ERP', status: 'Active' },
        { name: 'Helios Corporate HQ', email: 'client@corporate.com', role: 'Client', company: 'Helios Developers Inc.', status: 'Active' },
        { name: 'Rahul Sharma', email: 'rahul@smartbuild.ai', role: 'Engineer', company: 'SmartBuild Structural Consultants', status: 'Active' },
        { name: 'Priya Nair', email: 'priya@smartbuild.ai', role: 'Engineer', company: 'Apex Electrical Systems', status: 'Active' },
        { name: 'Skyline Construction Pvt Ltd', email: 'skyline@construction.com', role: 'Contractor', company: 'Skyline Construction Pvt Ltd', status: 'Active' },
        { name: 'MS Builders', email: 'msbuilders@construction.com', role: 'Contractor', company: 'MS Builders', status: 'Active' }
      ]);
    }

    // 2. Seed ONLY 2 Approved Online Engineers if empty
    const engineerCount = await EngineerProfile.countDocuments();
    if (engineerCount === 0) {
      await EngineerProfile.create([
        {
          photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
          fullName: 'Rahul Sharma',
          engineerId: 'ENG-1001',
          specialization: 'Structural Engineer',
          experience: 8,
          qualification: 'B.Tech Civil',
          currentCompany: 'SmartBuild Structural Consultants',
          currentProjects: ['Helios Tower A', 'Central Plaza'],
          availability: 'Available',
          isOnline: true,
          languages: ['English', 'Hindi'],
          skills: ['AutoCAD', 'STAAD Pro', 'BIM Modeling', 'Concrete Testing'],
          rating: 4.9,
          location: 'Bengaluru',
          completedProjects: 14,
          about: 'Lead structural engineer with 8 years experience in commercial office building design and site supervision.',
          status: 'Approved'
        },
        {
          photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
          fullName: 'Priya Nair',
          engineerId: 'ENG-1002',
          specialization: 'Electrical Engineer',
          experience: 6,
          qualification: 'M.Tech Electrical',
          currentCompany: 'Apex Electrical Systems',
          currentProjects: ['AeroCity Complex'],
          availability: 'Available',
          isOnline: true,
          languages: ['English', 'Telugu'],
          skills: ['Electrical Grids', 'BIM Coordination', 'LEED Certification'],
          rating: 4.8,
          location: 'Hyderabad',
          completedProjects: 11,
          about: 'Electrical engineer specializing in G+4 office buildings and heavy power distribution.',
          status: 'Approved'
        }
      ]);
    }

    // 3. Seed ONLY 2 Approved Online Contractors if empty
    const contractorCount = await ContractorProfile.countDocuments();
    if (contractorCount === 0) {
      await ContractorProfile.create([
        {
          photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
          companyName: 'Skyline Construction Pvt Ltd',
          ownerName: 'Skyline Operations',
          contractorId: 'CON001',
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
          photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
          companyName: 'MS Builders',
          ownerName: 'MS Management',
          contractorId: 'CON002',
          licenseNumber: 'IND-CON-002-CLASS-A',
          experience: 10,
          projectsCompleted: 22,
          rating: 4.8,
          currentWorkload: 1,
          availability: 'Available',
          isOnline: true,
          status: 'Approved'
        }
      ]);
    }

    // 4. Seed Workers if empty
    const workerCount = await Worker.countDocuments();
    if (workerCount === 0) {
      await Worker.create([
        {
          workerId: 'WRK-1001',
          name: 'Arjun Das',
          photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
          age: 32,
          gender: 'Male',
          phone: '+91 98765 43210',
          address: 'Block B, Sector 63, Noida, UP',
          emergencyContact: 'Saraswati Das (+91 98765 43211)',
          joiningDate: '2023-01-15',
          department: 'Civil Structure',
          trade: 'Master Rebar Mason',
          salary: 35000,
          projectId: 'PROJ-101',
          projectName: 'Helios Corporate HQ (Tower A)',
          contractorId: 'CON001',
          username: 'arjun.das',
          passwordHash: 'worker123',
          qrCode: 'WRK-1001-ARJUN-DAS-CON001',
          isLocked: false,
          failedAttempts: 0,
          status: 'Active'
        },
        {
          workerId: 'WRK-1002',
          name: 'Rajesh Kumar',
          photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
          age: 28,
          gender: 'Male',
          phone: '+91 98123 45678',
          address: 'Labor Colony, Sector 62, Noida, UP',
          emergencyContact: 'Sunita Kumar (+91 98123 45679)',
          joiningDate: '2023-05-10',
          department: 'Concrete Pouring',
          trade: 'Concrete Pump Operator',
          salary: 32000,
          projectId: 'PROJ-101',
          projectName: 'Helios Corporate HQ (Tower A)',
          contractorId: 'CON001',
          username: 'rajesh.kumar',
          passwordHash: 'worker123',
          qrCode: 'WRK-1002-RAJESH-KUMAR-CON001',
          isLocked: false,
          failedAttempts: 0,
          status: 'Active'
        }
      ]);
    }
  } catch (err) {
    console.error('Database seeding error:', err);
  }
}

export async function connectDB(): Promise<boolean> {
  // Ensure bufferCommands false
  mongoose.set('bufferCommands', false);

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (cached.conn && cached.conn.connection.readyState === 1) {
    return true;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500, // Fast fail in 2.5s if offline
      connectTimeoutMS: 3000,
      autoIndex: true
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('✅ [MongoDB] Connection initialized successfully.');
      seedDatabase().catch((e) => console.error('Database seeding error:', e));
      return m;
    }).catch((err) => {
      console.warn('⚠️ [MongoDB] Connection offline/timed out. Switching to high-speed dynamic store mode:', err?.message || err);
      cached.promise = null;
      return null;
    });
  }

  try {
    const conn = await cached.promise;
    if (conn && conn.connection.readyState === 1) {
      cached.conn = conn;
      return true;
    }
  } catch (err) {
    cached.promise = null;
  }

  return false;
}
