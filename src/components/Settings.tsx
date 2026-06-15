import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { Settings as SettingsIcon, Sliders, Play, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function Settings() {
  const [learningRate, setLearningRate] = useState<number>(0.05);
  const [maxDepth, setMaxDepth] = useState<number>(6);
  const [testSplit, setTestSplit] = useState<number>(20);
  const [isApplying, setIsApplying] = useState(false);
  const [applyComplete, setApplyComplete] = useState(false);

  const handleApply = () => {
    setIsApplying(true);
    setApplyComplete(false);
    setTimeout(() => {
      setIsApplying(false);
      setApplyComplete(true);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Sliders className="text-blue-400" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Hyperparameter Tuning (XGBoost)</h3>
            <p className="text-xs text-slate-400 font-mono">ENFORCE RE-TRAINING MANIFOLD PARAMETERS</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 space-y-6">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Model Configuration Sliders</h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-300 font-medium">Learning Rate (Eta eta)</span>
                <span className="font-mono text-blue-400">{learningRate}</span>
              </div>
              <input 
                type="range" 
                min="0.01" 
                max="0.5" 
                step="0.01" 
                value={learningRate} 
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full accent-blue-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-300 font-medium">Max Tree Depth</span>
                <span className="font-mono text-blue-400">{maxDepth}</span>
              </div>
              <input 
                type="range" 
                min="3" 
                max="12" 
                step="1" 
                value={maxDepth} 
                onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                className="w-full accent-blue-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-300 font-medium">Validation Split (%)</span>
                <span className="font-mono text-blue-400">{testSplit}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="40" 
                step="5" 
                value={testSplit} 
                onChange={(e) => setTestSplit(parseInt(e.target.value))}
                className="w-full accent-blue-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {isApplying ? 'Re-compiling Parameters...' : applyComplete ? <CheckCircle2 size={14} /> : <Play size={14} />}
              {isApplying ? 'Training Model...' : applyComplete ? 'Applied Successfully!' : 'Retrain & Save Parameters'}
            </button>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Environment Specs</h4>
            <div className="space-y-3 font-mono text-[11px] text-slate-400">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Kernel Compiler:</span>
                <span className="text-white">v4.12.0rc1</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>CUDA Core Stage:</span>
                <span className="text-emerald-400">Active (v12.2)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Precision Standard:</span>
                <span className="text-white">FP16</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Validation Scheme:</span>
                <span className="text-slate-300">5-Fold K-CV</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed font-sans mt-8">
            These variables command the training iterations of the XGBoost and Gradient Boosting regressors in background thread segments. Setting values with higher depths triggers longer cross-validation sessions which may exceed memory specs. Use with appropriate care.
          </p>
        </div>
      </div>
    </div>
  );
}
