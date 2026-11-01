/**
 * Presentation layer: builds DOM nodes from projects.
 * Uses textContent / setAttribute only (never innerHTML with data) so repo
 * descriptions can't inject markup.
 */

/** Tiny element factory: el('a', { href, class: 'x' }, 'text', child) */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value !== null && value !== undefined && value !== false) node.setAttribute(name, value);
  }
  node.append(...children.filter((c) => c !== null && c !== undefined && c !== false));
  return node;
}

const dateFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short' });

export function projectCard(project) {
  const meta = el(
    'p',
    { class: 'card__meta' },
    project.language && el('span', { class: 'card__lang' }, project.language),
    el('time', { datetime: project.updatedAt.toISOString() }, `Updated ${dateFormat.format(project.updatedAt)}`),
  );

  const topics = project.topics.length
    ? el('ul', { class: 'card__topics', 'aria-label': 'Topics' }, ...project.topics.map((t) => el('li', {}, t)))
    : null;

  return el(
    'article',
    { class: 'card' },
    el('h2', { class: 'card__title' }, el('a', { href: project.liveUrl }, project.title)),
    el('p', { class: 'card__desc' }, project.description || 'No description yet.'),
    topics,
    meta,
    el(
      'div',
      { class: 'card__actions' },
      el('a', { class: 'btn btn--primary', href: project.liveUrl }, 'Open site'),
      el('a', { class: 'btn', href: project.sourceUrl }, 'Source'),
    ),
  );
}

export function projectGrid(projects) {
  return el('div', { class: 'grid' }, ...projects.map(projectCard));
}

export function message(text, variant = 'info') {
  return el('p', { class: `message message--${variant}`, role: variant === 'error' ? 'alert' : 'status' }, text);
}
