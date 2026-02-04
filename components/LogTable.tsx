
import React from 'react';
import { WazuhLog, LogSeverity } from '../types';

const SeverityBadge: React.FC<{ severity: LogSeverity }> = ({ severity }) => {
  const styles = {
    [LogSeverity.LOW]: 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10',
    [LogSeverity.MEDIUM]: 'bg-cyan-500/5 text-cyan-500 border-cyan-500/10',
    [LogSeverity.HIGH]: 'bg-orange-500/5 text-orange-500 border-orange-500/10',
    [LogSeverity.CRITICAL]: 'bg-red-500/10 text-red-500 border-red-500/20 font-black',
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[9px] border font-bold uppercase tracking-wider ${styles[severity]}`}>
      {severity}
    </span>
  );
};

const LogTable: React.FC<{ logs: WazuhLog[] }> = ({ logs }) => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-slate-900/20">
        <h2 className="font-bold text-xl flex items-center gap-3 text-white">
          Incident Stream
          {logs.length > 0 && <span className="text-[9px] bg-cyan-500 text-black px-2 py-0.5 rounded font-black uppercase tracking-tighter">LIVE</span>}
        </h2>
        <div className="flex gap-2">
           <button className="text-[10px] font-black bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all text-slate-400 uppercase tracking-widest border border-white/5">Export CSV</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/50 text-slate-500 uppercase text-[9px] tracking-widest font-black">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Source Asset</th>
              <th className="px-6 py-4">Event Description & AI Insight</th>
              <th className="px-6 py-4">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center animate-pulse"><svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
                    <span className="text-slate-600 font-bold uppercase tracking-widest text-xs">Waiting for incoming telemetry...</span>
                  </div>
                </td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer group">
                <td className="px-6 py-4 text-slate-400 whitespace-nowrap text-xs font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-200 text-xs">{log.agentName}</div>
                  <div className="text-[9px] text-cyan-500 font-mono tracking-tight">{log.sourceIp}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-300 text-xs font-medium mb-1.5 line-clamp-1">{log.description}</div>
                  {log.ai_pre_analysis ? (
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3 bg-cyan-500 rounded-full"></div>
                      <span className="text-[10px] text-cyan-400 font-bold italic tracking-tight">AI: {log.ai_pre_analysis}</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-700 italic font-medium uppercase tracking-tighter">No edge analysis</div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <SeverityBadge severity={log.severity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogTable;
