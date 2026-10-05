import { subDays } from 'date-fns';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongoose';
import { Lead } from '@/lib/db/models/Lead';
import { Task } from '@/lib/db/models/Task';
import { Notification } from '@/lib/db/models/Notification';
import { Organization } from '@/lib/db/models/Organization';
import { CLOSED_LEAD_STATUSES } from '@/lib/crm/lead-query';

export async function runFollowUpMaintenanceCron() {
  await connectDB();
  const orgs = await Organization.find({}).select('_id defaults followUpStaleDays').lean();
  const now = new Date();
  let staleMarked = 0;
  let overdueNotified = 0;

  for (const org of orgs) {
    const orgId = org._id as mongoose.Types.ObjectId;
    const staleDays = org.followUpStaleDays ?? org.defaults?.followUpDays ?? 7;
    const staleBefore = subDays(now, staleDays);

    const staleResult = await Lead.updateMany(
      {
        organizationId: orgId,
        status: { $nin: CLOSED_LEAD_STATUSES },
        $or: [
          { lastContactAt: { $lt: staleBefore } },
          { lastContactAt: null, updatedAt: { $lt: staleBefore } },
        ],
        isStale: { $ne: true },
      },
      { $set: { isStale: true } }
    );
    staleMarked += staleResult.modifiedCount;

    const overdueLeads = await Lead.find({
      organizationId: orgId,
      status: { $nin: CLOSED_LEAD_STATUSES },
      nextFollowUpAt: { $lt: now },
      assignedTo: { $exists: true },
    })
      .select('_id assignedTo name nextFollowUpAt')
      .limit(200)
      .lean();

    for (const lead of overdueLeads) {
      if (!lead.assignedTo) continue;
      const exists = await Notification.findOne({
        organizationId: orgId,
        userId: lead.assignedTo,
        type: 'overdue_follow_up',
        'metadata.leadId': lead._id,
        createdAt: { $gte: subDays(now, 1) },
      });
      if (exists) continue;

      await Notification.create({
        organizationId: orgId,
        userId: lead.assignedTo,
        type: 'overdue_follow_up',
        title: 'Follow-up overdue',
        body: `${lead.name} — follow-up was due ${lead.nextFollowUpAt?.toISOString().slice(0, 10) ?? ''}`,
        metadata: { leadId: lead._id },
      });
      overdueNotified += 1;
    }

    const overdueTasks = await Task.find({
      organizationId: orgId,
      status: 'pending',
      dueAt: { $lt: now },
      assignedTo: { $exists: true },
    })
      .select('_id assignedTo title leadId')
      .limit(200)
      .lean();

    for (const task of overdueTasks) {
      const exists = await Notification.findOne({
        organizationId: orgId,
        userId: task.assignedTo,
        type: 'overdue_task',
        'metadata.taskId': task._id,
        createdAt: { $gte: subDays(now, 1) },
      });
      if (exists) continue;

      await Notification.create({
        organizationId: orgId,
        userId: task.assignedTo,
        type: 'overdue_task',
        title: 'Task overdue',
        body: task.title,
        metadata: { taskId: task._id, leadId: task.leadId },
      });
      overdueNotified += 1;
    }
  }

  return { staleMarked, overdueNotified, organizations: orgs.length };
}
