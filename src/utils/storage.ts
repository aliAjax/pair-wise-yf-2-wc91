import type { Bench, ComfortWeights } from '@/types';
import { DEFAULT_WEIGHTS, isValidWeights } from '@/utils/comfort';

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

export function loadWeights(): ComfortWeights {
  try {
    const data = localStorage.getItem(WEIGHTS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as ComfortWeights;
      if (isValidWeights(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load weights from localStorage:', error);
  }
  return DEFAULT_WEIGHTS;
}

export function saveWeights(weights: ComfortWeights): void {
  try {
    localStorage.setItem(WEIGHTS_STORAGE_KEY, JSON.stringify(weights));
  } catch (error) {
    console.error('Failed to save weights to localStorage:', error);
  }
}

export function clearWeights(): void {
  try {
    localStorage.removeItem(WEIGHTS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear weights from localStorage:', error);
  }
}
