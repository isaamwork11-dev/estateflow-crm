import { DEFAULT_SCORE_WEIGHTS } from './constants';

export type ScoreWeights = typeof DEFAULT_SCORE_WEIGHTS;

export function mergeScoreWeights(orgWeights?: Partial<ScoreWeights>): ScoreWeights {
  return { ...DEFAULT_SCORE_WEIGHTS, ...orgWeights };
}
