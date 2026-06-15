import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { cn, formatPercent } from '../lib/utils';
import { Cpu, Award, Zap, ShieldCheck, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ModelMetric {
  name: string;
  r2: number;
  rmse: number;
  mae: number;
  cvScore: number;
  speedMs: number;
  description: string;
  rank: number;
}

const MODELS_METRICS: ModelMetric[] = [
  {
    name: 'XGBoost Regressor',
    r2: 94.20,
    rmse: 3421,
    mae: 2110,
    cvScore: 93.8,
    speedMs: 120,
    description: 'Ensemble boosted decision tree optimization for extreme gradient systems.',
    rank: 1
  },
  {
    name: 'Gradient Boosting',
    r2: 91.50,
    rmse: 4212,
    mae: 2750,
    cvScore: 91.1,
    speedMs: 250,
    description: 'Iterative residual minimization using standard regression trees.',
    rank: 2
  },
  {
    name: 'Random Forest Regressor',
    r2: 89.10,
    rmse: 5120,
    mae: 3102,
    cvScore: 88.5,
    speedMs: 410,
    description: 'Bagging decision trees to alleviate overfitting and variance parameters.',
    rank: 3
  },
  {
    name: 'Linear Regression',
    r2: 78.40,
    rmse: 7880,
    mae: 4950,
    cvScore: 77.2,
    speedMs: 15,
    description: 'Ordinary least squares linear estimation with simple intercept vectors.',
    rank: 4
  }
];

export function MLModels() {
  const radarData = useMemo(() => {
    return [
      { subject: 'R² Score', 'XGBoost': 94.2, 'Grad Boosting': 91.5, 'Random Forest': 89.1, 'Linear Reg': 78.4 },
      { subject: 'CV Score', 'XGBoost': 93.8, 'Grad Boosting': 91.1, 'Random Forest': 88.5, 'Linear Reg': 77.2 },
      { subject: 'RMSE (Inverted)', 'XGBoost': 90.1, 'Grad Boosting': 85.2, 'Random Forest': 81.3, 'Linear Reg': 62.0 },
      { subject: 'MAE (Inverted)', 'XGBoost': 91.2, 'Grad Boosting': 84.5, 'Random Forest': 82.0, 'Linear Reg': 65.5 },
      { subject: 'Speed Optimizer', 'XGBoost': 85.0, 'Grad Boosting': 75.0, 'Random Forest': 55.0, 'Linear Reg': 98.0 }
    ];
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Cpu className="text-blue-400" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Models Leaderboard</h3>
                <p className="text-xs text-slate-400 font-mono">ENFORCE LEVEL: COGNITIVE RETAIL ENSEMBLES</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              NeuroForecast trains four separate machine learning regression modules concurrently. Prediction predictions are dynamic ensembles, weighted dynamically based on continuous out-of-bag validation metrics.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Ensemble Leader</p>
              <p className="text-sm font-semibold text-blue-400">XGBoost Regressor</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Mean Ensemble R²</p>
              <p className="text-sm font-semibold text-emerald-400">94.20%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Training Cycles</p>
              <p className="text-sm font-semibold text-purple-400">12 Epochs (Self-Tuned)</p>
            </div>
          </div>
        </div>

        {/* Champion Model */}
        <div className="gradient-glow-border glass-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Cpu size={140} className="text-blue-500" />
          </div>
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="px-2.5 py-1 text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-mono uppercase tracking-widest">Champion Module</span>
              <Award className="text-blue-500" size={24} />
            </div>
            <h4 className="text-2xl font-black text-white">94.20% Accuracy</h4>
            <p className="text-xs text-slate-400 mt-1">XGBoost Regressor Ensemble v2.4</p>
          </div>
          <div className="space-y-2 mt-6">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">RMSE Margin Of Error</span>
              <span className="font-mono text-white">$3,421</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "94%" }} className="bg-blue-500 h-full rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Model Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Comparison Radar Chart */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-6">Model Bi-Dimensional Radar</h4>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" opacity={0.3} />
                <Radar name="XGBoost" dataKey="XGBoost" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Radar name="Random Forest" dataKey="Random Forest" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} />
                <Radar name="Linear Reg" dataKey="Linear Reg" stroke="#e11d48" fill="#e11d48" fillOpacity={0.05} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.08)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metrics Grid Table */}
        <div className="lg:col-span-3 glass-card p-6">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-6">Comparative Feature Estimations (Validation Set)</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs mb-4">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-mono tracking-wider">
                  <th className="py-3">Model Engine</th>
                  <th className="py-3">R² Accuracy</th>
                  <th className="py-3">RMSE ($)</th>
                  <th className="py-3">MAE ($)</th>
                  <th className="py-3">Latency (ms)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MODELS_METRICS.map((m) => (
                  <tr key={m.name} className={cn("hover:bg-white/[0.02] transition-colors", m.rank === 1 && "bg-blue-500/[0.02]")}>
                    <td className="py-4 font-semibold text-white flex items-center gap-2">
                      {m.rank === 1 && <CheckCircle size={12} className="text-blue-400" />}
                      {m.name}
                    </td>
                    <td className="py-4 font-mono font-bold text-emerald-400">{m.r2.toFixed(2)}%</td>
                    <td className="py-4 font-mono text-slate-300">${m.rmse.toLocaleString()}</td>
                    <td className="py-4 font-mono text-slate-300">${m.mae.toLocaleString()}</td>
                    <td className="py-4 font-mono text-slate-400">{m.speedMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Model Quality Status Indicators */}
          <div className="space-y-4 mt-6 pt-6 border-t border-white/5">
            <h5 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Model Quality Assurance</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3 items-center">
                <ShieldCheck className="text-emerald-400 shrink-0" size={16} />
                <div>
                  <h6 className="text-xs font-bold text-white">Cross-Validation Confirmed</h6>
                  <p className="text-[10px] text-slate-400">Fold testing indicates stability bias &lt;0.4%</p>
                </div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3 items-center">
                <Zap className="text-yellow-400 shrink-0" size={16} />
                <div>
                  <h6 className="text-xs font-bold text-white">Model Auto-Staging Online</h6>
                  <p className="text-[10px] text-slate-400">Ready to pipeline 1-Click Retraining arrays</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
