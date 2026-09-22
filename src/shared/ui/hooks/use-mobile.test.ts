import { afterEach, describe, expect, it } from 'vitest';

import { act, renderHook, waitFor } from '@/shared/testing/render';

import { useIsMobile } from './use-mobile';

const originalMatchMedia = window.matchMedia;
const originalInnerWidth = window.innerWidth;

/** Replaces the global stub with one whose `change` listeners can be fired. */
const installControllableMatchMedia = (): (() => void) => {
  const listeners = new Set<() => void>();

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: window.innerWidth < 768,
        media: query,
        onchange: null,
        addEventListener: (_event: string, listener: () => void): void => {
          listeners.add(listener);
        },
        removeEventListener: (_event: string, listener: () => void): void => {
          listeners.delete(listener);
        },
        dispatchEvent: (): boolean => false,
      }) as unknown as MediaQueryList,
  });

  return (): void => {
    listeners.forEach((listener) => listener());
  };
};

const setViewportWidth = (width: number): void => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
};

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: originalMatchMedia,
  });
  setViewportWidth(originalInnerWidth);
});

describe('useIsMobile', () => {
  it('is true when the viewport is narrower than the mobile breakpoint', async () => {
    installControllableMatchMedia();
    setViewportWidth(500);

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => expect(result.current).toBe(true));
  });

  it('is false when the viewport is at least as wide as the breakpoint', async () => {
    installControllableMatchMedia();
    setViewportWidth(1024);

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => expect(result.current).toBe(false));
  });

  it('follows the media query when the viewport changes', async () => {
    const fireChange = installControllableMatchMedia();
    setViewportWidth(1024);

    const { result } = renderHook(() => useIsMobile());

    await waitFor(() => expect(result.current).toBe(false));

    setViewportWidth(400);
    act(() => {
      fireChange();
    });

    await waitFor(() => expect(result.current).toBe(true));
  });
});
