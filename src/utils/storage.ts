import type { Bench, ComfortWeights } from '@/types';
import { DEFAULT_COMFORT_WEIGHTS, WEIGHT_MIN, WEIGHT_MAX, WEIGHT_TOTAL } from '@/types';

const STORAGE_KEY = 'bench-archive-data';
const WEIGHTS_STORAGE_KEY = 'bench-archive-weights';

export function loadBenches(): Bench[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load benches from localStorage:', error);
  }
  return [];
}

export function saveBenches(benches: Bench[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(benches));
  } catch (error) {
    console.error('Failed to save benches to localStorage:', error);
  }
}

export function clearBenches(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear benches from localStorage:', error);
  }
}

export function isValidWeights(value: unknown): value is ComfortWeights {
  if (typeof value !== 'object' || value === null) return false;
  const weights = value as Record<string, unknown>;
  const keys: (keyof ComfortWeights)[] = ['backrest', 'shade', 'noise', 'material', 'rating'];
  const numbers = keys.map((key) => weights[key]);
  if (!numbers.every((n) => typeof n === 'number' && Number.isInteger(n) && n >= WEIGHT_MIN && n <= WEIGHT_MAX)) {
    return false;
  }
  return (numbers as number[]).reduce((sum, n) => sum + n, 0) === WEIGHT_TOTAL;
}

export function loadWeights(): ComfortWeights {
  try {
    const data = localStorage.getItem(WEIGHTS_STORAGE_KEY);
    if (data) {
      const parsed: unknown = JSON.parse(data);
      if (isValidWeights(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load weights from localStorage:', error);
  }
  return { ...DEFAULT_COMFORT_WEIGHTS };
}

export function saveWeights(weights: ComfortWeights): void {
  try {
    localStorage.setItem(WEIGHTS_STORAGE_KEY, JSON.stringify(weights));
  } catch (error) {
    console.error('Failed to save weights to localStorage:', error);
  }
}
