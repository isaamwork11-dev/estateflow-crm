import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import type { UserRole } from '@/lib/constants';
import { ROLES } from '@/lib/constants';

export interface AppSessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string | null;
}

export async function getAppSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as AppSessionUser;
}

export async function requireSession() {
  const user = await getAppSession();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function requireOrgSession() {
  const user = await requireSession();
  if (user.role === ROLES.SUPER_ADMIN) return user;
  if (!user.organizationId) throw new Error('Forbidden');
  return user;
}

export function canViewFinancials(role: UserRole): boolean {
  const allowed: UserRole[] = [ROLES.SUPER_ADMIN, ROLES.COMPANY_OWNER, ROLES.SALES_MANAGER];
  return allowed.includes(role);
}
