/**
 * URL Classification and Link Filtering Engine
 * Complies with statement2 §5, §6 (Controlled link expansion and classification).
 */

export const URLCategory = {
  PUBLIC_TECH_DOC: 'PUBLIC_TECH_DOC',
  AUTHENTICATED_GOOGLE: 'AUTHENTICATED_GOOGLE',
  AUTHENTICATED_ENTERPRISE: 'AUTHENTICATED_ENTERPRISE',
  IRRELEVANT: 'IRRELEVANT',
  BLOCKED: 'BLOCKED',
};

export const CRAWL_DEFAULTS = {
  maxDepth: 2,
  maxPagesPerSource: 10,
  allowedDomains: [
    'mock-company.com',
    'docs.google.com',
    'drive.google.com',
    'sap.com',
    'oracle.com',
    'microsoft.com',
  ],
  blockedDomains: [
    'facebook.com',
    'twitter.com',
    'x.com',
    'linkedin.com',
    'instagram.com',
    'doubleclick.net',
    'google-analytics.com',
  ],
  irrelevantPatterns: [
    /\/login/i,
    /\/logout/i,
    /\/signin/i,
    /\/signup/i,
    /\/pricing/i,
    /\/marketing/i,
    /\/careers/i,
    /\/contact-us/i,
    /\/privacy/i,
    /\/terms/i,
    /#navigation/i,
    /\?utm_/i,
  ],
};

export class URLClassifier {
  /**
   * Normalizes a URL string
   */
  static normalize(rawUrl) {
    if (!rawUrl) return '';
    try {
      const urlObj = new URL(rawUrl.trim());
      // strip hash and common tracking params
      urlObj.hash = '';
      const paramsToClean = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'source'];
      paramsToClean.forEach((p) => urlObj.searchParams.delete(p));
      return urlObj.toString().replace(/\/$/, ''); // Remove trailing slash
    } catch {
      // Return trimmed raw string if URL parsing fails
      return rawUrl.trim().replace(/\/$/, '');
    }
  }

  /**
   * Classifies a discovered URL and determines eligibility for ingestion
   * @param {string} url
   * @param {Object} config - custom crawl configuration overrides
   */
  static classify(url, config = {}) {
    const opts = { ...CRAWL_DEFAULTS, ...config };
    const normalized = this.normalize(url);

    if (!normalized) {
      return {
        url,
        normalized,
        category: URLCategory.IRRELEVANT,
        isEligible: false,
        reason: 'Empty or invalid URL',
      };
    }

    let domain = '';
    try {
      const parsed = new URL(normalized);
      domain = parsed.hostname.toLowerCase();
    } catch {
      // Fallback domain extraction
      const match = normalized.match(/https?:\/\/([^/]+)/i);
      domain = match ? match[1].toLowerCase() : '';
    }

    // 1. Blocked domains check
    if (opts.blockedDomains.some((d) => domain.includes(d))) {
      return {
        url,
        normalized,
        domain,
        category: URLCategory.BLOCKED,
        isEligible: false,
        reason: `Domain ${domain} is on system blocklist`,
      };
    }

    // 2. Irrelevant patterns check
    if (opts.irrelevantPatterns.some((pattern) => pattern.test(normalized))) {
      return {
        url,
        normalized,
        domain,
        category: URLCategory.IRRELEVANT,
        isEligible: false,
        reason: 'URL matches irrelevant pattern (marketing, login, tracking)',
      };
    }

    // 3. Google Workspace authenticated check (statement2 §8, §9)
    if (domain.includes('docs.google.com') || domain.includes('drive.google.com')) {
      return {
        url,
        normalized,
        domain,
        category: URLCategory.AUTHENTICATED_GOOGLE,
        isEligible: true,
        requiresAuth: true,
        authType: 'Google Workspace OAuth 2.0',
        reason: 'Restricted Google Workspace Technical Document',
      };
    }

    // 4. Allowed domains check
    const isAllowed = opts.allowedDomains.some((d) => domain.includes(d));
    if (isAllowed) {
      return {
        url,
        normalized,
        domain,
        category: URLCategory.PUBLIC_TECH_DOC,
        isEligible: true,
        requiresAuth: false,
        reason: 'Approved Technical Documentation Domain',
      };
    }

    // Default: conservative approach (statement2 §6: Do Not Blindly Crawl the Internet)
    return {
      url,
      normalized,
      domain,
      category: URLCategory.IRRELEVANT,
      isEligible: false,
      reason: 'Domain not in approved technical allowlist',
    };
  }

  /**
   * Extract all URLs found in markdown or plain text content
   * @param {string} text
   * @returns {Array<{ text: string, url: string }>}
   */
  static extractLinks(text) {
    if (!text) return [];
    const links = [];
    const seen = new Set();

    // 1. Markdown links: [Label](https://...)
    const mdRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
    let match;
    while ((match = mdRegex.exec(text)) !== null) {
      const url = match[2].trim();
      if (!seen.has(url)) {
        seen.add(url);
        links.push({ label: match[1].trim(), url });
      }
    }

    // 2. Plain raw URLs: https://...
    const rawRegex = /(https?:\/\/[^\s\)\],;>]+)/g;
    while ((match = rawRegex.exec(text)) !== null) {
      const url = match[1].trim();
      if (!seen.has(url)) {
        seen.add(url);
        links.push({ label: url, url });
      }
    }

    return links;
  }
}
