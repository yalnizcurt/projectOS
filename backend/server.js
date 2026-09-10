/**
 * ERP Delivery & Capacity Control Tower - Backend API Server
 * Deployed to Render (render.yaml).
 *
 * Provides REST endpoints for:
 * 1. Health checks (/api/health)
 * 2. ERP Developer Brain RAG queries with Groq LLM (/api/knowledge/query)
 * 3. Document catalog and metadata (/api/knowledge/documents)
 * 4. Knowledge base statistics (/api/knowledge/stats)
 * 5. Dynamic playbook ingestion (/api/knowledge/ingest)
 * 6. Deterministic Part 1 Delivery RAG calculations (/api/delivery/calculate)
 * 7. Jira connection and sync status (/api/jira/status)
 */

import express from 'express';
import cors from 'cors';
import { globalRetrievalPipeline } from '../src/knowledge/RetrievalPipeline.js';
import { globalKnowledgeStore } from '../src/knowledge/KnowledgeStore.js';
import { globalIngestionPipeline } from '../src/knowledge/IngestionPipeline.js';
import { seedKnowledgeCorpus } from '../src/knowledge/SeedKnowledge.js';
import { DeliveryRiskEngine } from '../src/services/DeliveryRiskEngine.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// 1. Health Check (for Render health check endpoint)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'erp-control-tower-backend',
    version: '2.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    knowledge: {
      documents: globalKnowledgeStore.listDocuments().length,
      chunks: globalKnowledgeStore.chunks.length,
    },
  });
});

// 2. Knowledge Base Query Endpoint (ERP Developer Brain RAG)
app.post('/api/knowledge/query', async (req, res) => {
  try {
    const { question, context = {}, searchOptions = {} } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Field "question" is required.' });
    }

    const result = await globalRetrievalPipeline.query(question, context, searchOptions);
    res.json(result);
  } catch (err) {
    console.error('Error in /api/knowledge/query:', err);
    res.status(500).json({ error: err.message || 'Internal server error during RAG query' });
  }
});

// 3. Document Catalog Endpoint
app.get('/api/knowledge/documents', (req, res) => {
  try {
    const { erp, status } = req.query;
    const docs = globalKnowledgeStore.listDocuments({ erp, status });
    res.json({
      total: docs.length,
      documents: docs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Knowledge Stats Endpoint
app.get('/api/knowledge/stats', (req, res) => {
  try {
    res.json({
      documentsCount: globalKnowledgeStore.listDocuments().length,
      chunksCount: globalKnowledgeStore.chunks.length,
      erps: ['SAP S/4HANA', 'Oracle NetSuite', 'Microsoft Dynamics 365 F&O'],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Ingestion Endpoint
app.post('/api/knowledge/ingest', async (req, res) => {
  try {
    const { documentId, documentName, erp, version, sourceType, sourceUrl, content, authContext } = req.body;
    if (!documentName || !erp || !content) {
      return res.status(400).json({ error: 'documentName, erp, and content are required' });
    }

    const summary = await globalIngestionPipeline.ingestPlaybook(
      {
        documentId: documentId || `doc-custom-${Date.now()}`,
        documentName,
        erp,
        version: version || '1.0',
        sourceType: sourceType || 'PLAYBOOK',
        sourceUrl: sourceUrl || 'mock://custom-upload',
        content,
      },
      authContext || {}
    );

    res.json({
      success: true,
      summary,
    });
  } catch (err) {
    console.error('Ingestion error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Delivery RAG Calculation (Part 1 Deterministic Delivery Status)
app.post('/api/delivery/calculate', (req, res) => {
  try {
    const { project, tasks = [], developerCapacity = {} } = req.body;
    if (!project) {
      return res.status(400).json({ error: 'project payload is required' });
    }

    const risk = DeliveryRiskEngine.calculateProjectRisk(project, tasks, developerCapacity);
    res.json(risk);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Jira Status Endpoint
app.get('/api/jira/status', (req, res) => {
  res.json({
    connected: true,
    host: 'jira.controltower.corp',
    syncMode: 'bidirectional-mock',
    lastSync: new Date().toISOString(),
    fieldOwnership: {
      Jira: ['Issue Status', 'Assigned Developer', 'Remaining Hours'],
      ControlTower: ['Customer Commit Date', 'Baseline Days (X)', 'Delta Days (ΔX)', 'Delivery RAG Status'],
    },
  });
});

// Initialize and auto-seed knowledge corpus on startup
async function startServer() {
  try {
    console.log('[Backend] Seeding knowledge corpus...');
    await seedKnowledgeCorpus(false);
    console.log(`[Backend] Knowledge corpus seeded (${globalKnowledgeStore.chunks.length} chunks).`);
  } catch (err) {
    console.warn('[Backend] Non-critical warning during seed:', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Backend] ERP Delivery Control Tower API server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
