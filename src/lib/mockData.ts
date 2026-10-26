export type ProjectStatus = 
  | 'Pending Admin Approval'
  | 'Approved by Admin'
  | 'Pending Engineer Approval'
  | 'Waiting for Engineer Approval'
  | 'Engineer Approved'
  | 'Engineer Rejected'
  | 'Pending Contractor Approval'
  | 'Waiting Contractor Approval'
  | 'Construction Ready'
  | 'In Progress'
  | 'Completed'
  | 'Rejected'
  | 'On Hold'
  | 'Planning';

export interface Project {
  id: string;
  name: string;
  location: string;
  status: ProjectStatus;
  completion: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  health: 'Healthy' | 'Risk' | 'Critical';
  description: string;
  coordinates: { lat: number; lng: number };
  milestones: { name: string; date: string; status: 'Pending' | 'Completed' | 'Delayed' }[];
  timeline: { title: string; date: string; description: string; type: 'milestone' | 'incident' | 'log' }[];
  logs: { date: string; workerCount: number; incidents: number; weather: string; logs: string }[];
  images: { url: string; caption: string; date: string; category: 'Drone' | 'Site' | 'Safety' }[];
}

export interface Material {
  id: string;
  name: string;
  category: 'Structural' | 'Electrical' | 'Plumbing' | 'Finishing' | 'Machinery';
  stock: number;
  unit: string;
  minThreshold: number;
  costPerUnit: number;
  supplier: string;
  wasteForecast: number; // percentage
  status: 'In Stock' | 'Low Stock' | 'Critical Stock';
  reorderQuantity: number;
  recentOrders: { id: string; qty: number; cost: number; date: string; status: 'Pending' | 'Delivered' }[];
}

export interface Worker {
  id: string;
  name: string;
  role: 'Contractor' | 'Project Manager' | 'Engineer' | 'Architect' | 'Client' | 'Worker' | 'Supplier' | 'Safety Officer' | 'Supervisor';
  attendance: 'Present' | 'Absent' | 'On Leave';
  salary: number;
  productivity: number; // percentage
  skills: string[];
  safetyCertifications: string[];
  attendanceRate: number; // percentage
  faceConfidence: number; // simulation face scan confidence
  checkInTime: string;
  status?: string;
  assignedProject?: string;
  projectId?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'Crane' | 'Excavator' | 'Concrete Mixer' | 'Bulldozer' | 'Loader';
  status: 'Active' | 'Maintenance' | 'Idle' | 'Faulty';
  health: number; // percentage
  fuel: number; // percentage
  telemetry: { speed?: number; rotation?: number; loadWeight?: number; hoursRun: number };
  gps: { lat: number; lng: number };
  maintenanceSchedule: string;
  breakdownProbability: number; // percentage
}

export interface SafetyIncident {
  id: string;
  date: string;
  type: 'Helmet Violation' | 'Slip & Fall' | 'Equipment Near Miss' | 'Hazard Zone Access' | 'Other';
  severity: 'Low' | 'Medium' | 'High';
  status: 'Resolved' | 'Under Investigation' | 'Open';
  workerName?: string;
  imageUrl?: string;
  description: string;
}

export interface WorkLog {
  id: string;
  engineerId: string;
  engineerName: string;
  project: string;
  site: string;
  taskDescription: string;
  images?: string[];
  blueprintAttachment?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'In Progress' | 'Completed' | 'Pending' | 'Flagged';
  createdTime: string;
  createdDate: string;
  gpsLocation?: { lat: number; lng: number };
}

export interface AttendanceRecord {
  id: string;
  engineerId: string;
  projectId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  workingHours: number;
  status: 'Present' | 'Absent' | 'Half Day' | 'Leave' | 'Late';
  attendanceSource: 'Work Log' | 'Manual' | 'QR Code' | 'Biometric';
  createdBy: string;
}

export interface BudgetForecast {
  month: string;
  planned: number;
  actual: number;
  forecast: number;
  materials: number;
  labor: number;
  equipment: number;
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Helios Corporate HQ (Tower A)',
    location: 'Sector 62, Noida, India',
    status: 'In Progress',
    completion: 62,
    startDate: '2026-01-10',
    endDate: '2027-02-15',
    budget: 45000000,
    spent: 28500000,
    health: 'Risk',
    description: 'A 24-story state-of-the-art office skyscraper implementing LEED Gold standards, solar facades, and automated environmental controls.',
    coordinates: { lat: 28.6273, lng: 77.3725 },
    milestones: [
      { name: 'Excavation & Foundation', date: '2026-02-28', status: 'Completed' },
      { name: 'Core Structural Framework', date: '2026-07-15', status: 'Completed' },
      { name: 'HVAC & Plumbing Rough-In', date: '2026-10-10', status: 'Pending' },
      { name: 'Exterior Glass Facade', date: '2026-12-05', status: 'Pending' },
      { name: 'Interior Fit-Out', date: '2027-01-30', status: 'Pending' }
    ],
    timeline: [
      { title: 'Excavation Completed', date: '2026-02-20', description: 'Excavation reached target depth of 18m.', type: 'milestone' },
      { title: 'Concrete Crack Warning', date: '2026-05-12', description: 'Minor micro-cracks detected in column B-12. Resolved with epoxy sealing.', type: 'incident' },
      { title: 'Foundation Concreting', date: '2026-03-05', description: 'Poured 4,200 cubic meters of high-durability concrete.', type: 'milestone' },
      { title: 'Superstructure Slab (Floor 10)', date: '2026-06-18', description: 'Slab structural grid finalized.', type: 'log' },
      { title: 'Steel Beam Alignment Issue', date: '2026-07-08', description: 'BIM Clash detected on Floor 12 plumbing vs steel girder. CAD revised.', type: 'incident' }
    ],
    logs: [
      { date: '2026-07-17', workerCount: 142, incidents: 0, weather: 'Sunny (34°C)', logs: 'Normal workflow. Floor 14 columns steel reinforcement layout completed. Drone site inspection scan completed at 15:00.' },
      { date: '2026-07-16', workerCount: 138, incidents: 1, weather: 'Thunderstorms (29°C)', logs: 'Work suspended for 2 hours in afternoon due to heavy rain. Worker flag: helmet warning on scaffolding. Resolved.' },
      { date: '2026-07-15', workerCount: 145, incidents: 0, weather: 'Cloudy (31°C)', logs: 'Floor 13 slab concreting finished. 3D Model structure alignment verification completed with 99.8% match.' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80', caption: 'Drone overview of Core Tower A structure', date: '2026-07-15', category: 'Drone' },
      { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', caption: 'Floor 12 reinforcement installation', date: '2026-07-16', category: 'Site' },
      { url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80', caption: 'Safety inspector checking harness rigging', date: '2026-07-17', category: 'Safety' }
    ]
  },
  {
    id: 'proj-2',
    name: 'Metro Line 3 Ext (Underground Tunnel)',
    location: 'Central Mumbai, India',
    status: 'In Progress',
    completion: 45,
    startDate: '2025-08-01',
    endDate: '2028-04-10',
    budget: 120000000,
    spent: 59000000,
    health: 'Healthy',
    description: 'Underground transit infrastructure spanning 4.2 km with 3 stations, using specialized Tunnel Boring Machines (TBMs) and precast concrete lining segments.',
    coordinates: { lat: 18.922, lng: 72.8346 },
    milestones: [
      { name: 'Shaft Sinking', date: '2025-11-30', status: 'Completed' },
      { name: 'TBM Launching', date: '2026-01-15', status: 'Completed' },
      { name: 'Tunneling Breakthrough 1', date: '2026-09-30', status: 'Pending' },
      { name: 'Station Civil Structure', date: '2027-05-15', status: 'Pending' }
    ],
    timeline: [
      { title: 'TBM 1 Commenced Drilling', date: '2026-01-20', description: 'TBM "Mahi" started active excavation towards station 1.', type: 'milestone' }
    ],
    logs: [
      { date: '2026-07-17', workerCount: 88, incidents: 0, weather: 'Humid (30°C)', logs: 'TBM 1 advanced 12 meters. Hydraulic system monitoring optimal. Concrete segment installation on ring 412.' }
    ],
    images: []
  },
  {
    id: 'proj-3',
    name: 'AeroCity Residential Enclave',
    location: 'Dwarka Expressway, Delhi, India',
    status: 'Planning',
    completion: 5,
    startDate: '2026-09-01',
    endDate: '2029-08-30',
    budget: 78000000,
    spent: 1200000,
    health: 'Healthy',
    description: 'High-end smart residential estate with 6 towers, luxury amenities, centralized HVAC, and recycled water micro-plants.',
    coordinates: { lat: 28.5562, lng: 77.0674 },
    milestones: [
      { name: 'Excavation Permission Approval', date: '2026-08-15', status: 'Pending' }
    ],
    timeline: [],
    logs: [],
    images: []
  }
];

export const MOCK_MATERIALS: Material[] = [
  {
    id: 'mat-1',
    name: 'Structural Steel Rebars (Grade Fe550)',
    category: 'Structural',
    stock: 450,
    unit: 'Tons',
    minThreshold: 120,
    costPerUnit: 780,
    supplier: 'Tata Steel Infrastructure',
    wasteForecast: 4.8,
    status: 'In Stock',
    reorderQuantity: 200,
    recentOrders: [
      { id: 'po-101', qty: 150, cost: 117000, date: '2026-07-10', status: 'Delivered' },
      { id: 'po-104', qty: 150, cost: 117000, date: '2026-07-16', status: 'Pending' }
    ]
  },
  {
    id: 'mat-2',
    name: 'Ready-Mix Concrete (M40 Premium)',
    category: 'Structural',
    stock: 65,
    unit: 'Cubic Meters',
    minThreshold: 150,
    costPerUnit: 115,
    supplier: 'Ultratech Cement Ltd.',
    wasteForecast: 8.2,
    status: 'Critical Stock',
    reorderQuantity: 300,
    recentOrders: [
      { id: 'po-102', qty: 250, cost: 28750, date: '2026-07-14', status: 'Pending' }
    ]
  },
  {
    id: 'mat-3',
    name: 'Copper PVC Cables (4 Sq mm)',
    category: 'Electrical',
    stock: 1200,
    unit: 'Meters',
    minThreshold: 500,
    costPerUnit: 3.5,
    supplier: 'Polycab Cables India',
    wasteForecast: 12.5,
    status: 'In Stock',
    reorderQuantity: 1000,
    recentOrders: []
  },
  {
    id: 'mat-4',
    name: 'Galvanized Piping (3-Inch)',
    category: 'Plumbing',
    stock: 85,
    unit: 'Meters',
    minThreshold: 150,
    costPerUnit: 18.5,
    supplier: 'Jindal Pipes Ltd.',
    wasteForecast: 3.1,
    status: 'Low Stock',
    reorderQuantity: 200,
    recentOrders: [
      { id: 'po-103', qty: 200, cost: 3700, date: '2026-07-15', status: 'Pending' }
    ]
  },
  {
    id: 'mat-5',
    name: 'Portland Cement (53 Grade)',
    category: 'Structural',
    stock: 2400,
    unit: 'Bags',
    minThreshold: 800,
    costPerUnit: 6.2,
    supplier: 'Ambuja Cements',
    wasteForecast: 5.5,
    status: 'In Stock',
    reorderQuantity: 1500,
    recentOrders: []
  }
];

export const MOCK_WORKERS: Worker[] = [
  {
    id: 'work-1',
    name: 'Rajesh Sharma',
    role: 'Contractor',
    attendance: 'Present',
    salary: 8500,
    productivity: 94,
    skills: ['Concrete Layout', 'Structural Drafting', 'Labor Sourcing'],
    safetyCertifications: ['OSHA 30-Hour Construction', 'Scaffold Safety Card'],
    attendanceRate: 98,
    faceConfidence: 99.4,
    checkInTime: '07:42'
  },
  {
    id: 'work-2',
    name: 'Vikram Aditya',
    role: 'Engineer',
    attendance: 'Present',
    salary: 11000,
    productivity: 88,
    skills: ['BIM coordination', 'Civil Engineering', 'Structural Stress Analysis'],
    safetyCertifications: ['First Aid & CPR Certification', 'Excavation Competent Person'],
    attendanceRate: 95,
    faceConfidence: 98.7,
    checkInTime: '07:55'
  },
  {
    id: 'work-3',
    name: 'Arjun Das',
    role: 'Worker',
    attendance: 'Present',
    salary: 2200,
    productivity: 91,
    skills: ['Ironworking', 'Arc Welding', 'Steel Rebar Lacing'],
    safetyCertifications: ['Rigging & Signalperson Certification'],
    attendanceRate: 92,
    faceConfidence: 96.2,
    checkInTime: '08:04'
  },
  {
    id: 'work-4',
    name: 'Suhail Khan',
    role: 'Worker',
    attendance: 'Absent',
    salary: 2000,
    productivity: 72,
    skills: ['Masonry', 'Plastering', 'Formwork Assembly'],
    safetyCertifications: ['Confined Space Entry'],
    attendanceRate: 85,
    faceConfidence: 0,
    checkInTime: '--:--'
  },
  {
    id: 'work-5',
    name: 'Sneha Rao',
    role: 'Architect',
    attendance: 'On Leave',
    salary: 13000,
    productivity: 95,
    skills: ['Autodesk Revit', 'Rhino 3D', 'Green Building Design'],
    safetyCertifications: ['LEED Accredited Professional'],
    attendanceRate: 97,
    faceConfidence: 0,
    checkInTime: '--:--'
  },
  {
    id: 'work-6',
    name: 'Ketan Mehta',
    role: 'Safety Officer',
    attendance: 'Present',
    salary: 9500,
    productivity: 97,
    skills: ['Risk Mitigation', 'Site Auditing', 'OSHA Compliance Tracking'],
    safetyCertifications: ['OSHA 500 Trainer', 'Hazwoper 40-Hour'],
    attendanceRate: 99,
    faceConfidence: 99.1,
    checkInTime: '07:30'
  }
];

export const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: 'eq-1',
    name: 'Liebherr 280 EC-H Tower Crane',
    type: 'Crane',
    status: 'Active',
    health: 92,
    fuel: 85,
    telemetry: { speed: 8.5, rotation: 120, loadWeight: 4.8, hoursRun: 1420 },
    gps: { lat: 28.6273, lng: 77.3724 },
    maintenanceSchedule: '2026-08-05',
    breakdownProbability: 4.2
  },
  {
    id: 'eq-2',
    name: 'CAT 320 Hydraulic Excavator',
    type: 'Excavator',
    status: 'Active',
    health: 78,
    fuel: 42,
    telemetry: { speed: 12, loadWeight: 1.2, hoursRun: 2950 },
    gps: { lat: 28.6275, lng: 77.3728 },
    maintenanceSchedule: '2026-07-28',
    breakdownProbability: 14.8
  },
  {
    id: 'eq-3',
    name: 'Schwing Stetter Concrete Mixer',
    type: 'Concrete Mixer',
    status: 'Idle',
    health: 96,
    fuel: 90,
    telemetry: { hoursRun: 850 },
    gps: { lat: 28.6271, lng: 77.3721 },
    maintenanceSchedule: '2026-09-10',
    breakdownProbability: 2.1
  },
  {
    id: 'eq-4',
    name: 'Komatsu D65 Bulldozer',
    type: 'Bulldozer',
    status: 'Maintenance',
    health: 48,
    fuel: 15,
    telemetry: { hoursRun: 4120 },
    gps: { lat: 28.6269, lng: 77.3719 },
    maintenanceSchedule: '2026-07-17',
    breakdownProbability: 58.5
  }
];

export const MOCK_SAFETY: SafetyIncident[] = [
  {
    id: 'saf-1',
    date: '2026-07-16 14:32',
    type: 'Helmet Violation',
    severity: 'Medium',
    status: 'Resolved',
    workerName: 'Arjun Das',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
    description: 'Worker detected at scaffolding floor 12 without hardhat. Drone visual alert triggered. Worker put on helmet within 2 minutes.'
  },
  {
    id: 'saf-2',
    date: '2026-07-14 09:15',
    type: 'Hazard Zone Access',
    severity: 'High',
    status: 'Resolved',
    workerName: 'Unknown (Visitor)',
    description: 'Unauthorized access detected inside excavation zone exclusion radius near excavator bucket. Site horn sounded. Visitor escorted out.'
  },
  {
    id: 'saf-3',
    date: '2026-07-12 11:00',
    type: 'Slip & Fall',
    severity: 'Low',
    status: 'Resolved',
    workerName: 'Ramesh Singh',
    description: 'Minor trip over scrap cabling in main hallway. Administered basic first aid for minor scrape. Cable routing cleared by safety team.'
  }
];

export const MOCK_BUDGET: BudgetForecast[] = [
  { month: 'Jan', planned: 2000000, actual: 1950000, forecast: 2000000, materials: 900000, labor: 650000, equipment: 400000 },
  { month: 'Feb', planned: 2500000, actual: 2600000, forecast: 2500000, materials: 1200000, labor: 700000, equipment: 700000 },
  { month: 'Mar', planned: 3000000, actual: 3200000, forecast: 3100000, materials: 1600000, labor: 800000, equipment: 800000 },
  { month: 'Apr', planned: 3500000, actual: 3400000, forecast: 3500000, materials: 1700000, labor: 850000, equipment: 850000 },
  { month: 'May', planned: 4000000, actual: 4450000, forecast: 4300000, materials: 2200000, labor: 1100000, equipment: 1150000 },
  { month: 'Jun', planned: 4500000, actual: 5100000, forecast: 4900000, materials: 2600000, labor: 1200000, equipment: 1300000 },
  { month: 'Jul', planned: 5000000, actual: 5450000, forecast: 5500000, materials: 2900000, labor: 1250000, equipment: 1300000 },
  { month: 'Aug', planned: 5000000, actual: 0, forecast: 5200000, materials: 2700000, labor: 1250000, equipment: 1250000 },
  { month: 'Sep', planned: 4500000, actual: 0, forecast: 4700000, materials: 2400000, labor: 1150000, equipment: 1150000 },
  { month: 'Oct', planned: 4000000, actual: 0, forecast: 4100000, materials: 2100000, labor: 1000000, equipment: 1000000 },
  { month: 'Nov', planned: 3500000, actual: 0, forecast: 3600000, materials: 1800000, labor: 900000, equipment: 900000 },
  { month: 'Dec', planned: 3000000, actual: 0, forecast: 3100000, materials: 1500000, labor: 800000, equipment: 800000 }
];

export const MOCK_NOTIFICATIONS = [
  { id: 'n-1', type: 'incident', title: 'Safety Violation Detected', message: 'Worker Arjun Das scaffolding floor 12 without hardhat.', time: '10 min ago', isNew: true },
  { id: 'n-2', type: 'material', title: 'Concrete Stock Alert', message: 'M40 Ready-Mix Concrete is at 65 cubic meters (critical threshold 150).', time: '25 min ago', isNew: true },
  { id: 'n-3', type: 'equipment', title: 'Excavator Maintenance Critical', message: 'CAT 320 Hydraulic Excavator breakdown probability is 58.5%.', time: '1 hour ago', isNew: false },
  { id: 'n-4', type: 'budget', title: 'Budget Deviation Alert', message: 'Steel reinforcement costs exceeded July budget estimate by 18.2%.', time: '4 hours ago', isNew: false },
  { id: 'n-5', type: 'weather', title: 'Weather Alert', message: 'Heavy thunderstorm warning for Sector 62 starting 14:00. Secure loose structures.', time: '5 hours ago', isNew: false }
];

export const MOCK_COPILOT_CONTEXTS: Record<string, { role: string; intro: string; metrics: string[]; suggestions: string[] }> = {
  '/dashboard': {
    role: 'Operations Director',
    intro: 'Active project monitoring system status: Helios Tower A is at 62% progress, running 18% over-budget on structural steel.',
    metrics: [
      'Project Completion: 62% (on schedule)',
      'Steel Usage: 18% above estimates',
      'Safety Index: 94.2% (1 open ticket)',
      'Active Workforce: 142 men on-site'
    ],
    suggestions: [
      'Verify structural concrete pouring invoices from Ultratech Cement.',
      'Check wind speeds for Crane-1 operations. Forecasted gusts: 28 km/h.',
      'Investigate rebar scrap logs to isolate steel wastage reasons.'
    ]
  },
  '/3d-twin': {
    role: 'BIM Expert',
    intro: '3D Building twin compiled. Running automated clash detection scan and green energy rating audit.',
    metrics: [
      'Structural Elements: 2,420 registered',
      'Clash Status: 0 conflicts detected',
      'Energy Efficiency: LEED Gold (84/110 pts)',
      'Plumbing / MEP Integrity: 100%'
    ],
    suggestions: [
      'Activate day/night simulation to evaluate solar glare on Glass Facade.',
      'Explode structural floors to verify pipe layout intersection on Floor 12.',
      'Increase concrete insulation thickness on Tower face for +3% HVAC savings.'
    ]
  },
  '/materials': {
    role: 'Supply Chain Expert',
    intro: 'Material inventory active. Re-routing deliveries to handle upcoming steel demand and concrete deficits.',
    metrics: [
      'Concrete: 65 m³ (Low stock alert)',
      'Steel: 450 Tons (Sufficient)',
      'Predicted Waste Factor: 6.8% global',
      'Active Purchase Orders: 3 pending'
    ],
    suggestions: [
      'Approve Purchase Order po-102 (Ultratech Concrete) to avoid concrete delays.',
      'Switch supplier for copper wiring to trim procurement lead time by 3 days.',
      'Introduce smart tag bins to reduce Fe550 steel rebar cutting waste.'
    ]
  },
  '/workers': {
    role: 'HR Specialist',
    intro: 'Worker logs synced. Productivity calculations based on biomechanics scans show 91% global efficiency.',
    metrics: [
      'Attendance today: 148 / 155 workers',
      'Suhail Khan (Mason) marked absent',
      'Safety training compliance: 98.2%',
      'Salary disbursement: 100% processed'
    ],
    suggestions: [
      'Assign Arjun Das to scaffolding supervisor under safety supervision.',
      'Schedule refresher course on "Confined Space Entry" for Arjun and Suhail.',
      'Reallocate 4 workers from Level 8 finishes to Level 12 masonry grids.'
    ]
  },
  '/equipment': {
    role: 'Equipment Engineer',
    intro: 'IoT nodes transmitting. Crane load limits normal. Excavator 320 reporting elevated temperature in pump system.',
    metrics: [
      'Active machines: 3 on-site',
      'Excavator Health: 78% (Attention)',
      'Bulldozer Status: Undergoing repair',
      'Avg fuel consumption: 14.2 L/hr'
    ],
    suggestions: [
      'Schedule CAT Excavator pump diagnostics today (Breakdown probability: 14.8%).',
      'Recall Bulldozer D65 from workshop. Repairs marked 100% completed.',
      'Switch concrete mixers to standby idle speed mode to cut diesel waste.'
    ]
  },
  '/budget': {
    role: 'Financial Controller',
    intro: 'Financial ledger reconciled. Estimated margins down 1.4% due to steel price indexing adjustment.',
    metrics: [
      'Total Budget: ₹45,00,00,000',
      'Actual Outflow: ₹28,50,00,000',
      'Forecast Overrun: +₹8,20,00,000 (1.8%)',
      'Labor Spend Ratio: 26.2% of total'
    ],
    suggestions: [
      'Lock steel prices with Tata Steel futures to shield against volatility.',
      'Audit contractor bills for Level 10 interior drywall installation.',
      'Refinance machinery leases to recover ₹42,000 in monthly interest.'
    ]
  },
  '/safety': {
    role: 'EHS Officer',
    intro: 'Site monitoring feeds connected. Live video analytics identifying PPE conformance ratios. Incident rate stable.',
    metrics: [
      'PPE Compliance: 97.4%',
      'Active Hazard Areas: 2 defined',
      'Open Safety Tickets: 0',
      'Avg resolution time: 14 mins'
    ],
    suggestions: [
      'Deploy localized alerts to workers entering Sector C crane swing zone.',
      'Reroute scaffolding access paths due to floor slickness logs.',
      'Acknowledge helmet detection alert for worker Arjun Das.'
    ]
  },
  '/analytics': {
    role: 'Chief Data Scientist',
    intro: 'Projecting historical analytics and sensor metrics. Main delay vulnerability identified as rainy weather in August.',
    metrics: [
      'Schedule confidence: 89.2%',
      'Resource efficiency: 91.5%',
      'Weather delay estimate: 4 days',
      'Data points processed: 148,000'
    ],
    suggestions: [
      'Download the Weekly AI Operations Digest PDF to send to shareholders.',
      'Simulate high-risk rain scenarios in August to reschedule framing steps.',
      'Deploy vibration loggers on slab edge to forecast load deflection.'
    ]
  },
  '/drone-inspection': {
    role: 'Drone Inspection Expert',
    intro: 'Drone live telemetry connected. GPS coordinates live-broadcasting. Flight diagnostics ready for review.',
    metrics: [
      'Drones Registered: 3 active',
      'Avg Battery Status: 82%',
      'Camera feed speed: 15 m/s',
      'Last Video analysis: Rebars detected'
    ],
    suggestions: [
      'Perform autonomous visual sweep on Sector A Scaffolding.',
      'Mark GPS waypoint boundary around excavation exclusions.',
      'Generate inspection safety report and export PDF summaries.'
    ]
  },
  '/damage-inspection': {
    role: 'Damage Inspection Expert',
    intro: 'Damage inspection console active. Laser sweeps operational. Ready to identify structural cracks, steel corrosion, and glass breaks.',
    metrics: [
      'Cracks Detected: 1 (Attention)',
      'Corrosion score: 4.2% surface',
      'Average Severity: 6.5/10',
      'Est Repair cost: ₹1,85,000'
    ],
    suggestions: [
      'Analyze Sector B foundation column crack sample.',
      'Assess steel corrosion severity metrics in warehouse rebar logs.',
      'Download the structural inspection audit report.'
    ]
  },
  '/attendance': {
    role: 'Attendance Coordinator',
    intro: 'AI Face recognition database synced. Shifts, leaves, and salary spreadsheets reconciled.',
    metrics: [
      'Crew Present: 148 / 155',
      'Biometric Confidence: 99.4%',
      'Pending leave applications: 2',
      'Total Overtime today: 24 hrs'
    ],
    suggestions: [
      'Register new worker face profile from webcam snapshots.',
      'Compute payroll salaries including overtime indices.',
      'Export monthly check-in history reports.'
    ]
  }
};

export const MOCK_WORK_LOGS: WorkLog[] = [
  {
    id: 'log-101',
    engineerId: 'work-2',
    engineerName: 'Vikram Aditya',
    project: 'Helios Corporate HQ (Tower A)',
    site: 'Sector 62 Noida Site A',
    taskDescription: 'Floor 14 rebar steel reinforcement sweeps completed.',
    priority: 'High',
    status: 'Completed',
    createdTime: '08:15',
    createdDate: new Date().toISOString().split('T')[0],
    gpsLocation: { lat: 28.6273, lng: 77.3725 }
  },
  {
    id: 'log-102',
    engineerId: 'work-2',
    engineerName: 'Vikram Aditya',
    project: 'Helios Corporate HQ (Tower A)',
    site: 'Sector 62 Noida Site A',
    taskDescription: 'Crane-1 wind telemetry is within safe threshold bounds.',
    priority: 'Medium',
    status: 'Completed',
    createdTime: '10:30',
    createdDate: new Date().toISOString().split('T')[0],
    gpsLocation: { lat: 28.6273, lng: 77.3725 }
  }
];

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'att-eng-1',
    engineerId: 'work-2',
    projectId: 'proj-1',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '08:15',
    checkOutTime: '--:--',
    workingHours: 0,
    status: 'Present',
    attendanceSource: 'Work Log',
    createdBy: 'work-2'
  }
];

