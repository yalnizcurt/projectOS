/**
 * @interface DataAdapter
 * Defines the contract for all external and internal data providers.
 * Allows transparently swapping between MockData, Katalyt API, and real enterprise backends.
 */

export class AdapterInterface {
  async getCustomers() {
    throw new Error('Not implemented');
  }

  async getERPs() {
    throw new Error('Not implemented');
  }

  async getProjects() {
    throw new Error('Not implemented');
  }

  async getDevelopers() {
    throw new Error('Not implemented');
  }

  async getTasks(projectId = null) {
    throw new Error('Not implemented');
  }

  async getAllocations() {
    throw new Error('Not implemented');
  }

  async createProject(projectData) {
    throw new Error('Not implemented');
  }

  async updateProject(id, projectData) {
    throw new Error('Not implemented');
  }

  async syncJiraIssues() {
    throw new Error('Not implemented');
  }
}
