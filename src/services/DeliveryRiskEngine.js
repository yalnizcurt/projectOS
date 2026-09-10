/**
 * Delivery Risk Engine (RAG)
 * Deterministic, rule-based operational status calculation.
 * Ref: PRD Section 17 & Principle 4
 */

export class DeliveryRiskEngine {
  /**
   * Calculates RAG status and human-readable explainable drivers for a project
   */
  static evaluateProjectRisk(project, developers, allocations, tasks) {
    const drivers = [];
    let severity = 'GREEN'; // 'GREEN' | 'AMBER' | 'RED'

    // 1. Commitment Date vs Planned Completion Date Check
    if (project.plannedCompletionDate && project.customerCommittedDate) {
      const plannedCompletion = new Date(project.plannedCompletionDate);
      const customerCommitment = new Date(project.customerCommittedDate);
      const diffDays = Math.round((plannedCompletion - customerCommitment) / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        severity = 'RED';
        drivers.push(
          `Schedule Breach: Planned completion (${project.plannedCompletionDate}) is ${diffDays} day(s) after customer Go-Live commitment (${project.customerCommittedDate}).`
        );
      } else if (diffDays >= -3) {
        if (severity !== 'RED') severity = 'AMBER';
        drivers.push(
          `Tight Timeline Buffer: Only ${Math.abs(diffDays)} calendar day buffer before customer Go-Live commitment.`
        );
      }
    }

    // 2. Developer Over-Allocation Check
    if (project.assignedDeveloperIds && project.assignedDeveloperIds.length > 0) {
      project.assignedDeveloperIds.forEach((devId) => {
        const dev = developers.find((d) => d.id === devId);
        if (!dev) return;

        // Check if this developer is overallocated in any week
        const devAllocs = allocations.filter((a) => a.developerId === devId);
        const weeklyPcts = {};
        devAllocs.forEach((a) => {
          weeklyPcts[a.weekIndex] = (weeklyPcts[a.weekIndex] || 0) + (a.allocationPct || 0);
        });

        const overallocatedWeeks = Object.entries(weeklyPcts).filter(([_, pct]) => pct > 100);
        if (overallocatedWeeks.length > 0) {
          severity = 'RED';
          const weekStr = overallocatedWeeks.map(([w, pct]) => `Week ${w} (${pct}%)`).join(', ');
          drivers.push(`Assigned developer ${dev.name} is overallocated in ${weekStr}.`);
        }
      });
    } else {
      severity = 'RED';
      drivers.push('Resource Deficit: No ERP developers are currently assigned to this project.');
    }

    // 3. Non-standard Scope Delta Impact
    if (project.isNonStandard && project.additionalEffortDays > 0) {
      const deltaRatio = project.additionalEffortDays / (project.baseEffortDays || 1);
      if (deltaRatio >= 0.4) {
        if (severity === 'GREEN') severity = 'AMBER';
        drivers.push(
          `High Non-Standard Delta: Additional custom development effort (+${project.additionalEffortDays}d) represents ${Math.round(deltaRatio * 100)}% extra scope beyond standard integration.`
        );
      }
    }

    // 4. Incomplete Work vs Remaining Days
    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    const remainingTaskHours = projectTasks.reduce((acc, t) => acc + (t.remainingHours || 0), 0);
    const assignedDevCount = project.assignedDeveloperIds?.length || 1;
    const estimatedWorkingHoursRemaining = (project.remainingDays || 0) * 8 * assignedDevCount;

    if (project.status === 'In Progress' && remainingTaskHours > estimatedWorkingHoursRemaining) {
      severity = 'RED';
      drivers.push(
        `Workload Deficit: Remaining task work (${remainingTaskHours}h) exceeds available developer working hours (${estimatedWorkingHoursRemaining}h) before scheduled completion.`
      );
    }

    // 5. Blocked Status
    if (project.status === 'Blocked') {
      severity = 'RED';
      drivers.push('Execution Blocked: Project is flagged as blocked due to unresolved technical or client dependencies.');
    }

    // Default healthy explanation if empty
    if (drivers.length === 0) {
      drivers.push('Schedule and capacity allocations are healthy with sufficient buffer before customer Go-Live.');
    }

    return {
      rag: severity,
      ragDrivers: drivers,
    };
  }
}
