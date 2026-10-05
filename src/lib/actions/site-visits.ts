'use server';

import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { SiteVisit } from '@/lib/db/models/SiteVisit';
import { Activity } from '@/lib/db/models/Activity';
import { Lead } from '@/lib/db/models/Lead';
import { requireOrgSession } from '@/lib/auth/session';
import { orgFilter } from '@/lib/auth/tenant';

const scheduleSchema = z.object({
  leadId: z.string(),
  propertyId: z.string(),
  date: z.coerce.date(),
  time: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
});

export async function scheduleSiteVisitAction(input: z.infer<typeof scheduleSchema>) {
  const user = await requireOrgSession();
  const data = scheduleSchema.parse(input);
  await connectDB();

  const lead = await Lead.findOne({ _id: data.leadId, ...orgFilter(user) });
  if (!lead) throw new Error('Lead not found');

  const visit = await SiteVisit.create({
    organizationId: new mongoose.Types.ObjectId(user.organizationId!),
    leadId: new mongoose.Types.ObjectId(data.leadId),
    propertyId: new mongoose.Types.ObjectId(data.propertyId),
    agentId: new mongoose.Types.ObjectId(user.id),
    date: data.date,
    time: data.time,
    notes: data.notes,
    location: data.location,
    status: 'Scheduled',
  });

  await Lead.findByIdAndUpdate(lead._id, { status: 'Site Visit' });

  await Activity.create({
    organizationId: visit.organizationId,
    leadId: visit.leadId,
    propertyId: visit.propertyId,
    type: 'site_visit_scheduled',
    summary: `Site visit scheduled${data.time ? ` at ${data.time}` : ''}`,
    createdBy: new mongoose.Types.ObjectId(user.id),
  });

  return { id: visit._id.toString() };
}

export async function updateSiteVisitStatusAction(visitId: string, status: string) {
  const user = await requireOrgSession();
  const allowed = ['Scheduled', 'Completed', 'Cancelled', 'No Show'];
  if (!allowed.includes(status)) throw new Error('Invalid status');
  await connectDB();
  const visit = await SiteVisit.findOneAndUpdate(
    { _id: visitId, ...orgFilter(user) },
    { status },
    { new: true }
  );
  if (!visit) throw new Error('Not found');
  await Activity.create({
    organizationId: visit.organizationId,
    leadId: visit.leadId,
    propertyId: visit.propertyId,
    type: 'site_visit_status',
    summary: `Site visit marked as ${status}`,
    createdBy: new mongoose.Types.ObjectId(user.id),
  });
  return { ok: true };
}
