import type { ReactElement } from 'react';

import { Skeleton } from '@/shared/ui/skeleton';

const placeholderRows = ['a', 'b', 'c', 'd', 'e'];

export const UserListSkeleton = (): ReactElement => (
  <section className="space-y-4" aria-busy="true" aria-label="Loading users">
    <Skeleton className="h-8 w-32" />

    <div className="space-y-2">
      {placeholderRows.map((row) => (
        <Skeleton key={row} className="h-10 w-full" />
      ))}
    </div>
  </section>
);
