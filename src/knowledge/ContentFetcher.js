/**
 * Content Fetcher Abstraction Layer
 * Handles retrieving technical documentation from public and authenticated sources.
 * Adheres to statement2 §8, §9, §10 (Google Authentication & Provider Abstraction).
 */

export class ContentFetcher {
  /**
   * Fetch text content from a URL
   * @param {string} url
   * @param {Object} authContext
   * @returns {Promise<{ content: string, title: string, status: number, effectiveUrl: string, requiresAuth: boolean }>}
   */
  async fetch(url, authContext = {}) {
    throw new Error('ContentFetcher.fetch() must be implemented by subclass');
  }
}

/**
 * PublicWebFetcher
 * Retrieves public technical documentation. For local MVP development, maps public
 * mock URLs (e.g. https://mock-company.com/sap/configuration) to local static fixtures.
 */
function resolveLocalPath(path) {
  if (typeof window === 'undefined' && path.startsWith('/')) {
    return `http://127.0.0.1:5173${path}`;
  }
  return path;
}

export class PublicWebFetcher extends ContentFetcher {
  // Static fixture mapping for local browser environment without needing live external servers
  static MOCK_URL_MAP = {
    'https://mock-company.com/sap/configuration': '/mock-knowledge/sap/configuration-guide.md',
    'https://mock-company.com/sap/troubleshooting': '/mock-knowledge/sap/troubleshooting-guide.md',
    'https://mock-company.com/oracle/troubleshooting': '/mock-knowledge/oracle/troubleshooting-guide.md',
    'https://mock-company.com/dynamics/configuration': '/mock-knowledge/dynamics/configuration-guide.md',
  };

  async fetch(url) {
    const normalized = url.trim().toLowerCase();
    const localPath = PublicWebFetcher.MOCK_URL_MAP[normalized];

    if (localPath) {
      try {
        const res = await fetch(resolveLocalPath(localPath));
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch ${localPath}`);
        const content = await res.text();
        const titleMatch = content.match(/^#\s+(.+)$/m);
        return {
          content,
          title: titleMatch ? titleMatch[1].trim() : 'Linked Technical Documentation',
          status: 200,
          effectiveUrl: url,
          requiresAuth: false,
          retrievedAt: new Date().toISOString(),
        };
      } catch (err) {
        return {
          content: '',
          title: '',
          status: 404,
          error: err.message,
          effectiveUrl: url,
          requiresAuth: false,
        };
      }
    }

    // If external live URL
    return {
      content: '',
      title: '',
      status: 404,
      error: 'Unreachable mock external domain in local environment',
      effectiveUrl: url,
      requiresAuth: false,
    };
  }
}

/**
 * MockAuthenticatedFetcher
 * Simulates authenticated retrieval for Google Workspace docs / Enterprise internal portals.
 * statement2 §8, §9, §31: Allows MVP to prove end-to-end authenticated ingestion without live company Google credentials.
 */
export class MockAuthenticatedFetcher extends ContentFetcher {
  static MOCK_AUTH_URL_MAP = {
    'https://docs.google.com/document/d/sap-server-config/edit': {
      path: '/mock-knowledge/sap/authenticated/server-config.md',
      title: 'SAP Server Configuration & Security Parameters',
      scope: 'https://www.googleapis.com/auth/documents.readonly',
    },
    'https://docs.google.com/document/d/sap-deployment-guide/edit': {
      path: '/mock-knowledge/sap/authenticated/deployment-guide.md',
      title: 'SAP Enterprise Production Deployment Guide',
      scope: 'https://www.googleapis.com/auth/documents.readonly',
    },
  };

  /**
   * Fetch with simulated authentication token validation
   */
  async fetch(url, authContext = {}) {
    const normalized = url.trim().toLowerCase();
    const mockAuthMeta = MockAuthenticatedFetcher.MOCK_AUTH_URL_MAP[normalized];

    if (!mockAuthMeta) {
      return {
        content: '',
        title: '',
        status: 401,
        requiresAuth: true,
        error: 'Authentication Required: Unregistered enterprise Google Doc',
        effectiveUrl: url,
      };
    }

    // In MVP simulation, if authContext.simulateAuthFailure is set, return 401
    if (authContext.simulateAuthFailure) {
      return {
        content: '',
        title: mockAuthMeta.title,
        status: 401,
        requiresAuth: true,
        error: 'Authentication Required: Google Workspace credentials missing or unverified',
        effectiveUrl: url,
      };
    }

    try {
      const res = await fetch(resolveLocalPath(mockAuthMeta.path));
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to read authenticated fixture`);
      const content = await res.text();
      return {
        content,
        title: mockAuthMeta.title,
        status: 200,
        effectiveUrl: url,
        requiresAuth: true,
        authenticatedVia: 'Mock Google Workspace Provider (OAuth 2.0 Simulated)',
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      return {
        content: '',
        title: mockAuthMeta.title,
        status: 500,
        requiresAuth: true,
        error: err.message,
        effectiveUrl: url,
      };
    }
  }
}

/**
 * EnterpriseAuthenticatedFetcher (Stub for production deployment)
 * Will exchange Google OAuth2 refresh tokens or enterprise service account keys for Google Drive / Docs APIs.
 */
export class EnterpriseAuthenticatedFetcher extends ContentFetcher {
  constructor(credentials = {}) {
    super();
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
  }

  async fetch(url, authContext = {}) {
    throw new Error('EnterpriseAuthenticatedFetcher: Google Workspace production credentials must be injected');
  }
}
