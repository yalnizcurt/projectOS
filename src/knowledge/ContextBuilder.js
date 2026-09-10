/**
 * Context Builder Engine
 * Complies with statement2 §34, §35 (Contextual metadata vs documented knowledge boundary).
 * Prepares verified contextual envelope from Developer Workspace or Project Detail.
 */

export class ContextBuilder {
  /**
   * Constructs contextual prompt envelope without hallucinating technical facts
   * @param {Object} contextParams
   * @returns {Object} Structured context payload
   */
  static build(contextParams = {}) {
    const {
      erp = null,
      customer = null,
      project = null,
      jiraTask = null,
      developer = null,
      conversationHistory = [],
    } = contextParams;

    const summaryParts = [];
    if (erp) summaryParts.push(`ERP: ${erp}`);
    if (customer?.name) summaryParts.push(`Customer: ${customer.name}`);
    if (project?.name) summaryParts.push(`Project: ${project.name}`);
    if (jiraTask?.jiraIssueKey) {
      summaryParts.push(`Jira Task: ${jiraTask.jiraIssueKey} (${jiraTask.title})`);
    }

    return {
      erp,
      customerId: customer?.id || null,
      customerName: customer?.name || null,
      projectId: project?.id || null,
      projectName: project?.name || null,
      jiraIssueKey: jiraTask?.jiraIssueKey || null,
      jiraTaskTitle: jiraTask?.title || null,
      developerName: developer?.name || null,
      developerRole: developer?.role || null,
      contextSummary: summaryParts.join(' · '),
      conversationHistory: conversationHistory.slice(-6), // Recent turns
    };
  }
}
