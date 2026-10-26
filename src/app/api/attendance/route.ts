import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Attendance, Worker } from '@/lib/models/schemas';
import { SEED_20_WORKERS, IN_MEMORY_WORKERS } from '../workers/route';
import { socketHub } from '@/lib/socket';
import { dbStore } from '@/lib/dbStore';

// Persistent in-memory ledger store backed by globalThis
const gAtt = globalThis as any;
if (!gAtt.__IN_MEMORY_ATTENDANCE_LEDGER) {
  gAtt.__IN_MEMORY_ATTENDANCE_LEDGER = new Map<string, any>();
}
export const IN_MEMORY_ATTENDANCE_LEDGER: Map<string, any> = gAtt.__IN_MEMORY_ATTENDANCE_LEDGER;

async function findWorkerCanonical(workerIdOrUsername: string) {
  if (!workerIdOrUsername) return null;
  const norm = workerIdOrUsername.trim().toLowerCase();

  // 1. IN_MEMORY_WORKERS
  for (const w of IN_MEMORY_WORKERS.values()) {
    if (
      (w.workerId && w.workerId.toLowerCase() === norm) ||
      (w.username && w.username.toLowerCase() === norm) ||
      (w.id && String(w.id).toLowerCase() === norm)
    ) {
      return w;
    }
  }

  // 2. SEED_20_WORKERS
  for (const w of SEED_20_WORKERS as any[]) {
    if (
      (w.workerId && w.workerId.toLowerCase() === norm) ||
      (w.username && w.username.toLowerCase() === norm)
    ) {
      return w;
    }
  }

  // 3. MongoDB Worker collection if connected
  const isConnected = await connectDB();
  if (isConnected) {
    try {
      const orClauses: any[] = [
        { workerId: { $regex: `^${norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
        { username: { $regex: `^${norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }
      ];
      if (norm.length === 24) {
        orClauses.push({ _id: norm });
      }
      const doc = await Worker.findOne({ $or: orClauses });
      if (doc) {
        return typeof doc.toObject === 'function' ? doc.toObject() : doc;
      }
    } catch {}
  }

  // 4. dbStore fallback
  const dsW = dbStore.getWorkers().find(w => 
    (w.id && w.id.toLowerCase() === norm) ||
    (w.name && w.name.toLowerCase() === norm)
  );
  if (dsW) {
    return {
      workerId: dsW.id,
      name: dsW.name,
      trade: dsW.role || 'Mason',
      department: 'Civil Works',
      salary: dsW.salary || 30000,
      projectId: 'PROJ-1001',
      projectName: 'Skyline Tower',
      contractorId: 'CON001'
    };
  }

  return null;
}

async function saveSingleAttendance(item: any, isConnected: boolean) {
  const { workerId, todayStatus, checkInTime, checkOutTime, overtimeHours, date, markedBy, projectId, projectName, contractorId } = item;
  if (!workerId) return null;

  const targetDate = date || new Date().toISOString().split('T')[0];
  const workerObj = await findWorkerCanonical(workerId);
  const canonicalId = workerObj?.workerId || workerId;
  const canonicalName = workerObj?.name || item.workerName || 'Worker';
  const projId = projectId || workerObj?.projectId || 'PROJ-1001';
  const projName = projectName || workerObj?.projectName || 'Skyline Tower';
  const contId = contractorId || workerObj?.contractorId || 'CON001';
  const salary = workerObj?.salary || 30000;
  const photoUrl = workerObj?.photoUrl || '';

  // Normalize status
  let statusNorm = todayStatus || 'Present';
  if (statusNorm === 'On Leave') statusNorm = 'Leave';

  const isPresent = statusNorm === 'Present';
  const finalCheckIn = checkInTime || (isPresent ? '08:30 AM' : '--:--');
  const finalCheckOut = checkOutTime || (isPresent ? '05:30 PM' : '--:--');

  const recordData = {
    workerId: canonicalId,
    workerName: canonicalName,
    workerIdStr: canonicalId,
    joiningDate: workerObj?.joiningDate || targetDate,
    projectId: projId,
    projectName: projName,
    contractorId: contId,
    salary,
    photoUrl,
    date: targetDate,
    todayStatus: statusNorm,
    checkInTime: finalCheckIn,
    checkOutTime: finalCheckOut,
    device: 'Manual Contractor Action',
    location: 'Sector 62 Site, Noida',
    markedBy: markedBy || 'Contractor',
    overtimeHours: Number(overtimeHours) || 0
  };

  // 1. Save to in-memory ledger
  IN_MEMORY_ATTENDANCE_LEDGER.set(`${canonicalId}_${targetDate}`, recordData);

  // 2. Save to MongoDB
  if (isConnected) {
    try {
      await Attendance.findOneAndUpdate(
        { workerIdStr: canonicalId, date: targetDate },
        { $set: recordData },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('MongoDB attendance save error:', err);
    }
  }

  // 3. Emit real-time event
  socketHub.emit('attendance:updated', recordData);

  return recordData;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const contractorId = searchParams.get('contractorId');
    const workerIdParam = searchParams.get('workerId');
    const projectIdParam = searchParams.get('projectId');

    const isConnected = await connectDB();
    let dbWorkers: any[] = [];
    let attendanceRecords: any[] = [];

    if (isConnected) {
      try {
        const workerQuery: any = { status: { $ne: 'Deleted' } };
        if (contractorId) workerQuery.contractorId = contractorId;
        if (workerIdParam) workerQuery.$or = [{ workerId: workerIdParam }, { username: workerIdParam }];
        dbWorkers = await Worker.find(workerQuery);

        const attQuery: any = { date: dateParam };
        if (workerIdParam) {
          attQuery.$or = [{ workerIdStr: workerIdParam }, { workerId: workerIdParam }];
        }
        attendanceRecords = await Attendance.find(attQuery).sort({ updatedAt: -1, createdAt: -1 });
      } catch (err) {
        console.error('MongoDB attendance query error:', err);
      }
    }

    // Combine all worker records across sources (keyed by unique workerId)
    const allWorkersMap = new Map<string, any>();

    // 1. Base seed workers
    (SEED_20_WORKERS as any[]).forEach(w => {
      if (w.workerId) allWorkersMap.set(w.workerId, w);
    });

    // 2. MongoDB workers if connected
    if (Array.isArray(dbWorkers)) {
      dbWorkers.forEach(w => {
        const id = w.workerId || w._id?.toString();
        if (id) {
          const obj = typeof w.toObject === 'function' ? w.toObject() : w;
          allWorkersMap.set(id, obj);
        }
      });
    }

    // 3. Newly registered IN_MEMORY_WORKERS
    IN_MEMORY_WORKERS.forEach(memW => {
      if (memW.workerId) {
        allWorkersMap.set(memW.workerId, memW);
      }
    });

    // 4. dbStore workers fallback
    dbStore.getWorkers().forEach(dsW => {
      if (dsW.id && !allWorkersMap.has(dsW.id)) {
        allWorkersMap.set(dsW.id, {
          workerId: dsW.id,
          name: dsW.name,
          trade: dsW.role || 'Mason',
          department: 'Civil Works',
          salary: dsW.salary || 30000,
          projectName: 'Skyline Tower',
          projectId: 'PROJ-1001',
          contractorId: 'CON001',
          joiningDate: '2024-01-15'
        });
      }
    });

    let combinedWorkers = Array.from(allWorkersMap.values());

    // Filter by contractorId
    if (contractorId) {
      combinedWorkers = combinedWorkers.filter(w => !w.contractorId || w.contractorId === contractorId || w.contractorId === 'CON001');
    }

    // Filter by projectId
    if (projectIdParam && projectIdParam !== 'All Projects') {
      combinedWorkers = combinedWorkers.filter(w =>
        w.projectId === projectIdParam || w.projectName === projectIdParam
      );
    }

    // Filter by workerId
    if (workerIdParam) {
      const targetParamNorm = workerIdParam.toLowerCase().trim();
      combinedWorkers = combinedWorkers.filter(w => 
        (w.workerId && w.workerId.toLowerCase().trim() === targetParamNorm) ||
        (w.username && w.username.toLowerCase().trim() === targetParamNorm) ||
        (w._id && String(w._id).toLowerCase().trim() === targetParamNorm)
      );
    }

    // Build comprehensive attendance table matching centralized database records
    const fullLedger = combinedWorkers.map(w => {
      const wId = w.workerId;

      const memRec = IN_MEMORY_ATTENDANCE_LEDGER.get(`${wId}_${dateParam}`);
      const dbRec = attendanceRecords.find(a => 
        (a.workerIdStr && a.workerIdStr.toLowerCase() === wId.toLowerCase()) || 
        (a.workerId && a.workerId.toString().toLowerCase() === wId.toLowerCase())
      );

      const existing = memRec || dbRec;

      if (existing) {
        return {
          _id: existing._id || `att-${wId}-${dateParam}`,
          workerId: wId,
          photoUrl: w.photoUrl || existing.photoUrl,
          workerName: w.name,
          workerIdStr: wId,
          joiningDate: w.joiningDate,
          project: existing.projectName || w.projectName || 'Skyline Tower',
          projectId: existing.projectId || w.projectId || 'PROJ-1001',
          salary: w.salary,
          todayStatus: existing.todayStatus,
          checkInTime: existing.checkInTime || (existing.todayStatus === 'Present' ? '08:30 AM' : '--:--'),
          checkOutTime: existing.checkOutTime || (existing.todayStatus === 'Present' ? '05:30 PM' : '--:--'),
          presentDays: existing.presentDays || 22,
          absentDays: existing.absentDays || 2,
          halfDays: existing.halfDays || 0,
          leaveDays: existing.leaveDays || 1,
          overtimeHours: existing.overtimeHours || 0,
          markedBy: existing.markedBy || 'Contractor',
          lastLogin: existing.lastLogin || `${dateParam} ${existing.checkInTime || '08:30 AM'}`
        };
      } else {
        return {
          _id: `att-${wId}-${dateParam}`,
          workerId: wId,
          photoUrl: w.photoUrl,
          workerName: w.name,
          workerIdStr: wId,
          joiningDate: w.joiningDate,
          project: w.projectName || 'Skyline Tower',
          projectId: w.projectId || 'PROJ-1001',
          salary: w.salary,
          todayStatus: 'Not Marked' as const,
          checkInTime: '--:--',
          checkOutTime: '--:--',
          presentDays: 0,
          absentDays: 0,
          halfDays: 0,
          leaveDays: 0,
          overtimeHours: 0,
          markedBy: 'Pending Contractor Action',
          lastLogin: 'Not Marked Yet'
        };
      }
    });

    const summary = {
      totalWorkers: fullLedger.length,
      presentCount: fullLedger.filter(a => a.todayStatus === 'Present').length,
      absentCount: fullLedger.filter(a => a.todayStatus === 'Absent').length,
      leaveCount: fullLedger.filter(a => a.todayStatus === 'Leave').length,
      halfDayCount: fullLedger.filter(a => a.todayStatus === 'Half Day').length,
      notMarkedCount: fullLedger.filter(a => a.todayStatus === 'Not Marked').length
    };

    return NextResponse.json({ success: true, date: dateParam, summary, attendance: fullLedger });
  } catch (error: any) {
    console.error('Error fetching attendance ledger:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const isConnected = await connectDB();

    // Check if batch records are provided
    if (Array.isArray(body.records) && body.records.length > 0) {
      const savedList = [];
      for (const rec of body.records) {
        const saved = await saveSingleAttendance(rec, isConnected);
        if (saved) savedList.push(saved);
      }
      return NextResponse.json({
        success: true,
        count: savedList.length,
        attendance: savedList,
        message: `Successfully saved attendance for ${savedList.length} workers to MongoDB.`
      });
    }

    // Single worker attendance save
    const { workerId, todayStatus } = body;
    if (!workerId) {
      return NextResponse.json({ success: false, message: 'Worker ID is required.' }, { status: 400 });
    }

    const savedRecord = await saveSingleAttendance(body, isConnected);
    if (!savedRecord) {
      return NextResponse.json({ success: false, message: 'Failed to save attendance record.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      attendance: savedRecord,
      message: `Attendance marked as ${savedRecord.todayStatus} for ${savedRecord.workerName} (${savedRecord.date}).`
    });

  } catch (error: any) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server Error' }, { status: 500 });
  }
}
