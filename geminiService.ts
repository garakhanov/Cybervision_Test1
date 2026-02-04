
import { GoogleGenAI, Type } from "@google/genai";
import { WazuhLog, AIAnalysisResult } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLogsWithAI = async (logs: WazuhLog[]): Promise<AIAnalysisResult> => {
  const logContext = logs.map(l => 
    `[${l.timestamp}] Agent: ${l.agentName}, Rule: ${l.ruleId}, Desc: ${l.description}, Severity: ${l.severity}, Source: ${l.sourceIp}, Log: ${l.fullLog}`
  ).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Sən peşəkar SOC L1 Analitikisən. Aşağıdakı Wazuh loglarını analiz et və təhlükəsizlik insidentlərini aşkarla. 
    Cavabı yalnız göstərilən JSON formatında ver. 
    
    Loglar:
    ${logContext}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          threatLevel: { type: Type.STRING, description: 'Ümumi təhlükə səviyyəsi (low, medium, high, critical)' },
          summary: { type: Type.STRING, description: 'Analizin qısa xülasəsi' },
          detections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: 'Təhlükə növü' },
                description: { type: Type.STRING, description: 'Təfərrüat' },
                risk: { type: Type.STRING, description: 'Risk dərəcəsi' }
              },
              required: ['type', 'description', 'risk']
            }
          },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'SOC L1 üçün tövsiyələr'
          },
          isAnomalous: { type: Type.BOOLEAN, description: 'Anomaliya aşkarlanıb-aşkarlanmadığı' }
        },
        required: ['threatLevel', 'summary', 'detections', 'recommendations', 'isAnomalous']
      }
    }
  });

  try {
    const result = JSON.parse(response.text || '{}');
    return result as AIAnalysisResult;
  } catch (error) {
    console.error("AI Analysis Parse Error:", error);
    throw new Error("Süni intellekt cavabı emal edilə bilmədi.");
  }
};
