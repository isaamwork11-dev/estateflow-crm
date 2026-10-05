/** Commercial CRM domain constants (no AI) */

export const CRM_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  AGENT: 'AGENT',
  VIEWER: 'VIEWER',
  // Legacy aliases (session normalization)
  COMPANY_OWNER: 'COMPANY_OWNER',
  SALES_MANAGER: 'SALES_MANAGER',
  SALES_AGENT: 'SALES_AGENT',
} as const;

export type CrmRole = (typeof CRM_ROLES)[keyof typeof CRM_ROLES];

export const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPERTY_SHARED',
  'SITE_VISIT',
  'NEGOTIATION',
  'BOOKED',
  'WON',
  'LOST',
  'NURTURE',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  'WhatsApp',
  'Facebook',
  'Instagram',
  'Website',
  'Referral',
  'Call',
  'Walk-in',
  'Portal',
  'Manual',
  'Other',
] as const;

export const SCORE_BANDS = {
  COLD: { min: 0, max: 30, label: 'COLD' },
  WARM: { min: 31, max: 60, label: 'WARM' },
  HOT: { min: 61, max: 80, label: 'HOT' },
  VERY_HOT: { min: 81, max: 100, label: 'VERY HOT' },
} as const;

export const DEFAULT_SCORE_WEIGHTS = {
  budgetProvided: 15,
  locationProvided: 15,
  propertyTypeProvided: 10,
  specificPropertySelected: 15,
  phoneVerified: 10,
  respondedRecently: 10,
  siteVisitScheduled: 20,
  negotiationStarted: 20,
} as const;

export const PROPERTY_STATUSES = [
  'AVAILABLE',
  'HOLD',
  'SOLD',
  'RENTED',
  'INACTIVE',
] as const;

export const PROPERTY_TYPES = [
  'HOUSE',
  'APARTMENT',
  'PLOT',
  'COMMERCIAL',
  'OFFICE',
  'SHOP',
  'LAND',
  'OTHER',
] as const;

export const TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export const DEAL_STATUSES = [
  'NEGOTIATION',
  'BOOKED',
  'CLOSED_WON',
  'CLOSED_LOST',
  'CANCELLED',
] as const;

/** Map legacy DB values → canonical pipeline status */
export function normalizeLeadStatus(status: string): LeadStatus {
  const map: Record<string, LeadStatus> = {
    New: 'NEW',
    NEW: 'NEW',
    Contacted: 'CONTACTED',
    CONTACTED: 'CONTACTED',
    Qualified: 'QUALIFIED',
    QUALIFIED: 'QUALIFIED',
    'Property Sent': 'PROPERTY_SHARED',
    PROPERTY_SHARED: 'PROPERTY_SHARED',
    'Site Visit': 'SITE_VISIT',
    SITE_VISIT: 'SITE_VISIT',
    Negotiation: 'NEGOTIATION',
    NEGOTIATION: 'NEGOTIATION',
    Booked: 'BOOKED',
    BOOKED: 'BOOKED',
    Won: 'WON',
    WON: 'WON',
    Lost: 'LOST',
    LOST: 'LOST',
    'Follow-up Later': 'NURTURE',
    NURTURE: 'NURTURE',
  };
  return map[status] ?? 'NEW';
}

export function normalizeUserRole(role: string): CrmRole {
  if (role === 'COMPANY_OWNER') return 'ADMIN';
  if (role === 'SALES_MANAGER') return 'MANAGER';
  if (role === 'SALES_AGENT') return 'AGENT';
  return role as CrmRole;
}
