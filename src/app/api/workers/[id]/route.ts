import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Worker, Notification, Task } from '@/lib/models/schemas';
import { dbStore } from '@/lib/dbStore';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, name, age, phone, address, salary, trade, department, projectId, projectName, status, newPassword, taskTitle, taskDesc } = body;

    const isConnected = await connectDB();
    let worker: any = null;

    if (isConnected) {
      try {
        worker = await Worker.findOne({ $or: [{ _id: id }, { workerId: id }] });
      } catch (err) {
        console.error('MongoDB worker find error:', err);
      }
    }

    let actionMessage = 'Worker updated successfully.';

    if (worker) {
      if (action === 'unlock') {
        worker.isLocked = false;
        worker.failedAttempts = 0;
        actionMessage = `Worker ${worker.name} (${worker.workerId}) account unlocked successfully!`;
      } else if (action === 'suspend') {
        worker.status = 'Suspended';
        actionMessage = `Worker ${worker.name} (${worker.workerId}) suspended.`;
      } else if (action === 'activate') {
        worker.status = 'Active';
        actionMessage = `Worker ${worker.name} (${worker.workerId}) reactivated.`;
      } else if (action === 'reset-password') {
        if (newPassword) worker.passwordHash = newPassword;
        worker.failedAttempts = 0;
        worker.isLocked = false;
        actionMessage = `Password reset successfully for ${worker.name}.`;
      } else if (action === 'transfer') {
        if (projectId) worker.projectId = projectId;
        if (projectName) worker.projectName = projectName;
        worker.status = 'Transferred';
        actionMessage = `Worker ${worker.name} transferred to project ${projectName || projectId}.`;
      } else if (action === 'update-salary') {
        if (salary) worker.salary = Number(salary);
        actionMessage = `Salary updated for ${worker.name} to ₹${salary}.`;
      } else if (action === 'assign-task') {
        if (taskTitle) {
          if (isConnected) {
            await Task.create({
              projectId: worker.projectId || 'PROJ-101',
              title: taskTitle,
              description: taskDesc || 'Daily assignment by Contractor',
              assignedWorker: worker.name,
              assignedWorkerId: worker.workerId,
              status: 'Pending',
              progress: 0,
              createdBy: 'Contractor'
            }).catch(() => {});
          }

          dbStore.addTask({
            projectId: worker.projectId || 'PROJ-101',
            title: taskTitle,
            description: taskDesc || 'Daily task assigned',
            assignedWorker: worker.name,
            status: 'Pending',
            progress: 0,
            createdByEngineer: 'Contractor'
          });

          actionMessage = `Task "${taskTitle}" assigned to ${worker.name}.`;
        }
      } else {
        if (name) worker.name = name;
        if (age) worker.age = Number(age);
        if (phone) worker.phone = phone;
        if (address) worker.address = address;
        if (salary) worker.salary = Number(salary);
        if (trade) worker.trade = trade;
        if (department) worker.department = department;
        if (status) worker.status = status;
      }

      if (isConnected && typeof worker.save === 'function') {
        await worker.save().catch(() => {});
      }

      dbStore.updateWorker(worker.workerId || id, {
        name: worker.name,
        role: (worker.trade as any) || 'Worker',
        status: worker.status === 'Active' ? 'Active' : 'Offline',
        assignedProject: worker.projectName || 'Helios Corporate HQ'
      });
    }

    return NextResponse.json({ success: true, worker, message: actionMessage });

  } catch (error: any) {
    console.error('Worker update endpoint error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server error updating worker' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isConnected = await connectDB();

    if (isConnected) {
      try {
        await Worker.deleteOne({ $or: [{ _id: id }, { workerId: id }] });
      } catch (err) {
        console.error('MongoDB worker delete error:', err);
      }
    }
    return NextResponse.json({ success: true, message: `Worker ${id} deleted successfully.` });
  } catch (error: any) {
    console.error('Worker deletion error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Error deleting worker' }, { status: 500 });
  }
}
