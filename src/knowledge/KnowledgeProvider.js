/**
 * Knowledge Provider Abstraction Layer
 * Defines contracts for accessing ERP technical knowledge.
 * Enables clean decoupling between the RAG engine and physical storage
 * (Mock in-memory index vs. Enterprise Vector DB / Katalyt).
 */

export class KnowledgeProvider {
  /**
   * Search knowledge chunks given a query and metadata filters
   * @param {string} query
   * @param {Object} filters - e.g. { erp: 'SAP S/4HANA', maxResults: 5 }
   * @returns {Promise<Array<Object>>} List of ranked chunk results with score and metadata
   */
  async search(query, filters = {}) {
    throw new Error('KnowledgeProvider.search() must be implemented by subclass');
  }

  /**
   * Retrieve a specific document by its unique ID
   * @param {string} documentId
   * @returns {Promise<Object|null>}
   */
  async getDocument(documentId) {
    throw new Error('KnowledgeProvider.getDocument() must be implemented by subclass');
  }

  /**
   * List all ingested documents matching filter criteria
   * @param {Object} filters
   * @returns {Promise<Array<Object>>}
   */
  async listDocuments(filters = {}) {
    throw new Error('KnowledgeProvider.listDocuments() must be implemented by subclass');
  }
}

/**
 * MockKnowledgeProvider
 * Backed by the client-side KnowledgeStore index for local/laptop execution.
 */
export class MockKnowledgeProvider extends KnowledgeProvider {
  constructor(knowledgeStore) {
    super();
    this.store = knowledgeStore;
  }

  async search(query, filters = {}) {
    return this.store.search(query, filters);
  }

  async getDocument(documentId) {
    return this.store.getDocument(documentId);
  }

  async listDocuments(filters = {}) {
    return this.store.listDocuments(filters);
  }
}

/**
 * EnterpriseKnowledgeProvider (Stub for production migration)
 * Future implementation will connect to Pinecone/Weaviate/Katalyt via authenticated enterprise gateway.
 */
export class EnterpriseKnowledgeProvider extends KnowledgeProvider {
  constructor(config = {}) {
    super();
    this.endpoint = config.endpoint || process.env.VITE_ENTERPRISE_RAG_ENDPOINT;
    this.apiKey = config.apiKey || process.env.VITE_ENTERPRISE_RAG_KEY;
  }

  async search(query, filters = {}) {
    throw new Error('EnterpriseKnowledgeProvider requires production enterprise deployment');
  }

  async getDocument(documentId) {
    throw new Error('EnterpriseKnowledgeProvider requires production enterprise deployment');
  }

  async listDocuments(filters = {}) {
    throw new Error('EnterpriseKnowledgeProvider requires production enterprise deployment');
  }
}
