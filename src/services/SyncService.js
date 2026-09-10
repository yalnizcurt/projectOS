/**
 * Jira Synchronization Service
 * Coordinates bidirectional state transfer between Control Tower and Jira Adapter.
 * Ref: PRD Section 14, 15, 23 & 38
 */

import { mockJiraAdapter } from '../adapters/MockJiraAdapter';

export class SyncService {
  /**
   * Triggers full bidirectional sync
   */
  static async executeBidirectionalSync(dispatch, currentTasks) {
    dispatch({ type: 'START_JIRA_SYNC' });

    // Ensure mock Jira adapter has latest task representation
    mockJiraAdapter.initializeWithTasks(currentTasks);

    const result = await mockJiraAdapter.performFullSync();

    dispatch({
      type: 'COMPLETE_JIRA_SYNC',
      payload: result,
    });

    return result;
  }

  /**
   * Simulates an inbound Jira status update (e.g. from developer on Jira board)
   */
  static simulateInboundJiraEvent(dispatch, jiraIssueKey, newStatus, remainingHours) {
    mockJiraAdapter.simulateJiraUpdate(jiraIssueKey, {
      status: newStatus,
      remainingEstimateHours: remainingHours,
    });

    dispatch({
      type: 'SIMULATE_JIRA_TASK_UPDATE',
      payload: {
        jiraIssueKey,
        newStatus,
        remainingHours,
      },
    });
  }
}
