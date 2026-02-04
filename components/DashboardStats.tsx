
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { DashboardStats as IStats } from '../types';

const COLORS = {
  low: '#06b6d4',
  medium: '#0ea5e9',
  high: '#f97316',
  critical: '#ef4444'
};

const DashboardStats: React.FC<{ stats: IStats }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-xl">
        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Incidents</h3>
        <p className="text-4xl font-black text-white mt-2 tracking-tighter">{stats.totalLogs}</p>
        <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500" style={{ width: '70%' }}></div>
        </div>
      </div>
      
      <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-xl">
        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-red-500/80">Critical Alerts</h3>
        <p className="text-4xl font-black text-red-500 mt-2 tracking-tighter">{stats.criticalAlerts}</p>
        <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-red-500" style={{ width: `${(stats.criticalAlerts / (stats.totalLogs || 1)) * 100}%` }}></div>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-xl">
        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Monitored Assets</h3>
        <p className="text-4xl font-black text-blue-400 mt-2 tracking-tighter">{stats.uniqueAgents}</p>
        <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">Healthy Connection</p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-xl flex items-center justify-between">
        <div>
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Severity Mix</h3>
          <p className="text-xs font-bold text-slate-400 mt-2">Global distribution</p>
        </div>
        <div className="h-20 w-20">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.alertsBySeverity}
                innerRadius={18}
                outerRadius={35}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {stats.alertsBySeverity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || '#1e293b'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
