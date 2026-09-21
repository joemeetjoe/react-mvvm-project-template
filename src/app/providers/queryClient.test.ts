import { describe, expect, it } from 'vitest';

import { queryClient } from './queryClient';

describe('queryClient', () => {
  it('keeps fetched data fresh for a minute and does not refetch on window focus', () => {
    const { queries } = queryClient.getDefaultOptions();

    expect(queries?.staleTime).toBe(60_000);
    expect(queries?.refetchOnWindowFocus).toBe(false);
  });
});
