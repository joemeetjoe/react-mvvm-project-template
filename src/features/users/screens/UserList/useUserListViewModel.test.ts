import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { renderHook, waitFor } from '@/shared/testing/render';
import { server } from '@/shared/testing/server';

import { userFixtures } from '../../data-layer/entities/user/userFixtures';
import { useUserListViewModel } from './useUserListViewModel';

describe('useUserListViewModel', () => {
  it('turns the users the API returns into the View props', async () => {
    const { result } = renderHook(() => useUserListViewModel());

    await waitFor(() => {
      expect(result.current?.users).toEqual(userFixtures);
    });
  });

  it('produces an empty users list when the API returns no users', async () => {
    server.use(http.get('*/api/users', () => HttpResponse.json([])));

    const { result } = renderHook(() => useUserListViewModel());

    await waitFor(() => {
      expect(result.current?.users).toEqual([]);
    });
  });
});
