/**
 * Katalyt Integration Adapter (Stub / Contract)
 * Connects ERP Delivery Control Tower to the Katalyt enterprise ecosystem.
 * Ref: PRD Section 41, 42, 43 & 44
 *
 * Reusable Katalyt data:
 * - Clients/Customers (/clients/)
 * - Authenticated User Context (/login, JWT sessions)
 * - Consulting Sessions (/consulting/sessions/)
 * - Knowledge Bases & Playbooks (/knowledge-bases/)
 */

import { IntegrationConfig } from './config';

export class KatalytAdapter {
  constructor() {
    this.baseUrl = IntegrationConfig.KATALYT_API_ENDPOINT;
    this.isEnabled = IntegrationConfig.KATALYT_MODE === 'LIVE';
  }

  /**
   * Fetch clients from Katalyt's `/clients/` endpoint
   */
  async getClients() {
    if (!this.isEnabled) {
      // In MVP mode, returns stubbed resolution
      return Promise.resolve({
        source: 'KATALYT_STUB',
        message: 'Katalyt integration disabled in MVP mode. Running on synthetic data layer.',
        clients: [],
      });
    }

    try {
      const response = await fetch(`${this.baseUrl}/clients/`);
      return await response.json();
    } catch (err) {
      console.warn('KatalytAdapter: failed to connect to Katalyt backend', err);
      throw err;
    }
  }

  /**
   * Contextual access to ERP Developer Brain (PRD Section 32)
   */
  getDeveloperBrainUrl(projectId, erpName) {
    return `${this.baseUrl}/cortex/?project=${encodeURIComponent(projectId)}&erp=${encodeURIComponent(erpName)}`;
  }
}

export const katalytAdapter = new KatalytAdapter();
