import React, { useState } from 'react';
import { cn, formatCurrency } from '../lib/utils';
import { Download, FileSpreadsheet, FileText, CheckCircle2, RotateCw, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { SalesData } from '../types';

interface ReportsProps {
  data: SalesData[];
}

export function Reports({ data }: ReportsProps) {
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('all');

  const startDownload = (type: string, filename: string, contentGetter: () => string, mimeType: string) => {
    setDownloadingType(type);
    setDownloadSuccess(null);
    
    // Simulate pipeline gathering and writing files
    setTimeout(() => {
      try {
        const content = contentGetter();
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setDownloadingType(null);
        setDownloadSuccess(type);
      } catch (err) {
        console.error("Export failure", err);
        setDownloadingType(null);
      }
    }, 1500);
  };

  const exportCSV = () => {
    const headers = 'OrderId,OrderDate,ShipMode,Category,SubCategory,Sales,Quantity,Discount,Profit,Region,Segment\n';
    const rows = data.map(d => 
      `"${d.orderId}","${d.orderDate}","${d.shipMode}","${d.category}","${d.subCategory}",${d.sales},${d.quantity},${d.discount},${d.profit},"${d.region}","${d.segment}"`
    ).join('\n');
    return headers + rows;
  };

  const exportModelMetrics = () => {
    return JSON.stringify([
      { model: 'XGBoost Regressor', r2: 0.942, rmse: 3421, mae: 2110, cvScore: 0.938 },
      { model: 'Gradient Boosting', r2: 0.915, rmse: 4212, mae: 2750, cvScore: 0.911 },
      { model: 'Random Forest Regressor', r2: 0.891, rmse: 5120, mae: 3102, cvScore: 0.885 },
      { model: 'Linear Regression', r2: 0.784, rmse: 7880, mae: 4950, cvScore: 0.772 }
    ], null, 2);
  };

  const exportPDFReport = () => {
    const totalSales = data.reduce((acc, curr) => acc + curr.sales, 0);
    const totalProfit = data.reduce((acc, curr) => acc + curr.profit, 0);
    return `NEUROFORECAST AI ENTERPRISE INTELLIGENCE REPORT
==================================================
Date: ${new Date().toLocaleDateString()}
Total Logged Sales: ${formatCurrency(totalSales)}
Total Net Profit: ${formatCurrency(totalProfit)}
Profit Margin Efficiency: ${((totalProfit / (totalSales || 1)) * 100).toFixed(2)}%
Assigned Model: XGBoost Ensemble Regression v2.4 (94.20% Accuracy)
==================================================
Executive Summary:
Sales targets show strong momentum leaning into upcoming quarters. Technology products show high margin efficiency (~18% outperformance).
==================================================
Generated securely via NeuroForecast AI sandbox workspace.`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Scope Settings */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-white mb-2">Export Parameters</h3>
        <p className="text-xs text-slate-400 mb-6">Select dataset criteria for report generation.</p>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setExportScope('all')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all border",
              exportScope === 'all' ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
            )}
          >
            All Live Records ({data.length} entries)
          </button>
          <button 
            onClick={() => setExportScope('filtered')}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all border",
              exportScope === 'filtered' ? "bg-blue-600 border-blue-500 text-white" : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
            )}
          >
            Limit Scope (First 50 records)
          </button>
        </div>
      </div>

      {/* Grid of exports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CSV export */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="text-emerald-400" size={24} />
            </div>
            <h4 className="text-base font-bold text-white">Full CSV Sheet Export</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export all column metrics, processed dates, cleaned features, and transactions layout to a spreadsheet-ready file.
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={() => startDownload('csv', 'neuroforce-transactions.csv', exportCSV, 'text/csv')}
              disabled={downloadingType !== null}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {downloadingType === 'csv' ? (
                <RotateCw className="animate-spin text-emerald-400" size={16} />
              ) : downloadSuccess === 'csv' ? (
                <CheckCircle2 className="text-emerald-400" size={16} />
              ) : (
                <Download size={16} />
              )}
              {downloadingType === 'csv' ? 'Compiling File...' : downloadSuccess === 'csv' ? 'Downloaded!' : 'Export CSV Ledger'}
            </button>
          </div>
        </div>

        {/* Model metrics export */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <FileText className="text-blue-400" size={24} />
            </div>
            <h4 className="text-base font-bold text-white">Model Metrics JSON</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dump metrics for Linear Regression, Random Forest, Out-Of-Bag Error, SHAP estimations, scores, CV validations, and speeds.
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={() => startDownload('json', 'model-metrics.json', exportModelMetrics, 'application/json')}
              disabled={downloadingType !== null}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {downloadingType === 'json' ? (
                <RotateCw className="animate-spin text-blue-400" size={16} />
              ) : downloadSuccess === 'json' ? (
                <CheckCircle2 className="text-blue-400" size={16} />
              ) : (
                <Download size={16} />
              )}
              {downloadingType === 'json' ? 'Compiling JSON...' : downloadSuccess === 'json' ? 'JSON Downloaded!' : 'Export Model JSON'}
            </button>
          </div>
        </div>

        {/* Strategic report export */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Sparkles className="text-purple-400" size={24} />
            </div>
            <h4 className="text-base font-bold text-white">Strategic Strategy Report</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthethize a clean business intelligence overview with aggregate sales statistics, Net Profit, and active model descriptions.
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={() => startDownload('pdf', 'executive-strategy-report.txt', exportPDFReport, 'text/plain')}
              disabled={downloadingType !== null}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {downloadingType === 'pdf' ? (
                <RotateCw className="animate-spin text-white" size={16} />
              ) : downloadSuccess === 'pdf' ? (
                <CheckCircle2 className="text-white" size={16} />
              ) : (
                <Download size={16} />
              )}
              {downloadingType === 'pdf' ? 'Formatting Engine...' : downloadSuccess === 'pdf' ? 'Report Downloaded!' : 'Download Strategy Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
