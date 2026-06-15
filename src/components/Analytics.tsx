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
import { cn, formatCurrency, formatNumber } from '../lib/utils';
import { Search, Filter, Calendar, BarChart2, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsProps {
  data: SalesData[];
}

export function Analytics({ data }: AnalyticsProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [timeUnit, setTimeUnit] = useState<'monthly' | 'yearly'>('monthly');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract filters
  const regions = useMemo(() => ['All', ...Array.from(new Set(data.map(d => d.region)))], [data]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(data.map(d => d.category)))], [data]);

  // Handle filtering
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

  // Aggregate time series
  const timeSeriesData = useMemo(() => {
    const map: Record<string, { name: string; sales: number; profit: number }> = {};
    
    filteredData.forEach(d => {
      // Parse orderDate robustly
      const date = new Date(d.orderDate);
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

  // Grid / Tab arrangement
  return (
    <div className="space-y-6 pb-12">
      {/* Top filter bar */}
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
            <div className="flex h-full items-center justify-center text-slate-500 text-sm">No transaction points match filters.</div>
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
                <span className="text-sm text-slate-400">Filtered Transactions</span>
                <span className="text-sm font-bold text-white font-mono">{filteredData.length} entries</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-slate-400">Aggregate Revenue</span>
                <span className="text-sm font-bold text-blue-400 font-mono">
                  {formatCurrency(filteredData.reduce((acc, curr) => acc + curr.sales, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-slate-400">Aggregate Net Profit</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {formatCurrency(filteredData.reduce((acc, curr) => acc + curr.profit, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-400">Mean Profit Efficiency</span>
                <span className="text-sm font-bold text-indigo-400 font-mono">
                  {((filteredData.reduce((acc, curr) => acc + curr.profit, 0) / (filteredData.reduce((acc, curr) => acc + curr.sales, 0) || 1)) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
            Historical views allow deep inspection into regional vectors. Utilize top filter grids to prune context variables. Change timescale resolution for seasonal adjustments.
          </p>
        </div>
      </div>
    </div>
  );
}
