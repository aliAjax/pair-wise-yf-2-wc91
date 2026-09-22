import { create } from 'zustand';
import type { ComfortWeights } from '@/types';
import { DEFAULT_COMFORT_WEIGHTS } from '@/types';
import { loadWeights, saveWeights } from '@/utils/storage';

interface WeightState {
  weights: ComfortWeights;
}

interface WeightActions {
  setWeights: (weights: ComfortWeights) => void;
  resetWeights: () => void;
}

export const useWeightStore = create<WeightState & WeightActions>((set) => ({
  weights: loadWeights(),

  setWeights: (weights) => {
    set({ weights });
    saveWeights(weights);
  },

  resetWeights: () => {
    const defaults = { ...DEFAULT_COMFORT_WEIGHTS };
    set({ weights: defaults });
    saveWeights(defaults);
  },
}));
