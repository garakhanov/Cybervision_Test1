
import { WazuhLog, LogSeverity } from './types';

export const mockLogs: WazuhLog[] = [
  {
    id: '1',
    timestamp: '2023-10-27T10:15:30Z',
    agentName: 'Web-Server-01',
    ruleId: '5710',
    description: 'sshd: Attempt to login using a non-existent user',
    severity: LogSeverity.MEDIUM,
    sourceIp: '192.168.1.50',
    location: '/var/log/auth.log',
    fullLog: 'Oct 27 10:15:30 Web-Server-01 sshd[1234]: Invalid user admin from 192.168.1.50 port 45678'
  },
  {
    id: '2',
    timestamp: '2023-10-27T10:16:45Z',
    agentName: 'DB-Prod-Primary',
    ruleId: '1002',
    description: 'Unknown problem somewhere in the system.',
    severity: LogSeverity.LOW,
    sourceIp: '10.0.0.5',
    location: 'Wazuh-Manager',
    fullLog: 'Internal error in database sync'
  },
  {
    id: '3',
    timestamp: '2023-10-27T10:18:12Z',
    agentName: 'Workstation-HR-05',
    ruleId: '5501',
    description: 'Login session opened',
    severity: LogSeverity.LOW,
    sourceIp: '172.16.5.10',
    location: '/var/log/auth.log',
    fullLog: 'pam_unix(sshd:session): session opened for user hr_manager by (uid=0)'
  },
  {
    id: '4',
    timestamp: '2023-10-27T10:20:00Z',
    agentName: 'Web-Server-01',
    ruleId: '5712',
    description: 'sshd: brute force trying to get access to the system.',
    severity: LogSeverity.HIGH,
    sourceIp: '45.12.34.156',
    location: '/var/log/auth.log',
    fullLog: 'Oct 27 10:20:00 Web-Server-01 sshd[1234]: Failed password for root from 45.12.34.156 port 55432 ssh2'
  },
  {
    id: '5',
    timestamp: '2023-10-27T10:22:15Z',
    agentName: 'Firewall-Edge',
    ruleId: '87105',
    description: 'Large amount of data sent to an external IP',
    severity: LogSeverity.CRITICAL,
    sourceIp: '10.0.0.15',
    location: 'Cisco-ASA',
    fullLog: 'Connection initiated from 10.0.0.15 to 203.0.113.10 with 5GB data transfer'
  }
];
