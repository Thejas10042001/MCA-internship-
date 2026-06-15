import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from 'recharts';
import { cn, formatPercent } from '../lib/utils';
import { Brain, HelpCircle, AlertCircle, Sparkles, Filter } from 'lucide-react';
import { motion } from 'motion/react';

interface ShapFeature {
  feature: string;
  shapValue: number; // impact
  direction: 'positive' | 'negative';
  description: string;
}

const DEFAULT_SHAP_FEATURES: ShapFeature[] = [
  { feature: 'Discount Level', shapValue: 0.38, direction: 'negative', description: 'Aggressive discounts stimulate velocity but compress marginal profit structures.' },
  { feature: 'Technology Category', shapValue: 0.32, direction: 'positive', description: 'A strong positive multiplier driven by premium orders and corporate clients.' },
  { feature: 'Seasonality (Q4)', shapValue: 0.28, direction: 'positive', description: 'Predictable cyclical peaks during enterprise software procurement cycles.' },
  { feature: 'Prior Lag-7 Sales', shapValue: 0.19, direction: 'positive', description: 'Inertia model factor; higher preceding sales heavily project upcoming transactions.' },
  { feature: 'Promotion Active', shapValue: 0.15, direction: 'positive', description: 'Coordinated marketing campaigns showing localized margins improvements.' },
  { feature: 'Furniture Class', shapValue: -0.12, direction: 'negative', description: 'Heavy shipping metrics and packaging assembly costs negatively impact net revenue.' },
  { feature: 'Corporate Segment', shapValue: 0.08, direction: 'positive', description: 'Bulk shipping tiers provide efficiency margins over consumer retail orders.' },
];

export function XAI() {
  const [selectedFeature, setSelectedFeature] = useState<ShapFeature>(DEFAULT_SHAP_FEATURES[0]);
  const [filterClass, setFilterClass] = useState<'All' | 'Positive' | 'Negative'>('All');

  const filteredFeatures = useMemo(() => {
    return DEFAULT_SHAP_FEATURES.filter(f => {
      if (filterClass === 'Positive') return f.direction === 'positive';
      if (filterClass === 'Negative') return f.direction === 'negative';
      return true;
    });
  }, [filterClass]);

  const chartData = useMemo(() => {
    return filteredFeatures.map(f => ({
      name: f.feature,
      impact: f.shapValue * (f.direction === 'positive' ? 1 : -1),
      absImpact: Math.abs(f.shapValue * 100),
      color: f.direction === 'positive' ? '#10b981' : '#f43f5e',
      featureItem: f
    }));
  }, [filteredFeatures]);

  return (
    <div className="space-y-6 pb-12">
      {/* Informative Header Title bar */}
      <div className="glass-card p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="text-blue-400" size={20} />
            <h3 className="text-lg font-bold text-white">Explainable AI Interface (SHAP Global Explainer)</h3>
          </div>
          <p className="text-sm text-slate-400">
            Unveiling model feature priorities through cooperative game-theoretic estimations.
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
          {['All', 'Positive', 'Negative'].map((opt: any) => (
            <button
              key={opt}
              onClick={() => setFilterClass(opt)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all",
                filterClass === opt ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              {opt} Influences
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SHAP Chart */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-6">SHAP Values Comparison Panel</h4>
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis 
                    type="number" 
                    stroke="#64748b" 
                    fontSize={10} 
                    domain={[-50, 50]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#090d16] border border-white/10 p-3 rounded-lg shadow-xl">
                            <h5 className="text-xs font-bold text-white">{data.name}</h5>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Impact: <span className={cn(data.impact >= 0 ? "text-emerald-400" : "text-rose-400", "font-mono font-bold")}>
                                {data.impact >= 0 ? '+' : ''}{(data.impact * 100).toFixed(1)}%
                              </span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="impact" 
                    radius={[4, 4, 4, 4]}
                    onClick={(e) => {
                      if (e && e.featureItem) {
                        setSelectedFeature(e.featureItem);
                      }
                    }}
                    cursor="pointer"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        opacity={selectedFeature?.feature === entry.name ? 1.0 : 0.6}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-500 font-mono mt-4 text-center">
              *Click on any horizontal bar above to inspect specific business factors.
            </p>
          </div>
        </div>

        {/* Selected Explanation Detail Card */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Feature Analysis Explainer</h4>
            
            {selectedFeature ? (
              <motion.div 
                key={selectedFeature.feature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-lg font-bold text-white">{selectedFeature.feature}</h5>
                    <span className={cn(
                      "px-2.5 py-0.5 text-[9px] font-mono rounded-full uppercase tracking-widest inline-block mt-1",
                      selectedFeature.direction === 'positive' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    )}>
                      {selectedFeature.direction === 'positive' ? 'Positive Weight Factor' : 'Negative Deficit Block'}
                    </span>
                  </div>
                  <span className={cn(
                    "text-2xl font-black font-mono",
                    selectedFeature.direction === 'positive' ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {(selectedFeature.shapValue * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {selectedFeature.description}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="text-xs text-slate-500">Pick a feature from the SHAP chart.</div>
            )}
            
            {/* Global Insight Section */}
            <div className="pt-6 border-t border-white/5 space-y-3">
              <div className="flex gap-2 text-xs font-semibold text-blue-400">
                <Sparkles size={14} />
                <span className="uppercase tracking-wide">Key Game-Theory Insight</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "Discount levels and Technology category contribute most strongly to sales growth. Strategic tuning of discounts shows immediate margin response levels."
              </p>
            </div>
          </div>

          <div className="bg-blue-600/5 p-4 border border-blue-500/10 rounded-xl flex gap-3 mt-6">
            <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              <strong>Kernel SHAP</strong> utilizes weighted linear regression kernels over coalition arrays to establish localized marginal weights. Results represent global values computed on the selected transaction series.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
