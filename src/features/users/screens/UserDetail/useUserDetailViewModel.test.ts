import { describe, expect, it } from 'vitest';

import { renderHook, waitFor } from '@/shared/testing/render';

import { userFixtures } from '../../data-layer/entities/user/userFixtures';
import { useUserDetailViewModel } from './useUserDetailViewModel';

describe('useUserDetailViewModel', () => {
  it("turns the user the API returns into the View's title and sections", async () => {
    const [user] = userFixtures;
    const { result } = renderHook(() => useUserDetailViewModel(user.id));

    await waitFor(() => {
      expect(result.current?.title).toBe(`${user.firstName} ${user.lastName}`);
    });

    const sections = result.current?.sections ?? [];
    const fields = sections.flatMap((section) => section.fields);

    expect(fields).toContainEqual({ id: 'email', label: 'Email', value: user.email });
    expect(fields).toContainEqual({ id: 'department', label: 'Department', value: user.department });
    expect(fields).toContainEqual({ id: 'role', label: 'Role', value: user.role });
    expect(fields).toContainEqual({ id: 'status', label: 'Status', value: user.status });
    expect(fields).toContainEqual({ id: 'id', label: 'User ID', value: user.id });
  });

  it('formats the created and updated dates as plain dates', async () => {
    const [user] = userFixtures;
    const { result } = renderHook(() => useUserDetailViewModel(user.id));

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    const fields = (result.current?.sections ?? []).flatMap((section) => section.fields);

    expect(fields).toContainEqual({ id: 'createdAt', label: 'Created', value: '2024-01-15' });
    expect(fields).toContainEqual({ id: 'updatedAt', label: 'Last Updated', value: '2024-11-20' });
  });

  it('provides an onBack handler', async () => {
    const [user] = userFixtures;
    const { result } = renderHook(() => useUserDetailViewModel(user.id));

    await waitFor(() => {
      expect(result.current?.onBack).toBeInstanceOf(Function);
    });
  });
});
