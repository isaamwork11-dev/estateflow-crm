import type { ScoreWeights } from '@/lib/crm/scoring-config';
import { DEFAULT_SCORE_WEIGHTS, SCORE_BANDS } from '@/lib/crm/constants';

export interface LeadScoreInput {
  budgetMin?: number | null;
  budgetMax?: number | null;
  budget?: number | null;
  preferredCity?: string | null;
  preferredArea?: string | null;
  propertyType?: string | null;
  selectedPropertyId?: string | null;
  phoneVerified?: boolean;
  status?: string;
  lastContactAt?: Date | null;
  hasSiteVisit?: boolean;
}

export interface LeadScoreResult {
  score: number;
  band: 'COLD' | 'WARM' | 'HOT' | 'VERY HOT';
  priority: 'COLD' | 'WARM' | 'HOT' | 'VERY_HOT';
  reasons: string[];
}

export function scoreBand(score: number): LeadScoreResult['band'] {
  if (score >= SCORE_BANDS.VERY_HOT.min) return 'VERY HOT';
  if (score >= SCORE_BANDS.HOT.min) return 'HOT';
  if (score >= SCORE_BANDS.WARM.min) return 'WARM';
  return 'COLD';
}

export function scorePriority(score: number): LeadScoreResult['priority'] {
  const band = scoreBand(score);
  if (band === 'VERY HOT') return 'VERY_HOT';
  return band;
}

export function calculateLeadScore(
  input: LeadScoreInput,
  weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS
): LeadScoreResult {
  let score = 0;
  const reasons: string[] = [];

  const hasBudget =
    (input.budgetMax != null && input.budgetMax > 0) ||
    (input.budget != null && input.budget > 0) ||
    (input.budgetMin != null && input.budgetMin > 0);

  if (hasBudget) {
    score += weights.budgetProvided;
    reasons.push('Budget provided');
  }
  if (input.preferredCity || input.preferredArea) {
    score += weights.locationProvided;
    reasons.push('Location provided');
  }
  if (input.propertyType) {
    score += weights.propertyTypeProvided;
    reasons.push('Property type provided');
  }
  if (input.selectedPropertyId) {
    score += weights.specificPropertySelected;
    reasons.push('Specific property selected');
  }
  if (input.phoneVerified) {
    score += weights.phoneVerified;
    reasons.push('Phone verified');
  }
  if (input.lastContactAt) {
    const days = (Date.now() - input.lastContactAt.getTime()) / (1000 * 60 * 60 * 24);
    if (days <= 3) {
      score += weights.respondedRecently;
      reasons.push('Responded recently');
    }
  }
  if (input.hasSiteVisit) {
    score += weights.siteVisitScheduled;
    reasons.push('Site visit scheduled');
  }
  const st = (input.status ?? '').toUpperCase();
  if (st.includes('NEGOTIATION') || st === 'NEGOTIATION') {
    score += weights.negotiationStarted;
    reasons.push('Negotiation started');
  }

  score = Math.min(100, score);
  const band = scoreBand(score);
  return { score, band, priority: scorePriority(score), reasons };
}
