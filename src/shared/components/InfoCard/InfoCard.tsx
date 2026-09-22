import type { ReactElement } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Text } from '@/shared/ui/typography';

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
    <CardContent>
      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <div key={section.id} className="flex flex-col gap-2">
            <Text variant="label" asChild>
              <h3>{section.title}</h3>
            </Text>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {section.fields.map((field) => (
                <div key={field.id}>
                  <Text variant="small" asChild>
                    <dt>{field.label}</dt>
                  </Text>
                  <Text asChild>
                    <dd>{field.value}</dd>
                  </Text>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
