import type { AppSessionUser } from '@/lib/auth/session';
import { ROLES } from '@/lib/constants';
import mongoose from 'mongoose';

export function orgFilter(user: AppSessionUser, extraOrgId?: string) {
  if (user.role === ROLES.SUPER_ADMIN && extraOrgId) {
    return { organizationId: new mongoose.Types.ObjectId(extraOrgId) };
  }
  if (!user.organizationId) throw new Error('Forbidden');
  return { organizationId: new mongoose.Types.ObjectId(user.organizationId) };
}

export function agentFilter(user: AppSessionUser) {
  const base = orgFilter(user);
  if (user.role === ROLES.SALES_AGENT) {
    return { ...base, assignedTo: new mongoose.Types.ObjectId(user.id) };
  }
  return base;
}
