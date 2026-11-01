/**
 * Small TTL cache over a Storage-like object (localStorage by default).
 * Storage failures (private mode, quota, disabled) are swallowed: caching is an
 * optimisation, never a requirement.
 */
export class TtlCache {
  /**
   * @param {Object} opts
   * @param {number} opts.ttlMs
   * @param {Storage} [opts.storage]
   * @param {() => number} [opts.now]
   */
  constructor({ ttlMs, storage = safeLocalStorage(), now = Date.now }) {
    this.ttlMs = ttlMs;
    this.storage = storage;
    this.now = now;
  }

  get(key) {
    try {
      const entry = JSON.parse(this.storage?.getItem(key) ?? 'null');
      if (!entry || this.now() - entry.savedAt > this.ttlMs) return null;
      return entry.value;
    } catch {
      return null;
    }
  }

  set(key, value) {
    try {
      this.storage?.setItem(key, JSON.stringify({ savedAt: this.now(), value }));
    } catch {
      /* ignore */
    }
  }

  /** Returns the cached value, or computes, stores and returns a fresh one. */
  async getOrLoad(key, loader) {
    const cached = this.get(key);
    if (cached) return cached;
    const fresh = await loader();
    this.set(key, fresh);
    return fresh;
  }
}

function safeLocalStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
