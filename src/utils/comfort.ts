import type { Bench, MaterialType, ShadeLevelType, NoiseLevelType, ComfortWeights } from '@/types';

export const DEFAULT_WEIGHTS: ComfortWeights = {
  backrest: 20,
  shade: 20,
  noise: 20,
  material: 15,
  rating: 25,
};

export const WEIGHT_MIN = 5;
export const WEIGHT_MAX = 60;
export const WEIGHT_SUM = 100;

export const WEIGHT_FIELDS: Array<{ key: keyof ComfortWeights; label: string; hint: string }> = [
  { key: 'backrest', label: '靠背', hint: '是否有靠背' },
  { key: 'shade', label: '遮阴', hint: '遮阴程度' },
  { key: 'noise', label: '噪音', hint: '环境安静度' },
  { key: 'material', label: '材质', hint: '椅面材质' },
  { key: 'rating', label: '个人评分', hint: '你的主观评分' },
];

/** 单项须在 5–60 之间且五项总和为 100，否则整组权重无效 */
export function isValidWeights(weights: ComfortWeights): boolean {
  const values = WEIGHT_FIELDS.map(({ key }) => weights[key]);
  return (
    values.every((value) => Number.isInteger(value) && value >= WEIGHT_MIN && value <= WEIGHT_MAX) &&
    values.reduce((sum, value) => sum + value, 0) === WEIGHT_SUM
  );
}

export function isDefaultWeights(weights: ComfortWeights): boolean {
  return WEIGHT_FIELDS.every(({ key }) => weights[key] === DEFAULT_WEIGHTS[key]);
}

const materialScores: Record<MaterialType, number> = {
  wood: 5,
  mixed: 4,
  stone: 3,
  metal: 2,
  plastic: 2,
};

const shadeScores: Record<ShadeLevelType, number> = {
  full: 5,
  partial: 3,
  none: 1,
};

const noiseScores: Record<NoiseLevelType, number> = {
  quiet: 5,
  moderate: 3,
  noisy: 1,
};

export function calculateComfortScore(bench: Bench, weights: ComfortWeights = DEFAULT_WEIGHTS): number {
  const backrestScore = bench.hasBackrest ? 5 : 2;
  const shadeScore = shadeScores[bench.shadeLevel];
  const noiseScore = noiseScores[bench.noiseLevel];
  const materialScore = materialScores[bench.material];
  const userRating = bench.rating;

  // 默认占比沿用原始算式，保证恢复默认后分数与顺序逐位还原
  if (
    weights.backrest === DEFAULT_WEIGHTS.backrest &&
    weights.shade === DEFAULT_WEIGHTS.shade &&
    weights.noise === DEFAULT_WEIGHTS.noise &&
    weights.material === DEFAULT_WEIGHTS.material &&
    weights.rating === DEFAULT_WEIGHTS.rating
  ) {
    const defaultComfort = backrestScore * 0.2 + shadeScore * 0.2 + noiseScore * 0.2 + materialScore * 0.15 + userRating * 0.25;
    return Math.round(defaultComfort * 10) / 10;
  }

  const comfort =
    (backrestScore * weights.backrest +
      shadeScore * weights.shade +
      noiseScore * weights.noise +
      materialScore * weights.material +
      userRating * weights.rating) /
    100;

  return Math.round(comfort * 10) / 10;
}

export function getComfortLevel(score: number): string {
  if (score >= 4.5) return '极佳';
  if (score >= 3.8) return '优秀';
  if (score >= 3.0) return '良好';
  if (score >= 2.0) return '一般';
  return '较差';
}

export function getComfortColor(score: number): string {
  if (score >= 4.5) return 'text-moss-green';
  if (score >= 3.8) return 'text-moss-light';
  if (score >= 3.0) return 'text-ochre';
  if (score >= 2.0) return 'text-ink-light';
  return 'text-red-500';
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
