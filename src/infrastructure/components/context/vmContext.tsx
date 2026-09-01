// components/vm-context.tsx
import { createContext, useContext, ReactNode } from 'react';
import type { TBaseListViewModel } from '@/infrastructure/types/vm/list.types';
import { useRef } from 'react';

type VMHook<TData = any> = () => TBaseListViewModel<TData>;

const VMContext = createContext<VMHook | null>(null);

interface VMProviderProps {
  useVM: VMHook; // Pass the hook itself
  children: ReactNode;
}

export function VMProvider({ useVM, children }: VMProviderProps) {
  return <VMContext.Provider value={useVM}>{children}</VMContext.Provider>;
}

// Child components use this
export function useVM<TData = any>(): TBaseListViewModel<TData> {
  const vmHook = useContext(VMContext);
  if (!vmHook) {
    throw new Error('useVM must be used within VMProvider');
  }
  // Call the hook - React Query and Zustand handle deduplication
  return vmHook();
}

export function useVMSelector<TData = any, TSelected = any>(
    selector: (vm: TBaseListViewModel<TData>) => TSelected,
    equalityFn: (a: TSelected, b: TSelected) => boolean = (a, b) => Object.is(a, b)
): TSelected {

  const vmHook = useContext(VMContext);
  if (!vmHook) throw new Error('useVMSelector must be used within VMProvider');

  const vm = vmHook();
  const selectedRef = useRef<TSelected | undefined>(undefined);
  const currentSelected = selector(vm);

  if (selectedRef.current === undefined || !equalityFn(selectedRef.current, currentSelected)) {
    selectedRef.current = currentSelected;
  }

  return selectedRef.current!;
}
