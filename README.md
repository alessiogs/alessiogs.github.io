# alessiogs.github.io — portfolio

A static portfolio page that lists every repository of
[@alessiogs](https://github.com/alessiogs) that is published on **GitHub Pages**.

The list is built live from the public GitHub API, so a new project appears
automatically as soon as Pages is enabled on its repository — no rebuild needed.

## Architecture

Plain HTML/CSS and native ES modules: no framework, no build step.
The code follows a layered, dependency-injected structure:

```
index.html                    Page shell
styles/main.css               Design tokens + components (light & dark)
src/
  config.js                   ← the only file you normally edit
  main.js                     Composition root: wires everything together
  domain/project.js           Pure rules: filter, map, sort, search (no I/O)
  services/github-client.js   GitHub REST API access (pagination, errors)
  services/cache.js           TTL cache over localStorage
  services/project-repository.js  Combines client + cache + domain rules
  ui/views.js                 DOM builders (safe: textContent, no innerHTML)
  ui/portfolio-controller.js  Page state + search + rendering
tests/project.test.js         Unit tests (node:test)
```

Principles applied: single responsibility per module, pure domain functions,
dependencies injected through constructors (easy to stub in tests), one
composition root, and no hard-coded values outside `config.js`.

## Which repositories are shown

A repository is listed when it:

- has GitHub Pages enabled,
- is not archived and not a fork (configurable),
- is not in `excludedRepos` in `src/config.js`.

The **Open site** link uses the repository's *Website* field if set,
otherwise `https://alessiogs.github.io/<repo>/`. Set a description and topics
on each repo to make its card richer.

## Run locally

```bash
npm run serve   # then open the printed URL
npm test        # requires Node 18+
```

## Publish

This repository is meant to be named **`alessiogs.github.io`**, so GitHub
serves it at the root URL `https://alessiogs.github.io/`.

1. Rename the repo: **Settings → General → Repository name** →
   `alessiogs.github.io` (GitHub redirects the old name automatically).
2. Push to `main`.
3. **Settings → Pages → Build and deployment**: Source *Deploy from a branch*,
   branch `main`, folder `/ (root)`.

Under any other name (e.g. `projects`) the page still works, but at
`https://alessiogs.github.io/<repo-name>/` instead of the root.
