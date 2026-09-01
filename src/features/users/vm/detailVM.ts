import { createDetailVM } from '@/infrastructure/utils/createDetailVM';
import { useUserDetailStore } from '../model/detailStore';
import { userUpdateSchema } from '../model/schemas';
import { usersService } from '../model/clientAPI';
import type { TUserUpdateForm } from '../model/schemas';
import type { User } from '../model/types';

/**
 * Users Detail View Model
 *
 * Created via createDetailVM factory.
 * Manages detail query, form state (TanStack Form + Zod), mutations (update/delete),
 * and store state (edit mode, dirty tracking).
 */
export const useUsersDetailVM = createDetailVM<
  User,
  TUserUpdateForm,
  typeof useUserDetailStore,
  typeof usersService
>({
  store: useUserDetailStore,
  service: usersService,
  queryKey: 'users',

  formConfig: {
    schema: userUpdateSchema,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'viewer',
      status: 'pending',
      department: '',
    },
    toFormData: (data: User): TUserUpdateForm => ({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      status: data.status,
      department: data.department,
    }),
  },

  mutationConfig: {
    update: true,
    delete: true,
  },

  serviceMethods: {
    getById: 'getUserDetail',
    update: 'updateUser',
    delete: 'deleteUser',
  },
});
