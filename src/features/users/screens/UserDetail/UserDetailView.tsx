import type { ReactElement } from 'react';

import { InfoCard } from '@/shared/components/InfoCard';
import type { InfoCardSection } from '@/shared/components/InfoCard';
import { Button } from '@/shared/ui/button';

export type UserDetailViewProps = {
  title: string;
  sections: InfoCardSection[];
  onBack: () => void;
};

export const UserDetailView = ({ title, sections, onBack }: UserDetailViewProps): ReactElement => (
  <section className="space-y-4">
    <Button variant="ghost" onClick={onBack}>
      ← Back to users
    </Button>

    <InfoCard title={title} sections={sections} />
  </section>
);
