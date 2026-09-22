import type { ReactElement } from 'react';

import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

export type FilterFieldOption = {
  value: string;
  label: string;
};

// `TId` is the union of field ids a caller declares, so `values` and
// `onValueChange` are checked against the same keys as `fields`.
export type FilterFieldConfig<TId extends string = string> =
  | { id: TId; label: string; kind: 'text'; placeholder?: string }
  | { id: TId; label: string; kind: 'select'; options: FilterFieldOption[]; allLabel?: string };

export type FilterCardProps<TId extends string = string> = {
  fields: FilterFieldConfig<TId>[];
  values: Record<TId, string>;
  onValueChange: (id: TId, value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  isSubmitDisabled?: boolean;
};

// Radix Select forbids an empty-string item value, so "all" uses this sentinel and maps back to '' at the prop boundary.
const ALL_VALUE = '__all__';

const toSelectValue = (value: string | undefined): string => value || ALL_VALUE;
const fromSelectValue = (value: string): string => (value === ALL_VALUE ? '' : value);

export const FilterCard = <TId extends string = string>({
  fields,
  values,
  onValueChange,
  onSubmit,
  onClear,
  hasActiveFilters,
  isSubmitDisabled = false,
}: FilterCardProps<TId>): ReactElement => (
  <Card>
    <CardContent>
      <form
        className="flex flex-wrap items-end gap-4 pt-6"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {fields.map((field) => (
          <div key={field.id} className="flex min-w-40 flex-col gap-1.5">
            <Label htmlFor={field.id}>{field.label}</Label>
            {field.kind === 'text' ? (
              <Input
                id={field.id}
                value={values[field.id] ?? ''}
                placeholder={field.placeholder}
                onChange={(event) => onValueChange(field.id, event.target.value)}
              />
            ) : (
              <Select
                value={toSelectValue(values[field.id])}
                onValueChange={(value) => onValueChange(field.id, fromSelectValue(value))}
              >
                <SelectTrigger id={field.id}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>{field.allLabel ?? `All ${field.label}`}</SelectItem>
                  {field.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
