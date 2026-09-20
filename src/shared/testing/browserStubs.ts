/**
 * Browser APIs jsdom does not provide (or that Node shadows), stubbed once for
 * every test rather than mocked per test file.
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

/**
 * Node exposes a `localStorage` global that shadows jsdom's and whose methods
 * are missing unless the process was started with `--localstorage-file`.
 * Anything that persists (the session store) needs a working one.
 */
const installLocalStorage = (): void => {
  if (typeof globalThis.localStorage?.setItem === 'function') {
    return;
  }

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: createMemoryStorage(),
  });
};

/** jsdom ships no `matchMedia`; responsive layout components call it on mount. */
const installMatchMedia = (): void => {
  if (typeof window.matchMedia === 'function') {
    return;
  }

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  });
};

export const installBrowserStubs = (): void => {
  installLocalStorage();
  installMatchMedia();
};

export const resetBrowserStubs = (): void => {
  globalThis.localStorage?.clear();
};
