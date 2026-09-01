import { useLoaderData } from '@tanstack/react-router';
import { AppFilterCard } from '@/infrastructure/components/app/AppFilterCard';
import { AppTableCard } from '@/infrastructure/components/app/AppTableCard';
import { AsyncWrapper } from '@/infrastructure/components/skeletons/AsyncWrapper';
import { GridLayout } from '@/infrastructure/layouts/GridLayout';
import { VMProvider, useVM } from '@/infrastructure/components/context/vmContext';
import type { TBaseListViewModel } from '@/infrastructure/types/vm/list.types';

export const ListTemplate = () => {
  const loaderData = useLoaderData({ strict: false }) as {
    useVM: () => TBaseListViewModel;
  };

  const { useVM: useVMHook } = loaderData;

  return (
    <VMProvider useVM={useVMHook}>
      <ListContent />
    </VMProvider>
  );
};

function ListContent() {
  const vm = useVM<TBaseListViewModel>();

  return (
    <GridLayout columns={1} gap={4} className="w-full h-80vh">
      {vm.config.filters && <AppFilterCard />}

      <AsyncWrapper>
        <AppTableCard>
          <AppTableCard.Header />
          <AppTableCard.Content data={vm.query.data} columns={vm.config.columns} />
          <AppTableCard.Footer />
        </AppTableCard>
      </AsyncWrapper>
    </GridLayout>
  );
}
