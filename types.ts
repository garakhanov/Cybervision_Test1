
export enum LogSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface WazuhLog {
  id: string;
  timestamp: string;
  agentName: string;
  ruleId: string;
  description: string;
  severity: LogSeverity;
  sourceIp: string;
  location: string;
  fullLog: string;
  ai_pre_analysis?: string; // Agent tərəfindən gələn ilkin AI analizi
  source?: 'mock' | 'wazuh-hook';
}

export interface AIAnalysisResult {
  threatLevel: LogSeverity;
  summary: string;
  detections: {
    type: string;
    description: string;
    risk: string;
  }[];
  recommendations: string[];
  isAnomalous: boolean;
}

export interface DashboardStats {
  totalLogs: number;
  criticalAlerts: number;
  uniqueAgents: number;
  alertsBySeverity: { name: string; value: number }[];
}

export type ViewState = 'dashboard' | 'integrations';
