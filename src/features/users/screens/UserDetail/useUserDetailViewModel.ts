import { useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { userDetailQueryOptions } from '../../data-layer/entities/user/userQueries';
import type { UserDetailViewProps } from './UserDetailView';

/** Keeps dates readable without depending on the viewer's locale in tests. */
const formatDate = (value: string): string => value.slice(0, 10);

export const useUserDetailViewModel = (userId: string): UserDetailViewProps => {
  const { data: user } = useSuspenseQuery(userDetailQueryOptions(userId));
  const router = useRouter();

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
    onBack: () => router.history.back(),
  };
};
