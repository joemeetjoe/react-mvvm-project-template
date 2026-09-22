import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';

import { act, renderHook, waitFor } from '@/shared/testing/render';
import { server } from '@/shared/testing/server';

import { userFixtures } from '../../data-layer/entities/user/userFixtures';
import { resetUserFixtures } from '../../data-layer/entities/user/userHandlers';
import { useUserDetailViewModel } from './useUserDetailViewModel';

describe('useUserDetailViewModel', () => {
  afterEach(() => {
    resetUserFixtures();
  });

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

  it('offers every known role and status as edit options', async () => {
    const [user] = userFixtures;
    const { result } = renderHook(() => useUserDetailViewModel(user.id));

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current?.roleOptions).toEqual(['admin', 'user', 'manager', 'editor', 'viewer']);
    expect(result.current?.statusOptions).toEqual(['active', 'inactive', 'pending']);
  });

  it('saves a changed role as the parsed enum value', async () => {
    const [user] = userFixtures;
    const { result } = renderHook(() => useUserDetailViewModel(user.id));

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    act(() => {
      result.current?.onEdit();
    });

    await waitFor(() => {
      expect(result.current?.isEditing).toBe(true);
    });

    act(() => {
      result.current?.form.setFieldValue('role', 'viewer');
    });

    await act(async () => {
      await result.current?.form.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current?.isEditing).toBe(false);
    });

    const fields = (result.current?.sections ?? []).flatMap((section) => section.fields);

    expect(fields).toContainEqual({ id: 'role', label: 'Role', value: 'viewer' });
  });

  it('provides an onBack handler', async () => {
    const [user] = userFixtures;
    const { result } = renderHook(() => useUserDetailViewModel(user.id));

    await waitFor(() => {
      expect(result.current?.onBack).toBeInstanceOf(Function);
    });
  });

  it('starts out of edit mode', async () => {
    const [user] = userFixtures;
    const { result } = renderHook(() => useUserDetailViewModel(user.id));

    await waitFor(() => {
      expect(result.current?.isEditing).toBe(false);
    });
  });

  it('enters edit mode when onEdit is called', async () => {
    const [user] = userFixtures;
    const { result } = renderHook(() => useUserDetailViewModel(user.id));

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    act(() => {
      result.current?.onEdit();
    });

    await waitFor(() => {
      expect(result.current?.isEditing).toBe(true);
    });
  });

  it('discards the draft and leaves edit mode when onCancel is called', async () => {
    const [user] = userFixtures;
    const { result } = renderHook(() => useUserDetailViewModel(user.id));

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    act(() => {
      result.current?.onEdit();
    });

    await waitFor(() => {
      expect(result.current?.isEditing).toBe(true);
    });

    act(() => {
      result.current?.form.setFieldValue('firstName', 'Draft Name');
    });

    act(() => {
      result.current?.onCancel();
    });

    await waitFor(() => {
      expect(result.current?.isEditing).toBe(false);
    });

    expect(result.current?.title).toBe(`${user.firstName} ${user.lastName}`);
  });

  it('saves the edited values and reflects them immediately', async () => {
    const [user] = userFixtures;
    const { result } = renderHook(() => useUserDetailViewModel(user.id));

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    act(() => {
      result.current?.onEdit();
    });

    await waitFor(() => {
      expect(result.current?.isEditing).toBe(true);
    });

    act(() => {
      result.current?.form.setFieldValue('firstName', 'Updated');
    });

    await act(async () => {
      await result.current?.form.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current?.isEditing).toBe(false);
    });

    expect(result.current?.isSaving).toBe(false);
    expect(result.current?.saveError).toBeNull();
    expect(result.current?.title).toBe(`Updated ${user.lastName}`);
  });

  it('shows an error and keeps editing when the save fails', async () => {
    const [user] = userFixtures;
    server.use(http.patch('*/api/users/:id', () => new HttpResponse(null, { status: 500 })));

    const { result } = renderHook(() => useUserDetailViewModel(user.id));

    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    act(() => {
      result.current?.onEdit();
    });

    await waitFor(() => {
      expect(result.current?.isEditing).toBe(true);
    });

    act(() => {
      result.current?.form.setFieldValue('firstName', 'Updated');
    });

    await act(async () => {
      await result.current?.form.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current?.saveError).not.toBeNull();
    });

    expect(result.current?.isEditing).toBe(true);
    expect(result.current?.isSaving).toBe(false);
    expect(result.current?.title).toBe(`${user.firstName} ${user.lastName}`);
  });
});
