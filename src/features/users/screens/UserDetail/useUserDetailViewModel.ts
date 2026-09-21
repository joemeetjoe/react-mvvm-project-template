import { useState } from 'react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { userDetailQueryOptions, userUpdateMutationOptions } from '../../data-layer/entities/user/userQueries';
import type { User, UserUpdate } from '../../data-layer/entities/user/userSchema';
import type { UserDetailViewProps } from './UserDetailView';
import { useUserEditForm } from './useUserEditForm';

/** Keeps dates readable without depending on the viewer's locale in tests. */
const formatDate = (value: string): string => value.slice(0, 10);

const toFormValues = (user: User): UserUpdate => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  status: user.status,
  department: user.department,
});

export const useUserDetailViewModel = (userId: string): UserDetailViewProps => {
  const { data: user } = useSuspenseQuery(userDetailQueryOptions(userId));
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const mutation = useMutation(userUpdateMutationOptions(queryClient, userId));

  const form = useUserEditForm(toFormValues(user), async (values) => {
    try {
      await mutation.mutateAsync(values);
      setIsEditing(false);
    } catch {
      // The mutation options already rolled the cache back; `saveError`
      // below surfaces the failure and edit mode stays open for a retry.
    }
  });

  const handleEdit = (): void => {
    form.reset(toFormValues(user));
    setIsEditing(true);
  };

  const handleCancel = (): void => {
    form.reset(toFormValues(user));
    setIsEditing(false);
  };

  return {
    title: `${user.firstName} ${user.lastName}`,
    sections: [
      {
        id: 'personal',
        title: 'Personal Information',
        fields: [
          { id: 'firstName', label: 'First Name', value: user.firstName },
          { id: 'lastName', label: 'Last Name', value: user.lastName },
          { id: 'email', label: 'Email', value: user.email },
        ],
      },
      {
        id: 'role-access',
        title: 'Role & Access',
        fields: [
          { id: 'role', label: 'Role', value: user.role },
          { id: 'status', label: 'Status', value: user.status },
          { id: 'department', label: 'Department', value: user.department },
        ],
      },
      {
        id: 'metadata',
        title: 'Metadata',
        fields: [
          { id: 'id', label: 'User ID', value: user.id },
          { id: 'createdAt', label: 'Created', value: formatDate(user.createdAt) },
          { id: 'updatedAt', label: 'Last Updated', value: formatDate(user.updatedAt) },
        ],
      },
    ],
    isEditing,
    isSaving: mutation.isPending,
    saveError: mutation.isError
      ? mutation.error instanceof Error
        ? mutation.error.message
        : 'Failed to save changes'
      : null,
    form,
    onBack: () => router.history.back(),
    onEdit: handleEdit,
    onCancel: handleCancel,
  };
};
