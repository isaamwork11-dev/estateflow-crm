/** Shared Mongo filters for legacy + canonical CRM values */

export const CLOSED_LEAD_STATUSES = ['WON', 'LOST', 'Won', 'Lost'];

export const NEW_LEAD_STATUSES = ['NEW', 'New'];

export const HOT_LEAD_PRIORITIES = ['HOT', 'VERY_HOT'];

export function openLeadStatusFilter() {
  return { $nin: CLOSED_LEAD_STATUSES };
}
