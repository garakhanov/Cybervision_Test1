
import React from 'react';
import { AIAnalysisResult, LogSeverity } from '../types';

interface AIAnalysisPanelProps {
  result: AIAnalysisResult | null;
  isLoading: boolean;
  onAnalyze: () => void;
}

const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ result, isLoading, onAnalyze }) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl h-full flex flex-col">
      <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-indigo-900/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <h2 className="font-semibold text-lg">AI SOC L1 Analiz</h2>
        </div>
        <button 
          onClick={onAnalyze}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analiz edilir...
            </>
          ) : 'Analiz Et'}
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {!result && !isLoading && (
          <div className="text-center py-12">
            <div className="bg-slate-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 className="text-slate-300 font-medium">SOC Analizi üçün hazırdır</h3>
            <p className="text-slate-500 text-sm mt-2">Logları süni intellekt ilə skan etmək üçün "Analiz Et" düyməsini sıxın.</p>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <section>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  result.threatLevel === LogSeverity.CRITICAL ? 'bg-red-500 text-white' :
                  result.threatLevel === LogSeverity.HIGH ? 'bg-orange-500 text-white' :
                  'bg-indigo-500 text-white'
                }`}>
                  TƏHLÜKƏ: {result.threatLevel.toUpperCase()}
                </span>
                {result.isAnomalous && (
                  <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-1 rounded text-[10px] uppercase font-bold">
                    Anomaliya
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{result.summary}</p>
            </section>

            <section>
              <h3 className="text-slate-100 text-sm font-bold uppercase tracking-wider mb-3">Aşkarlamalar</h3>
              <div className="space-y-3">
                {result.detections.map((det, i) => (
                  <div key={i} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                    <div className="flex justify-between items-start">
                      <h4 className="text-indigo-400 text-sm font-semibold">{det.type}</h4>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{det.risk} Risk</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">{det.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-slate-100 text-sm font-bold uppercase tracking-wider mb-3">Tövsiyələr</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-400">
                    <span className="text-indigo-500">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisPanel;
