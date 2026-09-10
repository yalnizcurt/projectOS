/**
 * In-Memory Knowledge Store & Client-Side Vector/TF-IDF Engine
 * Complies with statement2 §10, §13, §14, §15, §27.
 * Provides client-side semantic + keyword retrieval with ERP-aware prioritization.
 */

export const STOPWORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'for', 'with', 'about', 'against',
  'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from',
  'up', 'down', 'out', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
  'too', 'very', 'can', 'will', 'just', 'should', 'now', 'what', 'does', 'did', 'are', 'were'
]);

export class KnowledgeStore {
  constructor() {
    this.documents = new Map(); // documentId -> documentMetadata
    this.chunks = [];           // Array of chunk objects
    this.urlMap = new Map();    // normalizedUrl -> documentId
    this.storageKey = 'ERP_CONTROL_TOWER_KNOWLEDGE_STORE';
    this.loadFromStorage();
  }

  /**
   * Simple hash for duplicate content detection (statement2 §27)
   */
  static hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return String(Math.abs(hash));
  }

  /**
   * Tokenize and normalize text for inverted index & TF-IDF
   */
  static tokenize(text, removeStopwords = false) {
    if (!text) return [];
    const tokens = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);
    if (removeStopwords) {
      return tokens.filter((t) => !STOPWORDS.has(t));
    }
    return tokens;
  }

  /**
   * Add a document to the catalog
   */
  addDocument(doc) {
    const existing = this.documents.get(doc.documentId);
    if (existing) {
      // Preserve multiple parent source relationships (§27)
      const mergedReferencedBy = Array.from(
        new Set([...(existing.referencedBy || []), ...(doc.referencedBy || [])])
      );
      const updated = {
        ...existing,
        ...doc,
        referencedBy: mergedReferencedBy,
        updatedAt: new Date().toISOString(),
      };
      this.documents.set(doc.documentId, updated);
      if (doc.sourceUrl) {
        this.urlMap.set(doc.sourceUrl.toLowerCase(), doc.documentId);
      }
      this.saveToStorage();
      return updated;
    }

    const newDoc = {
      ...doc,
      status: doc.status || 'INDEXED',
      indexedAt: doc.indexedAt || new Date().toISOString(),
      referencedBy: doc.referencedBy || [],
    };
    this.documents.set(doc.documentId, newDoc);
    if (doc.sourceUrl) {
      this.urlMap.set(doc.sourceUrl.toLowerCase(), doc.documentId);
    }
    this.saveToStorage();
    return newDoc;
  }

  /**
   * Add chunks to the index
   */
  addChunks(newChunks) {
    if (!Array.isArray(newChunks) || newChunks.length === 0) return;

    // Filter out existing duplicates based on chunkId
    const existingIds = new Set(this.chunks.map((c) => c.chunkId));
    const toAdd = newChunks.filter((c) => !existingIds.has(c.chunkId));

    this.chunks.push(...toAdd);
    this.saveToStorage();
  }

  /**
   * Retrieve document by ID
   */
  getDocument(documentId) {
    return this.documents.get(documentId) || null;
  }

  /**
   * Retrieve document by Source URL
   */
  getDocumentByUrl(url) {
    if (!url) return null;
    const docId = this.urlMap.get(url.toLowerCase().trim());
    return docId ? this.documents.get(docId) : null;
  }

  /**
   * List all documents
   */
  listDocuments(filters = {}) {
    let docs = Array.from(this.documents.values());
    if (filters.erp) {
      docs = docs.filter((d) => d.erp === filters.erp);
    }
    if (filters.status) {
      docs = docs.filter((d) => d.status === filters.status);
    }
    return docs;
  }

  /**
   * Search knowledge chunks with ERP filtering and TF-IDF relevance scoring
   * Complies with statement2 §15 (ERP-Aware Retrieval) & §20 (Source-Grounded Answers)
   */
  search(query, filters = {}) {
    const {
      erp = null,
      maxResults = 5,
      minScore = 0.08,
    } = filters;

    if (!query || !query.trim() || this.chunks.length === 0) {
      return [];
    }

    const queryTokens = KnowledgeStore.tokenize(query, true);
    if (queryTokens.length === 0) return [];

    // Filter candidate chunks by ERP if specified, or prioritize matching ERP
    let candidateChunks = this.chunks;
    if (erp) {
      const erpFiltered = this.chunks.filter((c) => !c.erp || c.erp.toLowerCase() === erp.toLowerCase());
      // If ERP-specific chunks exist, strictly use them to avoid cross-ERP pollution (§15)
      if (erpFiltered.length > 0) {
        candidateChunks = erpFiltered;
      }
    }

    // Compute IDF across candidate corpus
    const N = candidateChunks.length;
    const df = {};
    candidateChunks.forEach((chunk) => {
      const uniqueWords = new Set(KnowledgeStore.tokenize(chunk.content));
      uniqueWords.forEach((word) => {
        df[word] = (df[word] || 0) + 1;
      });
    });

    const idf = {};
    queryTokens.forEach((token) => {
      const count = df[token] || 0;
      idf[token] = Math.log((N + 1) / (count + 1)) + 1;
    });

    // Score chunks
    const scoredChunks = candidateChunks.map((chunk) => {
      const chunkTokens = KnowledgeStore.tokenize(chunk.content);
      const totalWords = chunkTokens.length || 1;

      // Term Frequency
      const tf = {};
      chunkTokens.forEach((t) => {
        tf[t] = (tf[t] || 0) + 1;
      });

      let score = 0;
      queryTokens.forEach((qt) => {
        const termFreq = (tf[qt] || 0) / totalWords;
        const termIdf = idf[qt] || 1;
        score += termFreq * termIdf;

        // Heading & Section Boost
        if (chunk.heading && chunk.heading.toLowerCase().includes(qt)) {
          score += 0.35;
        }
        if (chunk.section && chunk.section.toLowerCase().includes(qt)) {
          score += 0.25;
        }
      });

      // Boost if exact ERP match
      if (erp && chunk.erp && chunk.erp.toLowerCase() === erp.toLowerCase()) {
        score *= 1.25;
      }

      return {
        chunk,
        score: Math.min(1.0, Number(score.toFixed(4))),
      };
    });

    // Sort descending and filter by minScore
    const results = scoredChunks
      .filter((item) => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map((item) => ({
        ...item.chunk,
        relevanceScore: item.score,
      }));

    return results;
  }

  /**
   * Delete document and its chunks
   */
  deleteDocument(documentId) {
    const doc = this.documents.get(documentId);
    if (doc && doc.sourceUrl) {
      this.urlMap.delete(doc.sourceUrl.toLowerCase());
    }
    this.documents.delete(documentId);
    this.chunks = this.chunks.filter((c) => c.documentId !== documentId);
    this.saveToStorage();
  }

  /**
   * Reset store
   */
  clear() {
    this.documents.clear();
    this.chunks = [];
    this.urlMap.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.storageKey);
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const data = {
        documents: Array.from(this.documents.entries()),
        chunks: this.chunks,
      };
      window.localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch {
      // Silently handle quota exceeded if applicable
    }
  }

  loadFromStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.documents) {
        this.documents = new Map(data.documents);
        this.documents.forEach((doc) => {
          if (doc.sourceUrl) {
            this.urlMap.set(doc.sourceUrl.toLowerCase(), doc.documentId);
          }
        });
      }
      if (Array.isArray(data.chunks)) {
        this.chunks = data.chunks;
      }
    } catch {
      // Reset if corrupt
      this.clear();
    }
  }
}

// Global singleton instance for easy import across modules
export const globalKnowledgeStore = new KnowledgeStore();
