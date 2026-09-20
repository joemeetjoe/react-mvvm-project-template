/**
 * Node exposes a `localStorage` global that shadows jsdom's and throws on every
 * method unless the process was started with `--localstorage-file`. Anything
 * that persists (the session store) needs a working one, so install an
 * in-memory replacement when the ambient global is unusable.
 */
const createMemoryStorage = (): Storage => {
  const entries = new Map<string, string>();

  return {
    get length(): number {
      return entries.size;
    },
    key: (index: number): string | null => [...entries.keys()][index] ?? null,
    getItem: (key: string): string | null => entries.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      entries.set(key, String(value));
    },
    removeItem: (key: string): void => {
      entries.delete(key);
    },
    clear: (): void => {
      entries.clear();
    },
  };
};

export const installMemoryLocalStorage = (): void => {
  if (typeof globalThis.localStorage?.setItem === 'function') {
    return;
  }

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: createMemoryStorage(),
  });
};

export const clearLocalStorage = (): void => {
  globalThis.localStorage?.clear();
};
