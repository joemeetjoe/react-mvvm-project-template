import type { ReactElement } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export type InfoCardField = {
  id: string;
  label: string;
  value: string;
};

export type InfoCardSection = {
  id: string;
  title: string;
  fields: InfoCardField[];
};

export type InfoCardProps = {
  title: string;
  sections: InfoCardSection[];
};

/**
 * A prop-driven card for showing read-only entity fields grouped into
 * labelled sections. Has no external dependencies (decision 7): every value
 * it renders arrives as a prop.
 */
export const InfoCard = ({ title, sections }: InfoCardProps): ReactElement => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      {sections.map((section) => (
        <div key={section.id} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">{section.title}</h3>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.id}>
                <dt className="text-xs text-muted-foreground">{field.label}</dt>
                <dd className="text-sm">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </CardContent>
  </Card>
);
