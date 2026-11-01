/**
 * Application service: the single entry point the UI uses to get projects.
 * Combines the API client, the cache and the domain rules (dependency injection
 * keeps each piece replaceable and testable).
 */
import { buildPortfolio } from '../domain/project.js';

export class ProjectRepository {
  /**
   * @param {Object} deps
   * @param {import('./github-client.js').GitHubClient} deps.client
   * @param {import('./cache.js').TtlCache} deps.cache
   * @param {Object} deps.options  Portfolio options (see config.js)
   */
  constructor({ client, cache, options }) {
    this.client = client;
    this.cache = cache;
    this.options = options;
  }

  /** @returns {Promise<import('../domain/project.js').Project[]>} */
  async getProjects() {
    const key = `portfolio:repos:${this.options.githubUser}`;
    const repos = await this.cache.getOrLoad(key, () =>
      this.client.listUserRepos(this.options.githubUser),
    );
    return buildPortfolio(repos, this.options);
  }
}
