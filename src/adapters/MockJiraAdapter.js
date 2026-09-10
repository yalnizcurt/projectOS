/**
 * Mock Jira Integration Adapter
 * Simulates Jira Cloud REST APIs and Webhook events for bidirectional synchronization.
 * Ref: PRD Section 14, 15, 38 & 39
 */

export class MockJiraAdapter {
  constructor(initialTasks = []) {
    // In-memory simulation of Jira issue storage
    this.jiraDatabase = new Map();
    this.syncHistory = [];
    this.isSyncing = false;
  }

  initializeWithTasks(tasks) {
    tasks.forEach((t) => {
      this.jiraDatabase.set(t.jiraIssueKey, {
        key: t.jiraIssueKey,
        summary: t.title,
        status: t.status,
        priority: t.priority,
        assigneeId: t.developerId,
        originalEstimateHours: t.estimatedHours,
        remainingEstimateHours: t.remainingHours,
        loggedHours: t.loggedHours || 0,
        projectId: t.projectId,
        lastUpdated: new Date().toISOString(),
      });
    });
  }

  /**
   * Simulates a developer moving a ticket on the Jira Kanban/Sprint board
   */
  simulateJiraUpdate(issueKey, updates) {
    const issue = this.jiraDatabase.get(issueKey);
    if (!issue) {
      throw new Error(`Issue ${issueKey} does not exist in Jira`);
    }

    const updatedIssue = {
      ...issue,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    this.jiraDatabase.set(issueKey, updatedIssue);

    const syncEvent = {
      id: `sync-${Date.now()}`,
      timestamp: new Date().toISOString(),
      direction: 'JIRA_TO_CT',
      issueKey,
      changes: updates,
      status: 'SUCCESS',
    };
    this.syncHistory.unshift(syncEvent);

    return updatedIssue;
  }

  /**
   * Pushes a new task created in Control Tower into the simulated Jira system
   */
  createIssueFromControlTower(taskData) {
    const issueKey = taskData.jiraIssueKey || `ERP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newIssue = {
      key: issueKey,
      summary: taskData.title,
      status: taskData.status || 'To Do',
      priority: taskData.priority || 'Medium',
      assigneeId: taskData.developerId,
      originalEstimateHours: taskData.estimatedHours || 16,
      remainingEstimateHours: taskData.remainingHours || 16,
      loggedHours: 0,
      projectId: taskData.projectId,
      lastUpdated: new Date().toISOString(),
    };
    this.jiraDatabase.set(issueKey, newIssue);

    this.syncHistory.unshift({
      id: `sync-${Date.now()}`,
      timestamp: new Date().toISOString(),
      direction: 'CT_TO_JIRA',
      issueKey,
      changes: { action: 'CREATED' },
      status: 'SUCCESS',
    });

    return newIssue;
  }

  /**
   * Simulates a bidirectional sync run
   */
  async performFullSync() {
    this.isSyncing = true;
    // Simulate minor network latency
    await new Promise((res) => setTimeout(res, 500));
    this.isSyncing = false;

    return {
      timestamp: new Date().toISOString(),
      syncedCount: this.jiraDatabase.size,
      conflicts: [],
      issues: Array.from(this.jiraDatabase.values()),
    };
  }

  getSyncHistory() {
    return this.syncHistory;
  }

  getAllJiraIssues() {
    return Array.from(this.jiraDatabase.values());
  }
}

export const mockJiraAdapter = new MockJiraAdapter();
