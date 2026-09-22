import { useState } from 'react';
import { SlidersHorizontal, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { useBenchStore } from '@/store/useBenchStore';
import type { ComfortWeights } from '@/types';
import {
  DEFAULT_WEIGHTS,
  WEIGHT_FIELDS,
  WEIGHT_MIN,
  WEIGHT_MAX,
  WEIGHT_SUM,
  isDefaultWeights,
} from '@/utils/comfort';

type Draft = Record<keyof ComfortWeights, string>;

function toDraft(weights: ComfortWeights): Draft {
  return {
    backrest: String(weights.backrest),
    shade: String(weights.shade),
    noise: String(weights.noise),
    material: String(weights.material),
    rating: String(weights.rating),
  };
}

export default function WeightEditor() {
  const weights = useBenchStore((state) => state.weights);
  const setWeights = useBenchStore((state) => state.setWeights);
  const resetWeights = useBenchStore((state) => state.resetWeights);

  const [draft, setDraft] = useState<Draft>(() => toDraft(weights));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const parsed = WEIGHT_FIELDS.map(({ key }) => {
    const value = Number(draft[key]);
    const valid =
      draft[key].trim() !== '' &&
      Number.isInteger(value) &&
      value >= WEIGHT_MIN &&
      value <= WEIGHT_MAX;
    return { key, value, valid };
  });

  const total = parsed.reduce((sum, item) => sum + (item.valid ? item.value : 0), 0);
  const allInRange = parsed.every((item) => item.valid);
  const isDirty = WEIGHT_FIELDS.some(({ key }) => draft[key] !== String(weights[key]));

  const handleChange = (key: keyof ComfortWeights, raw: string) => {
    setDraft((prev) => ({ ...prev, [key]: raw }));
    setError(null);
    setSaved(false);
  };

  const handleSave = () => {
    if (!allInRange) {
      setError(`每项占比须为 ${WEIGHT_MIN}–${WEIGHT_MAX} 的整数，已整次拒绝，原偏好未改动`);
      return;
    }
    if (total !== WEIGHT_SUM) {
      setError(`五项占比之和须为 ${WEIGHT_SUM}（当前 ${total}），已整次拒绝，原偏好未改动`);
      return;
    }

    const next: ComfortWeights = {
      backrest: parsed[0].value,
      shade: parsed[1].value,
      noise: parsed[2].value,
      material: parsed[3].value,
      rating: parsed[4].value,
    };

    if (setWeights(next)) {
      setDraft(toDraft(next));
      setError(null);
      setSaved(true);
    }
  };

  const handleReset = () => {
    resetWeights();
    setDraft(toDraft(DEFAULT_WEIGHTS));
    setError(null);
    setSaved(true);
  };

  return (
    <div className="paper-texture rounded-xl shadow-paper p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-moss-green" />
          <h3 className="font-serif font-semibold text-deep-brown">个性化占比</h3>
        </div>
        <span className="text-xs text-ink-light">
          {isDefaultWeights(weights) ? '当前：默认占比' : '当前：自定义占比'}
        </span>
      </div>

      <div className="space-y-3">
        {WEIGHT_FIELDS.map(({ key, label, hint }) => {
          const item = parsed.find((p) => p.key === key)!;
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-20 flex-shrink-0">
                <div className="text-sm font-medium text-deep-brown">{label}</div>
                <div className="text-xs text-ink-light/70">{hint}</div>
              </div>

              <input
                type="range"
                min={WEIGHT_MIN}
                max={WEIGHT_MAX}
                step={1}
                value={item.valid ? item.value : WEIGHT_MIN}
                onChange={(e) => handleChange(key, e.target.value)}
                className="flex-1 accent-moss-green cursor-pointer"
                aria-label={`${label}占比`}
              />

              <div className="w-20 flex-shrink-0">
                <input
                  type="number"
                  min={WEIGHT_MIN}
                  max={WEIGHT_MAX}
                  step={1}
                  value={draft[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className={`w-full px-2 py-1 text-sm text-right bg-white/60 border rounded-lg text-deep-brown focus:bg-white transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    draft[key].trim() !== '' && !item.valid
                      ? 'border-red-400'
                      : 'border-deep-brown/10'
                  }`}
                  aria-label={`${label}占比数值`}
                />
              </div>
              <span className="text-xs text-ink-light w-4 flex-shrink-0">%</span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-deep-brown/10">
        <span className={`text-sm ${total === WEIGHT_SUM && allInRange ? 'text-moss-green' : 'text-red-500'}`}>
          合计 {allInRange ? total : '—'} / {WEIGHT_SUM}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {saved && !error && (
            <span className="flex items-center gap-1 text-xs text-moss-green">
              <Check className="w-3.5 h-3.5" />
              已保存
            </span>
          )}
          <button
            onClick={handleReset}
            disabled={!isDirty && isDefaultWeights(weights)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-ink-light hover:text-deep-brown hover:bg-warm-beige/60 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            恢复默认
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="px-4 py-1.5 text-sm text-white bg-moss-green hover:bg-moss-light rounded-lg transition-colors disabled:opacity-40 disabled:cursor-default"
          >
            保存偏好
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 mt-3 px-3 py-2 bg-red-50 border border-red-200/60 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
