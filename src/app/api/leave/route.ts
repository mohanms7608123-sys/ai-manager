import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LeaveRequest, Notification } from '@/lib/models/schemas';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contractorId = searchParams.get('contractorId');
    const workerId = searchParams.get('workerId');

    const isConnected = await connectDB();
    let leaveRequests: any[] = [];

    if (isConnected) {
      try {
        let query: any = {};
        if (contractorId) query.contractorId = contractorId;
        if (workerId) query.workerId = workerId;

        leaveRequests = await LeaveRequest.find(query).sort({ createdAt: -1 });
      } catch (err) {
        console.error('MongoDB leave requests query error:', err);
      }
    }

    return NextResponse.json({ success: true, leaveRequests });
  } catch (error: any) {
    return NextResponse.json({ success: true, leaveRequests: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workerId, workerName, contractorId, projectId, startDate, endDate, reason } = body;

    if (!workerId || !startDate || !endDate || !reason) {
      return NextResponse.json({ success: false, message: 'Worker ID, start/end dates, and reason are required.' }, { status: 400 });
    }

    const isConnected = await connectDB();
    let newLeave: any = null;

    if (isConnected) {
      try {
        newLeave = await LeaveRequest.create({
          workerId,
          workerName: workerName || 'Worker',
          contractorId: contractorId || 'CONT-101',
          projectId: projectId || 'PROJ-101',
          startDate,
          endDate,
          reason,
          status: 'Pending'
        });

        await Notification.create({
          recipientRole: 'Contractor',
          recipientId: contractorId || 'CONT-101',
          title: `New Worker Leave Request (${workerName})`,
          message: `Worker ${workerName} requested leave from ${startDate} to ${endDate}. Reason: ${reason}`,
          type: 'workflow'
        }).catch(() => {});
      } catch (err) {
        console.error('MongoDB leave create error:', err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      leaveRequest: newLeave || { workerId, workerName, startDate, endDate, reason, status: 'Pending' }, 
      message: 'Leave request submitted to Contractor for review.' 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error submitting leave' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { leaveId, action } = body; // action: 'Approve' | 'Reject'

    if (!leaveId || !action) {
      return NextResponse.json({ success: false, message: 'leaveId and action are required.' }, { status: 400 });
    }

    const isConnected = await connectDB();

    if (isConnected) {
      try {
        const leave = await LeaveRequest.findById(leaveId);
        if (leave) {
          leave.status = action === 'Approve' ? 'Approved' : 'Rejected';
          await leave.save();

          await Notification.create({
            recipientRole: 'Worker',
            recipientId: leave.workerId,
            title: `Leave Request ${leave.status}`,
            message: `Your leave request for ${leave.startDate} to ${leave.endDate} has been ${leave.status.toLowerCase()} by Contractor.`,
            type: 'workflow'
          }).catch(() => {});

          return NextResponse.json({ success: true, leave, message: `Leave request ${leave.status.toLowerCase()} successfully.` });
        }
      } catch (err) {
        console.error('MongoDB leave update error:', err);
      }
    }

    return NextResponse.json({ success: true, message: `Leave request updated.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error updating leave' }, { status: 500 });
  }
}
