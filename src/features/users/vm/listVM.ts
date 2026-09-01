import { createListVM } from '@/infrastructure/utils/createListVM';
import { usersService } from '../model/clientAPI';
import { useUsersUIStore } from '../model/store';
import {
  usersListColumnConfig,
  usersListFilterConfig,
  usersListCardConfig,
} from '../view/listConfig';

export const useUsersListVM = createListVM({
  store: useUsersUIStore,
  service: usersService,
  queryKey: 'users',
  columnConfig: usersListColumnConfig,
  filterConfig: usersListFilterConfig,
  cardConfig: usersListCardConfig,
  serviceMethods: {
    getList: 'getUsersList',
    getFilters: 'getUserFilters',
  },
});
