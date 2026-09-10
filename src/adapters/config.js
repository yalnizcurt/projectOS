/**
 * Adapter and Integration Configuration
 * Controls whether the Control Tower runs in Laptop MVP Mode or Enterprise Mode.
 * Ref: PRD Section 46 & 50
 */

export const IntegrationConfig = {
  DATA_SOURCE: 'MOCK', // 'MOCK' | 'KATALYT' | 'COMPANY_BACKEND'
  JIRA_MODE: 'MOCK', // 'MOCK' | 'LIVE'
  KATALYT_MODE: 'DISABLED', // 'DISABLED' | 'LIVE'

  // Live Jira configuration placeholder (PRD Section 40: no credentials committed)
  JIRA_API_ENDPOINT: import.meta.env?.VITE_JIRA_API_ENDPOINT || '',
  KATALYT_API_ENDPOINT: import.meta.env?.VITE_KATALYT_API_ENDPOINT || '/genailabs',

  // Mock simulation parameters
  MOCK_NETWORK_LATENCY_MS: 400,
  AUTO_SYNC_INTERVAL_SEC: 60,
};
