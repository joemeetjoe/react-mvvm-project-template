import { expect } from 'vitest';
import type { TBaseListViewModel } from '@/infrastructure/types/vm/list.types';

export const expectLoadingState = (vm: TBaseListViewModel) => {
  expect(vm.query.isLoading).toBe(true);
  expect(vm.query.error).toBeNull();
};

export const expectErrorState = (vm: TBaseListViewModel, message?: string) => {
  expect(vm.query.isLoading).toBe(false);
  expect(vm.query.error).not.toBeNull();
  if (message) {
    expect(vm.query.error?.message).toContain(message);
  }
};

export const expectDataState = (vm: TBaseListViewModel, minItems = 1) => {
  expect(vm.query.isLoading).toBe(false);
  expect(vm.query.error).toBeNull();
  expect(vm.query.data.length).toBeGreaterThanOrEqual(minItems);
};
