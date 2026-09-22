import type { ReactElement } from 'react';

import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export const UserDetailSkeleton = (): ReactElement => (
  <section className="space-y-4" aria-busy="true" aria-label="Loading user">
    <Skeleton className="h-8 w-32" />

    <Card>
      <CardContent>
        <div className="flex flex-col gap-4 pt-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  </section>
);
