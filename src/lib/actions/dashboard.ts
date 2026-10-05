'use server';

import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongoose';
import { Lead } from '@/lib/db/models/Lead';
import { Task } from '@/lib/db/models/Task';
import { SiteVisit } from '@/lib/db/models/SiteVisit';
import { Deal } from '@/lib/db/models/Deal';
import { Activity } from '@/lib/db/models/Activity';
import { ClientPresentation } from '@/lib/db/models/ClientPresentation';
import { Property } from '@/lib/db/models/Property';
import { requireOrgSession } from '@/lib/auth/session';
import { orgFilter } from '@/lib/auth/tenant';
import { HOT_LEAD_PRIORITIES, NEW_LEAD_STATUSES, openLeadStatusFilter } from '@/lib/crm/lead-query';

export async function getOwnerDashboardAction() {
  const user = await requireOrgSession();
  await connectDB();
  const base = orgFilter(user);
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    totalLeads,
    newLeads,
    hotLeads,
    followUpsToday,
    upcomingVisits,
    activeDeals,
    closedDeals,
    monthRevenue,
    recentLeads,
    todayVisits,
    pendingTasks,
    hotWithoutFollowUp,
    openDealsList,
  ] = await Promise.all([
    Lead.countDocuments(base),
    Lead.countDocuments({ ...base, status: { $in: NEW_LEAD_STATUSES } }),
    Lead.countDocuments({
      ...base,
      priority: { $in: HOT_LEAD_PRIORITIES },
      status: openLeadStatusFilter(),
    }),
    Task.countDocuments({
      ...base,
      status: 'pending',
      dueAt: { $gte: startOfDay(now), $lte: endOfDay(now) },
    }),
    SiteVisit.countDocuments({
      ...base,
      date: { $gte: startOfDay(now) },
      status: { $in: ['Scheduled', 'Confirmed'] },
    }),
    Deal.countDocuments({ ...base, status: 'open' }),
    Deal.countDocuments({ ...base, status: 'closed' }),
    Deal.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(user.organizationId!),
          dealDate: { $gte: monthStart, $lte: monthEnd },
          status: { $in: ['open', 'closed'] },
        },
      },
      {
        $group: {
          _id: null,
          saleValue: { $sum: '$salePrice' },
          commission: { $sum: '$commissionAmount' },
        },
      },
    ]),
    Lead.find(base).sort({ updatedAt: -1 }).limit(5).select('name priority status').lean(),
    SiteVisit.find({
      ...base,
      date: { $gte: startOfDay(now), $lte: endOfDay(now) },
      status: { $in: ['Scheduled', 'Confirmed'] },
    })
      .populate('leadId', 'name')
      .populate('propertyId', 'title area')
      .sort({ date: 1 })
      .limit(5)
      .lean(),
    Task.find({
      ...base,
      status: 'pending',
      dueAt: { $lte: endOfDay(now) },
    })
      .populate('leadId', 'name priority')
      .sort({ dueAt: 1 })
      .limit(8)
      .lean(),
    Lead.find({
      ...base,
      priority: { $in: HOT_LEAD_PRIORITIES },
      status: openLeadStatusFilter(),
    })
      .select('_id name')
      .limit(20)
      .lean(),
    Deal.find({ ...base, status: 'open' }).limit(5).lean(),
  ]);

  const hotIds = hotWithoutFollowUp.map((l) => l._id);
  const tasksForHot = await Task.find({
    ...base,
    leadId: { $in: hotIds },
    status: 'pending',
  }).select('leadId');
  const hotWithTask = new Set(tasksForHot.map((t) => t.leadId.toString()));
  const hotNoFollowUp = hotWithoutFollowUp.filter((l) => !hotWithTask.has(l._id.toString())).length;

  const revenue = monthRevenue[0] ?? { saleValue: 0, commission: 0 };

  const presentations = await ClientPresentation.find({
    organizationId: new mongoose.Types.ObjectId(user.organizationId!),
  }).lean();

  const interestByProperty = new Map<string, number>();
  for (const p of presentations) {
    for (const ev of p.events ?? []) {
      if (['interested', 'site_visit_request', 'property_viewed', 'viewed'].includes(ev.type)) {
        const pid = ev.propertyId?.toString();
        if (pid) interestByProperty.set(pid, (interestByProperty.get(pid) ?? 0) + 1);
      }
    }
  }

  const topPropertyIds = [...interestByProperty.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topProperties = await Property.find({
    _id: { $in: topPropertyIds.map(([id]) => id) },
    ...base,
  }).lean();

  const topPropertiesDisplay = topPropertyIds.map(([id, count]) => {
    const prop = topProperties.find((p) => p._id.toString() === id);
    return {
      id,
      title: prop?.title ?? prop?.area ?? 'Property',
      area: prop?.area ?? prop?.location,
      interestCount: count,
    };
  });

  const todaysActions: string[] = [];
  if (followUpsToday > 0) {
    todaysActions.push(`Follow up with ${followUpsToday} lead${followUpsToday > 1 ? 's' : ''}`);
  }
  if (todayVisits.length > 0) {
    for (const v of todayVisits.slice(0, 2)) {
      const lead = v.leadId as { name?: string } | null;
      const prop = v.propertyId as { area?: string; title?: string } | null;
      todaysActions.push(
        `Site visit with ${lead?.name ?? 'customer'}${v.time ? ` at ${v.time}` : ''} — ${prop?.area || prop?.title || 'property'}`
      );
    }
  }
  if (hotNoFollowUp > 0) {
    todaysActions.push(`${hotNoFollowUp} hot lead${hotNoFollowUp > 1 ? 's' : ''} without follow-up`);
  }
  if (openDealsList.length > 0) {
    todaysActions.push(`${openDealsList.length} deal${openDealsList.length > 1 ? 's' : ''} awaiting update`);
  }

  const taskActions = pendingTasks.slice(0, 3).map((t) => {
    const lead = t.leadId as { name?: string } | null;
    return `Follow up with ${lead?.name ?? 'lead'}: ${t.title}`;
  });

  return {
    userName: user.name,
    metrics: {
      totalLeads,
      newLeads,
      hotLeads,
      followUpsToday,
      upcomingVisits,
      activeDeals,
      closedDeals,
      totalSaleValue: revenue.saleValue,
      expectedCommission: revenue.commission,
    },
    todaysActions: [...todaysActions, ...taskActions].slice(0, 6),
    recentLeads,
    topProperties: topPropertiesDisplay,
  };
}
