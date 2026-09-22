
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

/** Node's own `localStorage` global shadows jsdom's and lacks methods unless started with `--localstorage-file`. */
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

/** jsdom has no pointer capture or `scrollIntoView`; Radix Select calls both. */
const installPointerAndScrollStubs = (): void => {
  const proto = Element.prototype as Element & {
    hasPointerCapture?: (pointerId: number) => boolean;
    setPointerCapture?: (pointerId: number) => void;
    releasePointerCapture?: (pointerId: number) => void;
  };

  proto.hasPointerCapture ??= () => false;
  proto.setPointerCapture ??= () => undefined;
  proto.releasePointerCapture ??= () => undefined;
  proto.scrollIntoView ??= () => undefined;
};

export const installBrowserStubs = (): void => {
  installLocalStorage();
  installMatchMedia();
  installPointerAndScrollStubs();
};

export const resetBrowserStubs = (): void => {
  globalThis.localStorage?.clear();
};
