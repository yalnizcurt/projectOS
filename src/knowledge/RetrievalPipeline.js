/**
 * RAG Retrieval Pipeline Orchestrator
 * Complies with statement2 §3, §15, §20, §21, §22, §23, §24, §25, §33, §39.
 *
 * Separation of Concerns Notice (statement2 §3):
 * NEVER use this pipeline to compute project delivery status.
 * Delivery RAG (Part 1) and Knowledge RAG (Part 2) are completely independent subsystems.
 */

import { ContextBuilder } from './ContextBuilder.js';
import { globalKnowledgeStore } from './KnowledgeStore.js';
import { MockLLMProvider, GeminiLLMProvider, GroqLLMProvider } from './LLMProvider.js';

export class RetrievalPipeline {
  constructor(options = {}) {
    this.store = options.store || globalKnowledgeStore;
    const provider =
      (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_LLM_PROVIDER : '') ||
      (typeof process !== 'undefined' ? process.env?.VITE_LLM_PROVIDER : '') ||
      'groq';
    if (provider === 'groq') {
      this.llmProvider = options.llmProvider || new GroqLLMProvider();
    } else if (provider === 'gemini') {
      this.llmProvider = options.llmProvider || new GeminiLLMProvider();
    } else {
      this.llmProvider = options.llmProvider || new MockLLMProvider();
    }
    this.queryLogs = []; // Observability log (statement2 §39)
  }

  /**
   * Execute full RAG retrieval and answer generation
   * @param {string} userQuestion
   * @param {Object} contextParams - { erp, customer, project, jiraTask, developer, conversationHistory }
   * @param {Object} searchOptions - { maxResults, minScore }
   * @returns {Promise<Object>} Full response payload including answer, citations, evidence, observability
   */
  async query(userQuestion, contextParams = {}, searchOptions = {}) {
    const startTime = Date.now();

    // 0. Remote Backend Delegation (Render Backend Support)
    const backendUrl = typeof window !== 'undefined' ? import.meta.env?.VITE_BACKEND_URL : null;
    if (backendUrl) {
      try {
        const resp = await fetch(`${backendUrl}/api/knowledge/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: userQuestion,
            context: contextParams,
            searchOptions,
          }),
        });
        if (resp.ok) {
          const backendData = await resp.json();
          this.recordObservability(backendData);
          return backendData;
        }
      } catch (err) {
        console.warn('Remote backend query failed, falling back to local pipeline:', err);
      }
    }

    // 1. Context Builder (statement2 §34)
    const contextPayload = ContextBuilder.build(contextParams);

    // 2. Query Processing & ERP Filters (statement2 §15: ERP-Aware Retrieval)
    const searchFilters = {
      erp: contextPayload.erp,
      maxResults: searchOptions.maxResults || 5,
      minScore: searchOptions.minScore || 0.05,
    };

    // 3. Semantic / TF-IDF Retrieval from Knowledge Store
    const retrievedEvidence = this.store.search(userQuestion, searchFilters);

    // 4. Prompt Construction & Grounded Answer Generation (statement2 §20, §21, §22)
    const llmResult = await this.llmProvider.generateAnswer(
      userQuestion,
      retrievedEvidence,
      contextPayload
    );

    const executionTimeMs = Date.now() - startTime;

    // 5. Build Comprehensive Response Envelope with Provenance (statement2 §7, §23, §24, §25)
    const responsePayload = {
      id: `ans-${Date.now()}`,
      timestamp: new Date().toISOString(),
      question: userQuestion,
      context: contextPayload,
      answer: llmResult.answerText,
      citations: llmResult.citations,
      evidence: retrievedEvidence.map((chunk) => ({
        chunkId: chunk.chunkId,
        documentId: chunk.documentId,
        documentName: chunk.documentName,
        erp: chunk.erp,
        version: chunk.version,
        section: chunk.section,
        heading: chunk.heading,
        page: chunk.page,
        sourceUrl: chunk.sourceUrl,
        sourceType: chunk.sourceType,
        parentDocumentId: chunk.parentDocumentId,
        parentSourceUrl: chunk.parentSourceUrl,
        provenanceChain: chunk.provenanceChain || [],
        contentSnippet: chunk.content,
        relevanceScore: chunk.relevanceScore,
      })),
      modelUsed: llmResult.modelUsed,
      noAnswer: llmResult.noAnswer || false,
      executionTimeMs,
    };

    // 6. Observability Record (statement2 §39)
    this.recordObservability(responsePayload);

    return responsePayload;
  }

  /**
   * Records query execution for debugging and RAG quality evaluation (§39)
   */
  recordObservability(entry) {
    this.queryLogs.unshift({
      id: entry.id,
      timestamp: entry.timestamp,
      question: entry.question,
      erp: entry.context.erp,
      evidenceCount: entry.evidence.length,
      topScore: entry.evidence[0]?.relevanceScore || 0,
      executionTimeMs: entry.executionTimeMs,
      noAnswer: entry.noAnswer,
      modelUsed: entry.modelUsed,
    });

    // Keep last 50 queries in memory
    if (this.queryLogs.length > 50) {
      this.queryLogs = this.queryLogs.slice(0, 50);
    }
  }

  getObservabilityLogs() {
    return this.queryLogs;
  }
}

export const globalRetrievalPipeline = new RetrievalPipeline();
