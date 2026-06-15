import React, { useMemo, useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { SalesData } from '../types';
import { cn, formatCurrency, formatNumber, formatPercent, parseDate } from '../lib/utils';
import { 
  Search, 
  Filter, 
  Calendar, 
  BarChart2, 
  TrendingUp, 
  DollarSign, 
  GitCompare, 
  ArrowUpRight, 
  ArrowDownRight, 
  Globe, 
  Clock, 
  Layers, 
  Activity, 
  Sparkles,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsProps {
  data: SalesData[];
}

export function Analytics({ data }: AnalyticsProps) {
  // Navigation: Toggle between Standard view and Advanced A/B Comparison zone
  const [activeTab, setActiveTab] = useState<'standard' | 'compare'>('standard');

  // 1. Standard View States
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [timeUnit, setTimeUnit] = useState<'monthly' | 'yearly'>('monthly');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract primary filters
  const regions = useMemo(() => ['All', ...Array.from(new Set(data.map(d => d.region))).filter(Boolean)], [data]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(data.map(d => d.category))).filter(Boolean)], [data]);

  // Handle standard filtered dataset
  const filteredData = useMemo(() => {
    return data.filter(d => {
      const matchRegion = selectedRegion === 'All' || d.region === selectedRegion;
      const matchCategory = selectedCategory === 'All' || d.category === selectedCategory;
      const matchSearch = searchQuery === '' || 
        d.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.orderId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRegion && matchCategory && matchSearch;
    });
  }, [data, selectedRegion, selectedCategory, searchQuery]);

  // Aggregate standard time series
  const timeSeriesData = useMemo(() => {
    const map: Record<string, { name: string; sales: number; profit: number }> = {};
    
    filteredData.forEach(d => {
      const date = parseDate(d.orderDate);
      const isInvalid = isNaN(date.getTime());
      const year = isInvalid ? 2024 : date.getFullYear();
      const monthStr = isInvalid ? '01' : String(date.getMonth() + 1).padStart(2, '0');
      
      const key = timeUnit === 'monthly' ? `${year}-${monthStr}` : `${year}`;
      if (!map[key]) {
        map[key] = {
          name: timeUnit === 'monthly' ? `${year}/${monthStr}` : `${year}`,
          sales: 0,
          profit: 0
        };
      }
      map[key].sales += d.sales;
      map[key].profit += d.profit;
    });

    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, val]) => val);
  }, [filteredData, timeUnit]);


  // 2. Comparison Engine Core States
  const uniqueRegions = useMemo(() => Array.from(new Set(data.map(d => d.region))).filter(Boolean), [data]);
  const uniqueYears = useMemo(() => {
    const yrs = data.map(d => {
      const dt = parseDate(d.orderDate);
      return isNaN(dt.getTime()) ? 2024 : dt.getFullYear();
    });
    return Array.from(new Set(yrs)).sort((a, b) => b - a); // descending years
  }, [data]);

  const [compareMode, setCompareMode] = useState<'region' | 'time'>('region');
  const [regionA, setRegionA] = useState<string>(uniqueRegions[0] || 'East');
  const [regionB, setRegionB] = useState<string>(uniqueRegions[1] || 'West');
  const [yearA, setYearA] = useState<number>(uniqueYears[1] || 2023);
  const [yearB, setYearB] = useState<number>(uniqueYears[0] || 2024);
  const [compCategory, setCompCategory] = useState<string>('All');

  // Datasets division A & B for comparison
  const compDataA = useMemo(() => {
    return data.filter(d => {
      const matchCat = compCategory === 'All' || d.category === compCategory;
      if (compareMode === 'region') {
        return d.region === regionA && matchCat;
      } else {
        const yr = parseDate(d.orderDate).getFullYear();
        return yr === yearA && matchCat;
      }
    });
  }, [data, compareMode, regionA, yearA, compCategory]);

  const compDataB = useMemo(() => {
    return data.filter(d => {
      const matchCat = compCategory === 'All' || d.category === compCategory;
      if (compareMode === 'region') {
        return d.region === regionB && matchCat;
      } else {
        const yr = parseDate(d.orderDate).getFullYear();
        return yr === yearB && matchCat;
      }
    });
  }, [data, compareMode, regionB, yearB, compCategory]);

  // Aggregate stats side-by-side
  const metricsComparison = useMemo(() => {
    const calcStats = (lst: SalesData[]) => {
      const sales = lst.reduce((acc, curr) => acc + curr.sales, 0);
      const profit = lst.reduce((acc, curr) => acc + curr.profit, 0);
      const orders = new Set(lst.map(d => d.orderId)).size || 1;
      const transactions = lst.length;
      const aov = sales / orders;
      const margin = (profit / (sales || 1)) * 100;
      return { sales, profit, aov, margin, transactions };
    };

    const statsA = calcStats(compDataA);
    const statsB = calcStats(compDataB);

    const calcVar = (valA: number, valB: number) => {
      const diff = valB - valA;
      const pct = valA === 0 ? 0 : (diff / valA) * 100;
      return { diff, pct };
    };

    return {
      statsA,
      statsB,
      varSales: calcVar(statsA.sales, statsB.sales),
      varProfit: calcVar(statsA.profit, statsB.profit),
      varAov: calcVar(statsA.aov, statsB.aov),
      varMargin: { diff: statsB.margin - statsA.margin, pct: statsB.margin - statsA.margin },
      varVolume: calcVar(statsA.transactions, statsB.transactions)
    };
  }, [compDataA, compDataB]);

  // Normalized chart data
  const comparisonChartData = useMemo(() => {
    if (compareMode === 'region') {
      // Sort chronologically by month-year
      const mapA: Record<string, number> = {};
      const mapB: Record<string, number> = {};
      
      compDataA.forEach(d => {
        const date = parseDate(d.orderDate);
        const k = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        mapA[k] = (mapA[k] || 0) + d.sales;
      });

      compDataB.forEach(d => {
        const date = parseDate(d.orderDate);
        const k = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        mapB[k] = (mapB[k] || 0) + d.sales;
      });

      const allKeys = Array.from(new Set([...Object.keys(mapA), ...Object.keys(mapB)])).sort();
      return allKeys.map(k => ({
        name: k,
        salesA: mapA[k] || 0,
        salesB: mapB[k] || 0
      }));
    } else {
      // Month-by-month direct overlay for comparison (Jan to Dec)
      const monthsName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlySalesA = Array(12).fill(0);
      const monthlySalesB = Array(12).fill(0);

      compDataA.forEach(d => {
        const date = parseDate(d.orderDate);
        const m = date.getMonth();
        if (m >= 0 && m < 12) monthlySalesA[m] += d.sales;
      });

      compDataB.forEach(d => {
        const date = parseDate(d.orderDate);
        const m = date.getMonth();
        if (m >= 0 && m < 12) monthlySalesB[m] += d.sales;
      });

      return monthsName.map((name, idx) => ({
        name,
        salesA: monthlySalesA[idx],
        salesB: monthlySalesB[idx]
      }));
    }
  }, [compareMode, compDataA, compDataB]);

  // Labels for vector A and vector B
  const labelA = compareMode === 'region' ? `${regionA} Region` : `Year ${yearA}`;
  const labelB = compareMode === 'region' ? `${regionB} Region` : `Year ${yearB}`;

  // Qualitative analysis generation
  const qualitativeAnalysis = useMemo(() => {
    const { statsA, statsB, varSales, varMargin } = metricsComparison;
    const leaderSales = statsB.sales > statsA.sales ? labelB : labelA;
    const marginLeader = statsB.margin > statsA.margin ? labelB : labelA;
    const percentChange = Math.abs(varSales.pct).toFixed(1);
    
    return {
      salesStatement: `Revenue aggregates show ${leaderSales} leading the baseline comparative set. Current sales variance yields a difference index of ${percentChange}% between the sectors.`,
      marginStatement: `${marginLeader} is exhibiting the superior yield strategy, with a net profit margin of ${statsB.margin > statsA.margin ? statsB.margin.toFixed(1) : statsA.margin.toFixed(1)}% compared to the counterpart's ${statsB.margin > statsA.margin ? statsA.margin.toFixed(1) : statsB.margin.toFixed(1)}%.`,
      strategyTip: compareMode === 'time' 
        ? `Direct MoM overlays show seasonal optimization triggers around Q3 and Q4. Advise stabilization of subsidy programs during high-interest cycles.`
        : `Cross-regional demand varies widely. Align regional logistics and localized campaigns to support the underperforming zone's portfolio.`
    };
  }, [metricsComparison, labelA, labelB, compareMode]);

  return (
    <div className="space-y-6 pb-12 text-white">
      {/* Dynamic Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <GitCompare size={20} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold">Analytics Exploration Suite</h2>
            <p className="text-xs text-slate-400">Drill into historical trends or initiate multi-dimensional baseline comparisons</p>
          </div>
        </div>

        {/* View togglers */}
        <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('standard')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all",
              activeTab === 'standard' ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-400 hover:text-white"
            )}
          >
            Standard Dashboard
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5",
              activeTab === 'compare' ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-slate-400 hover:text-white"
            )}
          >
            <GitCompare size={13} />
            Performance Compare Zone
          </button>
        </div>
      </div>

      {activeTab === 'standard' ? (
        <>
          {/* Top filter bar for standard view */}
          <div className="glass-card p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 min-w-[150px]">
                <Filter size={14} className="text-blue-400" />
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
                >
                  {regions.map(r => <option key={r} value={r} className="bg-slate-900">{r} Region</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 min-w-[150px]">
                <BarChart2 size={14} className="text-blue-400" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
                >
                  {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                </select>
              </div>

              <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setTimeUnit('monthly')}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all",
                    timeUnit === 'monthly' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTimeUnit('yearly')}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all",
                    timeUnit === 'yearly' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 w-full md:w-64">
              <Search size={14} className="text-slate-400" />
              <input 
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder-white/20"
              />
            </div>
          </div>

          {/* Primary Trend Chart */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Historical Revenue & Net Profit</h3>
                <p className="text-xs text-slate-400">Comparing margins and sales across designated time intervals</p>
              </div>
              <div className="flex gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Sales
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Profit
                </span>
              </div>
            </div>
            
            <div className="h-[380px] w-full">
              {timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => `$${formatNumber(val)}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      name="Sales"
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fill="url(#salesGrad)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      name="Profit"
                      stroke="#10b981" 
                      strokeWidth={3}
                      fill="url(#profitGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500 text-xs">No transaction points match filters.</div>
              )}
            </div>
          </div>

          {/* Segmented breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Seasonal Performance Bar Graph</h4>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSeriesData.slice(-8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => `$${Math.round(val / 1000)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <Bar dataKey="sales" fill="#3b82f6" name="Sales" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Historical Filter Summary</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-xs text-slate-400">Filtered Transactions</span>
                    <span className="text-xs font-bold text-white font-mono">{filteredData.length} entries</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-xs text-slate-400">Aggregate Revenue</span>
                    <span className="text-xs font-bold text-blue-400 font-mono">
                      {formatCurrency(filteredData.reduce((acc, curr) => acc + curr.sales, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-xs text-slate-400">Aggregate Net Profit</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {formatCurrency(filteredData.reduce((acc, curr) => acc + curr.profit, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-slate-400">Mean Profit Efficiency</span>
                    <span className="text-xs font-bold text-indigo-400 font-mono">
                      {((filteredData.reduce((acc, curr) => acc + curr.profit, 0) / (filteredData.reduce((acc, curr) => acc + curr.sales, 0) || 1)) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-4 leading-relaxed font-sans">
                Historical views allow deep inspection into regional vectors. Utilize top filter grids to prune context variables. Change timescale resolution for seasonal adjustments.
              </p>
            </div>
          </div>
        </>
      ) : (
        /* Performance Compare Zone */
        <div className="space-y-6">
          {/* Comparative Controls */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Layers size={13} className="text-blue-400" />
                  Define Comparative Scope
                </h3>
                <p className="text-xs text-slate-500">Pick dimensions to target side-by-side deviations</p>
              </div>

              {/* Mode Toggler (Region vs Time) */}
              <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-lg w-full lg:w-auto">
                <button
                  onClick={() => setCompareMode('region')}
                  className={cn(
                    "flex-1 lg:flex-none px-3 py-1 rounded text-xs font-semibold transition-all",
                    compareMode === 'region' ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  Region vs Region
                </button>
                <button
                  onClick={() => setCompareMode('time')}
                  className={cn(
                    "flex-1 lg:flex-none px-3 py-1 rounded text-xs font-semibold transition-all",
                    compareMode === 'time' ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                  )}
                >
                  Year over Year
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Vector A dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Vector A (Baseline)</label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  {compareMode === 'region' ? (
                    <>
                      <Globe size={13} className="text-blue-400" />
                      <select
                        value={regionA}
                        onChange={(e) => setRegionA(e.target.value)}
                        className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
                      >
                        {uniqueRegions.map(r => <option key={r} value={r} className="bg-slate-900">{r} Region</option>)}
                      </select>
                    </>
                  ) : (
                    <>
                      <Calendar size={13} className="text-blue-400" />
                      <select
                        value={yearA}
                        onChange={(e) => setYearA(Number(e.target.value))}
                        className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
                      >
                        {uniqueYears.map(yr => <option key={yr} value={yr} className="bg-slate-900">Year {yr}</option>)}
                      </select>
                    </>
                  )}
                </div>
              </div>

              {/* Vector B dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Vector B (Comparison)</label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  {compareMode === 'region' ? (
                    <>
                      <Globe size={13} className="text-purple-400" />
                      <select
                        value={regionB}
                        onChange={(e) => setRegionB(e.target.value)}
                        className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
                      >
                        {uniqueRegions.map(r => <option key={r} value={r} className="bg-slate-900">{r} Region</option>)}
                      </select>
                    </>
                  ) : (
                    <>
                      <Calendar size={13} className="text-purple-400" />
                      <select
                        value={yearB}
                        onChange={(e) => setYearB(Number(e.target.value))}
                        className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
                      >
                        {uniqueYears.map(yr => <option key={yr} value={yr} className="bg-slate-900">Year {yr}</option>)}
                      </select>
                    </>
                  )}
                </div>
              </div>

              {/* Corporate Category filtering */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Category Scope</label>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <BarChart2 size={13} className="text-blue-400" />
                  <select
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value)}
                    className="bg-transparent border-none text-xs text-white focus:outline-none w-full"
                  >
                    {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-3 glass-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                  <Activity size={14} className="text-blue-400 animate-pulse" />
                  Comparative Deviation Matrix
                </h3>
                
                <div className="space-y-4 font-sans">
                  {/* Revenue */}
                  <CompareStatRow 
                    label="Aggregate Sales"
                    valA={formatCurrency(metricsComparison.statsA.sales)}
                    valB={formatCurrency(metricsComparison.statsB.sales)}
                    diff={metricsComparison.varSales.diff}
                    pct={metricsComparison.varSales.pct}
                    symbol="$"
                  />

                  {/* Profit */}
                  <CompareStatRow 
                    label="Net Returns Profit"
                    valA={formatCurrency(metricsComparison.statsA.profit)}
                    valB={formatCurrency(metricsComparison.statsB.profit)}
                    diff={metricsComparison.varProfit.diff}
                    pct={metricsComparison.varProfit.pct}
                    symbol="$"
                  />

                  {/* Margins */}
                  <CompareStatRow 
                    label="Yield profit margin"
                    valA={formatPercent(metricsComparison.statsA.margin)}
                    valB={formatPercent(metricsComparison.statsB.margin)}
                    diff={metricsComparison.varMargin.diff}
                    pct={metricsComparison.varMargin.pct}
                    isMarginPoints={true}
                  />

                  {/* AOV */}
                  <CompareStatRow 
                    label="Average transaction order value"
                    valA={formatCurrency(metricsComparison.statsA.aov)}
                    valB={formatCurrency(metricsComparison.statsB.aov)}
                    diff={metricsComparison.varAov.diff}
                    pct={metricsComparison.varAov.pct}
                    symbol="$"
                  />

                  {/* Output Transaction volume */}
                  <CompareStatRow 
                    label="Billed transaction instances"
                    valA={formatNumber(metricsComparison.statsA.transactions)}
                    valB={formatNumber(metricsComparison.statsB.transactions)}
                    diff={metricsComparison.varVolume.diff}
                    pct={metricsComparison.varVolume.pct}
                  />
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-sans italic mt-6 border-t border-white/5 pt-3 flex items-center gap-1.5">
                <Info size={11} className="text-blue-400" />
                <span>All benchmarks are evaluated dynamically relative to Sector A baseline. Margin deviations are expressed in net percentage points.</span>
              </div>
            </div>

            {/* Smart Narratives and strategic feedback */}
            <div className="md:col-span-2 glass-card p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-yellow-400" />
                  Comparative Intelligence
                </h3>
                
                <div className="space-y-4 text-xs leading-relaxed text-slate-400">
                  <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono mb-1">Sector Revenue leader</p>
                    <p className="text-white font-semibold">{qualitativeAnalysis.salesStatement}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono mb-1">Margin Optimization</p>
                    <p className="text-white font-semibold">{qualitativeAnalysis.marginStatement}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono mb-1">Strategic recommendation</p>
                    <p className="text-slate-300">{qualitativeAnalysis.strategyTip}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 text-[9px] text-slate-500 font-mono">
                System calculation cycle online • Continuous inference applied.
              </div>
            </div>
          </div>

          {/* Graphical overlay visualizer */}
          <div className="glass-card p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Comparative Performance Trend Overlay</h3>
                <p className="text-xs text-slate-400">
                  {compareMode === 'region' 
                    ? `Chronological monthly trends comparison between ${labelA} and ${labelB}`
                    : `Direct month-over-month (Jan-Dec) seasonal overlay: Year ${yearA} vs Year ${yearB}`}
                </p>
              </div>

              <div className="flex gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  {labelA}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  {labelB}
                </span>
              </div>
            </div>

            <div className="h-[360px] w-full">
              {comparisonChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={comparisonChartData}>
                    <defs>
                      <linearGradient id="gradVectorA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gradVectorB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(val) => `$${formatNumber(val)}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="salesA" 
                      name={labelA}
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fill="url(#gradVectorA)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="salesB" 
                      name={labelB}
                      stroke="#a855f7" 
                      strokeWidth={3}
                      fill="url(#gradVectorB)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500 text-xs">No baseline comparative points could be compiled.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CompareRowProps {
  label: string;
  valA: string;
  valB: string;
  diff: number;
  pct: number;
  symbol?: string;
  isMarginPoints?: boolean;
}

function CompareStatRow({ label, valA, valB, diff, pct, symbol, isMarginPoints }: CompareRowProps) {
  const isPositive = diff >= 0;

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-bold">{label}</span>
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[9px] text-slate-500 font-sans block">A (Baseline)</span>
            <span className="text-sm font-semibold text-slate-300">{valA}</span>
          </div>
          <div className="h-6 w-px bg-white/5"></div>
          <div>
            <span className="text-[9px] text-slate-500 font-sans block">B (Compare)</span>
            <span className="text-sm font-semibold text-white">{valB}</span>
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
        <div className={cn(
          "px-2.5 py-1 rounded-lg text-xs font-bold font-mono border flex items-center gap-1",
          isPositive 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-red-400"
        )}>
          {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          <span>
            {isPositive ? '+' : ''}
            {isMarginPoints 
              ? `${diff.toFixed(1)} pp` 
              : `${pct.toFixed(2)}%`}
          </span>
        </div>
      </div>
    </div>
  );
}

