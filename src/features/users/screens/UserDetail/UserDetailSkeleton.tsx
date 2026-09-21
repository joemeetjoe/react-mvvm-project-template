import type { ReactElement } from 'react';

import { Skeleton } from '@/shared/ui/skeleton';

export const UserDetailSkeleton = (): ReactElement => (
  <section className="space-y-4" aria-busy="true" aria-label="Loading user">
    <Skeleton className="h-8 w-32" />

    <div className="space-y-4 rounded-lg border p-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </section>
);
