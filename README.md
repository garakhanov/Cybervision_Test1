
# 👁️ CyberVision SIEM
**Advanced AI-Powered Security Information and Event Management**

CyberVision SIEM is a modern security operations platform designed to bridge the gap between traditional rule-based log analysis (Wazuh) and next-generation AI intelligence (Google Gemini). It provides real-time visibility, automated threat hunting, and SOC L1 decision support.

---

## 🌟 Key Capabilities
- **🧠 Hybrid AI Analysis**: Gemini 1.5 Flash integrated both at the Edge (CentOS Agent) and Core (SIEM Dashboard).
- **🚀 Ultra-Fast Telemetry**: Optimized Python agents for low-latency log transmission from CentOS 9 environments.
- **🛡️ SOC L1 Copilot**: Automated recommendations and threat summaries for every detection.
- **📊 Professional Insights**: Interactive charts for severity distribution and asset monitoring.
- **💾 Browser Persistence**: Logs are stored locally using IndexedDB for zero-latency history browsing.

---

## 🛠️ CentOS 9 Installation Guide

### 1. Prerequisites
Ensure you have a running Wazuh agent/manager on your CentOS server and Python 3.9+ installed.

```bash
# Update system and install Python tools
sudo dnf update -y
sudo dnf install python3 python3-pip -y

# Install CyberVision dependencies
pip3 install -U google-generativeai requests
```

### 2. Deploy the Smart Agent
Create the agent script:
```bash
sudo nano /usr/local/bin/cv_agent.py
# Paste the source code from the "Integrations" tab in the dashboard.
```

Configure permissions:
```bash
sudo chmod +r /var/ossec/logs/alerts/alerts.json
sudo chmod +x /usr/local/bin/cv_agent.py
```

### 3. Setup as a Background Service
Create a systemd unit file to ensure the agent stays alive:
```bash
sudo nano /etc/systemd/system/cv-agent.service
```

Add the following configuration:
```ini
[Unit]
Description=CyberVision SIEM Smart Agent
After=network.target wazuh-manager.service

[Service]
ExecStart=/usr/bin/python3 /usr/local/bin/cv_agent.py
Restart=always
User=root

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cv-agent
sudo systemctl status cv-agent
```

---

## 🌐 Web Dashboard Setup
1. Clone this repository.
2. Run `npm install` to install frontend dependencies.
3. Start the UI using `npm start`.
4. Navigate to `Integrations` to copy your specialized agent script.

## 🤝 Contributing
CyberVision SIEM is open-source. Feel free to submit PRs for new log source integrations or AI prompt improvements.

---
*Developed for Cyber Security Operations and Advanced Threat Hunting.*
