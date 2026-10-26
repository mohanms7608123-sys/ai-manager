import { NextResponse } from 'next/server';
import { dbStore, formatIndianRupee } from '@/lib/dbStore';
import { connectDB } from '@/lib/db';
import { Project, ProjectRequest, Notification } from '@/lib/models/schemas';
import { socketHub } from '@/lib/socket';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = (searchParams.get('role') || 'Admin') as 'Admin' | 'Contractor' | 'Engineer' | 'Client';
  const email = searchParams.get('email') || undefined;
  const engineerId = searchParams.get('engineerId') || 'ENG-1001';
  const contractorId = searchParams.get('contractorId');

  console.log('[DEBUG] Logged-in engineer ID:', engineerId, 'Role:', role, 'Email:', email);

  const isConnected = await connectDB();
  let projects: any[] = [];
  let projectRequests: any[] = [];

  if (isConnected) {
    try {
      let filter: any = {};
      if (role === 'Client') {
        filter = email ? {
          $or: [
            { clientEmail: email.toLowerCase() },
            { clientEmail: 'client@corporate.com' }
          ]
        } : {};
      } else if (role === 'Engineer') {
        filter = {
          $or: [
            { status: 'Waiting for Engineer Approval' },
            { status: 'Engineer Approved' },
            { status: 'Engineer Rejected' },
            { assignedEngineerId: engineerId },
            { assignedEngineerName: /rahul|sharma|priya|nair/i }
          ]
        };
      } else if (role === 'Contractor') {
        filter = {
          $or: [
            { status: 'Waiting Contractor Approval' },
            { status: 'In Progress' },
            { assignedContractorId: contractorId || { $exists: true } }
          ]
        };
      }

      projects = await Project.find(filter).sort({ createdAt: -1 });
      projectRequests = await ProjectRequest.find({
        $or: [{ engineerId }, { status: 'Pending' }]
      }).sort({ createdAt: -1 });

    } catch (err) {
      console.error('MongoDB GET projects error:', err);
    }
  }

  // Fallback to in-memory dbStore if empty
  if (!projects || projects.length === 0) {
    projects = dbStore.getProjectsForRole(role, email);
  }

  if (!projectRequests || projectRequests.length === 0) {
    projectRequests = dbStore.getProjectRequests(engineerId);
  }

  const pendingRequests = projects.filter(p => p.status === 'Waiting for Engineer Approval');
  console.log('[DEBUG] Pending requests returned by API:', pendingRequests.length, 'Total Projects:', projects.length);

  return NextResponse.json({ 
    success: true, 
    projects,
    projectRequests
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[DEBUG] Project creation payload:', body);

    const { 
      name, 
      type, 
      description, 
      location, 
      budget, 
      startDate, 
      expectedCompletionDate, 
      blueprintUrl, 
      documents, 
      images, 
      priority, 
      clientName, 
      clientEmail,
      selectedEngineerId,
      selectedEngineerName,
      selectedEngineerUsername
    } = body;

    if (!name || !description || !location || !budget) {
      return NextResponse.json({ success: false, message: 'Missing required project fields (Name, Description, Location, Budget).' }, { status: 400 });
    }

    await connectDB();

    const projId = `PROJ-${Math.floor(1000 + Math.random() * 9000)}`;
    const engineerName = selectedEngineerName || 'Rahul Sharma';
    const engineerId = selectedEngineerId || 'ENG-1001';
    const engineerUsername = selectedEngineerUsername || (engineerId === 'ENG-1002' ? 'priya.engineer' : 'rahul.engineer');
    const finalClientName = clientName || 'Client User';
    const finalClientEmail = (clientEmail || 'client@corporate.com').toLowerCase();

    const newProjectData = {
      name,
      type: type || 'Commercial Building',
      description,
      location,
      budget: Number(budget),
      spent: 0,
      startDate: startDate ? new Date(startDate) : new Date(),
      expectedCompletionDate: expectedCompletionDate ? new Date(expectedCompletionDate) : new Date(Date.now() + 180 * 86400000),
      blueprintUrl: blueprintUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      documents: Array.isArray(documents) ? documents : (documents ? [{ name: 'Building-Plan.pdf', url: documents, fileType: 'PDF' }] : []),
      images: Array.isArray(images) ? images : (images ? [{ url: images, caption: 'Site Plan', category: 'Site' }] : []),
      priority: priority || 'High',
      status: 'Waiting for Engineer Approval' as const,
      health: 'Healthy' as const,
      completion: 0,
      clientName: finalClientName,
      clientEmail: finalClientEmail,
      assignedEngineerId: engineerId,
      assignedEngineerName: engineerName
    };

    let mongoProj = null;
    try {
      mongoProj = await Project.create(newProjectData);
    } catch (dbErr) {
      console.error('Error writing project to MongoDB:', dbErr);
    }

    const memoryProject = {
      ...newProjectData,
      id: mongoProj?._id?.toString() || projId,
      startDate: newProjectData.startDate.toISOString().split('T')[0],
      expectedCompletionDate: newProjectData.expectedCompletionDate.toISOString().split('T')[0],
      endDate: newProjectData.expectedCompletionDate.toISOString().split('T')[0],
      coordinates: { lat: 28.6273, lng: 77.3725 },
      milestones: [],
      timeline: [],
      logs: []
    };

    dbStore.addProject(memoryProject as any);

    // Save ProjectRequest Record (Requirement 1)
    const projectRequestData = {
      requestId: `REQ-${Math.floor(10000 + Math.random() * 90000)}`,
      projectId: memoryProject.id,
      projectName: name,
      clientId: finalClientEmail,
      clientName: finalClientName,
      engineerId: engineerId,
      engineerUsername: engineerUsername,
      engineerName: engineerName,
      budget: Number(budget),
      location,
      description,
      priority: priority || 'High',
      status: 'Pending' as const,
      createdAt: new Date(),
      notification: true
    };

    try { await ProjectRequest.create(projectRequestData); } catch (reqErr) { console.error('ProjectRequest MongoDB Error:', reqErr); }
    dbStore.addProjectRequest(projectRequestData as any);
    console.log('[DEBUG] Saved ProjectRequest:', projectRequestData);

    // Engineer Notification (Requirement 9)
    const engineerNotif = {
      recipientRole: 'Engineer' as const,
      recipientId: engineerId,
      title: 'New Project Request',
      message: `New project request received from ${finalClientName}.`,
      projectId: memoryProject.id,
      type: 'workflow' as const
    };
    
    try { await Notification.create(engineerNotif); } catch {}
    dbStore.createNotification(engineerNotif);

    // Client Notification (Requirement 9)
    const clientNotif = {
      recipientRole: 'Client' as const,
      recipientId: finalClientEmail,
      title: 'Request Sent to Engineer',
      message: `Project request for "${name}" sent to Engineer ${engineerName}. Status: Waiting for Engineer Approval.`,
      projectId: memoryProject.id,
      type: 'workflow' as const
    };
    
    try { await Notification.create(clientNotif); } catch {}
    dbStore.createNotification(clientNotif);

    return NextResponse.json({
      success: true,
      project: memoryProject,
      projectRequest: projectRequestData,
      message: `Project created! Request sent to Engineer ${engineerName}.`
    });

  } catch (error: any) {
    console.error('Project creation endpoint error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = body.id || body.projectId || body._id;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Project ID is required for updating.' }, { status: 400 });
    }

    const {
      name,
      type,
      description,
      location,
      budget,
      priority,
      expectedCompletionDate,
      startDate,
      blueprintUrl,
      documents,
      images,
      assignedEngineerId,
      assignedEngineerName,
      assignedContractorId,
      assignedContractorName,
      technicalComments,
      status
    } = body;

    const isConnected = await connectDB();

    let mongoProj: any = null;
    if (isConnected) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          mongoProj = await Project.findOne({ $or: [{ _id: id }, { id }] });
        } else {
          mongoProj = await Project.findOne({ id });
        }
      } catch (err) {
        console.error('MongoDB project lookup error in PUT:', err);
      }
    }

    const updateFields: any = {};
    if (name !== undefined && name !== null) updateFields.name = name;
    if (type !== undefined && type !== null) updateFields.type = type;
    if (description !== undefined && description !== null) updateFields.description = description;
    if (location !== undefined && location !== null) updateFields.location = location;
    if (budget !== undefined && budget !== null) updateFields.budget = Number(budget);
    if (priority !== undefined && priority !== null) updateFields.priority = priority;
    if (expectedCompletionDate !== undefined && expectedCompletionDate !== null) {
      updateFields.expectedCompletionDate = new Date(expectedCompletionDate);
    }
    if (startDate !== undefined && startDate !== null) {
      updateFields.startDate = new Date(startDate);
    }
    if (blueprintUrl !== undefined && blueprintUrl !== null) updateFields.blueprintUrl = blueprintUrl;
    if (documents !== undefined && documents !== null) {
      updateFields.documents = Array.isArray(documents) ? documents : (documents ? [{ name: 'Building-Plan.pdf', url: documents, fileType: 'PDF' }] : []);
    }
    if (images !== undefined && images !== null) {
      updateFields.images = Array.isArray(images) ? images : (images ? [{ url: images, caption: 'Site Plan', category: 'Site' }] : []);
    }
    if (assignedEngineerId !== undefined && assignedEngineerId !== null) updateFields.assignedEngineerId = assignedEngineerId;
    if (assignedEngineerName !== undefined && assignedEngineerName !== null) updateFields.assignedEngineerName = assignedEngineerName;
    if (assignedContractorId !== undefined && assignedContractorId !== null) updateFields.assignedContractorId = assignedContractorId;
    if (assignedContractorName !== undefined && assignedContractorName !== null) updateFields.assignedContractorName = assignedContractorName;
    if (technicalComments !== undefined && technicalComments !== null) updateFields.technicalComments = technicalComments;
    if (status !== undefined && status !== null) updateFields.status = status;

    let updatedMongoDoc = null;
    if (isConnected && mongoProj) {
      try {
        Object.assign(mongoProj, updateFields);
        updatedMongoDoc = await mongoProj.save();
      } catch (saveErr) {
        console.error('Error saving updated project in MongoDB:', saveErr);
      }
    } else if (isConnected) {
      try {
        const query = mongoose.Types.ObjectId.isValid(id) ? { $or: [{ _id: id }, { id }] } : { id };
        updatedMongoDoc = await Project.findOneAndUpdate(query, { $set: updateFields }, { new: true });
      } catch (upErr) {
        console.error('Error updating project in MongoDB:', upErr);
      }
    }

    // Sync matching ProjectRequest in MongoDB
    if (isConnected) {
      try {
        const reqUpdates: any = {};
        if (name !== undefined) reqUpdates.projectName = name;
        if (budget !== undefined) reqUpdates.budget = Number(budget);
        if (location !== undefined) reqUpdates.location = location;
        if (description !== undefined) reqUpdates.description = description;
        if (priority !== undefined) reqUpdates.priority = priority;
        if (assignedEngineerId !== undefined) reqUpdates.engineerId = assignedEngineerId;
        if (assignedEngineerName !== undefined) reqUpdates.engineerName = assignedEngineerName;

        await ProjectRequest.updateMany(
          { $or: [{ projectId: id }, { projectId: mongoProj?.id }, { projectId: mongoProj?._id?.toString() }] },
          { $set: reqUpdates }
        );
      } catch (reqErr) {
        console.error('Error updating ProjectRequest:', reqErr);
      }
    }

    // Update memory dbStore
    const memoryUpdates: any = { ...updateFields };
    if (updateFields.expectedCompletionDate instanceof Date) {
      memoryUpdates.expectedCompletionDate = updateFields.expectedCompletionDate.toISOString().split('T')[0];
    }
    if (updateFields.startDate instanceof Date) {
      memoryUpdates.startDate = updateFields.startDate.toISOString().split('T')[0];
    }

    dbStore.updateProject(id, memoryUpdates);
    if (mongoProj?.id) dbStore.updateProject(mongoProj.id, memoryUpdates);
    if (mongoProj?._id) dbStore.updateProject(mongoProj._id.toString(), memoryUpdates);

    // Sync ProjectRequest in dbStore
    const storeReq = dbStore.projectRequests?.find(r => r.projectId === id || (mongoProj && r.projectId === mongoProj.id));
    if (storeReq) {
      if (name) storeReq.projectName = name;
      if (budget) storeReq.budget = Number(budget);
      if (location) storeReq.location = location;
      if (description) storeReq.description = description;
      if (priority) storeReq.priority = priority;
      if (assignedEngineerId) storeReq.engineerId = assignedEngineerId;
      if (assignedEngineerName) storeReq.engineerName = assignedEngineerName;
    }

    const projName = name || mongoProj?.name || 'Project';
    const budgetStr = budget ? formatIndianRupee(Number(budget)) : (mongoProj?.budget ? formatIndianRupee(mongoProj.budget) : '');

    // Notifications for Engineer, Contractor, and Admin
    const targetEngineerId = assignedEngineerId || mongoProj?.assignedEngineerId || 'ENG-1001';
    const engineerNotif = {
      recipientRole: 'Engineer' as const,
      recipientId: targetEngineerId,
      title: 'Project Info & Budget Updated by Client',
      message: `Client updated details for "${projName}". New Budget: ${budgetStr || 'Updated'}. Location: ${location || mongoProj?.location || 'Site'}.`,
      projectId: id,
      type: 'workflow' as const,
      isRead: false,
      createdAt: new Date()
    };
    try { await Notification.create(engineerNotif); } catch {}
    dbStore.createNotification(engineerNotif);

    const targetContractorId = assignedContractorId || mongoProj?.assignedContractorId || 'CONT-101';
    const contractorNotif = {
      recipientRole: 'Contractor' as const,
      recipientId: targetContractorId,
      title: 'Project Scope & Budget Updated by Client',
      message: `Client updated details for "${projName}". New Budget: ${budgetStr || 'Updated'}. Please review project scope.`,
      projectId: id,
      type: 'workflow' as const,
      isRead: false,
      createdAt: new Date()
    };
    try { await Notification.create(contractorNotif); } catch {}
    dbStore.createNotification(contractorNotif);

    const adminNotif = {
      recipientRole: 'Admin' as const,
      title: 'Client Project & Budget Updated',
      message: `Project "${projName}" updated by Client. New Budget: ${budgetStr || 'Updated'}. Changes live across all dashboards.`,
      projectId: id,
      type: 'workflow' as const,
      isRead: false,
      createdAt: new Date()
    };
    try { await Notification.create(adminNotif); } catch {}
    dbStore.createNotification(adminNotif);

    const finalProject = updatedMongoDoc || dbStore.getProjectById(id) || { id, ...updateFields };
    socketHub.emit('project:updated', finalProject);
    socketHub.emit('project:workflow_step', finalProject);

    return NextResponse.json({
      success: true,
      project: finalProject,
      message: `Project "${projName}" updated successfully! Changes synchronized across Engineer, Contractor, and Admin.`
    });

  } catch (error: any) {
    console.error('Project PUT error in route.ts:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server Error' }, { status: 500 });
  }
}
