/**
 * LLM Provider Abstraction Layer
 * Supports statement2 §20 (Source-Grounded Answers), §21 (No-Answer Requirement), §22 (Citations).
 * Provides MockLLMProvider for offline laptop execution and GeminiLLMProvider for live inference.
 */

export class LLMProvider {
  /**
   * Generates a grounded response based strictly on retrieved evidence
   * @param {string} userQuestion
   * @param {Array<Object>} evidenceChunks
   * @param {Object} contextPayload
   * @returns {Promise<{ answerText: string, citations: Array<Object>, modelUsed: string }>}
   */
  async generateAnswer(userQuestion, evidenceChunks, contextPayload) {
    throw new Error('LLMProvider.generateAnswer() must be implemented by subclass');
  }
}

/**
 * MockLLMProvider
 * Synthesizes grounded answers directly from evidence text without external API calls.
 * Ensures strict compliance with §20 and §21 (Never hallucinate, return no-answer if no evidence).
 */
export class MockLLMProvider extends LLMProvider {
  async generateAnswer(userQuestion, evidenceChunks = [], contextPayload = {}) {
    // Artificial latency for realistic typing/thinking UX
    await new Promise((resolve) => setTimeout(resolve, 600));

    // 1. Check No-Answer Requirement (statement2 §21)
    if (!evidenceChunks || evidenceChunks.length === 0) {
      return {
        answerText: `⚠️ **No supported answer found.**\n\nI couldn't find sufficient information for this question in the approved ERP knowledge sources for ${contextPayload.erp || 'the selected ERP'}.\n\nPlease verify that the relevant integration playbook or technical guide has been ingested in **Settings & Sync > ERP Knowledge Base**.`,
        citations: [],
        modelUsed: 'Mock Grounded Synthesizer v2.0 (Offline Mode)',
        noAnswer: true,
      };
    }

    // 2. Synthesize Grounded Answer from retrieved evidence
    const topChunk = evidenceChunks[0];
    const erpName = topChunk.erp || contextPayload.erp || 'ERP System';

    // Build synthesized response
    const answerSections = [];

    answerSections.push(`Based on the approved technical documentation for **${erpName}**, here are the documented instructions and requirements:\n`);

    evidenceChunks.forEach((chunk, index) => {
      const sourceLabel = `[${index + 1}]`;
      answerSections.push(`### ${chunk.heading || chunk.section} *(Source: ${chunk.documentName})*`);

      // Extract substantive bullet points or sentences from chunk content
      const lines = chunk.content
        .split('\n')
        .filter((l) => !l.startsWith('#') && l.trim().length > 10)
        .slice(0, 4);

      if (lines.length > 0) {
        answerSections.push(lines.join('\n'));
      } else {
        answerSections.push(chunk.content.slice(0, 300) + '...');
      }

      answerSections.push(`*Reference: ${chunk.documentName}, Section ${chunk.section || 'General'} (Relevance: ${Math.round((chunk.relevanceScore || 0.9) * 100)}%)* ${sourceLabel}\n`);
    });

    if (contextPayload.jiraIssueKey) {
      answerSections.push(`> ℹ️ *Grounded in current task context:* **${contextPayload.jiraIssueKey}** (${contextPayload.jiraTaskTitle || 'Active Task'}).`);
    }

    // Construct unique citations list
    const seenDocs = new Set();
    const citations = [];

    evidenceChunks.forEach((c) => {
      const citeKey = `${c.documentName}-${c.section}`;
      if (!seenDocs.has(citeKey)) {
        seenDocs.add(citeKey);
        citations.push({
          documentId: c.documentId,
          documentName: c.documentName,
          version: c.version || '1.0',
          section: c.section,
          heading: c.heading,
          page: c.page || 1,
          sourceUrl: c.sourceUrl || '',
          sourceType: c.sourceType || 'DOCUMENT',
          relevanceScore: c.relevanceScore,
          parentDocumentId: c.parentDocumentId,
          parentSourceUrl: c.parentSourceUrl,
        });
      }
    });

    return {
      answerText: answerSections.join('\n'),
      citations,
      modelUsed: 'Mock Grounded Synthesizer v2.0 (Grounded in Chunks)',
      noAnswer: false,
    };
  }
}

/**
 * GeminiLLMProvider
 * Uses Google Gemini API with system prompt strictly forbidding hallucination.
 */
export class GeminiLLMProvider extends LLMProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey || (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GEMINI_API_KEY : '');
  }

  async generateAnswer(userQuestion, evidenceChunks = [], contextPayload = {}) {
    if (!this.apiKey) {
      // Fallback to Mock if no key provided
      const mock = new MockLLMProvider();
      return mock.generateAnswer(userQuestion, evidenceChunks, contextPayload);
    }

    if (!evidenceChunks || evidenceChunks.length === 0) {
      return {
        answerText: `⚠️ **No supported answer found.**\n\nI couldn't find sufficient information for this question in the approved ERP knowledge sources for ${contextPayload.erp || 'the selected ERP'}.`,
        citations: [],
        modelUsed: 'Gemini-1.5-Flash (Zero Evidence)',
        noAnswer: true,
      };
    }

    const evidenceText = evidenceChunks
      .map(
        (c, idx) =>
          `[Source ${idx + 1}] Document: ${c.documentName} | Version: ${c.version || '1.0'} | Section: ${c.section} | Page: ${c.page}\nURL: ${c.sourceUrl || 'N/A'}\n${c.content}\n`
      )
      .join('\n---\n');

    const systemPrompt = `You are the ERP Developer Brain technical knowledge assistant.
Your sole job is to answer the developer's technical question using ONLY the retrieved evidence provided below.
Rules:
1. Do NOT hallucinate or guess any technical facts, configuration keys, or server values not present in the evidence.
2. If the evidence does not contain sufficient details to answer, reply strictly with: "⚠️ No supported answer found." followed by an explanation of what is missing.
3. Explicitly cite your sources using bracketed references like [Source 1], [Source 2] with document name and section.
4. Keep the tone technical, concise, and structured for an ERP integration engineer.`;

    const userPrompt = `Context: ERP = ${contextPayload.erp || 'N/A'}, Customer = ${contextPayload.customerName || 'N/A'}, Task = ${contextPayload.jiraIssueKey || 'N/A'}

Retrieved Evidence:
${evidenceText}

Developer Question: ${userQuestion}`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          }),
        }
      );

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('Invalid response payload from Gemini API');
      }

      const citations = evidenceChunks.map((c) => ({
        documentId: c.documentId,
        documentName: c.documentName,
        version: c.version || '1.0',
        section: c.section,
        heading: c.heading,
        page: c.page || 1,
        sourceUrl: c.sourceUrl,
        sourceType: c.sourceType,
      }));

      return {
        answerText: generatedText,
        citations,
        modelUsed: 'Gemini 1.5 Flash (Live Grounded)',
        noAnswer: generatedText.includes('No supported answer found'),
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to grounded mock synthesizer:', err);
      const fallback = new MockLLMProvider();
      return fallback.generateAnswer(userQuestion, evidenceChunks, contextPayload);
    }
  }
}

/**
 * GroqLLMProvider
 * Uses high-speed inference via Groq's OpenAI-compatible endpoint.
 * Default model: openai/gpt-oss-120b
 */
export class GroqLLMProvider extends LLMProvider {
  constructor(apiKey, model) {
    super();
    this.apiKey =
      apiKey ||
      (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GROQ_API_KEY : '') ||
      (typeof process !== 'undefined' ? process.env?.VITE_GROQ_API_KEY : '') ||
      '';
    this.model =
      model ||
      (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GROQ_MODEL : '') ||
      (typeof process !== 'undefined' ? process.env?.VITE_GROQ_MODEL : '') ||
      'openai/gpt-oss-120b';
  }

  async generateAnswer(userQuestion, evidenceChunks = [], contextPayload = {}) {
    if (!this.apiKey) {
      const mock = new MockLLMProvider();
      return mock.generateAnswer(userQuestion, evidenceChunks, contextPayload);
    }

    if (!evidenceChunks || evidenceChunks.length === 0) {
      return {
        answerText: `⚠️ **No supported answer found.**\n\nI couldn't find sufficient information for this question in the approved ERP knowledge sources for ${contextPayload.erp || 'the selected ERP'}.\n\nPlease verify that the relevant integration playbook or technical guide has been ingested in **Settings & Sync > ERP Knowledge Base**.`,
        citations: [],
        modelUsed: `Groq (${this.model}) - Zero Evidence`,
        noAnswer: true,
      };
    }

    const evidenceText = evidenceChunks
      .map(
        (c, idx) =>
          `[Source ${idx + 1}] Document: ${c.documentName} | Version: ${c.version || '1.0'} | Section: ${c.section} | Page: ${c.page}\nURL: ${c.sourceUrl || 'N/A'}\n${c.content}\n`
      )
      .join('\n---\n');

    const systemPrompt = `You are the ERP Developer Brain technical knowledge assistant.
Your sole job is to answer the developer's technical question using ONLY the retrieved evidence provided below.
Rules:
1. Do NOT hallucinate or invent any technical parameters, commands, or configurations not present in the evidence.
2. If the evidence does NOT provide sufficient information to answer the question, you MUST start your response with: "⚠️ **No supported answer found.**" and explain that the approved documentation does not contain this information.
3. Explicitly cite your sources using bracketed references like [Source 1], [Source 2] with document name and section.
4. Keep the tone technical, clear, and structured for an ERP developer.`;

    const userPrompt = `Context: ERP = ${contextPayload.erp || 'N/A'}, Customer = ${contextPayload.customerName || 'N/A'}, Task = ${contextPayload.jiraIssueKey || 'N/A'}

Retrieved Evidence:
${evidenceText}

Developer Question: ${userQuestion}`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 1500,
        }),
      });

      const data = await response.json();
      const generatedText = data?.choices?.[0]?.message?.content;

      if (!generatedText) {
        throw new Error(data?.error?.message || 'Invalid response payload from Groq API');
      }

      const seenDocs = new Set();
      const citations = [];
      evidenceChunks.forEach((c) => {
        const citeKey = `${c.documentName}-${c.section}`;
        if (!seenDocs.has(citeKey)) {
          seenDocs.add(citeKey);
          citations.push({
            documentId: c.documentId,
            documentName: c.documentName,
            version: c.version || '1.0',
            section: c.section,
            heading: c.heading,
            page: c.page || 1,
            sourceUrl: c.sourceUrl || '',
            sourceType: c.sourceType || 'DOCUMENT',
            relevanceScore: c.relevanceScore,
            parentDocumentId: c.parentDocumentId,
            parentSourceUrl: c.parentSourceUrl,
          });
        }
      });

      const isNoAnswer = generatedText.includes('No supported answer found') || generatedText.includes('⚠️');

      return {
        answerText: generatedText,
        citations,
        modelUsed: `Groq (${this.model})`,
        noAnswer: isNoAnswer,
      };
    } catch (err) {
      console.warn('Groq API call failed, falling back to grounded mock synthesizer:', err);
      const fallback = new MockLLMProvider();
      return fallback.generateAnswer(userQuestion, evidenceChunks, contextPayload);
    }
  }
}
