import { NextRequest, NextResponse } from 'next/server';
import { dbStore, formatIndianRupee } from '@/lib/dbStore';
import { connectDB } from '@/lib/db';
import { Project, Worker, ContractorProfile, EngineerProfile } from '@/lib/models/schemas';
import { SEED_20_WORKERS } from '@/app/api/workers/route';
import { generateConversationalAiResponse } from '@/lib/aiReasoningEngine';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pathname, query, role, messages = [], hasAttachment, attachmentName } = body;

    // Fetch Live Database Data for Context
    let projects = dbStore.getProjects();
    let workersList: any[] = SEED_20_WORKERS;
    let engineersList: any[] = [];
    let contractorsList: any[] = [];

    const isConnected = await connectDB();
    if (isConnected) {
      try {
        const dbProjects = await Project.find({}).sort({ createdAt: -1 });
        if (dbProjects && dbProjects.length > 0) {
          projects = dbProjects as any;
        }

        const dbWorkers = await Worker.find({});
        if (dbWorkers && dbWorkers.length > 0) {
          workersList = dbWorkers as any;
        }

        engineersList = await EngineerProfile.find({}) as any;
        contractorsList = await ContractorProfile.find({}) as any;
      } catch (e) {
        console.error('Error fetching MongoDB data for copilot:', e);
      }
    }

    const notifications = dbStore.getNotifications();
    const materials = dbStore.getMaterials();
    const equipment = dbStore.getEquipment();

    const dbContext = {
      projects,
      workers: workersList,
      engineers: engineersList,
      contractors: contractorsList,
      materials,
      equipment,
      notifications
    };

    // 1. If Gemini API Key is configured in Environment, call Gemini with full Conversation History
    if (GEMINI_API_KEY) {
      try {
        const historyText = messages.slice(-6).map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an enterprise AI Construction Copilot (like ChatGPT or Gemini specialized in Construction Management).
User Role: "${role || 'Client'}". Current Page: "${pathname}".
Live Construction ERP Database Context:
Projects (${projects.length}): ${JSON.stringify(projects.map(p => ({ name: p.name, status: p.status, budget: p.budget, spent: p.spent, location: p.location })))}
Workers Count: ${workersList.length} (Present: ${workersList.filter(w => w.attendanceStatus === 'Present' || w.status === 'Active').length})

Conversation History:
${historyText}

User Prompt: "${query}"

Respond naturally, accurately, and dynamically as a human Construction AI Manager. Use formatted Indian Rupee (₹) where relevant.`
              }]
            }]
          })
        });

        const resData = await response.json();
        const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return NextResponse.json({ success: true, content: text });
        }
      } catch (err) {
        console.error('Gemini API query failed, utilizing Conversational AI Engine:', err);
      }
    }

    // 2. Real Conversational AI Reasoning Engine (Dynamic NLP & Context Memory)
    const result = generateConversationalAiResponse(
      query,
      messages,
      role || 'Client',
      pathname || '/dashboard',
      dbContext,
      hasAttachment,
      attachmentName
    );

    return NextResponse.json({ 
      success: true, 
      content: result.content, 
      visionAnalysis: result.visionAnalysis 
    });

  } catch (error: any) {
    console.error('Copilot route exception:', error);
    return NextResponse.json({ 
      success: true, 
      content: 'I am here to assist with your construction management operations! How can I help you with your projects, budget, or workforce today?' 
    });
  }
}
