
import React, { useState, useEffect, useMemo } from 'react';
import { WazuhLog, LogSeverity, AIAnalysisResult, DashboardStats as IStats, ViewState } from './types';
import { mockLogs } from './mockData';
import { analyzeLogsWithAI } from './geminiService';
import { saveLogs, getAllLogs, saveAnalysis, getLatestAnalysis, clearDatabase, StoredAnalysis } from './db';
import LogTable from './components/LogTable';
import AIAnalysisPanel from './components/AIAnalysisPanel';
import DashboardStats from './components/DashboardStats';
import IntegrationView from './components/IntegrationView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [logs, setLogs] = useState<WazuhLog[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'syncing' | 'error'>('connected');

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedLogs = await getAllLogs();
        if (storedLogs.length > 0) {
          setLogs(storedLogs);
        } else {
          setLogs(mockLogs);
          await saveLogs(mockLogs);
        }
        
        const latestAna = await getLatestAnalysis();
        if (latestAna) {
          setAnalysisResult(latestAna);
        }
      } catch (e) {
        setDbStatus('error');
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let interval: number;
    if (isLiveMode) {
      interval = window.setInterval(async () => {
        setDbStatus('syncing');
        const isCritical = Math.random() > 0.85;
        const newLog: WazuhLog = {
          id: 'cv-' + Date.now(),
          timestamp: new Date().toISOString(),
          agentName: 'CentOS-Wazuh-01',
          ruleId: (Math.floor(Math.random() * 90000) + 10000).toString(),
          description: isCritical ? 'Suspicious file modification in /etc/passwd' : 'Periodic integrity check finished',
          severity: isCritical ? LogSeverity.CRITICAL : LogSeverity.LOW,
          sourceIp: '10.20.30.' + Math.floor(Math.random() * 255),
          location: '/var/ossec/logs/alerts/alerts.json',
          fullLog: 'CyberVision Agent captured real-time system event',
          ai_pre_analysis: isCritical ? "Təhlükəli sistem dəyişikliyi! Şifrə faylına müdaxilə aşkarlanıb." : "Sistem təmizdir.",
          source: 'wazuh-hook'
        };
        
        setLogs(prev => [newLog, ...prev].slice(0, 100));
        
        try {
          await saveLogs([newLog]);
          setDbStatus('connected');
        } catch (e) {
          setDbStatus('error');
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isLiveMode]);

  const stats = useMemo<IStats>(() => {
    const total = logs.length;
    const critical = logs.filter(l => l.severity === LogSeverity.CRITICAL).length;
    const agents = new Set(logs.map(l => l.agentName)).size;
    const severityCount: Record<string, number> = {};
    logs.forEach(l => {
      severityCount[l.severity] = (severityCount[l.severity] || 0) + 1;
    });
    const alertsBySeverity = Object.entries(severityCount).map(([name, value]) => ({ name, value }));
    return { totalLogs: total, criticalAlerts: critical, uniqueAgents: agents, alertsBySeverity };
  }, [logs]);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const logsToAnalyze = logs.slice(0, 20);
      const result = await analyzeLogsWithAI(logsToAnalyze);
      const storedAnalysis: StoredAnalysis = {
        ...result,
        id: 'cv-ana-' + Date.now(),
        timestamp: new Date().toISOString()
      };
      setAnalysisResult(result);
      await saveAnalysis(storedAnalysis);
    } catch (err: any) {
      setError(err.message || "Xəta baş verdi");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </div>
            <div>
              <h1 className="font-extrabold text-2xl tracking-tighter text-white">CyberVision <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 font-black">SIEM</span></h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-cyan-500/80 font-bold tracking-[0.2em] uppercase">Enterprise SOC Intelligence</span>
                <span className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'connected' ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-red-500 animate-pulse'}`}></span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-8 text-sm font-bold tracking-tight">
              <button onClick={() => setCurrentView('dashboard')} className={`${currentView === 'dashboard' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-white'} py-7 transition-all duration-300`}>DASHBOARD</button>
              <button onClick={() => setCurrentView('integrations')} className={`${currentView === 'integrations' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500 hover:text-white'} py-7 transition-all duration-300`}>INTEGRATIONS</button>
            </div>
            <button onClick={() => setIsLiveMode(!isLiveMode)} className={`flex items-center gap-3 px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-500 hover:scale-105 active:scale-95 ${isLiveMode ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 glow-cyan' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>
              <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-cyan-400 animate-ping' : 'bg-slate-700'}`}></div>
              {isLiveMode ? 'LIVE AGENT ACTIVE' : 'ACTIVATE AGENT'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-8">
        {currentView === 'dashboard' ? (
          <>
            <div className="mb-10 flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter">Security Operations</h2>
                <p className="text-slate-400 mt-2 font-medium">Real-time log analysis and AI-driven threat intelligence.</p>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => clearDatabase().then(() => window.location.reload())} className="text-[10px] font-bold text-slate-600 hover:text-red-500 transition-colors uppercase tracking-widest px-4 py-2 border border-slate-800 rounded-lg hover:border-red-900/30">System Reset</button>
              </div>
            </div>

            {error && (
              <div className="mb-8 bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-4 animate-in slide-in-from-top duration-500">
                 <div className="bg-red-500/20 p-2 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z"></path></svg></div>
                 {error}
              </div>
            )}

            <DashboardStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
              <div className="lg:col-span-8">
                <LogTable logs={logs} />
              </div>

              <div className="lg:col-span-4 h-full">
                <AIAnalysisPanel result={analysisResult} isLoading={isAnalyzing} onAnalyze={handleAIAnalysis} />
              </div>
            </div>
          </>
        ) : (
          <IntegrationView />
        )}
      </main>
    </div>
  );
};

export default App;
