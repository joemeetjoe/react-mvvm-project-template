import { JSX } from 'react';
import {
    Card,
    CardContent,
    CardFooter,
    CardTitle,
    CardHeader,
} from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { AppFilters, type FilterConfig } from '@/infrastructure/components/app/AppFilters';
import { useVM } from '@/infrastructure/components/context/vmContext';
import type { TBaseListViewModel } from '@/infrastructure/types/vm/list.types';

export const AppFilterCard = (): JSX.Element => {
  const vm = useVM<TBaseListViewModel>();

  return (
      <Card>
        <CardHeader>
            <CardTitle>{vm.config.card.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <AppFilters
              form={vm.state.filters.form}
              filterConfig={vm.config.filters as unknown as FilterConfig}
          />
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={vm.actions.filtering.clear} type="button">
            Clear
          </Button>
          <Button variant="default" onClick={vm.actions.filtering.submit} type="button">
            Search
          </Button>
        </CardFooter>
      </Card>
  );
};
