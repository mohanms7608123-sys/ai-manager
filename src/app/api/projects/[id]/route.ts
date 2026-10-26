import { NextResponse } from 'next/server';
import { dbStore, formatIndianRupee } from '@/lib/dbStore';
import { connectDB } from '@/lib/db';
import { Project, ProjectRequest, Notification } from '@/lib/models/schemas';
import { socketHub } from '@/lib/socket';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isConnected = await connectDB();
    let project: any = null;

    if (isConnected) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        project = await Project.findOne({ $or: [{ _id: id }, { id }] });
      } else {
        project = await Project.findOne({ id });
      }
    }

    if (!project) {
      project = dbStore.getProjectById(id);
    }

    if (!project) {
      return NextResponse.json({ success: false, message: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
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
        console.error('MongoDB project lookup error:', err);
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

    // Update matching ProjectRequest in MongoDB
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

    // Update in memory dbStore
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

    // Broadcast WebSocket updates
    const finalProject = updatedMongoDoc || dbStore.getProjectById(id) || { id, ...updateFields };
    socketHub.emit('project:updated', finalProject);
    socketHub.emit('project:workflow_step', finalProject);

    return NextResponse.json({
      success: true,
      project: finalProject,
      message: `Project "${projName}" updated successfully! Changes synchronized across Engineer, Contractor, and Admin.`
    });

  } catch (error: any) {
    console.error('Project PUT error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
}
