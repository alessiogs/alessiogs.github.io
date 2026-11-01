/**
 * Controller: owns page state (projects + search query) and re-renders on change.
 * One-way flow: event → update state → render.
 */
import { matchesQuery } from '../domain/project.js';
import { message, projectGrid } from './views.js';

export class PortfolioController {
  #projects = [];
  #query = '';

  /**
   * @param {Object} deps
   * @param {import('../services/project-repository.js').ProjectRepository} deps.repository
   * @param {{ list: HTMLElement, search: HTMLInputElement, count: HTMLElement }} deps.elements
   */
  constructor({ repository, elements }) {
    this.repository = repository;
    this.elements = elements;
  }

  async start() {
    this.elements.search.addEventListener('input', (event) => {
      this.#query = event.target.value;
      this.#render();
    });

    this.#show(message('Loading projects…'));
    try {
      this.#projects = await this.repository.getProjects();
      this.elements.search.disabled = this.#projects.length === 0;
      this.#render();
    } catch (error) {
      console.error(error);
      this.#show(message(error.message || 'Could not load projects.', 'error'));
    }
  }

  #render() {
    const visible = this.#projects.filter((p) => matchesQuery(p, this.#query));
    this.elements.count.textContent = `${visible.length} of ${this.#projects.length} projects`;

    if (this.#projects.length === 0) return this.#show(message('No published projects yet.'));
    if (visible.length === 0) return this.#show(message(`Nothing matches “${this.#query}”.`));
    this.#show(projectGrid(visible));
  }

  #show(node) {
    this.elements.list.replaceChildren(node);
  }
}
