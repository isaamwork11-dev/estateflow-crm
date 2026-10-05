import type { PropertyDocument } from '@/lib/db/models/Property';

export interface CompletenessResult {
  percent: number;
  missing: string[];
}

export function propertyCompleteness(property: Partial<PropertyDocument>): CompletenessResult {
  const checks: Array<{ ok: boolean; label: string }> = [
    { ok: Boolean(property.title), label: 'title' },
    { ok: Boolean(property.price && property.price > 0), label: 'price' },
    { ok: Boolean(property.propertyType), label: 'property type' },
    { ok: Boolean(property.city || property.area), label: 'city/area' },
    { ok: Boolean(property.address || property.location), label: 'address' },
    { ok: (property.images?.length ?? 0) >= 2, label: 'at least 2 images' },
    { ok: property.bedrooms != null, label: 'bedroom count' },
    { ok: property.bathrooms != null, label: 'bathroom count' },
    { ok: Boolean(property.description), label: 'description' },
    { ok: Boolean(property.features?.length), label: 'features' },
  ];

  const passed = checks.filter((c) => c.ok).length;
  const percent = Math.round((passed / checks.length) * 100);
  const missing = checks.filter((c) => !c.ok).map((c) => c.label);
  return { percent, missing };
}
