import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/dbStore';
import { connectDB } from '@/lib/db';
import { Project, ProjectRequest, Approval, Notification } from '@/lib/models/schemas';
import mongoose from 'mongoose';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      action, 
      role, 
      actorName, 
      contractorId, 
      contractorName, 
      engineerId, 
      engineerName, 
      comments, 
      estimatedTimeline, 
      estimatedMaterials, 
      estimatedCost, 
      assignedWorkers, 
      assignedEquipment 
    } = body;

    const isConnected = await connectDB();

    // Safe MongoDB Project Lookup (Prevents CastError)
    let project: any = null;
    if (isConnected) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          project = await Project.findOne({ $or: [{ _id: id }, { id }] });
        } else {
          project = await Project.findOne({ id });
        }
      } catch {
        project = null;
      }
    }

    const memProj = dbStore.getProjectById(id);
    const projName = project?.name || memProj?.name || 'Construction Project';
    const clientEmail = (project?.clientEmail || memProj?.clientEmail || 'client@corporate.com').toLowerCase();
    const engName = actorName || engineerName || 'Rahul Sharma';
    const engId = engineerId || 'ENG-1001';

    let nextStatus: string = project?.status || memProj?.status || 'Waiting for Engineer Approval';
    let responseMsg = '';

    // ==========================================
    // 1. ENGINEER WORKFLOW ACTIONS (APPROVE / REJECT)
    // ==========================================
    if (role === 'Engineer') {
      const reqStatus = action === 'Approve' ? 'Approved' : 'Rejected';

      // Update ProjectRequest in MongoDB & dbStore
      try {
        await ProjectRequest.updateMany(
          { $or: [{ projectId: id }, { projectId: project?.id }, { projectId: project?._id?.toString() }] },
          { $set: { status: reqStatus } }
        );
      } catch {}
      dbStore.updateProjectRequestStatus(id, reqStatus);

      if (action === 'Approve') {
        nextStatus = contractorId && contractorName ? 'Waiting Contractor Approval' : 'Engineer Approved';

        // Update Project in MongoDB
        if (project) {
          project.status = nextStatus as any;
          project.assignedEngineerId = engId;
          project.assignedEngineerName = engName;
          if (contractorId) project.assignedContractorId = contractorId;
          if (contractorName) project.assignedContractorName = contractorName;
          if (comments) project.technicalComments = comments;
          if (estimatedTimeline) project.estimatedTimeline = estimatedTimeline;
          await project.save();
        }

        // Update dbStore
        dbStore.updateProject(id, {
          status: nextStatus as any,
          assignedEngineerId: engId,
          assignedEngineerName: engName,
          assignedContractorId: contractorId,
          assignedContractorName: contractorName,
          technicalComments: comments,
          estimatedTimeline
        });

        // Exact Requirement 3: Client Notification on Engineer APPROVE
        const notifClient = {
          recipientRole: 'Client' as const,
          recipientId: clientEmail,
          title: 'Project Approved by Engineer',
          message: `✅ Engineer ${engName} has approved your project "${projName}". Your project is now ready for Contractor Assignment.`,
          projectId: id,
          isRead: false,
          type: 'workflow' as const,
          createdAt: new Date()
        };

        try { await Notification.create(notifClient); } catch (err) { console.error('MongoDB Notification Create Error:', err); }
        dbStore.createNotification(notifClient);

        // If Contractor specified during approval
        if (contractorId && contractorName) {
          const notifContractor = {
            recipientRole: 'Contractor' as const,
            recipientId: contractorId,
            title: 'New Project Assignment',
            message: `Engineer ${engName} assigned you project "${projName}". Action required: Accept or Reject.`,
            projectId: id,
            isRead: false,
            type: 'workflow' as const,
            createdAt: new Date()
          };
          try { await Notification.create(notifContractor); } catch {}
          dbStore.createNotification(notifContractor);
        }

        responseMsg = `✅ Engineer ${engName} has approved your project "${projName}". Your project is now ready for Contractor Assignment.`;

      } else if (action === 'Reject') {
        nextStatus = 'Engineer Rejected';
        const rejectionReason = comments || 'Technical specifications and structural stress criteria review required.';

        // Update Project in MongoDB
        if (project) {
          project.status = 'Engineer Rejected' as any;
          project.assignedEngineerId = engId;
          project.assignedEngineerName = engName;
          project.technicalComments = rejectionReason;
          await project.save();
        }

        // Update dbStore
        dbStore.updateProject(id, {
          status: 'Engineer Rejected' as any,
          assignedEngineerId: engId,
          assignedEngineerName: engName,
          technicalComments: rejectionReason
        });

        // Exact Requirement: Client Notification on Engineer REJECT
        const notifClient = {
          recipientRole: 'Client' as const,
          recipientId: clientEmail,
          title: 'Project Rejected by Engineer',
          message: `❌ Engineer ${engName} has rejected your project "${projName}". Reason: ${rejectionReason} Please review your project details and submit again.`,
          projectId: id,
          isRead: false,
          type: 'workflow' as const,
          createdAt: new Date()
        };

        try { await Notification.create(notifClient); } catch (err) { console.error('MongoDB Rejection Notification Error:', err); }
        dbStore.createNotification(notifClient);

        responseMsg = `❌ Engineer ${engName} has rejected your project "${projName}".`;
      }
    }

    // ==========================================
    // 2. CONTRACTOR WORKFLOW ACTIONS
    // ==========================================
    else if (role === 'Contractor') {
      if (action === 'Accept' || action === 'Approve') {
        nextStatus = 'In Progress';

        if (project) {
          project.status = 'In Progress' as any;
          project.completion = 5;
          if (assignedWorkers) project.assignedWorkers = assignedWorkers;
          if (assignedEquipment) project.assignedEquipment = assignedEquipment;
          await project.save();
        }

        dbStore.updateProject(id, {
          status: 'In Progress' as any,
          completion: 5,
          assignedWorkers,
          assignedEquipment
        });

        const notifClient = {
          recipientRole: 'Client' as const,
          recipientId: clientEmail,
          title: 'Construction Started',
          message: `Contractor accepted project "${projName}"! Construction site mobilized and work has officially started.`,
          projectId: id,
          isRead: false,
          type: 'workflow' as const,
          createdAt: new Date()
        };
        try { await Notification.create(notifClient); } catch {}
        dbStore.createNotification(notifClient);

        const notifEngineer = {
          recipientRole: 'Engineer' as const,
          recipientId: project?.assignedEngineerId || 'ENG-1001',
          title: 'Contractor Mobilized Site',
          message: `Contractor accepted project "${projName}" and initialized site crews. Work in progress.`,
          projectId: id,
          isRead: false,
          type: 'workflow' as const,
          createdAt: new Date()
        };
        try { await Notification.create(notifEngineer); } catch {}
        dbStore.createNotification(notifEngineer);

        responseMsg = `Contractor accepted project "${projName}". Site mobilized and Construction Started!`;
      } else if (action === 'Reject') {
        nextStatus = 'Rejected';

        if (project) {
          project.status = 'Rejected' as any;
          await project.save();
        }

        dbStore.updateProject(id, { status: 'Rejected' as any });

        const notifEngineer = {
          recipientRole: 'Engineer' as const,
          recipientId: project?.assignedEngineerId || 'ENG-1001',
          title: 'Contractor Rejected Assignment',
          message: `Contractor rejected assignment for project "${projName}".`,
          projectId: id,
          isRead: false,
          type: 'workflow' as const,
          createdAt: new Date()
        };
        try { await Notification.create(notifEngineer); } catch {}
        dbStore.createNotification(notifEngineer);

        const notifClient = {
          recipientRole: 'Client' as const,
          recipientId: clientEmail,
          title: 'Contractor Rejected Project',
          message: `Contractor declined assignment for project "${projName}".`,
          projectId: id,
          isRead: false,
          type: 'workflow' as const,
          createdAt: new Date()
        };
        try { await Notification.create(notifClient); } catch {}
        dbStore.createNotification(notifClient);

        responseMsg = `Contractor rejected project "${projName}".`;
      }
    }

    // Save Approval Audit Record in MongoDB
    try {
      await Approval.create({
        projectId: id,
        approverRole: role,
        approverName: engName,
        action: action === 'Accept' ? 'Approve' : action,
        comments,
        estimatedTimeline,
        estimatedMaterials,
        estimatedCost,
        createdAt: new Date()
      });
    } catch {}

    return NextResponse.json({
      success: true,
      status: nextStatus,
      message: responseMsg || `Project status updated to ${nextStatus}.`,
      project: project || dbStore.getProjectById(id)
    });

  } catch (error: any) {
    console.error('Workflow API Error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Workflow Execution Error' }, { status: 500 });
  }
}
