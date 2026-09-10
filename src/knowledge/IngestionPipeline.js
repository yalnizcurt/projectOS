/**
 * Knowledge Ingestion Pipeline Engine
 * Orchestrates statement2 §4, §5, §6, §7, §11, §13, §14, §29, §30.
 *
 * Pipeline Stages:
 * Document Validation -> Text Extraction -> Structure Detection ->
 * URL Extraction -> URL Classification -> Authenticated/Public Fetching ->
 * Linked Content Extraction -> Controlled Link Expansion ->
 * Metadata Enrichment -> Chunking -> Indexing -> Knowledge Store
 */

import { URLClassifier, URLCategory } from './URLClassifier.js';
import { ChunkingService } from './ChunkingService.js';
import { PublicWebFetcher, MockAuthenticatedFetcher } from './ContentFetcher.js';
import { globalKnowledgeStore } from './KnowledgeStore.js';

export class IngestionPipeline {
  constructor(options = {}) {
    this.store = options.store || globalKnowledgeStore;
    this.publicFetcher = options.publicFetcher || new PublicWebFetcher();
    this.authFetcher = options.authFetcher || new MockAuthenticatedFetcher();
    this.maxDepth = options.maxDepth || 2;
  }

  /**
   * Run end-to-end ingestion on a root playbook or document
   * @param {Object} input - { documentName, erp, content, sourceType, sourceUrl, version, file }
   * @param {Object} authContext - credentials or simulation flags
   * @param {Function} onProgress - optional progress callback
   */
  async ingestPlaybook(input, authContext = {}, onProgress = null) {
    const notify = (stage, detail) => {
      if (onProgress) onProgress({ stage, detail });
    };

    notify('VALIDATING', 'Validating document format and ERP association...');

    // 1. Document Validation
    if (!input.documentName || !input.content) {
      throw new Error('Ingestion failed: Document name and content are required.');
    }

    const documentId = input.documentId || `doc-${Date.now()}`;
    const erp = input.erp || 'General ERP';
    const version = input.version || '1.0';
    const sourceUrl = input.sourceUrl || '';
    const sourceType = input.sourceType || 'PLAYBOOK';

    const rootDoc = {
      documentId,
      documentName: input.documentName,
      erp,
      version,
      sourceType,
      sourceUrl,
      parentDocumentId: null,
      parentSourceUrl: null,
      provenanceChain: [
        {
          documentId,
          documentName: input.documentName,
          sourceUrl,
          type: sourceType,
        },
      ],
      effectiveDate: input.effectiveDate || new Date().toISOString().split('T')[0],
      status: 'INDEXED',
      indexedAt: new Date().toISOString(),
      discoveredUrls: [],
    };

    notify('CHUNKING_ROOT', `Chunking primary document ${input.documentName}...`);

    // 2. Chunk Root Document
    const rootChunks = ChunkingService.chunkDocument({
      ...rootDoc,
      content: input.content,
    });
    this.store.addDocument(rootDoc);
    this.store.addChunks(rootChunks);

    // 3. URL Extraction from primary document (statement2 §4)
    notify('DISCOVERING_URLS', 'Scanning content for referenced technical documentation URLs...');
    const extractedLinks = URLClassifier.extractLinks(input.content);

    const pipelineSummary = {
      rootDocumentId: documentId,
      documentName: input.documentName,
      erp,
      textChunksCount: rootChunks.length,
      urlsDiscovered: extractedLinks.length,
      relevantUrlsCount: 0,
      successfullyFetchedCount: 0,
      authRequiredCount: 0,
      failedCount: 0,
      discoveredUrls: [],
    };

    // 4. Classify each discovered URL (statement2 §5, §6)
    const classifiedUrls = extractedLinks.map((link) => {
      const classification = URLClassifier.classify(link.url);
      return {
        ...link,
        ...classification,
      };
    });

    // 5. Controlled Fetching & Linked Ingestion (statement2 §5, §6, §30)
    for (const urlItem of classifiedUrls) {
      if (!urlItem.isEligible) {
        pipelineSummary.discoveredUrls.push({
          url: urlItem.url,
          label: urlItem.label,
          status: 'SKIPPED_IRRELEVANT',
          reason: urlItem.reason,
        });
        continue;
      }

      pipelineSummary.relevantUrlsCount++;

      notify('FETCHING_LINK', `Retrieving linked resource: ${urlItem.url}...`);

      let fetchResult = null;

      if (urlItem.requiresAuth) {
        // Route through authentication abstraction (§8, §9, §30)
        fetchResult = await this.authFetcher.fetch(urlItem.url, authContext);
      } else {
        fetchResult = await this.publicFetcher.fetch(urlItem.url);
      }

      if (fetchResult.status === 200 && fetchResult.content) {
        // Successfully retrieved linked technical document!
        pipelineSummary.successfullyFetchedCount++;

        const linkedDocId = `doc-linked-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const linkedDoc = {
          documentId: linkedDocId,
          documentName: fetchResult.title || urlItem.label || 'Linked Technical Guide',
          erp,
          version: '1.0',
          sourceType: urlItem.requiresAuth ? 'GOOGLE_DOC' : 'WEB_PAGE',
          sourceUrl: urlItem.url,
          parentDocumentId: documentId,
          parentSourceUrl: sourceUrl || input.documentName,
          provenanceChain: [
            ...rootDoc.provenanceChain,
            {
              documentId: linkedDocId,
              documentName: fetchResult.title,
              sourceUrl: urlItem.url,
              type: urlItem.requiresAuth ? 'GOOGLE_DOC' : 'WEB_PAGE',
            },
          ],
          effectiveDate: new Date().toISOString().split('T')[0],
          status: 'INDEXED',
          requiresAuth: urlItem.requiresAuth,
          authProvider: fetchResult.authenticatedVia || null,
          retrievedAt: fetchResult.retrievedAt,
          indexedAt: new Date().toISOString(),
          referencedBy: [documentId],
        };

        const linkedChunks = ChunkingService.chunkDocument({
          ...linkedDoc,
          content: fetchResult.content,
        });

        this.store.addDocument(linkedDoc);
        this.store.addChunks(linkedChunks);
        pipelineSummary.textChunksCount += linkedChunks.length;

        pipelineSummary.discoveredUrls.push({
          url: urlItem.url,
          label: urlItem.label,
          documentId: linkedDocId,
          documentName: linkedDoc.documentName,
          status: 'INDEXED',
          requiresAuth: urlItem.requiresAuth,
          authProvider: fetchResult.authenticatedVia,
          chunksCount: linkedChunks.length,
        });
      } else if (fetchResult.requiresAuth || fetchResult.status === 401) {
        // Authenticated URL state (§30: Do not fail ingestion; record as AUTHENTICATION_REQUIRED)
        pipelineSummary.authRequiredCount++;
        pipelineSummary.discoveredUrls.push({
          url: urlItem.url,
          label: urlItem.label,
          status: 'AUTH_REQUIRED',
          requiresAuth: true,
          reason: fetchResult.error || 'Enterprise Authentication Required',
        });
      } else {
        // Failed retrieval (§43: Failure scenario handling)
        pipelineSummary.failedCount++;
        pipelineSummary.discoveredUrls.push({
          url: urlItem.url,
          label: urlItem.label,
          status: 'FAILED',
          error: fetchResult.error || 'Failed to fetch content',
        });
      }
    }

    // Update root document with final discovered URL registry
    rootDoc.discoveredUrls = pipelineSummary.discoveredUrls;
    this.store.addDocument(rootDoc);

    notify('COMPLETED', `Ingestion completed: ${pipelineSummary.textChunksCount} chunks indexed.`);

    return pipelineSummary;
  }
}

export const globalIngestionPipeline = new IngestionPipeline();
