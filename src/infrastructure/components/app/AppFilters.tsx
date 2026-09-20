import { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { CalendarIcon } from 'lucide-react';
import { GridLayout } from '@/infrastructure/layouts/GridLayout';

interface FormInstance {
  setFieldValue: (name: string, value: any) => void;
  getFieldValue: (name: string) => any;
}

interface SelectOption {
  value: string;
  label: string;
}

interface TextFilterConfig {
  id: string;
  label: string;
  placeholder: string;
}

interface SelectFilterConfig {
  id: string;
  label: string;
  options: SelectOption[];
}

interface DateFilterConfig {
  id: string;
  label: string;
  placeholder?: string;
}

interface FilterConfig {
  textFilters?: TextFilterConfig[];
  selectFilters?: SelectFilterConfig[];
  dateFilters?: DateFilterConfig[];
}

interface DatePickerFilterProps {
  name: string;
  label: string;
  value?: Date | string;
  placeholder?: string;
  form: FormInstance;
}

interface TextFilterProps {
  id: string;
  label: string;
  placeholder: string;
  form: FormInstance;
}

interface SelectFilterProps {
  id: string;
  label: string;
  options: SelectOption[];
  form: FormInstance;
}

interface FiltersProps {
  form: FormInstance;
  filterConfig: FilterConfig;
}

const formatDate = (date: Date | string | undefined): string => {
  if (!date) return '';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
};

const DatePickerFilter = ({ name, value, placeholder, form }: DatePickerFilterProps) => {
  const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);

  useEffect(() => {
    if (date) {
      form.setFieldValue(name, date);
    }
  }, [date, form, name]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button id={name} variant="outline" className="w-full justify-start text-left font-normal shadow-md">
          <CalendarIcon className="mr-2 h-4 w-4 shadow-md" />
          {date ? formatDate(date) : placeholder || 'Select date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-popover text-popover-foreground shadow-md">
        <Calendar mode="single" selected={date} onSelect={setDate} autoFocus={true} />
      </PopoverContent>
    </Popover>
  );
};

const TextFilter = ({ id, placeholder, form }: TextFilterProps) => (
  <Input
    id={id}
    name={id}
    placeholder={placeholder}
    value={form.getFieldValue(id) || ''}
    onChange={(e) => form.setFieldValue(id, e.target.value)}
  />
);

const SelectFilter = ({ id, label, options, form }: SelectFilterProps) => (
  <Select value={form.getFieldValue(id) || ''} onValueChange={(value) => form.setFieldValue(id, value)}>
    <SelectTrigger id={id}>
      <SelectValue placeholder={label} />
    </SelectTrigger>
    <SelectContent>
      {options?.map(option => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export const AppFilters = ({ form, filterConfig }: FiltersProps) => {
  return (
    <GridLayout columns={5}>
      {filterConfig.textFilters?.map(filter => (
        <TextFilter key={filter.id} id={filter.id} label={filter.label} placeholder={filter.placeholder} form={form} />
      ))}
      {filterConfig.selectFilters?.map(filter => (
        <SelectFilter key={filter.id} id={filter.id} label={filter.label} options={filter.options} form={form} />
      ))}
      {filterConfig.dateFilters?.map(filter => (
        <DatePickerFilter
          key={filter.id}
          name={filter.id}
          label={filter.label}
          value={form.getFieldValue(filter.id)}
          placeholder={filter.placeholder}
          form={form}
        />
      ))}
    </GridLayout>
  );
};

export type { FiltersProps, FilterConfig, FormInstance, SelectOption, TextFilterConfig, SelectFilterConfig, DateFilterConfig };
