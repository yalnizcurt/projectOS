/**
 * RAG Evaluation Runner
 * Executes evaluation test suite against RetrievalPipeline to assess
 * Groundedness, Retrieval Accuracy, Source Relevance, and No-Answer compliance (§38).
 */

import { evalDataset } from './evalDataset.js';
import { globalRetrievalPipeline } from '../RetrievalPipeline.js';

export class EvalRunner {
  /**
   * Runs the complete evaluation suite
   * @param {Function} onProgress
   * @returns {Promise<Object>} Evaluation score and per-test reports
   */
  static async runAll(onProgress = null) {
    const results = [];
    let passedCount = 0;

    for (let i = 0; i < evalDataset.length; i++) {
      const testCase = evalDataset[i];
      if (onProgress) {
        onProgress({ current: i + 1, total: evalDataset.length, testCase });
      }

      const res = await globalRetrievalPipeline.query(
        testCase.question,
        { erp: testCase.erp }
      );

      // Brief pacing to respect API rate limits (e.g. Groq TPM limits)
      await new Promise((r) => setTimeout(r, 1200));

      let passed = true;
      const failures = [];

      if (testCase.expectedNoAnswer) {
        if (!res.noAnswer) {
          passed = false;
          failures.push('Expected no-answer behavior, but an answer was generated.');
        }
      } else {
        if (res.noAnswer) {
          passed = false;
          failures.push('Expected grounded answer, but system returned no-answer.');
        }

        // Check expected source presence in evidence
        if (testCase.expectedSource) {
          const sourceFound = res.evidence.some((e) =>
            e.documentName.toLowerCase().includes(testCase.expectedSource.toLowerCase())
          );
          if (!sourceFound) {
            passed = false;
            failures.push(`Expected source "${testCase.expectedSource}" not found in top evidence.`);
          }
        }

        // Check keyword presence in answer or evidence
        if (testCase.expectedKeywords) {
          const combinedText = (res.answer + ' ' + res.evidence.map((e) => e.contentSnippet).join(' ')).toLowerCase();
          const missingKeywords = testCase.expectedKeywords.filter(
            (kw) => !combinedText.includes(kw.toLowerCase())
          );
          if (missingKeywords.length > 0) {
            passed = false;
            failures.push(`Missing expected technical keywords: ${missingKeywords.join(', ')}`);
          }
        }

        // Check negative constraints (ERP isolation / zero contamination)
        if (testCase.mustNotContain) {
          const combinedText = (res.answer + ' ' + res.evidence.map((e) => e.contentSnippet).join(' ')).toLowerCase();
          const contaminated = testCase.mustNotContain.filter(
            (term) => combinedText.includes(term.toLowerCase())
          );
          if (contaminated.length > 0) {
            passed = false;
            failures.push(`Cross-ERP contamination detected: Found disallowed terms ${contaminated.join(', ')}`);
          }
        }
      }

      if (passed) passedCount++;

      results.push({
        id: testCase.id,
        question: testCase.question,
        erp: testCase.erp,
        type: testCase.type,
        passed,
        failures,
        evidenceCount: res.evidence.length,
        executionTimeMs: res.executionTimeMs,
      });
    }

    const accuracyPct = Math.round((passedCount / evalDataset.length) * 100);

    return {
      totalTests: evalDataset.length,
      passedCount,
      failedCount: evalDataset.length - passedCount,
      accuracyPct,
      results,
      executedAt: new Date().toISOString(),
    };
  }
}
