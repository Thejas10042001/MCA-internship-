import React from 'react';
import { 
  LayoutDashboard, 
  FileUp, 
  TrendingUp, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  BarChart2,
  Cpu,
  Brain,
  Download
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Data Source', icon: FileUp },
    { id: 'analytics', label: 'Data Analytics', icon: BarChart2 },
    { id: 'models', label: 'ML Models', icon: Cpu },
    { id: 'forecast', label: 'Forecasting', icon: TrendingUp },
    { id: 'xai', label: 'Explainable AI', icon: Brain },
    { id: 'reports', label: 'Reports', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={cn(
      "h-full border-r border-white/5 transition-all duration-300 relative z-40 flex flex-col glass",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Brand */}
      <div className="h-16 flex items-center px-4 gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <BrainCircuit size={18} className="text-white" />
        </div>
        {isOpen && (
          <span className="font-bold text-base tracking-tight font-sans whitespace-nowrap">
            NeuroForecast <span className="text-blue-500">AI</span>
          </span>
        )}
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-20 -right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border border-white/20 hover:bg-blue-500 transition-colors z-50 shadow-lg"
      >
        {isOpen ? <ChevronLeft size={14} className="text-white" /> : <ChevronRight size={14} className="text-white" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 mt-8 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all group border text-left",
                isActive 
                  ? "bg-blue-600/10 text-blue-400 border-blue-500/20" 
                  : "text-slate-400 border-transparent hover:bg-white/5"
              )}
            >
              <Icon size={18} className={cn(
                "shrink-0 transition-transform group-hover:scale-110",
                isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"
              )} />
              {isOpen && (
                <span className="text-xs font-semibold whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-4">
        {isOpen && (
          <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
             <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1">Active Model</p>
             <p className="text-xs text-blue-400 font-semibold">XGBoost Ensemble</p>
          </div>
        )}
        <div className="flex items-center gap-2 px-2">
          <div className="status-dot bg-emerald-500 w-1.5 h-1.5 rounded-full"></div>
          {isOpen && <span className="text-[10px] text-slate-400">Inference Engine Active</span>}
        </div>
      </div>
    </aside>
  );
}

