/**
 * Site configuration — the only file you should need to edit.
 */
export const config = Object.freeze({
  githubUser: 'alessiogs',
  ownerName: 'Alessio Soggiu',
  tagline: 'Projects I have built and published on GitHub Pages.',

  /** Repositories never shown, even if they have Pages enabled. */
  excludedRepos: ['alessiogs.github.io', 'projects', 'portfolio'],

  /** Hide forks of other people's work. */
  includeForks: false,

  /** Cache API results to stay well under GitHub's 60 req/hour anonymous limit. */
  cacheTtlMinutes: 30,
});
