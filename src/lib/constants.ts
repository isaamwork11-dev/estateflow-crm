export {
  CRM_ROLES,
  LEAD_STATUSES,
  LEAD_SOURCES,
  normalizeLeadStatus,
  normalizeUserRole,
  SCORE_BANDS,
} from '@/lib/crm/constants';

export type { LeadStatus, CrmRole } from '@/lib/crm/constants';

/** @deprecated Use CRM_ROLES / normalizeUserRole */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COMPANY_OWNER: 'COMPANY_OWNER',
  SALES_MANAGER: 'SALES_MANAGER',
  SALES_AGENT: 'SALES_AGENT',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const LEAD_PRIORITIES = ['VERY_HOT', 'HOT', 'WARM', 'COLD'] as const;

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  PROPERTY_SHARED: 'Property shared',
  SITE_VISIT: 'Site visit',
  NEGOTIATION: 'Negotiation',
  BOOKED: 'Booked',
  WON: 'Won',
  LOST: 'Lost',
  NURTURE: 'Nurture',
};

export const TASK_TYPES = [
  'call',
  'send_properties',
  'site_visit',
  'follow_up',
  'payment_plan',
  'negotiate',
  'feedback',
  'close',
  'note',
] as const;

export const SITE_VISIT_STATUSES = [
  'Scheduled',
  'Confirmed',
  'Completed',
  'Cancelled',
  'Rescheduled',
] as const;
