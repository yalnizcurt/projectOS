/**
 * Seed Knowledge Utility
 * Preloads and runs the Ingestion Pipeline over the synthetic playbooks
 * so the ERP Developer Brain is instantly functional out-of-the-box.
 */

import { globalIngestionPipeline } from './IngestionPipeline.js';
import { globalKnowledgeStore } from './KnowledgeStore.js';

export const PLAYBOOK_FIXTURES = [
  {
    documentId: 'doc-sap-playbook',
    documentName: 'SAP S/4HANA Enterprise Integration Playbook v4.2',
    erp: 'SAP S/4HANA',
    version: '4.2',
    sourceType: 'PLAYBOOK',
    sourceUrl: 'mock://playbooks/sap-integration-v4.2.md',
    fetchUrl: '/mock-knowledge/sap/integration-playbook.md',
  },
  {
    documentId: 'doc-oracle-playbook',
    documentName: 'Oracle NetSuite Integration Playbook v3.0',
    erp: 'Oracle NetSuite',
    version: '3.0',
    sourceType: 'PLAYBOOK',
    sourceUrl: 'mock://playbooks/oracle-integration-v3.0.md',
    fetchUrl: '/mock-knowledge/oracle/integration-playbook.md',
  },
  {
    documentId: 'doc-dynamics-playbook',
    documentName: 'Microsoft Dynamics 365 F&O Integration Playbook v2.5',
    erp: 'Microsoft Dynamics 365 F&O',
    version: '2.5',
    sourceType: 'PLAYBOOK',
    sourceUrl: 'mock://playbooks/dynamics-integration-v2.5.md',
    fetchUrl: '/mock-knowledge/dynamics/integration-playbook.md',
  },
];

export async function seedKnowledgeCorpus(force = false, onProgress = null) {
  const existingDocs = globalKnowledgeStore.listDocuments();
  if (existingDocs.length > 0 && !force) {
    return {
      alreadySeeded: true,
      documentsCount: existingDocs.length,
      chunksCount: globalKnowledgeStore.chunks.length,
    };
  }

  if (force) {
    globalKnowledgeStore.clear();
  }

  const results = [];

async function readFixtureContent(localPath) {
  if (typeof window === 'undefined') {
    const fs = await import('fs');
    const path = await import('path');
    const fullPath = path.join(process.cwd(), 'public', localPath);
    return fs.readFileSync(fullPath, 'utf8');
  }
  const res = await fetch(localPath);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch ${localPath}`);
  return await res.text();
}

  for (const fixture of PLAYBOOK_FIXTURES) {
    try {
      const content = await readFixtureContent(fixture.fetchUrl);

      const summary = await globalIngestionPipeline.ingestPlaybook(
        {
          documentId: fixture.documentId,
          documentName: fixture.documentName,
          erp: fixture.erp,
          version: fixture.version,
          sourceType: fixture.sourceType,
          sourceUrl: fixture.sourceUrl,
          content,
        },
        {}, // Auth context
        onProgress
      );

      results.push(summary);
    } catch (err) {
      console.error(`Failed to ingest fixture ${fixture.documentName}:`, err);
    }
  }

  return {
    alreadySeeded: false,
    summaries: results,
    documentsCount: globalKnowledgeStore.listDocuments().length,
    chunksCount: globalKnowledgeStore.chunks.length,
  };
}
