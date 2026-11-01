/**
 * Domain layer: turns raw GitHub API repositories into Project objects.
 * Pure functions only — no network, no DOM — so everything here is unit-testable.
 */

/**
 * @typedef {Object} Project
 * @property {string}   name
 * @property {string}   title        Human-friendly name ("my-cool-app" → "My Cool App")
 * @property {string}   description
 * @property {string}   liveUrl      Where the GitHub Pages site lives
 * @property {string}   sourceUrl    Repository on GitHub
 * @property {?string}  language
 * @property {string[]} topics
 * @property {number}   stars
 * @property {Date}     updatedAt
 */

/** "my-cool_app" → "My Cool App" */
export function toTitle(repoName) {
  return repoName
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

/** Prefers the repo's "homepage" field when it is set, otherwise the default Pages URL. */
export function pagesUrlFor(repo, user) {
  const homepage = repo.homepage?.trim();
  if (homepage) return homepage;
  return `https://${user.toLowerCase()}.github.io/${repo.name}/`;
}

/** @returns {Project} */
export function toProject(repo, user) {
  return {
    name: repo.name,
    title: toTitle(repo.name),
    description: repo.description ?? '',
    liveUrl: pagesUrlFor(repo, user),
    sourceUrl: repo.html_url,
    language: repo.language ?? null,
    topics: repo.topics ?? [],
    stars: repo.stargazers_count ?? 0,
    updatedAt: new Date(repo.pushed_at),
  };
}

/** Builds the predicate that decides which repositories belong in the portfolio. */
export function isPublishedProject({ excludedRepos, includeForks }) {
  const excluded = new Set(excludedRepos.map((n) => n.toLowerCase()));
  return (repo) =>
    repo.has_pages === true &&
    !repo.archived &&
    (includeForks || !repo.fork) &&
    !excluded.has(repo.name.toLowerCase());
}

/** Most recently updated first. */
export const byMostRecent = (a, b) => b.updatedAt - a.updatedAt;

/** Case-insensitive search over title, description, language and topics. */
export function matchesQuery(project, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [project.title, project.description, project.language ?? '', ...project.topics]
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

/** Full pipeline: raw API repos → filtered, mapped, sorted projects. */
export function buildPortfolio(repos, options) {
  return repos
    .filter(isPublishedProject(options))
    .map((repo) => toProject(repo, options.githubUser))
    .sort(byMostRecent);
}
