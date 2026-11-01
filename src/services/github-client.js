/**
 * Infrastructure layer: talks to the GitHub REST API.
 * Knows nothing about the DOM or about what a "project" is.
 */
const API_BASE = 'https://api.github.com';
const PAGE_SIZE = 100;

export class GitHubApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
  }
}

export class GitHubClient {
  /**
   * @param {Object} deps
   * @param {typeof fetch} [deps.fetchFn] Injected so tests can stub the network.
   */
  constructor({ fetchFn = globalThis.fetch.bind(globalThis) } = {}) {
    this.fetchFn = fetchFn;
  }

  /** Returns every public repository of a user, following pagination. */
  async listUserRepos(user) {
    const all = [];
    for (let page = 1; ; page++) {
      const batch = await this.#get(
        `/users/${encodeURIComponent(user)}/repos?per_page=${PAGE_SIZE}&page=${page}&sort=pushed`,
      );
      all.push(...batch);
      if (batch.length < PAGE_SIZE) return all;
    }
  }

  async #get(path) {
    const response = await this.fetchFn(`${API_BASE}${path}`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) {
      const reason =
        response.status === 403
          ? 'GitHub rate limit reached — please try again in a few minutes.'
          : `GitHub API responded with ${response.status}.`;
      throw new GitHubApiError(reason, response.status);
    }
    return response.json();
  }
}
