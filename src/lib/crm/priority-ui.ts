export function priorityBadgeVariant(
  priority?: string | null
): 'hot' | 'warm' | 'cold' {
  if (priority === 'HOT' || priority === 'VERY_HOT') return 'hot';
  if (priority === 'WARM') return 'warm';
  return 'cold';
}

export function formatPriorityLabel(priority?: string | null): string {
  if (!priority) return 'COLD';
  if (priority === 'VERY_HOT') return 'VERY HOT';
  return priority;
}
