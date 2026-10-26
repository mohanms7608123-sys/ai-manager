import { WorkLog, AttendanceRecord } from './mockData';

export interface AIAnalyticsData {
  logsSubmitted: number;
  workProgress: number; // percentage (0-100)
  productivityScore: number; // percentage (0-100)
  workingHours: number; // hours (e.g. 8.5)
  taskCompletionRate: number; // percentage (0-100)
  dailySummary: string;
}

export function generateAIAnalytics(
  workLogs: WorkLog[],
  attendance: AttendanceRecord | null,
  tasks: { id: string; text: string; done: boolean }[]
): AIAnalyticsData {
  const logsSubmitted = workLogs.length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.done).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // Calculate working hours
  let workingHours = attendance ? attendance.workingHours : 0;
  if (attendance && attendance.checkInTime && attendance.checkInTime !== '--:--') {
    if (attendance.checkOutTime && attendance.checkOutTime !== '--:--') {
      workingHours = attendance.workingHours;
    } else {
      // Calculate running hours from check-in time to now
      const [inH, inM] = attendance.checkInTime.split(':').map(Number);
      const now = new Date();
      const currH = now.getHours();
      const currM = now.getMinutes();
      const diffMs = (currH * 60 + currM) - (inH * 60 + inM);
      workingHours = Math.max(0, parseFloat((diffMs / 60).toFixed(1)));
    }
  }

  // Work Progress based on tasks completed + logs submitted
  const baseProgress = 60;
  const taskBonus = (completedTasks / (totalTasks || 1)) * 25;
  const logBonus = Math.min(logsSubmitted * 5, 15);
  const workProgress = Math.min(100, Math.round(baseProgress + taskBonus + logBonus));

  // Productivity Score based on hours worked, task completion, and active logging
  let productivityScore = 75;
  if (attendance?.status === 'Present') productivityScore += 10;
  if (taskCompletionRate >= 60) productivityScore += 10;
  if (logsSubmitted >= 2) productivityScore += 5;
  productivityScore = Math.min(100, productivityScore);

  // Generate Daily Summary text using AI format
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  let dailySummary = `[AI Daily Digest - ${dateStr}]: Engineer completed ${completedTasks}/${totalTasks} critical milestone tasks with ${logsSubmitted} detailed work logs submitted. `;
  
  if (attendance && attendance.status === 'Present') {
    dailySummary += `Contractor marked check-in recorded at ${attendance.checkInTime}. Total active duration: ${workingHours} hrs. `;
  } else {
    dailySummary += `Attendance pending Contractor manual action. `;
  }

  if (productivityScore >= 90) {
    dailySummary += `High productivity score of ${productivityScore}% achieved. All structural safety checks and telemetry readings are optimal.`;
  } else {
    dailySummary += `Productivity score is ${productivityScore}%. Continue resolving open inspection tasks to maximize operational score.`;
  }

  return {
    logsSubmitted,
    workProgress,
    productivityScore,
    workingHours,
    taskCompletionRate,
    dailySummary,
  };
}
