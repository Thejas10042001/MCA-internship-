/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  LayoutDashboard, 
  FileUp, 
  Settings as SettingsIcon, 
  Search,
  Bell,
  Menu,
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DataUpload } from './components/DataUpload';
import { Forecasting } from './components/Forecasting';
import { Analytics } from './components/Analytics';
import { MLModels } from './components/MLModels';
import { XAI } from './components/XAI';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { SalesData } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'upload' | 'analytics' | 'models' | 'forecast' | 'xai' | 'reports' | 'settings'
  >('upload');
  const [data, setData] = useState<SalesData[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleDataLoaded = (newData: SalesData[]) => {
    setData(newData);
    setActiveTab('dashboard');
  };

  const DataPlaceholder = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
        <FileUp size={28} className="text-blue-400" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">Ingest Dataset Prior to Analysis</h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          NeuroForecast requires a valid transaction log dataset to compile ML weights, calculate SHAP vectors, and plot forecasts.
        </p>
      </div>
      <button
        onClick={() => {
          // Trigger sample load
          const regionsList = ['East', 'West', 'Central', 'South'];
          const segmentsList = ['Consumer', 'Corporate', 'Home Office'];
          const categoryList = ['Technology', 'Office Supplies', 'Furniture'];
          const subCategoryMap: Record<string, string[]> = {
            'Technology': ['Phones', 'Copiers', 'Machines', 'Accessories'],
            'Office Supplies': ['Paper', 'Binders', 'Art', 'Appliances', 'Fasteners'],
            'Furniture': ['Chairs', 'Tables', 'Bookcases', 'Furnishings']
          };

          const sample = Array.from({ length: 180 }).map((_, i) => {
            const year = 2023 + Math.floor(i / 60);
            const month = Math.floor((i % 60) / 5);
            const day = (i % 28) + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            const cat = categoryList[i % 3];
            const subCats = subCategoryMap[cat];
            const subCat = subCats[i % subCats.length];
            
            const reg = regionsList[i % 4];
            const seg = segmentsList[i % 3];
            
            const salesVal = 120 + Math.random() * 880 + (cat === 'Technology' ? 400 : 0);
            const discVal = Math.random() > 0.7 ? Math.random() * 0.15 : 0;
            const profitVal = salesVal * (0.25 + Math.random() * 0.1) - (discVal * salesVal * 0.5);

            return {
              orderId: `CA-${year}-${1000 + i}`,
              orderDate: dateStr,
              shipDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(Math.min(day + 3, 28)).padStart(2, '0')}`,
              shipMode: i % 2 === 0 ? 'Standard Class' : 'Second Class',
              customerId: `US-${10000 + i}`,
              customerName: `Acme Corp Unit ${i}`,
              segment: seg,
              country: 'United States',
              city: 'New York',
              state: 'New York',
              postalCode: '10001',
              region: reg,
              productId: `OFF-LA-${10000000 + i}`,
              category: cat,
              subCategory: subCat,
              productName: `${cat} Solution Pack ${i}`,
              sales: salesVal,
              quantity: Math.floor(Math.random() * 8) + 1,
              discount: discVal,
              profit: profitVal,
            };
          });
          handleDataLoaded(sample as any);
        }}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        Load Premium Sample Data
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-white">
      {/* Sidebar - Desktop */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab as any} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-slate-950/20 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors md:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold uppercase tracking-wider font-sans">
              NeuroForecast <span className="text-blue-500 ml-1">AI</span>
              <span className="text-slate-500 text-xs font-mono ml-4 font-normal tracking-normal lowercase">/ {activeTab}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="px-2.5 py-1 text-[9px] font-mono border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 rounded-full uppercase tracking-wider font-bold">
              K-CV State: Optimizing
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs accent-glow cursor-pointer">
              NF
            </div>
          </div>
        </header>

        {/* Dynamic View */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-7xl mx-auto h-full"
            >
              {activeTab === 'upload' && <DataUpload onDataLoaded={handleDataLoaded} />}
              {activeTab === 'settings' && <Settings />}
              {activeTab !== 'upload' && activeTab !== 'settings' && data.length === 0 ? (
                <DataPlaceholder />
              ) : (
                <>
                  {activeTab === 'dashboard' && <Dashboard data={data} />}
                  {activeTab === 'analytics' && <Analytics data={data} />}
                  {activeTab === 'models' && <MLModels />}
                  {activeTab === 'forecast' && <Forecasting data={data} />}
                  {activeTab === 'xai' && <XAI />}
                  {activeTab === 'reports' && <Reports data={data} />}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

