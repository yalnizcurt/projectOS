/**
 * Chunking Service
 * Splits markdown and structured text into context-preserving chunks.
 * Enforces metadata preservation required by statement2 §7, §14, §25 (Source Provenance).
 */

export class ChunkingService {
  /**
   * Chunks a document preserving section and heading boundaries
   * @param {Object} document - Document metadata and full content
   * @param {Object} options - chunking parameters
   * @returns {Array<Object>} List of enriched chunks
   */
  static chunkDocument(document, options = {}) {
    const {
      maxChunkChars = 800,
      overlapChars = 100,
    } = options;

    const {
      documentId,
      documentName,
      erp,
      sourceType = 'PLAYBOOK',
      sourceUrl = '',
      version = '1.0',
      parentDocumentId = null,
      parentSourceUrl = null,
      provenanceChain = [],
      content = '',
    } = document;

    if (!content || !content.trim()) return [];

    const chunks = [];
    const lines = content.split('\n');

    let currentSection = 'General';
    let currentHeading = 'Overview';
    let currentLines = [];
    let currentChunkIndex = 1;
    let estimatedPage = 1;

    const flushChunk = () => {
      const text = currentLines.join('\n').trim();
      if (!text) return;
      const stripped = text.replace(/^[#\s\-_=]+/gm, '').trim();
      if (stripped.length < 30) return;

      const chunkId = `${documentId}-chk-${String(currentChunkIndex).padStart(3, '0')}`;

      chunks.push({
        chunkId,
        documentId,
        documentName,
        erp,
        sourceType,
        sourceUrl,
        section: currentSection,
        heading: currentHeading,
        page: estimatedPage,
        parentDocumentId,
        parentSourceUrl,
        version,
        provenanceChain: [
          ...provenanceChain,
          {
            documentId,
            documentName,
            sourceUrl,
            section: currentSection,
            heading: currentHeading,
          },
        ],
        content: text,
        charCount: text.length,
        indexedAt: new Date().toISOString(),
      });

      currentChunkIndex++;
      currentLines = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Approximate page count every 40 lines
      if (i > 0 && i % 40 === 0) {
        estimatedPage++;
      }

      // Check for markdown headers (## Section / ### Heading)
      const h2Match = line.match(/^##\s+(.+)$/);
      const h3Match = line.match(/^###\s+(.+)$/);

      if (h2Match) {
        flushChunk();
        currentSection = h2Match[1].trim();
        currentHeading = currentSection;
        currentLines.push(line);
        continue;
      }

      if (h3Match) {
        const currentLength = currentLines.reduce((acc, l) => acc + l.length + 1, 0);
        if (currentLength >= 500) {
          flushChunk();
        }
        currentHeading = h3Match[1].trim();
        currentLines.push(line);
        continue;
      }

      currentLines.push(line);

      // If current buffer exceeds maximum characters, flush
      const currentLength = currentLines.reduce((acc, l) => acc + l.length + 1, 0);
      if (currentLength >= maxChunkChars) {
        flushChunk();
      }
    }

    // Flush any remaining text
    flushChunk();

    return chunks;
  }
}
