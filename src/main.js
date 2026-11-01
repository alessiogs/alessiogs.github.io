/**
 * Composition root: the only place where concrete classes are wired together.
 */
import { config } from './config.js';
import { TtlCache } from './services/cache.js';
import { GitHubClient } from './services/github-client.js';
import { ProjectRepository } from './services/project-repository.js';
import { PortfolioController } from './ui/portfolio-controller.js';

function bootstrap() {
  document.querySelector('[data-owner]').textContent = config.ownerName;
  document.querySelector('[data-tagline]').textContent = config.tagline;
  const profile = document.querySelector('[data-profile]');
  profile.href = `https://github.com/${config.githubUser}`;
  document.querySelector('[data-year]').textContent = new Date().getFullYear();

  const repository = new ProjectRepository({
    client: new GitHubClient(),
    cache: new TtlCache({ ttlMs: config.cacheTtlMinutes * 60_000 }),
    options: config,
  });

  new PortfolioController({
    repository,
    elements: {
      list: document.querySelector('[data-projects]'),
      search: document.querySelector('[data-search]'),
      count: document.querySelector('[data-count]'),
    },
  }).start();
}

bootstrap();
