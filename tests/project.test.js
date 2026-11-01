import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPortfolio,
  matchesQuery,
  pagesUrlFor,
  toProject,
  toTitle,
} from '../src/domain/project.js';
import { ProjectRepository } from '../src/services/project-repository.js';
import { TtlCache } from '../src/services/cache.js';

const repo = (overrides = {}) => ({
  name: 'my-app',
  description: 'A demo',
  homepage: '',
  html_url: 'https://github.com/alessiogs/my-app',
  language: 'JavaScript',
  topics: ['demo'],
  stargazers_count: 3,
  pushed_at: '2026-01-01T00:00:00Z',
  has_pages: true,
  fork: false,
  archived: false,
  ...overrides,
});

const options = { githubUser: 'AlessioGS', excludedRepos: ['projects'], includeForks: false };

test('toTitle humanises repo names', () => {
  assert.equal(toTitle('my-cool_app'), 'My Cool App');
});

test('pagesUrlFor uses homepage when set, default Pages URL otherwise', () => {
  assert.equal(pagesUrlFor(repo({ homepage: 'https://x.dev' }), 'u'), 'https://x.dev');
  assert.equal(pagesUrlFor(repo(), 'AlessioGS'), 'https://alessiogs.github.io/my-app/');
});

test('buildPortfolio keeps only published, non-fork, non-excluded repos, newest first', () => {
  const result = buildPortfolio(
    [
      repo({ name: 'old', pushed_at: '2025-01-01T00:00:00Z' }),
      repo({ name: 'new', pushed_at: '2026-06-01T00:00:00Z' }),
      repo({ name: 'no-pages', has_pages: false }),
      repo({ name: 'forked', fork: true }),
      repo({ name: 'archived', archived: true }),
      repo({ name: 'Projects' }),
    ],
    options,
  );
  assert.deepEqual(result.map((p) => p.name), ['new', 'old']);
});

test('matchesQuery searches title, description, language and topics', () => {
  const project = toProject(repo(), 'u');
  assert.ok(matchesQuery(project, 'DEMO'));
  assert.ok(matchesQuery(project, 'javascript'));
  assert.ok(matchesQuery(project, '  '));
  assert.ok(!matchesQuery(project, 'python'));
});

test('ProjectRepository caches API results', async () => {
  let calls = 0;
  const client = { listUserRepos: async () => (calls++, [repo()]) };
  const store = new Map();
  const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  const cache = new TtlCache({ ttlMs: 60_000, storage });
  const repository = new ProjectRepository({ client, cache, options });

  await repository.getProjects();
  const projects = await repository.getProjects();

  assert.equal(calls, 1);
  assert.equal(projects[0].title, 'My App');
});
