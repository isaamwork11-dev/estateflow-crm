'use server';

import { z } from 'zod';
import { connectDB } from '@/lib/db/mongoose';
import { Organization } from '@/lib/db/models/Organization';
import { User } from '@/lib/db/models/User';
import { requireOrgSession } from '@/lib/auth/session';

const orgSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  logoUrl: z.string().optional(),
  commissionPercent: z.coerce.number().min(0).max(100).optional(),
});

export async function updateOrganizationSettingsAction(input: z.infer<typeof orgSchema>) {
  const user = await requireOrgSession();
  const data = orgSchema.parse(input);
  await connectDB();
  await Organization.findByIdAndUpdate(user.organizationId, {
    name: data.name,
    phone: data.phone,
    whatsapp: data.whatsapp,
    logoUrl: data.logoUrl,
    ...(data.commissionPercent != null
      ? { 'defaults.commissionPercent': data.commissionPercent }
      : {}),
  });
  return { ok: true };
}

export async function updateProfileAction(input: { name: string; phone?: string }) {
  const user = await requireOrgSession();
  await connectDB();
  await User.findByIdAndUpdate(user.id, { name: input.name, phone: input.phone });
  return { ok: true };
}
