import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, MapPin, Star, Crown, Medal, Award, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useBenchStore } from '@/store/useBenchStore';
import { useWeightStore } from '@/store/useWeightStore';
import { calculateComfortScore, getComfortLevel, getComfortColor } from '@/utils/comfort';
import { MATERIAL_LABELS, SHADE_LABELS, WEIGHT_LABELS, WEIGHT_MIN, WEIGHT_MAX, WEIGHT_TOTAL, DEFAULT_COMFORT_WEIGHTS } from '@/types';
import type { ComfortWeights } from '@/types';

type WeightDraft = Record<keyof ComfortWeights, string>;

function toDraft(weights: ComfortWeights): WeightDraft {
  return {
    backrest: String(weights.backrest),
    shade: String(weights.shade),
    noise: String(weights.noise),
    material: String(weights.material),
    rating: String(weights.rating),
  };
}

const WEIGHT_KEYS: (keyof ComfortWeights)[] = ['backrest', 'shade', 'noise', 'material', 'rating'];

export default function RankingPage() {
  const { benches, initialize, initialized } = useBenchStore();
  const { weights, setWeights, resetWeights } = useWeightStore();
  const navigate = useNavigate();

  const [draft, setDraft] = useState<WeightDraft>(() => toDraft(weights));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  const rankedBenches = [...benches]
    .sort((a, b) => calculateComfortScore(b, weights) - calculateComfortScore(a, weights))
    .map((bench, index) => ({ bench, rank: index + 1 }));

  const draftNumbers = WEIGHT_KEYS.map((key) => Number(draft[key]));
  const draftSum = draftNumbers.reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0);

  const handleDraftChange = (key: keyof ComfortWeights, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setError(null);
  };

  const handleSave = () => {
    const parsed = {} as ComfortWeights;
    for (const key of WEIGHT_KEYS) {
      parsed[key] = Number(draft[key]);
    }
    const values = WEIGHT_KEYS.map((key) => parsed[key]);
    const allInRange = values.every(
      (v) => Number.isInteger(v) && v >= WEIGHT_MIN && v <= WEIGHT_MAX
    );
    const sum = values.reduce((acc, v) => acc + v, 0);

    if (!allInRange || sum !== WEIGHT_TOTAL) {
      setError(`保存失败：每项占比须为 ${WEIGHT_MIN}–${WEIGHT_MAX} 的整数，且五项总和必须等于 ${WEIGHT_TOTAL}`);
      setSaved(false);
      return;
    }

    setWeights(parsed);
    setError(null);
    setSaved(true);
  };

  const handleReset = () => {
    resetWeights();
    setDraft(toDraft(DEFAULT_COMFORT_WEIGHTS));
    setError(null);
    setSaved(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-base font-bold text-ink-light">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50/80 to-amber-50/80 border-yellow-200/50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50/80 to-slate-50/80 border-gray-200/50';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50/80 to-amber-50/80 border-orange-200/50';
    return 'bg-white/50 border-deep-brown/5';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-semibold text-deep-brown mb-1">
          舒适度排行
        </h2>
        <p className="text-ink-light text-sm">
          综合评分最高的长椅
        </p>
      </div>

      <div className="paper-texture rounded-xl shadow-paper p-4 border border-deep-brown/5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="w-4 h-4 text-moss-green" />
          <h3 className="font-serif font-semibold text-deep-brown">个性化权重</h3>
          <span className="text-xs text-ink-light ml-auto">
            当前总和
            <span className={`ml-1 font-medium ${draftSum === WEIGHT_TOTAL ? 'text-moss-green' : 'text-red-500'}`}>
              {draftSum}
            </span>
            /{WEIGHT_TOTAL}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {WEIGHT_KEYS.map((key) => (
            <label key={key} className="block">
              <span className="block text-xs text-ink-light mb-1">{WEIGHT_LABELS[key]}</span>
              <input
                type="number"
                min={WEIGHT_MIN}
                max={WEIGHT_MAX}
                step={1}
                value={draft[key]}
                onChange={(e) => handleDraftChange(key, e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-white/80 border border-deep-brown/10 text-sm text-deep-brown focus:outline-none focus:ring-2 focus:ring-moss-green/40"
              />
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-moss-green text-white rounded-lg text-sm font-medium hover:bg-moss-light transition-colors shadow-md"
          >
            保存权重
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/70 text-ink-light rounded-lg text-sm font-medium hover:text-deep-brown hover:bg-white transition-colors border border-deep-brown/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            恢复默认
          </button>
          <span className="text-xs text-ink-light">
            每项 {WEIGHT_MIN}–{WEIGHT_MAX}，总和 {WEIGHT_TOTAL}
          </span>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500">{error}</p>
        )}
        {saved && !error && (
          <p className="mt-3 text-sm text-moss-green">已保存，排行与全站评分已按新权重重算</p>
        )}
      </div>

      <div className="space-y-3">
        {rankedBenches.map(({ bench, rank }) => {
          const comfortScore = calculateComfortScore(bench, weights);
          const comfortLevel = getComfortLevel(comfortScore);
          const comfortColor = getComfortColor(comfortScore);

          return (
            <div
              key={bench.id}
              onClick={() => navigate(`/bench/${bench.id}`)}
              className={`paper-texture rounded-xl shadow-paper p-4 border ${
                getRankBg(rank)
              } cursor-pointer card-hover fade-in opacity-0 stagger-${Math.min(rank, 6)}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warm-beige flex items-center justify-center flex-shrink-0">
                  {getRankIcon(rank)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif font-semibold text-deep-brown truncate">
                      {bench.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${comfortColor} bg-white/80`}>
                      {comfortLevel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-ink-light text-sm mb-2">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{bench.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-ink-light px-2 py-0.5 bg-white/60 rounded">
                      {MATERIAL_LABELS[bench.material]}
                    </span>
                    <span className="text-xs text-ink-light px-2 py-0.5 bg-white/60 rounded">
                      {SHADE_LABELS[bench.shadeLevel]}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-ink-light px-2 py-0.5 bg-white/60 rounded">
                      <Star className="w-3 h-3 fill-ochre text-ochre" />
                      <span>{bench.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className={`text-2xl font-bold font-serif ${comfortColor}`}>
                    {comfortScore}
                  </div>
                  <div className="text-xs text-ink-light">
                    舒适度
                  </div>
                </div>
              </div>

              <div className="mt-3 pl-16">
                <div className="h-2 bg-warm-beige rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      comfortScore >= 4 ? 'bg-moss-green' :
                      comfortScore >= 3 ? 'bg-ochre' :
                      'bg-ink-light'
                    }`}
                    style={{ width: `${(comfortScore / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {rankedBenches.length === 0 && (
        <div className="paper-texture rounded-xl shadow-paper p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-moss-green/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-moss-green/50" />
          </div>
          <h3 className="font-serif text-lg font-medium text-deep-brown mb-2">
            还没有排行数据
          </h3>
          <p className="text-ink-light text-sm">
            添加一些长椅档案后，这里会显示舒适度排行榜
          </p>
        </div>
      )}
    </div>
  );
}
