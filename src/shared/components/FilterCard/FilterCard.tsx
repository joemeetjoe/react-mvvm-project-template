import type { ReactElement } from 'react';

import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export type FilterFieldOption = {
  value: string;
  label: string;
};

export type FilterFieldConfig =
  | { id: string; label: string; kind: 'text'; placeholder?: string }
  | { id: string; label: string; kind: 'select'; options: FilterFieldOption[]; allLabel?: string };

export type FilterCardProps = {
  fields: FilterFieldConfig[];
  values: Record<string, string>;
  onValueChange: (id: string, value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  isSubmitDisabled?: boolean;
};

/**
 * A prop-driven filter form: fields, values and buttons all arrive as props
 * (issue #6). It knows nothing about users, queries or the router — the
 * ViewModel owns the actual filter state (a TanStack Form) and bridges its
 * draft values into these plain props.
 */
export const FilterCard = ({
  fields,
  values,
  onValueChange,
  onSubmit,
  onClear,
  hasActiveFilters,
  isSubmitDisabled = false,
}: FilterCardProps): ReactElement => (
  <Card>
    <CardContent className="pt-6">
      <form
        className="flex flex-wrap items-end gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col gap-1.5">
            <Label htmlFor={field.id}>{field.label}</Label>
            {field.kind === 'text' ? (
              <Input
                id={field.id}
                value={values[field.id] ?? ''}
                placeholder={field.placeholder}
                onChange={(event) => onValueChange(field.id, event.target.value)}
              />
            ) : (
              <select
                id={field.id}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={values[field.id] ?? ''}
                onChange={(event) => onValueChange(field.id, event.target.value)}
              >
                <option value="">{field.allLabel ?? `All ${field.label}`}</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitDisabled}>
            Apply filters
          </Button>
          <Button type="button" variant="outline" onClick={onClear} disabled={!hasActiveFilters}>
            Clear filters
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
);
