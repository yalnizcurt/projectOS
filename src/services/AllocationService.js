/**
 * Resource Allocation & Reallocation Service
 * Handles developer assignments, capacity validation, and reallocation impact simulation.
 * Ref: PRD Section 20 & 21
 */

export class AllocationService {
  /**
   * Simulates the capacity impact before applying an allocation change
   */
  static previewAllocationImpact(developer, allocations, weekIndex, newAllocationPct) {
    const devAllocs = allocations.filter(
      (a) => a.developerId === developer.id && a.weekIndex === weekIndex
    );
    const currentTotalPct = devAllocs.reduce((s, a) => s + (a.allocationPct || 0), 0);
    const projectedTotalPct = currentTotalPct + Number(newAllocationPct);

    const currentHours = (currentTotalPct / 100) * developer.weeklyCapacityHours;
    const projectedHours = (projectedTotalPct / 100) * developer.weeklyCapacityHours;

    return {
      currentTotalPct,
      projectedTotalPct,
      currentHours,
      projectedHours,
      availableHoursRemaining: Math.max(0, developer.weeklyCapacityHours - projectedHours),
      willBeOverallocated: projectedTotalPct > 100,
      overtimeHours: Math.max(0, projectedHours - developer.weeklyCapacityHours),
    };
  }

  /**
   * Finds alternative developers with available bandwidth for a specific week
   */
  static findAvailableCandidates(developers, allocations, weekIndex, requiredPct = 30) {
    return developers
      .map((dev) => {
        const weekAllocs = allocations.filter(
          (a) => a.developerId === dev.id && a.weekIndex === weekIndex
        );
        const currentPct = weekAllocs.reduce((s, a) => s + (a.allocationPct || 0), 0);
        const availablePct = Math.max(0, 100 - currentPct);
        const availableHours = (availablePct / 100) * dev.weeklyCapacityHours;

        return {
          developer: dev,
          currentPct,
          availablePct,
          availableHours,
          canAccommodate: availablePct >= requiredPct,
        };
      })
      .sort((a, b) => b.availablePct - a.availablePct);
  }
}
