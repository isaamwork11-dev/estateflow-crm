'use server';

import { startOfDay, endOfDay } from 'date-fns';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongoose';
import { Task } from '@/lib/db/models/Task';
import { Activity } from '@/lib/db/models/Activity';
import { Lead } from '@/lib/db/models/Lead';
import { SiteVisit } from '@/lib/db/models/SiteVisit';
import { Deal } from '@/lib/db/models/Deal';
import { requireOrgSession } from '@/lib/auth/session';
import { agentFilter, orgFilter } from '@/lib/auth/tenant';
import { ROLES } from '@/lib/constants';

function taskFilter(user: Awaited<ReturnType<typeof requireOrgSession>>) {
  const base = orgFilter(user);
  if (user.role === ROLES.SALES_AGENT) {
    return { ...base, assignedTo: new mongoose.Types.ObjectId(user.id) };
  }
  return base;
}

export async function listTodayTasksAction() {
  const user = await requireOrgSession();
  await connectDB();
  const now = new Date();
  const tasks = await Task.find({
    ...taskFilter(user),
    status: 'pending',
    dueAt: { $lte: endOfDay(now) },
  })
    .sort({ dueAt: 1 })
    .populate('leadId', 'name phone preferredArea priority')
    .lean();
  return tasks;
}

export async function completeTaskAction(taskId: string) {
  const user = await requireOrgSession();
  await connectDB();
  const task = await Task.findOneAndUpdate(
    { _id: taskId, ...taskFilter(user) },
    { status: 'completed', completedAt: new Date() },
    { new: true }
  );
  if (!task) throw new Error('Task not found');

  await Activity.create({
    organizationId: task.organizationId,
    leadId: task.leadId,
    type: 'task_completed',
    summary: `Completed: ${task.title}`,
    createdBy: new mongoose.Types.ObjectId(user.id),
  });

  return { ok: true };
}

export async function dashboardCountsAction() {
  const user = await requireOrgSession();
  await connectDB();
  const base = agentFilter(user);
  const now = new Date();

  const [newLeads, hotLeads, overdueTasks, todayTasks, siteVisits, openDeals] = await Promise.all([
    Lead.countDocuments({ ...base, status: { $in: ['NEW', 'New'] } }),
    Lead.countDocuments({
      ...base,
      priority: { $in: ['HOT', 'VERY_HOT'] },
      status: { $nin: ['Won', 'Lost', 'WON', 'LOST'] },
    }),
    Task.countDocuments({ ...taskFilter(user), status: 'pending', dueAt: { $lt: startOfDay(now) } }),
    Task.countDocuments({
      ...taskFilter(user),
      status: 'pending',
      dueAt: { $gte: startOfDay(now), $lte: endOfDay(now) },
    }),
    SiteVisit.countDocuments({
      ...base,
      date: { $gte: startOfDay(now), $lte: endOfDay(now) },
      status: { $in: ['Scheduled', 'Confirmed'] },
    }),
    Deal.countDocuments({ ...base, status: 'open' }),
  ]);

  return { newLeads, hotLeads, overdueTasks, todayTasks, siteVisits, openDeals };
}
