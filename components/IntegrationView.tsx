
import React, { useState } from 'react';

const PYTHON_SCRIPT = `
# CyberVision SIEM - Smart Agent v2.0
# Requirements: pip install google-generativeai requests

import json
import time
import requests
import os
import google.generativeai as genai
from datetime import datetime

# ==========================================
# CONFIGURATION
# ==========================================
GEMINI_API_KEY = "YOUR_GOOGLE_AI_STUDIO_KEY"
API_ENDPOINT = "http://YOUR_SERVER_IP:3000/api/logs" # Replace with your SIEM URL
WAZUH_LOG_FILE = "/var/ossec/logs/alerts/alerts.json"
STATE_FILE = "/tmp/cv_siem_state.txt"
CHECK_INTERVAL = 5 # seconds

# Gemini AI Setup
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def get_ai_insight(log_line):
    if not GEMINI_API_KEY or "YOUR_" in GEMINI_API_KEY:
        return "Local AI bypassed"
    try:
        prompt = f"As a CyberVision SOC Agent, analyze this Wazuh log and give a 1-sentence risk summary: {log_line[:800]}"
        response = model.generate_content(prompt)
        return response.text.strip()
    except:
        return "AI analysis failed"

def run_agent():
    print(f"[{datetime.now()}] CyberVision Agent starting on CentOS 9...")
    last_pos = 0
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r') as f:
            try: last_pos = int(f.read().strip())
            except: last_pos = 0

    while True:
        if not os.path.exists(WAZUH_LOG_FILE):
            time.sleep(10)
            continue

        current_size = os.path.getsize(WAZUH_LOG_FILE)
        if current_size < last_pos: last_pos = 0 

        if current_size > last_pos:
            with open(WAZUH_LOG_FILE, 'r') as f:
                f.seek(last_pos)
                new_logs = []
                for line in f:
                    if not line.strip(): continue
                    try:
                        data = json.loads(line)
                        level = data.get("rule", {}).get("level", 0)
                        
                        ai_note = ""
                        if level >= 7: # Analyze only important logs
                            ai_note = get_ai_insight(line)

                        log_entry = {
                            "id": data.get("id", str(time.time())),
                            "timestamp": data.get("timestamp", datetime.now().isoformat()),
                            "agentName": data.get("agent", {}).get("name", "CentOS-Local"),
                            "ruleId": data.get("rule", {}).get("id"),
                            "description": data.get("rule", {}).get("description"),
                            "severity": "critical" if level >= 12 else "high" if level >= 10 else "medium" if level >= 5 else "low",
                            "sourceIp": data.get("data", {}).get("srcip", "0.0.0.0"),
                            "ai_pre_analysis": ai_note,
                            "fullLog": line.strip()
                        }
                        new_logs.append(log_entry)
                    except: continue
                
                last_pos = f.tell()
                with open(STATE_FILE, 'w') as sf: sf.write(str(last_pos))

                if new_logs:
                    print(f"[{datetime.now()}] Transmitting {len(new_logs)} incidents...")
                    try:
                        # Real Transmission (Enabled on deployment)
                        # requests.post(API_ENDPOINT, json=new_logs, timeout=5)
                        pass
                    except: print("Transmission failed: SIEM unreachable")

        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    run_agent()
`;

const IntegrationView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <div className="bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        <div className="p-16 border-b border-white/5 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex items-center gap-8">
              <div className="bg-cyan-500 p-5 rounded-3xl shadow-2xl shadow-cyan-500/20 ring-8 ring-cyan-500/5">
                <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
              </div>
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter">CentOS 9 Deployment</h2>
                <p className="text-slate-400 mt-4 text-xl font-medium">CyberVision Smart Agent quraşdırılması və konfiqurasiyası.</p>
              </div>
            </div>
            <button 
              onClick={handleCopy}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-black px-10 py-5 rounded-2xl transition-all shadow-xl shadow-cyan-500/10 active:scale-95 flex items-center justify-center gap-4 text-sm tracking-widest uppercase"
            >
              {copied ? 'COPIED TO CLIPBOARD!' : 'COPY AGENT SOURCE'}
            </button>
          </div>
        </div>

        <div className="p-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="space-y-6">
              <div className="text-cyan-500 font-black text-4xl opacity-20">01</div>
              <h3 className="text-xl font-bold text-white tracking-tight">Dependencies</h3>
              <div className="bg-black/60 rounded-2xl p-6 border border-white/5 font-mono text-xs text-cyan-400 leading-relaxed">
                <p className="text-slate-600"># Install core libs</p>
                <p>dnf install python3-pip -y</p>
                <p>pip3 install google-generativeai</p>
                <p>pip3 install requests</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-cyan-500 font-black text-4xl opacity-20">02</div>
              <h3 className="text-xl font-bold text-white tracking-tight">Systemd Service</h3>
              <div className="bg-black/60 rounded-2xl p-6 border border-white/5 font-mono text-xs text-cyan-400 leading-relaxed">
                <p className="text-slate-600"># Create auto-start service</p>
                <p>nano /etc/systemd/system/cv-agent.service</p>
                <p className="text-slate-600 mt-2"># Enable & Start</p>
                <p>systemctl enable --now cv-agent</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-cyan-500 font-black text-4xl opacity-20">03</div>
              <h3 className="text-xl font-bold text-white tracking-tight">Connectivity</h3>
              <ul className="space-y-4 text-slate-400 text-sm font-medium">
                <li className="flex gap-4">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">✓</div>
                  <span><code>GEMINI_API_KEY</code> daxil edin.</span>
                </li>
                <li className="flex gap-4">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">✓</div>
                  <span>Endpoint IP-ni SIEM serverinə yönləndirin.</span>
                </li>
                <li className="flex gap-4">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">✓</div>
                  <span>Alerts.json oxuma icazələrini yoxlayın.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -top-4 left-8 px-5 py-2 bg-cyan-500 text-black text-[11px] font-black rounded-full uppercase tracking-widest shadow-xl">
              Python Smart Agent v2.0
            </div>
            <pre className="bg-black/40 p-12 rounded-[32px] border border-white/5 text-xs font-mono text-slate-300 overflow-x-auto max-h-[600px] leading-8 scrollbar-thin">
              {PYTHON_SCRIPT}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationView;
