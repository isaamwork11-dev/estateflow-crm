'use server';

import crypto from 'crypto';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/mongoose';
import { ClientPresentation } from '@/lib/db/models/ClientPresentation';
import { Activity } from '@/lib/db/models/Activity';
import { Property } from '@/lib/db/models/Property';
import { Lead } from '@/lib/db/models/Lead';
import { requireOrgSession } from '@/lib/auth/session';
import { orgFilter } from '@/lib/auth/tenant';

export async function createPresentationAction(leadId: string, propertyIds: string[]) {
  const user = await requireOrgSession();
  await connectDB();
  const token = crypto.randomBytes(24).toString('hex');
  const presentation = await ClientPresentation.create({
    organizationId: new mongoose.Types.ObjectId(user.organizationId!),
    leadId: new mongoose.Types.ObjectId(leadId),
    propertyIds: propertyIds.map((id) => new mongoose.Types.ObjectId(id)),
    agentId: new mongoose.Types.ObjectId(user.id),
    token,
    events: [{ type: 'created', at: new Date() }],
  });

  await Activity.create({
    organizationId: presentation.organizationId,
    leadId: presentation.leadId,
    type: 'presentation_created',
    summary: 'Property presentation link created for client',
    createdBy: new mongoose.Types.ObjectId(user.id),
    metadata: { token, propertyIds },
  });

  await Lead.findByIdAndUpdate(presentation.leadId, { status: 'Property Sent' });

  return { token, id: presentation._id.toString() };
}

export async function getPresentationByTokenAction(token: string) {
  await connectDB();
  const presentation = await ClientPresentation.findOne({ token }).lean();
  if (!presentation) return null;
  return presentation;
}

export async function recordPresentationEventAction(
  token: string,
  type: 'viewed' | 'interested' | 'site_visit_request' | 'contact_agent' | 'property_viewed',
  propertyId?: string
): Promise<{ ok: boolean }> {
  await connectDB();
  const presentation = await ClientPresentation.findOne({ token });
  if (!presentation) throw new Error('Not found');

  presentation.viewCount += type === 'viewed' ? 1 : 0;
  presentation.events.push({
    type,
    propertyId: propertyId ? new mongoose.Types.ObjectId(propertyId) : undefined,
    at: new Date(),
  });
  await presentation.save();

  let summary = 'Client viewed presentation';
  if (propertyId) {
    const prop = await Property.findById(propertyId).lean();
    const label = prop?.area || prop?.title || 'property';
    if (type === 'interested') summary = `Client showed interest in ${label}`;
    else if (type === 'site_visit_request') summary = `Client requested site visit for ${label}`;
    else if (type === 'property_viewed') summary = `Client viewed ${label}`;
    else if (type === 'contact_agent') summary = 'Client requested contact';
  }

  await Activity.create({
    organizationId: presentation.organizationId,
    leadId: presentation.leadId,
    propertyId: propertyId ? new mongoose.Types.ObjectId(propertyId) : undefined,
    type: `presentation_${type}`,
    summary,
    metadata: { token, propertyId },
  });

  return { ok: true };
}
