import { describe, expect, it } from 'vitest';

import { userHandlers } from '@/features/users/data-layer/entities/user/userHandlers';

import { handlers } from './handlers';

describe('handlers', () => {
  it('aggregates every feature entity handler for the dev-mode worker', () => {
    expect(handlers).toEqual([...userHandlers]);
  });
});
