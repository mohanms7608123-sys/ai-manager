import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/dbStore';
import { connectDB } from '@/lib/db';
import { Message, Task, Meeting } from '@/lib/models/schemas';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId') || 'proj-1';

  const isConnected = await connectDB();
  if (isConnected) {
    try {
      const messages = await Message.find({ projectId }).sort({ createdAt: 1 });
      const tasks = await Task.find({ projectId }).sort({ createdAt: -1 });
      const meetings = await Meeting.find({ projectId }).sort({ scheduledTime: 1 });

      return NextResponse.json({
        success: true,
        messages: messages.length > 0 ? messages : dbStore.getMessages(projectId),
        tasks: tasks.length > 0 ? tasks : dbStore.getTasks(projectId),
        meetings: meetings.length > 0 ? meetings : dbStore.getMeetings(projectId)
      });
    } catch (err) {
      console.error('Error fetching MongoDB workspace items:', err);
    }
  }

  return NextResponse.json({
    success: true,
    messages: dbStore.getMessages(projectId),
    tasks: dbStore.getTasks(projectId),
    meetings: dbStore.getMeetings(projectId)
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, projectId, senderRole, senderName, messageText, attachments, taskTitle, taskDesc, assignedWorker, meetingTitle, scheduledTime, meetingLink } = body;

    if (!projectId) {
      return NextResponse.json({ success: false, message: 'Missing projectId' }, { status: 400 });
    }

    const isConnected = await connectDB();

    // 1. CHAT MESSAGE
    if (action === 'chat' || !action) {
      if (!messageText) return NextResponse.json({ success: false, message: 'Empty message text' }, { status: 400 });
      
      const newMsg = dbStore.addMessage({
        projectId,
        senderRole: senderRole || 'Client',
        senderName: senderName || 'Site Collaborator',
        messageText,
        attachments: attachments || []
      });

      if (isConnected) {
        try {
          await Message.create(newMsg);
        } catch (e) {
          console.error('MongoDB chat insert error:', e);
        }
      }

      return NextResponse.json({ success: true, messageItem: newMsg });
    }

    // 2. CREATE TASK
    if (action === 'task') {
      const newTask = dbStore.addTask({
        projectId,
        title: taskTitle || 'Site Inspection Task',
        description: taskDesc || 'Review structural alignment parameters',
        assignedWorker: assignedWorker || 'Unassigned Worker',
        status: 'Pending',
        progress: 0,
        createdByEngineer: senderName || 'Engineer'
      });

      if (isConnected) {
        try {
          await Task.create(newTask);
        } catch (e) {
          console.error('MongoDB task insert error:', e);
        }
      }

      return NextResponse.json({ success: true, taskItem: newTask });
    }

    // 3. SCHEDULE MEETING
    if (action === 'meeting') {
      const newMeeting = dbStore.addMeeting({
        projectId,
        title: meetingTitle || 'Project Review Meeting',
        scheduledTime: scheduledTime || new Date(Date.now() + 86400000).toISOString(),
        meetingLink: meetingLink || `https://meet.jit.si/smart-construction-${projectId}`,
        attendees: ['Client', 'Admin', 'Contractor', 'Engineer'],
        createdBy: senderName || 'Admin'
      });

      if (isConnected) {
        try {
          await Meeting.create(newMeeting);
        } catch (e) {
          console.error('MongoDB meeting insert error:', e);
        }
      }

      return NextResponse.json({ success: true, meetingItem: newMeeting });
    }

    return NextResponse.json({ success: false, message: 'Unknown workspace action' }, { status: 400 });
  } catch (error: any) {
    console.error('Workspace API Error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}
